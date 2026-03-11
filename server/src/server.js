import app from './app.js'
import process from 'node:process'

const PORT = Number(process.env.PORT) || 3001

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})
