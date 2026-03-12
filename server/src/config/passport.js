import bcrypt from 'bcrypt'
import passport from 'passport'
import process from 'node:process'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
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

const findByGoogleIdQuery = `
  SELECT id, username, email, created_at
  FROM users
  WHERE google_id = $1
  LIMIT 1
`

const findByEmailQuery = `
  SELECT id, username, email, created_at
  FROM users
  WHERE email = $1
  LIMIT 1
`

const linkGoogleIdQuery = `
  UPDATE users
  SET google_id = $1
  WHERE id = $2
  RETURNING id, username, email, created_at
`

const countUsernameQuery = `
  SELECT COUNT(*)::int AS count
  FROM users
  WHERE username = $1
`

const insertGoogleUserQuery = `
  INSERT INTO users (username, email, password_hash, google_id)
  VALUES ($1, $2, NULL, $3)
  RETURNING id, username, email, created_at
`

function sanitizeUsername(source) {
  const cleaned = source
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')

  if (!cleaned) {
    return 'google_user'
  }

  return cleaned.slice(0, 50)
}

async function buildUniqueUsername(base) {
  const normalizedBase = sanitizeUsername(base)
  let candidate = normalizedBase
  let suffix = 1

  while (true) {
    const { rows } = await pool.query(countUsernameQuery, [candidate])
    if (rows[0].count === 0) {
      return candidate
    }

    suffix += 1
    const suffixText = `_${suffix}`
    const maxBaseLength = 50 - suffixText.length
    candidate = `${normalizedBase.slice(0, maxBaseLength)}${suffixText}`
  }
}

export function setupPassport() {
  const googleClientId = process.env.GOOGLE_CLIENT_ID
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
  const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
  const googleCallbackUrl =
    process.env.GOOGLE_CALLBACK_URL || `${clientOrigin}/api/auth/google/callback`

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

          if (!user.password_hash) {
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

  if (googleClientId && googleClientSecret) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: googleClientId,
          clientSecret: googleClientSecret,
          callbackURL: googleCallbackUrl,
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const googleId = profile.id
            const email = profile.emails?.[0]?.value?.trim().toLowerCase()

            if (!googleId || !email) {
              return done(null, false, { message: 'missing google profile data' })
            }

            const linkedUserResult = await pool.query(findByGoogleIdQuery, [googleId])
            if (linkedUserResult.rows[0]) {
              return done(null, linkedUserResult.rows[0])
            }

            const existingByEmailResult = await pool.query(findByEmailQuery, [email])
            if (existingByEmailResult.rows[0]) {
              const { rows } = await pool.query(linkGoogleIdQuery, [
                googleId,
                existingByEmailResult.rows[0].id,
              ])

              return done(null, rows[0])
            }

            const profileName = profile.displayName?.trim()
            const emailPrefix = email.split('@')[0]
            const baseUsername = profileName || emailPrefix || 'google_user'
            const uniqueUsername = await buildUniqueUsername(baseUsername)

            const { rows } = await pool.query(insertGoogleUserQuery, [
              uniqueUsername,
              email,
              googleId,
            ])

            return done(null, rows[0])
          } catch (error) {
            return done(error)
          }
        },
      ),
    )
  } else {
    console.warn('[auth] Google OAuth disabled: missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET')
  }

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
