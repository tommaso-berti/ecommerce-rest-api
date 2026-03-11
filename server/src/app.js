import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import session from 'express-session'
import morgan from 'morgan'
import passport from 'passport'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { setupPassport } from './config/passport.js'
import apiRouter from './routes/index.js'
import { notFound } from './middlewares/notFound.js'
import { errorHandler } from './middlewares/errorHandler.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootEnvPath = path.resolve(__dirname, '../../.env')

dotenv.config({ path: rootEnvPath })

const app = express()
setupPassport()

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
)
app.use(passport.initialize())
app.use(passport.session())

app.use('/api', apiRouter)

app.use(notFound)
app.use(errorHandler)

export default app
