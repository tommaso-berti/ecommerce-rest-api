import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import { products } from './data/products'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

function App() {
  const [cartItems, setCartItems] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)

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

  return (
    <AppLayout
      cartItems={cartItems}
      cartItemCount={cartItemCount}
      cartSubtotal={cartSubtotal}
      isCartOpen={isCartOpen}
      onAddToCart={handleAddToCart}
      onCloseCart={() => setIsCartOpen(false)}
      onOpenCart={() => setIsCartOpen(true)}
      onRemoveFromCart={handleRemoveFromCart}
    >
      <Routes>
        <Route path="/" element={<HomePage products={products} onAddToCart={handleAddToCart} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  )
}

export default App
