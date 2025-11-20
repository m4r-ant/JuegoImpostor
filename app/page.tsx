"use client"

import { useState } from "react"
import { CreateRoom } from "@/components/entrance/create-room"
import { JoinRoom } from "@/components/entrance/join-room"

export default function Home() {
  const [screen, setScreen] = useState<"menu" | "create" | "join">("menu")

  if (screen === "create") {
    return <CreateRoom onBack={() => setScreen("menu")} />
  }

  if (screen === "join") {
    return <JoinRoom onBack={() => setScreen("menu")} />
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-5xl font-bold text-lime-400" style={{ fontFamily: "monospace" }}>
            MAC IMPOSTOR
          </h1>
          <p className="text-gray-400 text-sm">Adivina quién es el impostor en el museo</p>
        </div>

        {/* Main Actions */}
        <div className="space-y-3 pt-8">
          <button
            onClick={() => setScreen("create")}
            className="w-full px-6 py-4 bg-lime-400 text-black font-bold rounded-lg hover:bg-lime-300 transition-colors transform hover:scale-105"
          >
            Crear Partida
          </button>

          <button
            onClick={() => setScreen("join")}
            className="w-full px-6 py-4 bg-gray-700 text-lime-400 font-bold rounded-lg hover:bg-gray-600 transition-colors border-2 border-lime-400"
          >
            Unirse a Partida
          </button>
        </div>

        {/* Footer */}
        <div className="pt-12 text-gray-600 text-xs space-y-1">
          <p>Mínimo 3 jugadores para empezar</p>
          <p>1 impostor por cada 3 jugadores</p>
        </div>
      </div>
    </main>
  )
}
