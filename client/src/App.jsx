import { Alert, Snackbar } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import CheckoutPage from './pages/CheckoutPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import OrdersPage from './pages/OrdersPage'
import ProductPage from './pages/ProductPage'
import RegisterPage from './pages/RegisterPage'
import { getCurrentUser, logout as logoutUser } from './services/auth'
import { deleteMyCartItem, getMyCart, updateMyCartItem } from './services/cart'
import { getProducts } from './services/products'

function App() {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCartSyncing, setIsCartSyncing] = useState(false)
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState('')
  const [cartFeedback, setCartFeedback] = useState({
    open: false,
    message: '',
    severity: 'success',
  })
  const [currentUser, setCurrentUser] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function bootstrapCurrentSession() {
      try {
        const response = await getCurrentUser()
        if (isMounted) {
          setCurrentUser(response.user ?? null)
          setAuthError('')
        }
      } catch (error) {
        if (!isMounted) {
          return
        }

        if (error.status !== 401) {
          setAuthError(error.message || 'Failed to load user session.')
        }
        setCurrentUser(null)
      } finally {
        if (isMounted) {
          setIsAuthLoading(false)
        }
      }
    }

    bootstrapCurrentSession()

    return () => {
      isMounted = false
    }
  }, [])

  const reloadProducts = useCallback(async ({ showLoader = true } = {}) => {
    if (showLoader) {
      setProductsLoading(true)
    }

    try {
      const response = await getProducts()
      const normalizedProducts = (response.products ?? []).map((product) => ({
        ...product,
        price: Number(product.price),
      }))

      setProducts(normalizedProducts)
      setProductsError('')
    } catch (error) {
      setProducts([])
      setProductsError(error.message || 'Failed to load products.')
    } finally {
      if (showLoader) {
        setProductsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    reloadProducts()
  }, [reloadProducts])

  const mapCartItemsFromApi = useCallback((items = []) => {
    return items.map((item) => ({
      id: Number(item.product_id),
      name: item.name,
      description: item.description,
      price: Number(item.price),
      stock: Number(item.stock),
      quantity: Number(item.quantity),
    }))
  }, [])

  const loadMyCart = useCallback(async () => {
    if (!currentUser) {
      setCartItems([])
      return
    }

    setIsCartSyncing(true)
    try {
      const response = await getMyCart()
      setCartItems(mapCartItemsFromApi(response.items))
    } catch (error) {
      if (error.status === 401) {
        setCurrentUser(null)
        setCartItems([])
      } else {
        setCartFeedback({
          open: true,
          message: error.message || 'Failed to load cart.',
          severity: 'error',
        })
      }
    } finally {
      setIsCartSyncing(false)
    }
  }, [currentUser, mapCartItemsFromApi])

  useEffect(() => {
    if (!currentUser) {
      setCartItems([])
      return
    }

    loadMyCart()
  }, [currentUser, loadMyCart])

  const syncCartItemQuantity = async (productId, quantity) => {
    setIsCartSyncing(true)
    try {
      const response =
        quantity === 0 ? await deleteMyCartItem(productId) : await updateMyCartItem(productId, quantity)

      setCartItems(mapCartItemsFromApi(response.items))
      return true
    } catch (error) {
      setCartFeedback({
        open: true,
        message: error.message || 'Cart update failed. Please try again.',
        severity: 'error',
      })
      return false
    } finally {
      setIsCartSyncing(false)
    }
  }

  const handleAddToCart = async (product) => {
    if (!currentUser) {
      setCartFeedback({
        open: true,
        message: 'Please sign in to use the cart.',
        severity: 'info',
      })
      navigate('/login')
      return
    }

    const existingItem = cartItems.find((item) => item.id === product.id)
    const nextQuantity = existingItem ? existingItem.quantity + 1 : 1
    const synced = await syncCartItemQuantity(product.id, nextQuantity)

    if (synced) {
      setCartFeedback({
        open: true,
        message: `${product.name} aggiunto al carrello`,
        
        severity: 'success',
      })
    }
  }

  const handleDecreaseCartItem = async (productId) => {
    const item = cartItems.find((entry) => entry.id === productId)
    if (!item) {
      return
    }

    const nextQuantity = item.quantity - 1
    await syncCartItemQuantity(productId, nextQuantity)
  }

  const handleIncreaseCartItem = async (productId) => {
    const item = cartItems.find((entry) => entry.id === productId)
    if (!item) {
      return
    }

    const nextQuantity = item.quantity + 1
    await syncCartItemQuantity(productId, nextQuantity)
  }

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const cartSubtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const isAuthBusy = isAuthLoading || isLoggingOut

  const handleLoginSuccess = (user) => {
    setCurrentUser(user)
    setAuthError('')
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    setAuthError('')

    try {
      await logoutUser()
      setCurrentUser(null)
      setCartItems([])
      setIsCartOpen(false)
      navigate('/', { replace: true })
    } catch (error) {
      const message = error.message || 'Logout failed. Please try again.'
      setAuthError(message)
      throw error
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleOpenCheckout = () => {
    if (!currentUser) {
      setCartFeedback({
        open: true,
        message: 'Please sign in to continue to checkout.',
        severity: 'info',
      })
      navigate('/login')
      return
    }

    setIsCartOpen(false)
    navigate('/checkout')
  }

  const handleCheckoutSuccess = async () => {
    setCartItems([])
    setIsCartOpen(false)
    await reloadProducts({ showLoader: false })
    await loadMyCart()
  }

  return (
    <>
      <AppLayout
        cartItems={cartItems}
        cartItemCount={cartItemCount}
        cartSubtotal={cartSubtotal}
        currentUser={currentUser}
        isAuthBusy={isAuthBusy}
        authError={authError}
        isCartOpen={isCartOpen}
        isCartSyncing={isCartSyncing}
        onCheckout={handleOpenCheckout}
        onCloseCart={() => setIsCartOpen(false)}
        onDecreaseFromCart={handleDecreaseCartItem}
        onIncreaseFromCart={handleIncreaseCartItem}
        onLogout={handleLogout}
        onOpenCart={() => setIsCartOpen(true)}
      >
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                products={products}
                productsError={productsError}
                productsLoading={productsLoading}
                onAddToCart={handleAddToCart}
              />
            }
          />
          <Route path="/products/:productId" element={<ProductPage onAddToCart={handleAddToCart} />} />
          <Route
            path="/checkout"
            element={
              <CheckoutPage
                cartItems={cartItems}
                cartSubtotal={cartSubtotal}
                currentUser={currentUser}
                isAuthLoading={isAuthLoading}
                onCheckoutSuccess={handleCheckoutSuccess}
              />
            }
          />
          <Route
            path="/orders"
            element={<OrdersPage currentUser={currentUser} isAuthLoading={isAuthLoading} />}
          />
          <Route
            path="/login"
            element={
              <LoginPage
                currentUser={currentUser}
                isAuthBusy={isAuthBusy}
                onLoginSuccess={handleLoginSuccess}
              />
            }
          />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
      <Snackbar
        open={cartFeedback.open}
        autoHideDuration={1800}
        onClose={() =>
          setCartFeedback((current) => ({
            ...current,
            open: false,
          }))
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={cartFeedback.severity} variant="filled" sx={{ width: '100%' }}>
          {cartFeedback.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default App
