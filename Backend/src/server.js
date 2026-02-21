import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import http from 'http'
import morgan from 'morgan'
import { Server as SocketServer } from 'socket.io'
import connectDb from './config/db.js'
import expertRoutes from './routes/expertRoutes.js'
import bookingRoutes from './routes/bookingRoutes.js'

dotenv.config()

const app = express()
const server = http.createServer(app)
const clientOrigin = process.env.CLIENT_ORIGIN || '*'

app.use(cors({ origin: clientOrigin }))
app.use(express.json())
app.use(morgan('dev'))

const io = new SocketServer(server, {
  cors: {
    origin: clientOrigin,
  },
})

app.locals.io = io

io.on('connection', (socket) => {
  socket.emit('connected', { id: socket.id })
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/experts', expertRoutes)
app.use('/api/bookings', bookingRoutes)

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' })
})

app.use((err, req, res, next) => {
  if (err.name === 'ZodError') {
    const message = err.issues?.[0]?.message || 'Invalid request.'
    return res.status(400).json({ message })
  }

  const status = err.statusCode || 500
  return res.status(status).json({ message: err.message || 'Server error.' })
})

const PORT = process.env.PORT || 4000

connectDb()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`)
      console.log(`📡 Client Origin: ${clientOrigin}`)
    })
  })
  .catch((error) => {
    console.error('❌ Database connection failed.')
    console.error(error.message)
    process.exit(1)
  })
