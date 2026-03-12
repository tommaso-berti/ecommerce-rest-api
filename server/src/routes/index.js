import { Router } from 'express'
import authRouter from './auth.routes.js'
import cartRouter from './cart.routes.js'
import checkoutRouter from './checkout.routes.js'
import healthRouter from './health.routes.js'
import ordersRouter from './orders.routes.js'
import productsRouter from './products.routes.js'

const router = Router()

router.use('/health', healthRouter)
router.use(productsRouter)
router.use(cartRouter)
router.use(ordersRouter)
router.use(checkoutRouter)
router.use(authRouter)

router.get('/error-test', () => {
  const error = new Error('Forced error for handler validation')
  error.status = 500
  throw error
})

export default router
