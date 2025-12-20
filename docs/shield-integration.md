# Shield Integration Guide

## How to Protect Your Website/App with Shield

Shield is a **Web Application Firewall (WAF)** and **Network Security** module that protects your website or application from:
- DDoS attacks
- SQL injection
- Cross-Site Scripting (XSS)
- CSRF attacks
- Brute force attempts

---

## Integration Methods

### Option 1: DNS-Based Protection (Easiest)

**How it works:** Route your traffic through Vajra's Shield network

**Steps:**
1. Get your Shield API key from workspace settings
2. Update your DNS records:
   ```
   Type: CNAME
   Name: www
   Value: shield.vajra.app
   ```
3. Configure your origin server IP in Shield settings
4. Shield automatically filters all traffic before it reaches your server

**Benefits:**
- No code changes required
- Works with any tech stack
- Instant DDoS protection

---

### Option 2: Reverse Proxy (Recommended)

**How it works:** Deploy Shield as a reverse proxy in front of your application

**Docker Deployment:**
```bash
docker run -d \
  -p 80:80 \
  -p 443:443 \
  -e SHIELD_API_KEY=your_api_key \
  -e ORIGIN_SERVER=https://your-app.com \
  vajra/shield:latest
```

**Kubernetes:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vajra-shield
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: shield
        image: vajra/shield:latest
        env:
        - name: SHIELD_API_KEY
          valueFrom:
            secretKeyRef:
              name: vajra-credentials
              key: api-key
        - name: ORIGIN_SERVER
          value: "http://your-app-service:8080"
```

---

### Option 3: SDK Integration (For Custom Apps)

**Node.js/Express:**
```javascript
const { ShieldMiddleware } = require('@vajra/shield-sdk')

const shield = new ShieldMiddleware({
  apiKey: process.env.SHIELD_API_KEY,
  workspaceId: 'your-workspace-id'
})

app.use(shield.protect())
```

**Python/Flask:**
```python
from vajra_shield import ShieldMiddleware

shield = ShieldMiddleware(
    api_key=os.getenv('SHIELD_API_KEY'),
    workspace_id='your-workspace-id'
)

app.wsgi_app = shield.protect(app.wsgi_app)
```

**Next.js Middleware:**
```typescript
// middleware.ts
import { shield } from '@vajra/shield-nextjs'

export default shield({
  apiKey: process.env.SHIELD_API_KEY!,
  workspaceId: process.env.WORKSPACE_ID!
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
```

---

### Option 4: API Gateway Integration

**AWS API Gateway:**
```json
{
  "type": "HTTP_PROXY",
  "httpMethod": "ANY",
  "uri": "https://shield.vajra.app/proxy",
  "requestParameters": {
    "integration.request.header.X-Shield-API-Key": "'your_api_key'",
    "integration.request.header.X-Origin-Server": "'https://your-api.com'"
  }
}
```

**Kong Gateway:**
```bash
curl -X POST http://localhost:8001/plugins \
  --data "name=vajra-shield" \
  --data "config.api_key=your_api_key" \
  --data "config.workspace_id=your_workspace_id"
```

---

## What Shield Protects Against

### 1. DDoS Attacks
- **Layer 3/4**: SYN floods, UDP floods
- **Layer 7**: HTTP floods, Slowloris
- **Rate limiting**: Automatic throttling of suspicious IPs
- **Bot detection**: Distinguishes between humans and bots

### 2. SQL Injection
- **Pattern matching**: Detects malicious SQL patterns
- **Parameterized queries**: Enforces safe query practices
- **Real-time blocking**: Stops attacks before they reach your database

### 3. Cross-Site Scripting (XSS)
- **Input sanitization**: Cleans user input
- **Output encoding**: Prevents script execution
- **CSP enforcement**: Content Security Policy headers

### 4. CSRF Protection
- **Token validation**: Verifies CSRF tokens
- **Origin checking**: Validates request origins
- **SameSite cookies**: Enforces secure cookie policies

### 5. Brute Force Protection
- **Login throttling**: Limits failed login attempts
- **IP blocking**: Temporary bans for suspicious IPs
- **CAPTCHA integration**: Challenges suspicious requests

---

## Configuration

### Shield Settings in Vajra Dashboard

1. **Security Level:**
   - Low: Basic protection
   - Medium: Balanced (recommended)
   - High: Strict (may block legitimate traffic)
   - Custom: Fine-tune rules

2. **Rate Limiting:**
   ```
   Requests per IP: 100/minute
   API calls: 1000/hour
   Login attempts: 5/5 minutes
   ```

3. **Whitelist/Blacklist:**
   - Whitelist trusted IPs
   - Blacklist known attackers
   - Country-based blocking

4. **Custom Rules:**
   ```javascript
   // Block requests with specific patterns
   {
     "name": "Block admin scanner",
     "pattern": "/admin/*",
     "action": "block",
     "except_ips": ["your-office-ip"]
   }
   ```

---

## Monitoring & Alerts

### Real-Time Dashboard
- Live threat feed
- Attack heatmap
- Traffic analytics
- Blocked requests

### Alerts
- Email notifications
- Slack/Discord webhooks
- SMS for critical threats
- PagerDuty integration

### API Access
```bash
curl -H "Authorization: Bearer $API_KEY" \
  https://api.vajra.app/v1/shield/threats?status=active
```

---

## Pricing

- **Free Tier**: 10K requests/month
- **Starter**: $29/month - 100K requests
- **Business**: $99/month - 1M requests
- **Enterprise**: Custom pricing

---

## Getting Started

1. **Get API Key:**
   - Go to Workspace → Settings → API Keys
   - Click "Generate Shield API Key"
   - Copy and save securely

2. **Choose Integration Method:**
   - DNS (easiest)
   - Reverse Proxy (most flexible)
   - SDK (for custom apps)

3. **Test in Staging:**
   - Enable Shield in test mode
   - Monitor for false positives
   - Adjust rules as needed

4. **Go Live:**
   - Switch to production mode
   - Monitor dashboard for threats
   - Review weekly security reports

---

## Support

- **Documentation**: https://docs.vajra.app/shield
- **Discord**: https://discord.gg/vajra
- **Email**: shield-support@vajra.app
- **Emergency**: +1-800-VAJRA-911
