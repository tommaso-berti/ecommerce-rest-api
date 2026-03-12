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

const selectActiveCartByUserIdQuery = `
  SELECT id, user_id, status, created_at
  FROM carts
  WHERE user_id = $1 AND status = 'active'
  LIMIT 1
`

const selectActiveCartByUserIdForUpdateQuery = `
  SELECT id, user_id, status, created_at
  FROM carts
  WHERE user_id = $1 AND status = 'active'
  LIMIT 1
  FOR UPDATE
`

const selectCartItemsWithProductsQuery = `
  SELECT ci.id, ci.product_id, ci.quantity, p.name, p.description, p.price, p.stock
  FROM cart_items ci
  JOIN products p ON p.id = ci.product_id
  WHERE ci.cart_id = $1
  ORDER BY ci.id ASC
`

const clearCartItemsQuery = `
  DELETE FROM cart_items
  WHERE cart_id = $1
`

const upsertCartItemQuery = `
  INSERT INTO cart_items (cart_id, product_id, quantity)
  VALUES ($1, $2, $3)
  ON CONFLICT (cart_id, product_id)
  DO UPDATE SET quantity = EXCLUDED.quantity
`

const deleteCartItemByProductIdQuery = `
  DELETE FROM cart_items
  WHERE cart_id = $1 AND product_id = $2
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

function parseAuthUserId(req) {
  if (!req.isAuthenticated?.() || !req.user?.id) {
    return null
  }

  return parseUserId(req.user.id)
}

function parseProductId(productIdValue) {
  const productId = Number(productIdValue)
  if (!Number.isInteger(productId) || productId <= 0) {
    return null
  }
  return productId
}

function parseQuantity(quantityValue) {
  const quantity = Number(quantityValue)
  if (!Number.isInteger(quantity) || quantity < 0) {
    return null
  }
  return quantity
}

function validateItemsPayload(items) {
  if (!Array.isArray(items)) {
    return { error: 'items must be an array' }
  }

  const quantitiesByProductId = new Map()

  for (const item of items) {
    const productId = parseProductId(item?.product_id)
    const quantity = parseQuantity(item?.quantity)

    if (!productId) {
      return { error: 'invalid product_id in items' }
    }

    if (quantity === null || quantity <= 0) {
      return { error: 'invalid quantity in items' }
    }

    const currentQuantity = quantitiesByProductId.get(productId) || 0
    quantitiesByProductId.set(productId, currentQuantity + quantity)
  }

  return {
    items: Array.from(quantitiesByProductId.entries()).map(([product_id, quantity]) => ({
      product_id,
      quantity,
    })),
  }
}

async function getOrCreateActiveCart(client, userId, { lock = false } = {}) {
  const query = lock ? selectActiveCartByUserIdForUpdateQuery : selectActiveCartByUserIdQuery
  const existingResult = await client.query(query, [userId])
  const existingCart = existingResult.rows[0]

  if (existingCart) {
    return existingCart
  }

  const createdResult = await client.query(insertCartQuery, [userId, 'active'])
  return createdResult.rows[0]
}

async function readCartPayload(client, cart) {
  const itemsResult = await client.query(selectCartItemsWithProductsQuery, [cart.id])
  const items = itemsResult.rows
  const subtotal = items.reduce(
    (total, item) => total + Number(item.price) * Number(item.quantity),
    0,
  )

  return {
    cart,
    items,
    subtotal,
  }
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

export async function getMyActiveCart(req, res, next) {
  try {
    const userId = parseAuthUserId(req)
    if (!userId) {
      return res.status(401).json({ message: 'not authenticated' })
    }

    const cart = await getOrCreateActiveCart(pool, userId)
    const payload = await readCartPayload(pool, cart)
    return res.status(200).json(payload)
  } catch (error) {
    return next(error)
  }
}

export async function replaceMyCartItems(req, res, next) {
  const userId = parseAuthUserId(req)
  if (!userId) {
    return res.status(401).json({ message: 'not authenticated' })
  }

  const parsed = validateItemsPayload(req.body?.items)
  if (parsed.error) {
    return res.status(400).json({ message: parsed.error })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const cart = await getOrCreateActiveCart(client, userId, { lock: true })
    await client.query(clearCartItemsQuery, [cart.id])

    for (const item of parsed.items) {
      await client.query(upsertCartItemQuery, [cart.id, item.product_id, item.quantity])
    }

    const payload = await readCartPayload(client, cart)
    await client.query('COMMIT')

    return res.status(200).json(payload)
  } catch (error) {
    await client.query('ROLLBACK')

    if (error.code === '23503') {
      return res.status(400).json({ message: 'invalid product_id in items' })
    }

    return next(error)
  } finally {
    client.release()
  }
}

export async function updateMyCartItem(req, res, next) {
  const userId = parseAuthUserId(req)
  if (!userId) {
    return res.status(401).json({ message: 'not authenticated' })
  }

  const productId = parseProductId(req.params.productId)
  const quantity = parseQuantity(req.body?.quantity)

  if (!productId) {
    return res.status(400).json({ message: 'invalid product id' })
  }

  if (quantity === null) {
    return res.status(400).json({ message: 'invalid quantity' })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const cart = await getOrCreateActiveCart(client, userId, { lock: true })

    if (quantity === 0) {
      await client.query(deleteCartItemByProductIdQuery, [cart.id, productId])
    } else {
      await client.query(upsertCartItemQuery, [cart.id, productId, quantity])
    }

    const payload = await readCartPayload(client, cart)
    await client.query('COMMIT')

    return res.status(200).json(payload)
  } catch (error) {
    await client.query('ROLLBACK')

    if (error.code === '23503') {
      return res.status(400).json({ message: 'invalid product id' })
    }

    return next(error)
  } finally {
    client.release()
  }
}

export async function deleteMyCartItem(req, res, next) {
  const userId = parseAuthUserId(req)
  if (!userId) {
    return res.status(401).json({ message: 'not authenticated' })
  }

  const productId = parseProductId(req.params.productId)
  if (!productId) {
    return res.status(400).json({ message: 'invalid product id' })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const cart = await getOrCreateActiveCart(client, userId, { lock: true })
    await client.query(deleteCartItemByProductIdQuery, [cart.id, productId])

    const payload = await readCartPayload(client, cart)
    await client.query('COMMIT')

    return res.status(200).json(payload)
  } catch (error) {
    await client.query('ROLLBACK')
    return next(error)
  } finally {
    client.release()
  }
}
