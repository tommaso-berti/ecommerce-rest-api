import app from './app.js'
import process from 'node:process'
import { resetAndSeedDatabase } from './db/bootstrap.js'

const PORT = Number(process.env.PORT) || 3001

async function startServer() {
  try {
    await resetAndSeedDatabase()

    app.listen(PORT, () => {
      console.log(`API server running on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('[startup] failed to initialize database:', error.message)
    process.exit(1)
  }
}

startServer()
