"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Props {
  onBack: () => void
}

export function CreateRoom({ onBack }: Props) {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!username.trim()) {
      setError("Por favor ingresa tu nombre")
      return
    }

    if (username.length > 20) {
      setError("El nombre debe tener máximo 20 caracteres")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      })

      if (!response.ok) throw new Error("Error al crear la sala")

      const { roomId, playerId } = await response.json()
      // store player id locally for identifying socket
      try {
        localStorage.setItem('playerId', playerId)
      } catch (_) {}
      router.push(`/game/${roomId}`)
    } catch (err) {
      setError("Hubo un error al crear la partida")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <button onClick={onBack} className="text-gray-400 hover:text-lime-400 transition-colors text-sm font-mono">
          ← Volver
        </button>

        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-lime-400">Crear Partida</h2>
          <p className="text-gray-400 text-sm">Eres el anfitrión de esta sala</p>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-mono text-gray-300 mb-2">Tu nombre</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu nombre"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-lime-400 focus:outline-none transition-colors"
              maxLength={20}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-lime-400 text-black font-bold rounded-lg hover:bg-lime-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creando..." : "Crear Sala"}
          </button>
        </form>

        <div className="text-gray-600 text-xs text-center">Se creará una sala privada con código único</div>
      </div>
    </main>
  )
}
