import { Router } from 'express'
import { checkout } from '../controllers/checkoutController.js'

const checkoutRouter = Router()

/**
 * @openapi
 * /api/checkout:
 *   post:
 *     summary: Checkout the active cart for the authenticated user
 *     tags: [Checkout]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                   required: [product_id, quantity]
 *     responses:
 *       200:
 *         description: Checkout completed and order created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CheckoutResponse'
 *       400:
 *         description: Invalid context, empty cart, or insufficient stock
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Active cart not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Database/server error
 */
checkoutRouter.post('/checkout', checkout)

export default checkoutRouter
