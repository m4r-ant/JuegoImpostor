"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Room } from "@/lib/types"

interface Props {
  room: Room
}

export function VotingResult({ room }: Props) {
  const router = useRouter()
  const [countdown, setCountdown] = useState(3)

  const votedOutId = room.currentGame?.votedOutId
  const votedOutPlayer = room.players.find((p) => p.id === votedOutId)
  const wasImpostor = room.currentGame?.impostorIds.includes(votedOutId || "") || false

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // Determine next phase and update
          const updateAndRefresh = async () => {
            try {
              let nextPhase = "revealing"
              
              if (room.status === "finished" || room.currentGame?.result) {
                nextPhase = "finished"
              } else {
                nextPhase = "revealing"
              }

              await fetch(`/api/rooms/${room.code}/phase`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nextPhase }),
              })

              router.refresh()
            } catch (error) {
              console.error("Error updating phase:", error)
              router.refresh()
            }
          }

          updateAndRefresh()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router, room.code])

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-white">Votación Completa</h1>
          
          <div className="bg-gray-800 rounded-lg p-6 border-2" style={{ borderColor: wasImpostor ? "#ef4444" : "#fbbf24" }}>
            <p className="text-gray-400 text-sm mb-2">Fue eliminado:</p>
            <h2 className="text-4xl font-bold" style={{ color: wasImpostor ? "#ef4444" : "#fbbf24" }}>
              {votedOutPlayer?.username}
            </h2>
            <p className="text-gray-300 text-lg mt-2">
              {wasImpostor ? "🎭 Era Impostor" : "😇 Era Inocente"}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-gray-400">Continuando en</p>
          <div className="text-5xl font-bold text-lime-400">{countdown}s</div>
        </div>

        {room.status === "finished" ? (
          <div className="p-4 bg-red-900 bg-opacity-30 border border-red-700 rounded-lg text-red-300">
            <p className="font-bold">¡Juego Finalizado!</p>
            <p className="text-sm mt-2">{room.currentGame?.result === "impostors_escaped" ? "Los impostores ganan" : "Los inocentes ganan"}</p>
          </div>
        ) : (
          <div className="p-4 bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg text-blue-300">
            <p className="text-sm">Siguiente ronda: {room.currentGame?.round || 0}</p>
          </div>
        )}
      </div>
    </main>
  )
}
