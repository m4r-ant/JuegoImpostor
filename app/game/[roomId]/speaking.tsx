"use client"

import { useState, useEffect } from "react"
import { useWebsocket } from "@/hooks/use-websocket"
import type { Room } from "@/lib/types"
import { useRouter } from "next/navigation"

interface Props {
  room: Room
}

const SPEAK_DURATION = 10 // seconds per speaker

export function SpeakingRound({ room }: Props) {
  const playerId = typeof window !== "undefined" ? localStorage.getItem("playerId") || undefined : undefined
  const { on, off } = useWebsocket(room.id, playerId || undefined)
  const router = useRouter()

  const [currentSpeakerIndex, setCurrentSpeakerIndex] = useState(room.currentGame?.currentSpeakerIndex || 0)
  const [timeLeft, setTimeLeft] = useState(SPEAK_DURATION)
  const [roundComplete, setRoundComplete] = useState(false)

  const speakingOrder = room.currentGame?.speakingOrder || []
  const currentSpeakerId = speakingOrder[currentSpeakerIndex]
  const currentSpeaker = room.players.find((p) => p.id === currentSpeakerId)

  // Timer for current speaker
  useEffect(() => {
    if (roundComplete || !speakingOrder.length) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // Move to next speaker
          const nextIndex = currentSpeakerIndex + 1
          if (nextIndex >= speakingOrder.length) {
            // Round complete, move to voting
            setRoundComplete(true)
            return 0
          }
          setCurrentSpeakerIndex(nextIndex)
          setTimeLeft(SPEAK_DURATION)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [currentSpeakerIndex, speakingOrder.length, roundComplete])

  // Listen for phase changes
  useEffect(() => {
    const handlePhaseChanged = (data: any) => {
      console.log("[SpeakingRound] phase-changed event:", data)
      if (data?.phase === "voting") {
        router.refresh()
      }
    }

    on("phase-changed", handlePhaseChanged)

    return () => {
      off("phase-changed")
    }
  }, [on, off, router])

  // Auto-advance to voting when round is complete
  useEffect(() => {
    if (!roundComplete) return

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/rooms/${room.code}/phase`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nextPhase: "voting" }),
        })

        if (!response.ok) {
          console.error("[SpeakingRound] Failed to advance to voting")
        }
      } catch (error) {
        console.error("[SpeakingRound] Error advancing to voting:", error)
      }
    }, 2000) // 2 second delay before advancing

    return () => clearTimeout(timer)
  }, [roundComplete, room.code])

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {roundComplete ? (
          <>
            <h1 className="text-4xl font-bold text-lime-400">Ronda completada</h1>
            <div className="text-gray-400">Pasando a votación...</div>
          </>
        ) : (
          <>
            {/* Current Speaker */}
            <div className="space-y-4">
              <p className="text-gray-400 text-lg">Hablando ahora:</p>
              <div className="bg-gradient-to-b from-lime-400 to-lime-500 rounded-lg p-8">
                <h2 className="text-5xl font-bold text-black">{currentSpeaker?.username || "?"}</h2>
              </div>
            </div>

            {/* Timer */}
            <div className="space-y-2">
              <div className="text-7xl font-bold text-lime-400">{timeLeft}s</div>
              <p className="text-gray-400 text-sm">
                Jugador {currentSpeakerIndex + 1} de {speakingOrder.length}
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-lime-400 h-full transition-all duration-500"
                style={{
                  width: `${((SPEAK_DURATION - timeLeft) / SPEAK_DURATION) * 100}%`,
                }}
              />
            </div>

            {/* Speakers waiting */}
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">Próximos a hablar:</p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {speakingOrder.slice(currentSpeakerIndex + 1).map((speakerId, idx) => (
                  <div
                    key={speakerId}
                    className="px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 text-gray-300 text-sm"
                  >
                    {room.players.find((p) => p.id === speakerId)?.username || "?"} - #{currentSpeakerIndex + idx + 2}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
