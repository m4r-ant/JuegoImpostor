"use client"

import type React from "react"

import { useState } from "react"
import type { Room } from "@/lib/types"

interface Props {
  room: Room
}

export function DescriptionRound({ room }: Props) {
  const [myDescription, setMyDescription] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [descriptions, setDescriptions] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!myDescription.trim()) return

    setDescriptions({
      ...descriptions,
      current: myDescription,
    })
    setSubmitted(true)

    // Simulate receiving others' descriptions
    setTimeout(() => {
      setDescriptions((prev) => ({
        ...prev,
        player2: "Es una forma abstracta",
        player3: "Tiene colores oscuros",
        player4: "Parece moderna",
      }))
    }, 2000)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-lime-400" style={{ fontFamily: "monospace" }}>
            Ronda de Descripciones
          </h1>
          <p className="text-gray-400 text-sm mt-2">Cada jugador describe una característica de la obra</p>
        </div>

        {/* Players Count */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Jugadores que han descrito</p>
          <p className="text-2xl font-bold text-lime-400">
            {Object.keys(descriptions).length}/{room.players.length}
          </p>
        </div>

        {/* Descriptions List */}
        {Object.keys(descriptions).length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-300">Descripciones</h2>
            <div className="space-y-2">
              {Object.entries(descriptions).map(([player, desc]) => (
                <div key={player} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <p className="text-xs text-gray-400 mb-1">Jugador Anónimo</p>
                  <p className="text-gray-200">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        {!submitted && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-mono text-gray-300 mb-2">Tu descripción</label>
              <textarea
                value={myDescription}
                onChange={(e) => setMyDescription(e.target.value)}
                placeholder="Describe una característica de la obra..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-lime-400 focus:outline-none transition-colors resize-none"
                rows={3}
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">{myDescription.length}/100</p>
            </div>

            <button
              type="submit"
              disabled={!myDescription.trim()}
              className="w-full px-6 py-3 bg-lime-400 text-black font-bold rounded-lg hover:bg-lime-300 transition-colors disabled:opacity-50"
            >
              Enviar Descripción
            </button>
          </form>
        )}

        {submitted && (
          <div className="p-4 bg-green-900 bg-opacity-20 border border-green-700 rounded-lg text-green-300 text-sm text-center">
            Tu descripción ha sido enviada. Esperando a los otros jugadores...
          </div>
        )}
      </div>
    </main>
  )
}
