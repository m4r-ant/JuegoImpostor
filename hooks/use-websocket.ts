"use client"

import { useEffect, useState, useRef } from "react"
import socket from "@/lib/socket"

export function useWebsocket(roomId?: string, playerId?: string) {
  const [connected, setConnected] = useState(false)
  const handlersRef = useRef<Record<string, Function>>({})

  useEffect(() => {
    if (!roomId || !playerId) return

    socket.auth = { roomId, playerId }
    socket.connect()

    socket.on("connect", () => setConnected(true))
    socket.on("disconnect", () => setConnected(false))

    return () => {
      socket.disconnect()
      socket.off()
    }
  }, [roomId, playerId])

  const on = (event: string, cb: Function) => {
    handlersRef.current[event] = cb
    socket.on(event, cb as any)
  }

  const off = (event: string) => {
    const cb = handlersRef.current[event]
    if (cb) socket.off(event, cb as any)
    delete handlersRef.current[event]
  }

  const emit = (event: string, payload?: any) => {
    socket.emit(event, payload)
  }

  return { connected, on, off, emit }
}
