import bcrypt from 'bcrypt'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { pool } from '../db/pool.js'

const findByIdentifierQuery = `
  SELECT id, username, email, password_hash, created_at
  FROM users
  WHERE username = $1 OR email = $1
  LIMIT 1
`

const findByIdQuery = `
  SELECT id, username, email, created_at
  FROM users
  WHERE id = $1
  LIMIT 1
`

export function setupPassport() {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'identifier',
        passwordField: 'password',
      },
      async (identifier, password, done) => {
        try {
          const normalizedIdentifier = identifier?.trim()
          if (!normalizedIdentifier || !password) {
            return done(null, false, { message: 'Missing credentials' })
          }

          const { rows } = await pool.query(findByIdentifierQuery, [normalizedIdentifier])
          const user = rows[0]

          if (!user) {
            return done(null, false, { message: 'Invalid credentials' })
          }

          const isValidPassword = await bcrypt.compare(password, user.password_hash)
          if (!isValidPassword) {
            return done(null, false, { message: 'Invalid credentials' })
          }

          const safeUser = {
            id: user.id,
            username: user.username,
            email: user.email,
            created_at: user.created_at,
          }

          return done(null, safeUser)
        } catch (error) {
          return done(error)
        }
      },
    ),
  )

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser(async (id, done) => {
    try {
      const { rows } = await pool.query(findByIdQuery, [id])
      const user = rows[0]

      if (!user) {
        return done(null, false)
      }

      return done(null, user)
    } catch (error) {
      return done(error)
    }
  })
}

