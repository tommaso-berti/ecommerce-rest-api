import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import session from 'express-session'
import morgan from 'morgan'
import passport from 'passport'
import path from 'node:path'
import process from 'node:process'
import swaggerUi from 'swagger-ui-express'
import { fileURLToPath } from 'node:url'
import { setupPassport } from './config/passport.js'
import swaggerSpec from './config/swagger.js'
import apiRouter from './routes/index.js'
import { notFound } from './middlewares/notFound.js'
import { errorHandler } from './middlewares/errorHandler.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootEnvPath = path.resolve(__dirname, '../../.env')

dotenv.config({ path: rootEnvPath })

const app = express()
setupPassport()
const isProduction = process.env.NODE_ENV === 'production'
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

if (isProduction) {
  // Required behind reverse proxies (Caddy/Nginx) so secure session cookies work correctly.
  app.set('trust proxy', 1)
}

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  }),
)
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-session-secret',
    proxy: isProduction,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
)
app.use(passport.initialize())
app.use(passport.session())

app.get('/api-docs.json', (_req, res) => {
  res.status(200).json(swaggerSpec)
})
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use('/api', apiRouter)

app.use(notFound)
app.use(errorHandler)

export default app
