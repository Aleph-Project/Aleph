"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
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
  resumeSong: (songId: string) => void
  connect: () => void
  disconnect: () => void
}

export function useWebSocket(url: string = 'ws://localhost:8081/ws'): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const { data: session } = useSession()
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<number | undefined>()

  const sendMessage = useCallback((message: StreamRequest) => {
    console.log('[useWebSocket] sendMessage llamado con:', message)
    console.log('[useWebSocket] WebSocket estado:', wsRef.current?.readyState)
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('[useWebSocket] Enviando mensaje:', JSON.stringify(message))
      wsRef.current.send(JSON.stringify(message))
    } else {
      console.error('[useWebSocket] WebSocket no está conectado para enviar mensaje')
      setError('WebSocket no está conectado')
    }
  }, [])

  const handleMessage = useCallback((event: MessageEvent) => {
    console.log('[useWebSocket] Mensaje recibido desde streaming-ms:', event.data)
    
    try {
      const response: StreamResponse = JSON.parse(event.data)
      console.log('[useWebSocket] Respuesta parseada:', response)
      
      switch (response.type) {
        case 'song_data':
          console.log('[useWebSocket] Procesando song_data:', response.song)
          setCurrentSong(response.song || null)
          setIsPlaying(true)
          setError(null)
          // Emitir evento personalizado para MusicPlayer
          if (response.song) {
            console.log('[useWebSocket] Disparando evento playSong personalizado:', response.song)
            const event = new CustomEvent('playSong', { detail: response.song })
            window.dispatchEvent(event)
          }
          console.log('[WebSocket] Canción cargada:', response.song)
          break
          
        case 'status':
          console.log('[useWebSocket] Procesando status:', response.message)
          if (response.message.includes('pausada')) {
            setIsPlaying(false)
          } else if (response.message.includes('detenida')) {
            setIsPlaying(false)
            setCurrentSong(null)
          }
          console.log('[WebSocket] Estado:', response.message)
          break
          
        case 'error':
          console.log('[useWebSocket] Procesando error:', response.message)
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

    // Verificar que hay sesión activa antes de conectar
    if (!session?.user?.id) {
      setError('Debe iniciar sesión para usar el reproductor')
      return
    }

    try {
      // Agregar el user_id como query parameter para autenticación
      const wsUrl = `${url}?user_id=${encodeURIComponent(session.user.id)}`
      wsRef.current = new WebSocket(wsUrl)
      
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
  }, [url, handleMessage, session])

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
    console.log('[useWebSocket] playSong llamado con songId:', songId)
    console.log('[useWebSocket] WebSocket conectado:', isConnected)
    console.log('[useWebSocket] readyState:', wsRef.current?.readyState)
    
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

  const resumeSong = useCallback((songId: string) => {
    console.log('[useWebSocket] resumeSong llamado con songId:', songId)
    console.log('[useWebSocket] WebSocket conectado:', isConnected)
    console.log('[useWebSocket] readyState:', wsRef.current?.readyState)
    
    sendMessage({ type: 'resume', songId })
  }, [sendMessage])

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
    resumeSong,
    connect,
    disconnect
  }
}