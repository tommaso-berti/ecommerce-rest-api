import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { pool } from './pool.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const schemaPath = path.resolve(__dirname, '../../../database/schema.sql')

export async function resetAndSeedDatabase() {
  const environment = process.env.NODE_ENV || 'development'

  if (environment !== 'development') {
    console.log(`[db] bootstrap skipped (NODE_ENV=${environment})`)
    return
  }

  const schemaSql = await readFile(schemaPath, 'utf8')
  await pool.query(schemaSql)
  console.log('[db] reset and seed completed from database/schema.sql')
}

