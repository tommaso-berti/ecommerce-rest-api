import { Router } from 'express'
import { getOrderById, getOrders } from '../controllers/ordersController.js'

const ordersRouter = Router()

ordersRouter.get('/orders', getOrders)
ordersRouter.get('/orders/:orderId', getOrderById)

export default ordersRouter

