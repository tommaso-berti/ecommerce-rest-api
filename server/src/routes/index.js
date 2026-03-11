import { Router } from 'express'
import authRouter from './auth.routes.js'
import healthRouter from './health.routes.js'

const router = Router()

router.use('/health', healthRouter)
router.use(authRouter)

router.get('/error-test', () => {
  const error = new Error('Forced error for handler validation')
  error.status = 500
  throw error
})

export default router
