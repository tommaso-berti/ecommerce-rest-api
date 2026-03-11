import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import apiRouter from './routes/index.js'
import { notFound } from './middlewares/notFound.js'
import { errorHandler } from './middlewares/errorHandler.js'

const app = express()

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api', apiRouter)

app.use(notFound)
app.use(errorHandler)

export default app
