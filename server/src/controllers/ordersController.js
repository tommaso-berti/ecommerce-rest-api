import { pool } from '../db/pool.js'

const selectOrdersByUserQuery = `
  SELECT id, user_id, status, total_amount, created_at
  FROM orders
  WHERE user_id = $1
  ORDER BY created_at DESC
`

const selectOrderByIdForUserQuery = `
  SELECT id, user_id, status, total_amount, created_at
  FROM orders
  WHERE id = $1 AND user_id = $2
  LIMIT 1
`

const selectOrderItemsQuery = `
  SELECT id, order_id, product_id, quantity, price_at_purchase
  FROM order_items
  WHERE order_id = $1
  ORDER BY id ASC
`

function parseUserId(req) {
  if (!req.isAuthenticated?.() || !req.user?.id) {
    return null
  }

  const userId = Number(req.user.id)
  if (!Number.isInteger(userId) || userId <= 0) {
    return null
  }

  return userId
}

export async function getOrders(req, res, next) {
  try {
    const userId = parseUserId(req)
    if (!userId) {
      return res.status(400).json({ message: 'invalid request context' })
    }

    const { rows } = await pool.query(selectOrdersByUserQuery, [userId])
    return res.status(200).json({ orders: rows })
  } catch (error) {
    return next(error)
  }
}

export async function getOrderById(req, res, next) {
  try {
    const userId = parseUserId(req)
    if (!userId) {
      return res.status(400).json({ message: 'invalid request context' })
    }

    const orderId = Number(req.params.orderId)
    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({ message: 'invalid order id' })
    }

    const orderResult = await pool.query(selectOrderByIdForUserQuery, [orderId, userId])
    const order = orderResult.rows[0]

    if (!order) {
      return res.status(404).json({ message: 'order not found' })
    }

    const itemsResult = await pool.query(selectOrderItemsQuery, [order.id])

    return res.status(200).json({
      order,
      items: itemsResult.rows,
    })
  } catch (error) {
    return next(error)
  }
}

