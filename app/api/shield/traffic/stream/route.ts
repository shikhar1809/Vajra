import { NextRequest } from 'next/server'

/**
 * Server-Sent Events (SSE) endpoint for real-time traffic streaming
 * Streams live traffic data to connected clients every 2 seconds
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const workspaceId = searchParams.get('workspaceId')

    if (!workspaceId) {
        return new Response('Missing workspaceId', { status: 400 })
    }

    // Create SSE stream
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
        async start(controller) {
            // Send initial connection message
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`))

            // Stream traffic data every 2 seconds
            const interval = setInterval(async () => {
                try {
                    const trafficData = await getLiveTrafficData(workspaceId)
                    const message = `data: ${JSON.stringify(trafficData)}\n\n`
                    controller.enqueue(encoder.encode(message))
                } catch (error) {
                    console.error('Error streaming traffic:', error)
                }
            }, 2000)

            // Cleanup on connection close
            request.signal.addEventListener('abort', () => {
                clearInterval(interval)
                controller.close()
            })
        },
    })

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    })
}

/**
 * Get live traffic data for workspace
 */
async function getLiveTrafficData(workspaceId: string) {
    // In production, this would query Supabase for recent traffic
    // For now, return simulated data
    const now = new Date()

    return {
        type: 'traffic_update',
        timestamp: now.toISOString(),
        data: {
            totalRequests: Math.floor(Math.random() * 100) + 50,
            blockedRequests: Math.floor(Math.random() * 20),
            botRequests: Math.floor(Math.random() * 30),
            recentEvents: [
                {
                    id: Math.random().toString(36).substr(2, 9),
                    ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
                    path: ['/', '/api', '/login', '/dashboard'][Math.floor(Math.random() * 4)],
                    method: ['GET', 'POST'][Math.floor(Math.random() * 2)],
                    botScore: Math.floor(Math.random() * 100),
                    blocked: Math.random() > 0.8,
                    timestamp: now.toISOString(),
                },
            ],
        },
    }
}
