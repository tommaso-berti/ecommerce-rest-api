import { Router } from 'express'
import { createCart, deleteCart, getCartById, updateCart } from '../controllers/cartController.js'

const cartRouter = Router()

cartRouter.get('/cart/:cartId', getCartById)
cartRouter.post('/cart', createCart)
cartRouter.put('/cart/:cartId', updateCart)
cartRouter.delete('/cart/:cartId', deleteCart)

export default cartRouter

