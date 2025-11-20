import { io, Socket } from "socket.io-client"

const SOCKET_URL = process.env.SOCKET_URL || process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000"

let socket: Socket | null = null

export function getServerSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, { autoConnect: true })
    socket.on("connect", () => console.log("server-socket connected", socket?.id))
    socket.on("connect_error", (err) => console.error("server-socket connect_error", err))
  }
  return socket
}

export function emitToSocket(event: string, payload: any) {
  try {
    const s = getServerSocket()
    s.emit(event, payload)
  } catch (err) {
    console.error("emitToSocket error", err)
  }
}

export default { getServerSocket, emitToSocket }
