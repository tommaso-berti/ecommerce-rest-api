import bcrypt from 'bcrypt'
import { Router } from 'express'
import passport from 'passport'
import { pool } from '../db/pool.js'

const authRouter = Router()
const SALT_ROUNDS = 10
const MIN_PASSWORD_LENGTH = 8

const existingUserQuery = `
  SELECT id
  FROM users
  WHERE username = $1 OR email = $2
  LIMIT 1
`

const insertUserQuery = `
  INSERT INTO users (username, email, password_hash)
  VALUES ($1, $2, $3)
  RETURNING id, username, email, created_at
`

authRouter.post('/register', async (req, res, next) => {
  try {
    const username = req.body.username?.trim()
    const email = req.body.email?.trim().toLowerCase()
    const password = req.body.password

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email and password are required' })
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ message: `password must be at least ${MIN_PASSWORD_LENGTH} characters` })
    }

    const existing = await pool.query(existingUserQuery, [username, email])
    if (existing.rows[0]) {
      return res.status(409).json({ message: 'user already exists' })
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    const { rows } = await pool.query(insertUserQuery, [username, email, passwordHash])

    return res.status(201).json({ user: rows[0] })
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'user already exists' })
    }

    return next(error)
  }
})

authRouter.post('/login', (req, res, next) => {
  const identifier = req.body.identifier?.trim()
  const password = req.body.password

  if (!identifier || !password) {
    return res.status(400).json({ message: 'identifier and password are required' })
  }

  return passport.authenticate('local', (error, user, info) => {
    if (error) {
      return next(error)
    }

    if (!user) {
      return res.status(401).json({ message: info?.message || 'invalid credentials' })
    }

    return req.login(user, (loginError) => {
      if (loginError) {
        return next(loginError)
      }

      return res.status(200).json({ user })
    })
  })(req, res, next)
})

authRouter.post('/logout', (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(error)
    }

    req.session.destroy((sessionError) => {
      if (sessionError) {
        return next(sessionError)
      }

      res.clearCookie('connect.sid')
      return res.status(200).json({ message: 'logged out' })
    })
  })
})

authRouter.get('/me', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'not authenticated' })
  }

  return res.status(200).json({ user: req.user })
})

export default authRouter

