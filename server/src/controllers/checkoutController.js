import { pool } from '../db/pool.js'

const selectActiveCartForUserQuery = `
  SELECT id, user_id, status, created_at
  FROM carts
  WHERE user_id = $1 AND status = 'active'
  LIMIT 1
  FOR UPDATE
`

const selectCartItemsQuery = `
  SELECT ci.product_id, ci.quantity, p.price, p.stock
  FROM cart_items ci
  JOIN products p ON p.id = ci.product_id
  WHERE ci.cart_id = $1
  ORDER BY ci.id ASC
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

export async function checkout(req, res, next) {
  if (!req.isAuthenticated?.() || !req.user?.id) {
    return res.status(400).json({ message: 'invalid request context' })
  }

  const userId = Number(req.user.id)
  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ message: 'invalid request context' })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const cartResult = await client.query(selectActiveCartForUserQuery, [userId])
    const cart = cartResult.rows[0]

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
    return next(error)
  } finally {
    client.release()
  }
}

