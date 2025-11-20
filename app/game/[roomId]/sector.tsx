"use client"

import { useEffect, useState } from "react"
import { useWebsocket } from "@/hooks/use-websocket"
import { useRouter } from "next/navigation"
import type { Room } from "@/lib/types"

interface Props {
  room: Room
}

const SECTOR_DISPLAY_DURATION = 15 // seconds before moving to reveal

export function SectorAnnouncement({ room }: Props) {
  const playerId = typeof window !== "undefined" ? localStorage.getItem("playerId") || undefined : undefined
  const { on, off } = useWebsocket(room.id, playerId || undefined)
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState(SECTOR_DISPLAY_DURATION)

  useEffect(() => {
    const handleGameStarted = () => {
      console.log("[SectorAnnouncement] game-started event")
      router.refresh()
    }

    const handlePhaseChanged = (data: any) => {
      console.log("[SectorAnnouncement] phase-changed event:", data)
      if (data?.phase === "revealing") {
        router.refresh()
      }
    }

    on("game-started", handleGameStarted)
    on("phase-changed", handlePhaseChanged)

    return () => {
      off("game-started")
      off("phase-changed")
    }
  }, [on, off, router])

  // Timer to auto-move to reveal phase
  useEffect(() => {
    let timer: NodeJS.Timeout
    
    const startTimer = async () => {
      timer = setInterval(async () => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            // Call endpoint to change phase to "revealing"
            fetch(`/api/rooms/${room.code}/phase`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ nextPhase: "revealing" })
            })
              .then(() => {
                console.log("[SectorAnnouncement] Changed phase to revealing")
                router.refresh()
              })
              .catch((err) => console.error("Failed to change phase:", err))
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    startTimer()

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [room.code, router])

  const sector = room.currentGame?.artwork.sector || 1

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <p className="text-gray-400 text-lg">La obra está en:</p>
          <div className="bg-gradient-to-b from-lime-400 to-lime-500 rounded-lg p-12">
            <h1 className="text-7xl font-bold text-black" style={{ fontFamily: "monospace" }}>
              SALA {sector}
            </h1>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-gray-300 text-sm">Todos a la sala {sector}!</p>
          <p className="text-gray-500 text-xs">Comenzando en {timeLeft}s...</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-xs">Los inocentes verán la obra durante 5 segundos</p>
        </div>
      </div>
    </main>
  )
}
