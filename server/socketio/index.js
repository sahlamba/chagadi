import { Server } from 'socket.io'
import { GameServerEvents } from './listeners.js'

const socketIoHandler = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        'http://localhost:3000',
        'https://cloud.sahillamba.com',
      ],
      methods: ['GET', 'POST'],
    },
  })

  io.totalConnections = 0
  io.on('connection', (socket) => {
    io.totalConnections += 1
    console.log(`Socket.io CONNECT (${io.totalConnections})`)

    socket.on('disconnect', () => {
      io.totalConnections -= 1
      console.log(`Socket.io DISCONNECT (${io.totalConnections})`)
    })

    // Set up game session event listeners for the server
    GameServerEvents.forEach((evt) => {
      socket.on(evt.name, (data, callback) => {
        evt.listener(io, socket, data, callback)
      })
    })
  })
}

export default socketIoHandler
