import { pool } from '../db/pool.js'

const selectActiveCartForUserQuery = `
  SELECT id, user_id, status, created_at
  FROM carts
  WHERE user_id = $1 AND status = 'active'
  LIMIT 1
  FOR UPDATE
`

const insertActiveCartForUserQuery = `
  INSERT INTO carts (user_id, status)
  VALUES ($1, 'active')
  RETURNING id, user_id, status, created_at
`

const selectCartItemsQuery = `
  SELECT ci.product_id, ci.quantity, p.price, p.stock
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

const insertOrderQuery = `
  INSERT INTO orders (user_id, status, total_amount)
  VALUES ($1, $2, $3)
  RETURNING id, user_id, status, total_amount, created_at
`

const insertOrderItemQuery = `
  INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
  VALUES ($1, $2, $3, $4)
`

const decrementStockQuery = `
  UPDATE products
  SET stock = stock - $1
  WHERE id = $2 AND stock >= $1
  RETURNING id
`

const updateCartStatusQuery = `
  UPDATE carts
  SET status = 'checked_out'
  WHERE id = $1
`

function parseCheckoutItems(rawItems) {
  if (rawItems === undefined) {
    return { items: null }
  }

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return { error: 'items must be a non-empty array' }
  }

  const quantitiesByProductId = new Map()

  for (const item of rawItems) {
    const productId = Number(item?.product_id)
    const quantity = Number(item?.quantity)

    if (!Number.isInteger(productId) || productId <= 0) {
      return { error: 'invalid product_id in items' }
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
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

export async function checkout(req, res, next) {
  if (!req.isAuthenticated?.() || !req.user?.id) {
    return res.status(400).json({ message: 'invalid request context' })
  }

  const userId = Number(req.user.id)
  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ message: 'invalid request context' })
  }

  const parsedItems = parseCheckoutItems(req.body?.items)
  if (parsedItems.error) {
    return res.status(400).json({ message: parsedItems.error })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const cartResult = await client.query(selectActiveCartForUserQuery, [userId])
    let cart = cartResult.rows[0]

    if (parsedItems.items) {
      if (!cart) {
        const newCartResult = await client.query(insertActiveCartForUserQuery, [userId])
        cart = newCartResult.rows[0]
      }

      await client.query(clearCartItemsQuery, [cart.id])

      for (const item of parsedItems.items) {
        await client.query(upsertCartItemQuery, [cart.id, item.product_id, item.quantity])
      }
    }

    if (!cart) {
      await client.query('ROLLBACK')
      return res.status(404).json({ message: 'cart not found' })
    }

    const itemsResult = await client.query(selectCartItemsQuery, [cart.id])
    const items = itemsResult.rows

    if (items.length === 0) {
      await client.query('ROLLBACK')
      return res.status(400).json({ message: 'cart is empty' })
    }

    for (const item of items) {
      if (Number(item.stock) < Number(item.quantity)) {
        await client.query('ROLLBACK')
        return res.status(400).json({ message: `insufficient stock for product ${item.product_id}` })
      }
    }

    const totalAmount = items.reduce(
      (total, item) => total + Number(item.price) * Number(item.quantity),
      0,
    )

    const orderResult = await client.query(insertOrderQuery, [userId, 'pending', totalAmount])
    const order = orderResult.rows[0]

    for (const item of items) {
      await client.query(insertOrderItemQuery, [
        order.id,
        item.product_id,
        item.quantity,
        item.price,
      ])

      const stockUpdateResult = await client.query(decrementStockQuery, [
        item.quantity,
        item.product_id,
      ])

      if (!stockUpdateResult.rows[0]) {
        await client.query('ROLLBACK')
        return res.status(400).json({ message: `insufficient stock for product ${item.product_id}` })
      }
    }

    await client.query(updateCartStatusQuery, [cart.id])
    await client.query('COMMIT')

    return res.status(200).json({
      order,
      items: items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.price,
      })),
      cart: {
        id: cart.id,
        status: 'checked_out',
      },
    })
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
