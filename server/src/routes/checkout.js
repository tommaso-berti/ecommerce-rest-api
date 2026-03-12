import { Router } from 'express'
import { checkout } from '../controllers/checkoutController.js'

const checkoutRouter = Router()

checkoutRouter.post('/checkout', checkout)

export default checkoutRouter

