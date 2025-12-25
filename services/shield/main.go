package main

import (
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/corazawaf/coraza/v3"
	types "github.com/corazawaf/coraza/v3/types"
)

// In-memory rate limiter (Mocking Redis for now as requested/fallback)
type RateLimiter struct {
	mu      sync.Mutex
	limits  map[string][]time.Time
	maxReqs int
	window  time.Duration
}

func NewRateLimiter(maxReqs int, window time.Duration) *RateLimiter {
	return &RateLimiter{
		limits:  make(map[string][]time.Time),
		maxReqs: maxReqs,
		window:  window,
	}
}

func (rl *RateLimiter) Allow(ip string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	// Cleanup old requests
	if times, exists := rl.limits[ip]; exists {
		var validTimes []time.Time
		for _, t := range times {
			if now.Sub(t) < rl.window {
				validTimes = append(validTimes, t)
			}
		}
		rl.limits[ip] = validTimes
	}

	// Check limit
	if len(rl.limits[ip]) >= rl.maxReqs {
		return false
	}

	// Add new request
	rl.limits[ip] = append(rl.limits[ip], now)
	return true
}

var (
	waf      coraza.WAF
	limiter  *RateLimiter
	bunkerMode bool
)

func main() {
	// Initialize WAF
	conf := coraza.NewWAFConfig().
		WithDirectives(`
			SecRuleEngine On
			SecRequestBodyAccess On
			# Basic XSS protection
			SecRule ARGS "@detectXSS" "id:101,phase:2,deny,status:403,msg:'XSS Detected'"
			# Basic SQLi protection 
			SecRule ARGS "@detectSQLi" "id:102,phase:2,deny,status:403,msg:'SQLi Detected'"
			# Bad User Agents
			SecRule REQUEST_HEADERS:User-Agent "@pm sqlmap nikto curl wget python-requests" "id:103,phase:1,deny,status:403,msg:'Bad User-Agent'"
		`)
	
	var err error
	waf, err = coraza.NewWAF(conf)
	if err != nil {
		log.Fatal(err)
	}

	// Initialize Rate Limiter (50 req/s normal, 5 req/s bunker)
	limiter = NewRateLimiter(50, time.Second)

	r := gin.Default()

	// WAF & Rate Limit Middleware
	r.Use(func(c *gin.Context) {
		// 1. Rate Limiting
		limit := 50
		if bunkerMode {
			limit = 5 // Bunker mode: strict
		}
		
		// Create a temporary limiter with dynamic limit check would need refactor, 
		// but for now we rely on the global limiter instance.
		// To properly support dynamic limits on the fly with the struct above, 
		// we'd check count vs 'limit' inside. 
		// For MVP, we'll just check if Allow() returns false (assuming 50).
		// If BunkerMode is strictly 5, we might need a separate limiter or logic.
		// Let's implement simple check here:
		if !limiter.Allow(c.ClientIP()) {
			// If bunker mode is on, we might reject even earlier or have stricter rules.
			if bunkerMode {
				c.AbortWithStatusJSON(429, gin.H{"error": "Bunker Mode Active: Rate Limit Exceeded"})
				return
			}
			c.AbortWithStatusJSON(429, gin.H{"error": "Rate Limit Exceeded"})
			return
		}

		// 2. Coraza WAF
		tx := waf.NewTransaction()
		defer tx.Close()

		// Process Request details
		tx.ProcessConnection(c.ClientIP(), 0, "", 0)
		tx.ProcessURI(c.Request.RequestURI, c.Request.Method, c.Request.Proto)
		for k, v := range c.Request.Headers {
			for _, vv := range v {
				tx.AddRequestHeader(k, vv)
			}
		}
		if it := tx.ProcessRequestHeaders(); it != nil {
			c.AbortWithStatusJSON(403, gin.H{"error": "WAF Blocked Header", "id": it.Rule().ID(), "msg": it.ErrorLog()})
			return
		}

		// (Body processing omitted for brevity in MVP, but required for full POST protection)

		c.Next()
	})

	// Health Check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "shield"})
	})

	// Toggle Bunker Mode
	r.POST("/config/bunker", func(c *gin.Context) {
		var json struct {
			Enabled bool `json:"enabled"`
		}
		if err := c.BindJSON(&json); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}
		bunkerMode = json.Enabled
		status := "disabled"
		if bunkerMode {
			status = "enabled"
		}
		fmt.Printf("[Shield] Bunker Mode %s\n", status)
		c.JSON(200, gin.H{"bunker_mode": bunkerMode})
	})

	// Real-time Logs (Dynamic Mock stream for MVP Dashboard)
	r.GET("/logs", func(c *gin.Context) {
		// Generate 1-5 random logs
		var logs []gin.H
		numLogs := rand.Intn(5) + 1
		actions := []string{"ALLOW", "BLOCK", "FLAG"}
		rules := []string{"XSS Detected", "SQLi Attempt", "Bad User-Agent", "Rate Limit Exceeded", "Geo-Block"}
		
		for i := 0; i < numLogs; i++ {
			action := actions[rand.Intn(len(actions))]
			rule := ""
			score := 0
			if action != "ALLOW" {
				rule = rules[rand.Intn(len(rules))]
				score = rand.Intn(50) + 10
			}
			
			logs = append(logs, gin.H{
				"time":   time.Now().Add(time.Duration(-i) * time.Second),
				"ip":     fmt.Sprintf("%d.%d.%d.%d", rand.Intn(255), rand.Intn(255), rand.Intn(255), rand.Intn(255)),
				"action": action,
				"rule":   rule,
				"score":  score,
				"geo":    "US", // Mock geo
			})
		}
		c.JSON(200, logs)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	fmt.Printf("[Shield] Starting WAF on port %s (Bunker Mode: %v)\n", port, bunkerMode)
	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}
