"use client"

import { useState, useEffect } from "react"
import type { Room } from "@/lib/types"

interface Props {
  room: Room
}

const REVEAL_DURATION = 5 // seconds

export function ArtworkReveal({ room }: Props) {
  const [timeLeft, setTimeLeft] = useState(REVEAL_DURATION)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
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
  }, [])

  // Check if current player is impostor
  const isImpostor = true // TODO: Get from actual game state

  if (isImpostor) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-red-500" style={{ fontFamily: "monospace" }}>
              IMPOSTOR
            </h1>
            <p className="text-gray-300">Eres el impostor. No puedes ver la obra de arte.</p>
          </div>

          <div className="text-6xl font-bold text-gray-600">{timeLeft}s</div>

          <p className="text-gray-400 text-sm">Espera a que se revele la obra...</p>
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

          <div className="text-6xl font-bold text-gray-600 animate-pulse">Espera...</div>
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
