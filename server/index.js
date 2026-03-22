import express from 'express'
import http from 'http'
import cors from 'cors'
import morgan from 'morgan'
import path from 'path'
import socketIoHandler from './socketio/index.js'
import routes from './routes/index.js'

const app = express()
const server = http.createServer(app)
const port = process.env.PORT || 8081

app.use(morgan('tiny'))
app.use(cors())
app.use(express.json())

// Express only serves static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use('/', express.static(path.join('client', 'build')))

  // Connect all routes
  app.use(routes)

  app.get('/*', (req, res) => {
    res.sendFile(path.resolve('client', 'build', 'index.html'), (err) => {
      if (err) {
        res.status(500).send(err)
      }
    })
  })
} else {
  app.get('/', (req, res) => {
    res.send(
      'React app at: <a href="http://localhost:3000">http://localhost:3000</a>',
    )
  })

  // Delay responses for production simulation (network latency)
  // app.use(async (req, res, next) => {
  //   await new Promise((resolve) => setTimeout(resolve, 3000))
  //   next()
  // })

  // Connect all routes
  app.use(routes)
}

// Common Error Handler
app.use((err, req, res, next) => {
  res.status(500).send({
    ok: false,
    message: err.message,
    error: err,
  })
})

server.listen(port, () => {
  console.log(`Game server started at http://localhost:${port}`)
})

socketIoHandler(server)
