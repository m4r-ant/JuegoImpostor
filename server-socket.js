// Simple Socket.io server to run alongside Next.js for local development
const { createServer } = require('http')
const { Server } = require('socket.io')

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  }
})

const PORT = process.env.SOCKET_PORT || 4000

// In-memory mapping roomId -> Set(socketId)
const rooms = new Map()

// Server-side events from Next.js backend (connect from server-socket-client)
io.on('connection', (socket) => {
  const { roomId, playerId } = socket.handshake.auth || {}
  console.log('socket connected', socket.id, 'roomId:', roomId, 'playerId:', playerId)

  // If this is a backend connection (no roomId), listen for events to broadcast
  if (!roomId) {
    console.log('Backend connection detected (server-socket-client)')
    
    // Listen for events from Next.js backend
    socket.on('player-joined', (data) => {
      console.log('[BACKEND] Received player-joined:', data)
      if (data.roomId) {
        console.log(`[BROADCAST] Emitting player-joined to room ${data.roomId}`)
        io.to(data.roomId).emit('player-joined', data)
      }
    })

    socket.on('game-started', (data) => {
      console.log('[BACKEND] Received game-started:', data)
      if (data.roomId) {
        console.log(`[BROADCAST] Emitting game-started to room ${data.roomId}`)
        io.to(data.roomId).emit('game-started', data)
      }
    })

    socket.on('artwork-revealed', (data) => {
      console.log('[BACKEND] Received artwork-revealed:', data)
      if (data.roomId) {
        console.log(`[BROADCAST] Emitting artwork-revealed to room ${data.roomId}`)
        io.to(data.roomId).emit('artwork-revealed', data)
      }
    })

    socket.on('player-ready', (data) => {
      console.log('[BACKEND] Received player-ready:', data)
      if (data.roomId) {
        console.log(`[BROADCAST] Emitting player-ready to room ${data.roomId}`)
        io.to(data.roomId).emit('player-ready', data)
      }
    })

    socket.on('phase-changed', (data) => {
      console.log('[BACKEND] Received phase-changed:', data)
      if (data.roomId) {
        console.log(`[BROADCAST] Emitting phase-changed to room ${data.roomId}`)
        io.to(data.roomId).emit('phase-changed', data)
      }
    })

    socket.on('voting-complete', (data) => {
      console.log('[BACKEND] Received voting-complete:', data)
      if (data.roomId) {
        console.log(`[BROADCAST] Emitting voting-complete to room ${data.roomId}`)
        io.to(data.roomId).emit('voting-complete', data)
      }
    })

    return
  }

  // Client connections (browser)
  socket.join(roomId)

  // track
  if (!rooms.has(roomId)) rooms.set(roomId, new Set())
  rooms.get(roomId).add(socket.id)

  console.log(`Room ${roomId} now has ${rooms.get(roomId).size} connections`)

  socket.on('disconnect', () => {
    console.log('socket disconnected', socket.id)
    if (rooms.has(roomId)) {
      rooms.get(roomId).delete(socket.id)
      if (rooms.get(roomId).size === 0) {
        rooms.delete(roomId)
      } else {
        socket.to(roomId).emit('player-left', { playerId })
      }
    }
  })
})

httpServer.listen(PORT, () => {
  console.log('Socket server running on port', PORT)
})

