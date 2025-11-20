"use client"

import { useRouter } from "next/navigation"
import type { Room } from "@/lib/types"

interface Props {
  room: Room
}

export function GameResults({ room }: Props) {
  const router = useRouter()

  const handlePlayAgain = () => {
    router.push("/")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Result */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-green-400" style={{ fontFamily: "monospace" }}>
            ¡INOCENTES GANAN!
          </h1>
          <p className="text-gray-300">Se eliminó al impostor. La obra era correctamente identificada.</p>
        </div>

        {/* Stats */}
        <div className="space-y-2 bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Puntos ganados</span>
            <span className="text-lime-400 font-bold">+100</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Racha</span>
            <span className="text-lime-400 font-bold">1 partida</span>
          </div>
        </div>

        {/* Players Ranking */}
        <div className="text-left">
          <h2 className="text-lg font-bold text-gray-300 mb-3">Resultados</h2>
          <div className="space-y-2">
            {room.players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between px-4 py-2 bg-gray-800 rounded-lg border border-gray-700"
              >
                <span className="font-mono text-white">{player.username}</span>
                <span className="text-lime-400 font-bold">+{player.points}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Button */}
        <button
          onClick={handlePlayAgain}
          className="w-full px-6 py-3 bg-lime-400 text-black font-bold rounded-lg hover:bg-lime-300 transition-colors"
        >
          Volver al Menú
        </button>
      </div>
    </main>
  )
}
