"use client"

import { useState } from "react"
import type { Room } from "@/lib/types"

interface Props {
  room: Room
}

export function VotingPanel({ room }: Props) {
  const [votes, setVotes] = useState<Record<string, number>>({})
  const [voted, setVoted] = useState(false)

  const handleVote = (playerId: string) => {
    setVotes({
      ...votes,
      [playerId]: (votes[playerId] || 0) + 1,
    })
    setVoted(true)
  }

  const maxVotes = Math.max(...Object.values(votes), 0)

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-red-500" style={{ fontFamily: "monospace" }}>
            Votación
          </h1>
          <p className="text-gray-400 text-sm mt-2">¿Quién crees que es el impostor?</p>
        </div>

        {/* Vote Count */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Votos recibidos</p>
          <p className="text-2xl font-bold text-red-500">
            {Object.values(votes).reduce((a, b) => a + b, 0)}/{room.players.length}
          </p>
        </div>

        {/* Players to Vote */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-300">Candidatos</h2>
          <div className="grid gap-2">
            {room.players.map((player) => {
              const playerVotes = votes[player.id] || 0
              const votePercentage = maxVotes > 0 ? (playerVotes / maxVotes) * 100 : 0

              return (
                <button
                  key={player.id}
                  onClick={() => handleVote(player.id)}
                  disabled={voted}
                  className="relative overflow-hidden px-4 py-3 text-left bg-gray-800 border border-gray-700 rounded-lg hover:border-red-500 transition-colors disabled:cursor-not-allowed"
                >
                  {/* Vote Progress Bar */}
                  <div
                    className="absolute inset-0 bg-red-900 opacity-20 transition-all"
                    style={{ width: `${votePercentage}%` }}
                  />

                  <div className="relative flex items-center justify-between">
                    <span className="font-mono text-white">{player.username}</span>
                    <span className="text-red-400 font-bold">{playerVotes}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {voted && (
          <div className="p-4 bg-green-900 bg-opacity-20 border border-green-700 rounded-lg text-green-300 text-sm text-center">
            ¡Tu voto ha sido registrado!
          </div>
        )}
      </div>
    </main>
  )
}
