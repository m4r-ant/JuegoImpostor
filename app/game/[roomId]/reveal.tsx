"use client"

import { useState, useEffect } from "react"
import { useWebsocket } from "@/hooks/use-websocket"
import { useRouter } from "next/navigation"
import type { Room } from "@/lib/types"

interface Props {
  room: Room
}

const REVEAL_DURATION = 5 // seconds

export function ArtworkReveal({ room }: Props) {
  // try to get playerId from localStorage
  const playerId = typeof window !== 'undefined' ? localStorage.getItem('playerId') || undefined : undefined
  const { on, off, emit } = useWebsocket(room.id, playerId || undefined)
  const router = useRouter()
  
  const [timeLeft, setTimeLeft] = useState(REVEAL_DURATION)
  const [hidden, setHidden] = useState(false)
  const [isImpostor, setIsImpostor] = useState<boolean | null>(null)
  const [hasEmitted, setHasEmitted] = useState(false)
  const [hasClickedReady, setHasClickedReady] = useState(false)
  const [readyCount, setReadyCount] = useState(0)

  // Determine if player is impostor
  useEffect(() => {
    if (!room.currentGame || !playerId) return
    const isImp = room.currentGame.impostorIds.includes(playerId)
    setIsImpostor(isImp)
  }, [])

  // Timer for reveal countdown (calculates elapsed time)
  useEffect(() => {
    if (!room.currentGame || hidden) return

    const elapsedSeconds = Math.floor(
      (new Date().getTime() - new Date(room.currentGame.createdAt).getTime()) / 1000
    )
    const remainingTime = Math.max(0, REVEAL_DURATION - elapsedSeconds)

    if (remainingTime <= 0) {
      setTimeLeft(0)
      setHidden(true)
      return
    }

    setTimeLeft(remainingTime)

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setHidden(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [room.currentGame, hidden])

  // Emit artwork-revealed event once (only for innocents)
  useEffect(() => {
    if (hasEmitted || isImpostor === null || isImpostor) return
    
    if (room.currentGame && emit) {
      console.log("[ArtworkReveal] Emitting artwork-revealed event")
      emit('artwork-revealed', { roomId: room.id, playerId, artwork: room.currentGame.artwork })
      setHasEmitted(true)
    }
  }, [isImpostor, hasEmitted])

  // Listen for ready confirmations
  useEffect(() => {
    const handlePlayerReady = (data: any) => {
      console.log("[ArtworkReveal] player-ready event:", data)
      setReadyCount(data?.readyCount || 0)
    }

    const handlePhaseChanged = (data: any) => {
      console.log("[ArtworkReveal] phase-changed event:", data)
      router.refresh()
    }

    on("player-ready", handlePlayerReady)
    on("phase-changed", handlePhaseChanged)

    return () => {
      off("player-ready")
      off("phase-changed")
    }
  }, [on, off, router])

  const handleClickReady = async () => {
    if (!hasClickedReady && playerId) {
      setHasClickedReady(true)
      
      try {
        const response = await fetch(`/api/rooms/${room.code}/player-ready`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerId }),
        })
        
        const data = await response.json()
        console.log("[ArtworkReveal] Ready response:", data)
        setReadyCount(data.readyCount || 0)
      } catch (error) {
        console.error("[ArtworkReveal] Error sending ready:", error)
      }
    }
  }

  if (isImpostor === null) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        <div className="text-white">Cargando...</div>
      </main>
    )
  }

  if (isImpostor) {
    // Impostors also see the image for 5 seconds
    if (hidden) {
      return (
        <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-red-500">Viste la obra</h1>
              <p className="text-gray-300">Ahora todos hablarán sobre sus observaciones.</p>
            </div>

            <div className="space-y-4">
              <div className="text-6xl font-bold text-gray-600">Esperando...</div>
              
              <button
                onClick={handleClickReady}
                disabled={hasClickedReady}
                className="w-full px-6 py-3 bg-lime-400 text-black font-bold rounded-lg hover:bg-lime-300 transition-colors disabled:opacity-50"
              >
                {hasClickedReady ? "✓ Listo" : "Listo"}
              </button>

              <p className="text-gray-400 text-sm">
                Listos: {readyCount}/{room.players.length}
              </p>
            </div>
          </div>
        </main>
      )
    }

    // Show image while timer is running
    return (
      <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="text-center space-y-4 mb-6">
            <p className="text-gray-400 text-sm">Visualiza la obra de arte</p>
            <div className="text-4xl font-bold text-lime-400">{timeLeft}s</div>
          </div>

          {/* Artwork - Placeholder */}
          <div className="aspect-square bg-gray-800 rounded-lg border-2 border-lime-400 overflow-hidden mb-6">
            <img src="/contemporary-art-sculpture.jpg" alt="Obra de arte" className="w-full h-full object-cover" />
          </div>

          {/* Artwork Info */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 space-y-2">
            <h3 className="text-lg font-bold text-lime-400">Sin Título</h3>
            <p className="text-gray-300 text-sm">Artista desconocido • 2023</p>
          </div>
        </div>
      </main>
    )
  }

  if (hidden) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-green-400">Viste la obra</h1>
            <p className="text-gray-300">Ahora todos describirán características de la obra.</p>
          </div>

          <div className="space-y-4">
            <div className="text-6xl font-bold text-gray-600">Esperando...</div>
            
            <button
              onClick={handleClickReady}
              disabled={hasClickedReady}
              className="w-full px-6 py-3 bg-lime-400 text-black font-bold rounded-lg hover:bg-lime-300 transition-colors disabled:opacity-50"
            >
              {hasClickedReady ? "✓ Listo" : "Listo"}
            </button>

            <p className="text-gray-400 text-sm">
              Listos: {readyCount}/{room.players.length}
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center space-y-4 mb-6">
          <p className="text-gray-400 text-sm">Visualiza la obra de arte</p>
          <div className="text-4xl font-bold text-lime-400">{timeLeft}s</div>
        </div>

        {/* Artwork - Placeholder */}
        <div className="aspect-square bg-gray-800 rounded-lg border-2 border-lime-400 overflow-hidden mb-6">
          <img src="/contemporary-art-sculpture.jpg" alt="Obra de arte" className="w-full h-full object-cover" />
        </div>

        {/* Artwork Info */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 space-y-2">
          <h3 className="text-lg font-bold text-lime-400">Sin Título</h3>
          <p className="text-gray-300 text-sm">Artista desconocido • 2023</p>
        </div>
      </div>
    </main>
  )
}
