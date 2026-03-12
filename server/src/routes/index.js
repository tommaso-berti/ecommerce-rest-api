import { Router } from 'express'
import authRouter from './auth.routes.js'
import cartRouter from './cart.js'
import checkoutRouter from './checkout.js'
import healthRouter from './health.routes.js'
import productsRouter from './products.js'

const router = Router()

router.use('/health', healthRouter)
router.use(productsRouter)
router.use(cartRouter)
router.use(checkoutRouter)
router.use(authRouter)

router.get('/error-test', () => {
  const error = new Error('Forced error for handler validation')
  error.status = 500
  throw error
})

export default router
