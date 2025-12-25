import { useEffect, useState, useRef } from 'react'

interface UseSSEOptions {
    url: string
    enabled?: boolean
    onMessage?: (data: any) => void
    onError?: (error: Event) => void
}

interface UseSSEReturn {
    data: any
    isConnected: boolean
    error: Event | null
    reconnect: () => void
}

/**
 * Custom hook for Server-Sent Events (SSE)
 * Handles connection, reconnection, and cleanup
 */
export function useSSE({ url, enabled = true, onMessage, onError }: UseSSEOptions): UseSSEReturn {
    const [data, setData] = useState<any>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [error, setError] = useState<Event | null>(null)
    const eventSourceRef = useRef<EventSource | null>(null)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>()

    const connect = () => {
        if (!enabled || !url) return

        try {
            // Close existing connection
            if (eventSourceRef.current) {
                eventSourceRef.current.close()
            }

            // Create new EventSource
            const eventSource = new EventSource(url)
            eventSourceRef.current = eventSource

            eventSource.onopen = () => {
                setIsConnected(true)
                setError(null)
            }

            eventSource.onmessage = (event) => {
                try {
                    const parsedData = JSON.parse(event.data)
                    setData(parsedData)
                    onMessage?.(parsedData)
                } catch (err) {
                    console.error('Error parsing SSE data:', err)
                }
            }

            eventSource.onerror = (err) => {
                setIsConnected(false)
                setError(err)
                onError?.(err)

                // Auto-reconnect after 5 seconds
                reconnectTimeoutRef.current = setTimeout(() => {
                    connect()
                }, 5000)
            }
        } catch (err) {
            console.error('Error creating EventSource:', err)
        }
    }

    const reconnect = () => {
        connect()
    }

    useEffect(() => {
        connect()

        // Cleanup on unmount
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close()
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
            }
        }
    }, [url, enabled])

    return {
        data,
        isConnected,
        error,
        reconnect,
    }
}
