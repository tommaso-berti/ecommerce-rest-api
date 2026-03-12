import { pool } from '../db/pool.js'

const selectAllProductsQuery = `
  SELECT id, name, description, price, stock, created_at
  FROM products
  ORDER BY id ASC
`

const selectProductByIdQuery = `
  SELECT id, name, description, price, stock, created_at
  FROM products
  WHERE id = $1
  LIMIT 1
`

export async function getProducts(_req, res, next) {
  try {
    const { rows } = await pool.query(selectAllProductsQuery)
    return res.status(200).json({ products: rows })
  } catch (error) {
    return next(error)
  }
}

export async function getProductById(req, res, next) {
  try {
    const productId = Number(req.params.productId)

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ message: 'invalid product id' })
    }

    const { rows } = await pool.query(selectProductByIdQuery, [productId])
    const product = rows[0]

    if (!product) {
      return res.status(404).json({ message: 'product not found' })
    }

    return res.status(200).json({ product })
  } catch (error) {
    return next(error)
  }
}

