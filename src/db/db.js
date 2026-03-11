import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config()

const { Pool } = pg

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
})

pool
  .query('SELECT NOW()')
  .then((result) => {
    console.log('PostgreSQL connected:', result.rows[0].now)
  })
  .catch((error) => {
    console.error('PostgreSQL connection error:', error.message)
  })
