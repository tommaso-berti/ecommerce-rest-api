import { pool } from '../db/pool.js'

const CART_STATUSES = new Set(['active', 'checked_out', 'abandoned'])

const selectCartByIdQuery = `
  SELECT id, user_id, status, created_at
  FROM carts
  WHERE id = $1
  LIMIT 1
`

const insertCartQuery = `
  INSERT INTO carts (user_id, status)
  VALUES ($1, $2)
  RETURNING id, user_id, status, created_at
`

const updateCartQuery = `
  UPDATE carts
  SET user_id = $1, status = $2
  WHERE id = $3
  RETURNING id, user_id, status, created_at
`

const deleteCartQuery = `
  DELETE FROM carts
  WHERE id = $1
  RETURNING id, user_id, status, created_at
`

function parseCartId(cartIdParam) {
  const cartId = Number(cartIdParam)
  if (!Number.isInteger(cartId) || cartId <= 0) {
    return null
  }
  return cartId
}

function parseUserId(userIdValue) {
  const userId = Number(userIdValue)
  if (!Number.isInteger(userId) || userId <= 0) {
    return null
  }
  return userId
}

function parseStatus(statusValue) {
  if (typeof statusValue !== 'string') {
    return null
  }
  const status = statusValue.trim()
  if (!CART_STATUSES.has(status)) {
    return null
  }
  return status
}

export async function getCartById(req, res, next) {
  try {
    const cartId = parseCartId(req.params.cartId)
    if (!cartId) {
      return res.status(400).json({ message: 'invalid cart id' })
    }

    const { rows } = await pool.query(selectCartByIdQuery, [cartId])
    const cart = rows[0]

    if (!cart) {
      return res.status(404).json({ message: 'cart not found' })
    }

    return res.status(200).json({ cart })
  } catch (error) {
    return next(error)
  }
}

export async function createCart(req, res, next) {
  try {
    const userId = parseUserId(req.body.user_id)
    const status = req.body.status === undefined ? 'active' : parseStatus(req.body.status)

    if (!userId) {
      return res.status(400).json({ message: 'user_id is required and must be a positive integer' })
    }

    if (!status) {
      return res.status(400).json({ message: 'status must be one of: active, checked_out, abandoned' })
    }

    const { rows } = await pool.query(insertCartQuery, [userId, status])
    return res.status(201).json({ cart: rows[0] })
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({ message: 'invalid user_id: user does not exist' })
    }
    if (error.code === '23505') {
      return res.status(409).json({ message: 'an active cart already exists for this user' })
    }
    return next(error)
  }
}

export async function updateCart(req, res, next) {
  try {
    const cartId = parseCartId(req.params.cartId)
    if (!cartId) {
      return res.status(400).json({ message: 'invalid cart id' })
    }

    const userId = parseUserId(req.body.user_id)
    const status = parseStatus(req.body.status)

    if (!userId || !status) {
      return res.status(400).json({
        message: 'user_id and status are required (status: active, checked_out, abandoned)',
      })
    }

    const { rows } = await pool.query(updateCartQuery, [userId, status, cartId])
    const cart = rows[0]

    if (!cart) {
      return res.status(404).json({ message: 'cart not found' })
    }

    return res.status(200).json({ cart })
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({ message: 'invalid user_id: user does not exist' })
    }
    if (error.code === '23505') {
      return res.status(409).json({ message: 'an active cart already exists for this user' })
    }
    return next(error)
  }
}

export async function deleteCart(req, res, next) {
  try {
    const cartId = parseCartId(req.params.cartId)
    if (!cartId) {
      return res.status(400).json({ message: 'invalid cart id' })
    }

    const { rows } = await pool.query(deleteCartQuery, [cartId])
    const cart = rows[0]

    if (!cart) {
      return res.status(404).json({ message: 'cart not found' })
    }

    return res.status(200).json({ message: 'cart deleted', cart })
  } catch (error) {
    return next(error)
  }
}

