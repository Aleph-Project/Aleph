"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import { Song } from '@/components/music-player/types'

interface StreamRequest {
  type: 'play' | 'pause' | 'stop'
  songId: string
}

interface StreamResponse {
  type: 'song_data' | 'error' | 'status'
  message: string
  song?: Song
}

interface UseWebSocketReturn {
  isConnected: boolean
  isPlaying: boolean
  currentSong: Song | null
  error: string | null
  playSong: (songId: string) => void
  pauseSong: () => void
  stopSong: () => void
  connect: () => void
  disconnect: () => void
}

export function useWebSocket(url: string = 'ws://localhost:8081/ws'): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<number | undefined>()

  const sendMessage = useCallback((message: StreamRequest) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    } else {
      setError('WebSocket no está conectado')
    }
  }, [])

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const response: StreamResponse = JSON.parse(event.data)
      
      switch (response.type) {
        case 'song_data':
          setCurrentSong(response.song || null)
          setIsPlaying(true)
          setError(null)
          // Emitir evento personalizado para MusicPlayer
          if (response.song) {
            const event = new CustomEvent('playSong', { detail: response.song })
            window.dispatchEvent(event)
          }
          console.log('[WebSocket] Canción cargada:', response.song)
          break
          
        case 'status':
          if (response.message.includes('pausada')) {
            setIsPlaying(false)
          } else if (response.message.includes('detenida')) {
            setIsPlaying(false)
            setCurrentSong(null)
          }
          console.log('[WebSocket] Estado:', response.message)
          break
          
        case 'error':
          setError(response.message)
          setIsPlaying(false)
          // Si es un error de audio no disponible, no mostrar como error crítico
          if (response.message.includes('no tiene audio disponible')) {
            console.warn('[WebSocket] Audio no disponible:', response.message)
          } else {
            console.error('[WebSocket] Error:', response.message)
          }
          break
      }
    } catch (err) {
      console.error('[WebSocket] Error parsing message:', err)
      setError('Error al procesar mensaje del servidor')
    }
  }, [])

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      wsRef.current = new WebSocket(url)
      
      wsRef.current.onopen = () => {
        console.log('[WebSocket] Conectado a streaming-ms')
        setIsConnected(true)
        setError(null)
      }
      
      wsRef.current.onmessage = handleMessage
      
      wsRef.current.onclose = () => {
        console.log('[WebSocket] Desconectado de streaming-ms')
        setIsConnected(false)
        setIsPlaying(false)
        
        // Reconexión automática después de 5 segundos (aumentado de 3)
        // Solo reconectar si no fue una desconexión intencional
        if (wsRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('[WebSocket] Intentando reconectar...')
            connect()
          }, 5000)
        }
      }
      
      wsRef.current.onerror = (error: Event) => {
        // Mejorar el manejo del error para evitar problemas de serialización
        const errorMessage = error instanceof ErrorEvent ? error.message : 'Error de conexión WebSocket'
        console.error('[WebSocket] Error de conexión:', errorMessage)
        setError('Error de conexión WebSocket')
        setIsConnected(false)
      }
    } catch (err) {
      // Mejorar el manejo del error para evitar problemas de serialización
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al crear conexión'
      console.error('[WebSocket] Error al crear conexión:', errorMessage)
      setError('No se pudo establecer conexión WebSocket')
    }
  }, [url, handleMessage])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    setIsConnected(false)
    setIsPlaying(false)
    setCurrentSong(null)
  }, [])

  const playSong = useCallback((songId: string) => {
    sendMessage({ type: 'play', songId })
  }, [sendMessage])

  const pauseSong = useCallback(() => {
    if (currentSong) {
      sendMessage({ type: 'pause', songId: currentSong._id })
    }
  }, [sendMessage, currentSong])

  const stopSong = useCallback(() => {
    if (currentSong) {
      sendMessage({ type: 'stop', songId: currentSong._id })
    }
  }, [sendMessage, currentSong])

  useEffect(() => {
    // Delay pequeño para evitar conexiones muy agresivas al montar el componente
    const initialConnectionTimeout = setTimeout(() => {
      connect()
    }, 100)
    
    return () => {
      clearTimeout(initialConnectionTimeout)
      disconnect()
    }
  }, [connect, disconnect])

  return {
    isConnected,
    isPlaying,
    currentSong,
    error,
    playSong,
    pauseSong,
    stopSong,
    connect,
    disconnect
  }
}