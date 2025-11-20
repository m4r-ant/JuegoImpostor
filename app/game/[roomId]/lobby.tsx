"use client"

import { useState } from "react"
import { calculateImpostorCount } from "@/lib/game-logic"
import type { Room } from "@/lib/types"
import { useEffect } from "react"
import { useWebsocket } from "@/hooks/use-websocket"
import { useRouter } from "next/navigation"

interface Props {
  room: Room
}

export function Lobby({ room }: Props) {
  const [starting, setStarting] = useState(false)
  const router = useRouter()

  // Local players state so we can update in realtime
  const [players, setPlayers] = useState(room.players)

  // read playerId from localStorage
  const playerId = typeof window !== 'undefined' ? localStorage.getItem('playerId') || undefined : undefined
  const { on, off } = useWebsocket(room.id, playerId || undefined)

  // Calculate derived values from players array
  const playerCount = players.length
  const impostorCount = calculateImpostorCount(playerCount)
  const canStart = playerCount >= 3
  const isHost = room.hostId === playerId

  useEffect(() => {
    // handler for new players
    const handlePlayerJoined = (data: any) => {
      console.log("[Lobby] player-joined event:", data)
      if (!data || !data.player) {
        console.warn("[Lobby] Invalid player-joined data:", data)
        return
      }
      const incoming = data.player
      setPlayers((prev) => {
        if (prev.some((p) => p.id === incoming.id)) return prev
        return [...prev, incoming]
      })
    }

    const handleGameStarted = (data: any) => {
      console.log("[Lobby] game-started event")
      // refresh server state so page shows revealing state
      router.refresh()
    }

    on("player-joined", handlePlayerJoined)
    on("player-left", (d: any) => {
      const pid = d?.playerId
      if (pid) {
        setPlayers((prev) => prev.filter((p) => p.id !== pid))
      }
    })
    on("game-started", handleGameStarted)

    return () => {
      off("player-joined")
      off("player-left")
      off("game-started")
    }
  }, [on, off, router])

  const handleStart = async () => {
    if (!canStart) return

    setStarting(true)
    try {
      // Use room.code to call the start endpoint (which uses [code] dynamic route)
      const response = await fetch(`/api/rooms/${room.code}/start`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to start game")
    } catch (error) {
      console.error(error)
      setStarting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="space-y-2 mb-8">
          <h1 className="text-4xl font-bold text-lime-400" style={{ fontFamily: "monospace" }}>
            Sala de Espera
          </h1>
          <p className="text-gray-400 text-sm">
            Código: <span className="text-lime-400 font-mono font-bold">{room.code}</span>
          </p>
        </div>

        {/* Game Info */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Jugadores</p>
            <p className="text-3xl font-bold text-lime-400">
              {playerCount}/{room.maxPlayers}
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Impostores</p>
            <p className="text-3xl font-bold text-red-400">{impostorCount}</p>
          </div>
        </div>

        {/* Players List */}
        <div className="space-y-3 mb-8">
          <h2 className="text-lg font-bold text-gray-300">Jugadores</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between px-4 py-3 bg-gray-800 rounded-lg border border-gray-700"
              >
                <div className="flex items-center gap-2">
                  {player.id === room.hostId && (
                    <span className="text-lg">👑</span>
                  )}
                  <span className="text-white font-mono">{player.username}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-lime-400 rounded-full"></span>
                  <span className="text-gray-400 text-sm">Conectado</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Requirements */}
        {!canStart && (
          <div className="mb-6 p-3 bg-yellow-900 bg-opacity-20 border border-yellow-700 rounded-lg text-yellow-300 text-sm">
            Se necesitan al menos 3 jugadores para comenzar
          </div>
        )}

        {/* Start Button - Only for host */}
        {isHost ? (
          <button
            onClick={handleStart}
            disabled={!canStart || starting}
            className="w-full px-6 py-4 bg-lime-400 text-black font-bold rounded-lg hover:bg-lime-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {starting ? "Iniciando..." : "Comenzar Partida"}
          </button>
        ) : (
          <div className="w-full px-6 py-4 bg-gray-700 text-gray-400 font-bold rounded-lg text-center">
            Esperando que el anfitrión inicie...
          </div>
        )}
      </div>
    </main>
  )
}
