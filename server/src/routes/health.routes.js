import { Router } from 'express'

const healthRouter = Router()

/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Health check
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 service:
 *                   type: string
 *                   example: ecommerce-api
 */
healthRouter.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'ecommerce-api',
  })
})

export default healthRouter
