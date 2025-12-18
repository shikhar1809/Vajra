import { NextResponse } from 'next/server';
import { anomalyEngine } from '@/lib/shield/anomaly-detector';

export async function GET() {
    try {
        // Simulate traffic data for the last 30 minutes
        const trafficData = [];
        const now = new Date();

        for (let i = 29; i >= 0; i--) {
            const timestamp = new Date(now.getTime() - i * 60000);
            const baseRequests = 200 + Math.random() * 100;

            // Simulate a traffic spike at minute 5
            const requestCount = i === 5
                ? baseRequests * 4.5 // 450% spike
                : baseRequests;

            trafficData.push({
                timestamp,
                requestCount: Math.floor(requestCount),
                uniqueIPs: Math.floor(requestCount * 0.6),
                avgResponseTime: Math.floor(50 + Math.random() * 100),
                statusCodes: {
                    200: Math.floor(requestCount * 0.9),
                    404: Math.floor(requestCount * 0.05),
                    500: Math.floor(requestCount * 0.05),
                },
            });
        }

        // Run anomaly detection
        const anomalies = await anomalyEngine.analyzeTraffic(trafficData);

        return NextResponse.json({
            success: true,
            data: {
                trafficData: trafficData.map(d => ({
                    time: d.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    requests: d.requestCount,
                    uniqueIPs: d.uniqueIPs,
                    avgResponseTime: d.avgResponseTime,
                })),
                anomalies: anomalies.map(a => ({
                    type: a.type,
                    severity: a.severity,
                    description: a.description,
                    confidence: a.confidence,
                    recommendBunkerMode: a.recommendBunkerMode,
                    metrics: a.metrics,
                })),
                summary: {
                    totalRequests: trafficData.reduce((sum, d) => sum + d.requestCount, 0),
                    avgRequestsPerMinute: Math.floor(
                        trafficData.reduce((sum, d) => sum + d.requestCount, 0) / trafficData.length
                    ),
                    peakRequests: Math.max(...trafficData.map(d => d.requestCount)),
                    anomaliesDetected: anomalies.length,
                },
            },
        });
    } catch (error) {
        console.error('Traffic analysis error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to analyze traffic' },
            { status: 500 }
        );
    }
}
