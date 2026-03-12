import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import CheckoutPage from './pages/CheckoutPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import OrdersPage from './pages/OrdersPage'
import ProductPage from './pages/ProductPage'
import RegisterPage from './pages/RegisterPage'
import { getCurrentUser, logout as logoutUser } from './services/auth'
import { getProducts } from './services/products'

function App() {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState('')
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
          setAuthError(error.message || 'Errore nel recupero della sessione utente.')
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

  useEffect(() => {
    let isMounted = true

    async function loadProducts() {
      try {
        const response = await getProducts()
        if (!isMounted) {
          return
        }

        const normalizedProducts = (response.products ?? []).map((product) => ({
          ...product,
          price: Number(product.price),
        }))

        setProducts(normalizedProducts)
        setProductsError('')
      } catch (error) {
        if (!isMounted) {
          return
        }

        setProducts([])
        setProductsError(error.message || 'Errore nel caricamento dei prodotti.')
      } finally {
        if (isMounted) {
          setProductsLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      isMounted = false
    }
  }, [])

  const handleAddToCart = (product) => {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id)

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }

      return [...currentItems, { ...product, quantity: 1 }]
    })

    setIsCartOpen(true)
  }

  const handleRemoveFromCart = (productId) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    )
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
      const message = error.message || 'Errore durante il logout. Riprova.'
      setAuthError(message)
      throw error
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleOpenCheckout = () => {
    setIsCartOpen(false)
    navigate('/checkout')
  }

  const handleCheckoutSuccess = () => {
    setCartItems([])
    setIsCartOpen(false)
  }

  return (
    <AppLayout
      cartItems={cartItems}
      cartItemCount={cartItemCount}
      cartSubtotal={cartSubtotal}
      currentUser={currentUser}
      isAuthBusy={isAuthBusy}
      authError={authError}
      isCartOpen={isCartOpen}
      onCheckout={handleOpenCheckout}
      onCloseCart={() => setIsCartOpen(false)}
      onLogout={handleLogout}
      onOpenCart={() => setIsCartOpen(true)}
      onRemoveFromCart={handleRemoveFromCart}
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
  )
}

export default App
