import { Box, Container } from '@mui/material'
import CartDrawer from './CartDrawer'
import Header from './Header'

function AppLayout({
  children,
  cartItems,
  cartItemCount,
  cartSubtotal,
  currentUser,
  isAuthBusy,
  authError,
  isCartOpen,
  onCloseCart,
  onLogout,
  onOpenCart,
  onRemoveFromCart,
}) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header
        authError={authError}
        cartItemCount={cartItemCount}
        currentUser={currentUser}
        isAuthBusy={isAuthBusy}
        onLogout={onLogout}
        onOpenCart={onOpenCart}
      />
      <Box
        component="main"
        className="py-8"
        sx={{
          background:
            'linear-gradient(180deg, rgba(15,118,110,0.08) 0%, rgba(248,250,252,1) 28%)',
        }}
      >
        <Container maxWidth="lg">{children}</Container>
      </Box>
      <CartDrawer
        cartItems={cartItems}
        cartSubtotal={cartSubtotal}
        isOpen={isCartOpen}
        onClose={onCloseCart}
        onRemoveItem={onRemoveFromCart}
      />
    </Box>
  )
}

export default AppLayout
