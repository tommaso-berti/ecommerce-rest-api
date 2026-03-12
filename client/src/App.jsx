import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import { products } from './data/products'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { getCurrentUser, logout as logoutUser } from './services/auth'

function App() {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
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

  return (
    <AppLayout
      cartItems={cartItems}
      cartItemCount={cartItemCount}
      cartSubtotal={cartSubtotal}
      currentUser={currentUser}
      isAuthBusy={isAuthBusy}
      authError={authError}
      isCartOpen={isCartOpen}
      onCloseCart={() => setIsCartOpen(false)}
      onLogout={handleLogout}
      onOpenCart={() => setIsCartOpen(true)}
      onRemoveFromCart={handleRemoveFromCart}
    >
      <Routes>
        <Route path="/" element={<HomePage products={products} onAddToCart={handleAddToCart} />} />
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
