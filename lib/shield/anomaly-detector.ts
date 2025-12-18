/**
 * Vajra Shield - Anomaly Detection Engine
 * 
 * Implements multiple algorithms for detecting security threats:
 * 1. Statistical Analysis (Z-score, IQR)
 * 2. Traffic Spike Detection
 * 3. Bot Detection via Pattern Analysis
 * 4. Geographic Anomalies
 * 5. Rate Limiting Violations
 */

export interface TrafficDataPoint {
    timestamp: Date;
    requestCount: number;
    uniqueIPs: number;
    avgResponseTime: number;
    statusCodes: Record<number, number>;
}

export interface AnomalyResult {
    isAnomaly: boolean;
    type: 'traffic_spike' | 'unusual_pattern' | 'suspicious_ip' | 'bot_activity';
    severity: 'critical' | 'high' | 'medium' | 'low';
    confidence: number; // 0-1
    description: string;
    metrics: Record<string, any>;
    recommendBunkerMode: boolean;
}

/**
 * Statistical Anomaly Detection using Z-Score
 * Detects outliers based on standard deviations from mean
 */
export class StatisticalDetector {
    private readonly threshold = 3; // Z-score threshold

    detect(data: number[]): { isAnomaly: boolean; zScore: number } {
        if (data.length < 3) {
            return { isAnomaly: false, zScore: 0 };
        }

        const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
        const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
        const stdDev = Math.sqrt(variance);

        const latestValue = data[data.length - 1];
        const zScore = stdDev === 0 ? 0 : Math.abs((latestValue - mean) / stdDev);

        return {
            isAnomaly: zScore > this.threshold,
            zScore,
        };
    }

    /**
     * Interquartile Range (IQR) method for outlier detection
     * More robust to extreme values than Z-score
     */
    detectIQR(data: number[]): { isAnomaly: boolean; outlierScore: number } {
        if (data.length < 4) {
            return { isAnomaly: false, outlierScore: 0 };
        }

        const sorted = [...data].sort((a, b) => a - b);
        const q1Index = Math.floor(sorted.length * 0.25);
        const q3Index = Math.floor(sorted.length * 0.75);
        
        const q1 = sorted[q1Index];
        const q3 = sorted[q3Index];
        const iqr = q3 - q1;

        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;

        const latestValue = data[data.length - 1];
        const isAnomaly = latestValue < lowerBound || latestValue > upperBound;

        return {
            isAnomaly,
            outlierScore: isAnomaly ? Math.abs(latestValue - (latestValue < lowerBound ? lowerBound : upperBound)) : 0,
        };
    }
}

/**
 * Traffic Spike Detection
 * Detects sudden increases in traffic volume
 */
export class TrafficSpikeDetector {
    private readonly spikeThreshold = 3; // 300% increase
    private readonly windowSize = 30; // 30 minute window

    detect(dataPoints: TrafficDataPoint[]): AnomalyResult | null {
        if (dataPoints.length < 2) {
            return null;
        }

        const recentData = dataPoints.slice(-this.windowSize);
        const requestCounts = recentData.map(d => d.requestCount);
        
        // Calculate moving average
        const movingAvg = requestCounts.slice(0, -1).reduce((sum, val) => sum + val, 0) / (requestCounts.length - 1);
        const currentRate = requestCounts[requestCounts.length - 1];
        
        const increaseRatio = currentRate / movingAvg;

        if (increaseRatio > this.spikeThreshold) {
            return {
                isAnomaly: true,
                type: 'traffic_spike',
                severity: increaseRatio > 5 ? 'critical' : increaseRatio > 4 ? 'high' : 'medium',
                confidence: Math.min(increaseRatio / 10, 1),
                description: `Traffic spike detected: ${Math.round((increaseRatio - 1) * 100)}% increase in ${this.windowSize} minutes`,
                metrics: {
                    currentRate,
                    movingAvg,
                    increaseRatio,
                    percentIncrease: (increaseRatio - 1) * 100,
                },
                recommendBunkerMode: increaseRatio > 4,
            };
        }

        return null;
    }
}

/**
 * Bot Detection Engine
 * Analyzes request patterns to identify automated traffic
 */
export class BotDetector {
    /**
     * Analyze user-agent strings for bot signatures
     */
    analyzeUserAgent(userAgent: string): { isBot: boolean; confidence: number; botType?: string } {
        const botPatterns = [
            { pattern: /bot|crawler|spider|scraper/i, type: 'crawler', confidence: 0.9 },
            { pattern: /curl|wget|python-requests|java|go-http/i, type: 'automated_tool', confidence: 0.85 },
            { pattern: /headless|phantom|selenium|puppeteer/i, type: 'headless_browser', confidence: 0.95 },
            { pattern: /^$/i, type: 'no_user_agent', confidence: 0.7 },
        ];

        for (const { pattern, type, confidence } of botPatterns) {
            if (pattern.test(userAgent)) {
                return { isBot: true, confidence, botType: type };
            }
        }

        return { isBot: false, confidence: 0 };
    }

    /**
     * Detect bot behavior based on request patterns
     * - Too fast request rate
     * - Perfect timing intervals
     * - Unusual endpoint access patterns
     */
    analyzeRequestPattern(timestamps: Date[]): { isBot: boolean; confidence: number; reason: string } {
        if (timestamps.length < 5) {
            return { isBot: false, confidence: 0, reason: '' };
        }

        // Calculate intervals between requests
        const intervals: number[] = [];
        for (let i = 1; i < timestamps.length; i++) {
            intervals.push(timestamps[i].getTime() - timestamps[i - 1].getTime());
        }

        // Check for suspiciously consistent intervals (bot behavior)
        const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
        const variance = intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / intervals.length;
        const stdDev = Math.sqrt(variance);
        const coefficientOfVariation = stdDev / avgInterval;

        // Bots often have very consistent timing (low CV)
        if (coefficientOfVariation < 0.1 && intervals.length > 10) {
            return {
                isBot: true,
                confidence: 0.8,
                reason: 'Suspiciously consistent request intervals',
            };
        }

        // Check for superhuman speed (< 100ms between requests)
        const fastRequests = intervals.filter(i => i < 100).length;
        if (fastRequests / intervals.length > 0.5) {
            return {
                isBot: true,
                confidence: 0.9,
                reason: 'Request rate too fast for human interaction',
            };
        }

        return { isBot: false, confidence: 0, reason: '' };
    }
}

/**
 * Geographic Anomaly Detector
 * Detects impossible travel and unusual location patterns
 */
export class GeoAnomalyDetector {
    /**
     * Detect impossible travel
     * If user appears in two distant locations in short time, flag as suspicious
     */
    detectImpossibleTravel(
        location1: { lat: number; lon: number; timestamp: Date },
        location2: { lat: number; lon: number; timestamp: Date }
    ): { isAnomaly: boolean; reason: string } {
        const distance = this.calculateDistance(location1.lat, location1.lon, location2.lat, location2.lon);
        const timeDiff = Math.abs(location2.timestamp.getTime() - location1.timestamp.getTime()) / 1000 / 3600; // hours

        // Assume max travel speed of 900 km/h (commercial aircraft)
        const maxPossibleDistance = timeDiff * 900;

        if (distance > maxPossibleDistance) {
            return {
                isAnomaly: true,
                reason: `Impossible travel: ${Math.round(distance)}km in ${timeDiff.toFixed(1)} hours`,
            };
        }

        return { isAnomaly: false, reason: '' };
    }

    /**
     * Haversine formula to calculate distance between two coordinates
     */
    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private toRad(degrees: number): number {
        return degrees * (Math.PI / 180);
    }
}

/**
 * Main Anomaly Detection Orchestrator
 * Combines multiple detection methods for comprehensive analysis
 */
export class AnomalyDetectionEngine {
    private statisticalDetector = new StatisticalDetector();
    private trafficSpikeDetector = new TrafficSpikeDetector();
    private botDetector = new BotDetector();
    private geoDetector = new GeoAnomalyDetector();

    /**
     * Analyze traffic data and detect anomalies
     */
    async analyzeTraffic(dataPoints: TrafficDataPoint[]): Promise<AnomalyResult[]> {
        const anomalies: AnomalyResult[] = [];

        // 1. Check for traffic spikes
        const spikeAnomaly = this.trafficSpikeDetector.detect(dataPoints);
        if (spikeAnomaly) {
            anomalies.push(spikeAnomaly);
        }

        // 2. Statistical analysis on request counts
        const requestCounts = dataPoints.map(d => d.requestCount);
        const { isAnomaly: isStatAnomaly, zScore } = this.statisticalDetector.detect(requestCounts);
        
        if (isStatAnomaly) {
            anomalies.push({
                isAnomaly: true,
                type: 'unusual_pattern',
                severity: zScore > 5 ? 'high' : 'medium',
                confidence: Math.min(zScore / 10, 1),
                description: `Unusual traffic pattern detected (Z-score: ${zScore.toFixed(2)})`,
                metrics: { zScore, requestCounts: requestCounts.slice(-5) },
                recommendBunkerMode: zScore > 5,
            });
        }

        return anomalies;
    }

    /**
     * Analyze individual request for bot behavior
     */
    analyzeBotBehavior(userAgent: string, requestTimestamps: Date[]): AnomalyResult | null {
        const uaResult = this.botDetector.analyzeUserAgent(userAgent);
        const patternResult = this.botDetector.analyzeRequestPattern(requestTimestamps);

        if (uaResult.isBot || patternResult.isBot) {
            const confidence = Math.max(uaResult.confidence, patternResult.confidence);
            return {
                isAnomaly: true,
                type: 'bot_activity',
                severity: confidence > 0.8 ? 'high' : 'medium',
                confidence,
                description: uaResult.isBot ? `Bot detected: ${uaResult.botType}` : patternResult.reason,
                metrics: {
                    userAgent,
                    botType: uaResult.botType,
                    patternReason: patternResult.reason,
                },
                recommendBunkerMode: confidence > 0.85,
            };
        }

        return null;
    }
}

// Export singleton instance
export const anomalyEngine = new AnomalyDetectionEngine();
