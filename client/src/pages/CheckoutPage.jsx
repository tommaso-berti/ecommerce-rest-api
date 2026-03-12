import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded'
import { Alert, Box, Button, CircularProgress, Divider, Paper, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { performCheckout } from '../services/checkout'

function CheckoutPage({ cartItems, cartSubtotal, currentUser, isAuthLoading, onCheckoutSuccess }) {
  const navigate = useNavigate()
  const [isPaying, setIsPaying] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [paymentStep, setPaymentStep] = useState('')

  if (isAuthLoading) {
    return (
      <Box className="flex items-center gap-3 py-8">
        <CircularProgress size={24} />
        <Typography variant="body2" color="text.secondary">
          Verifying session...
        </Typography>
      </Box>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  const handlePayment = async () => {
    if (cartItems.length === 0 || isPaying) {
      return
    }

    setErrorMessage('')
    setPaymentStep('Simulating payment...')
    setIsPaying(true)

    try {
      await new Promise((resolve) => {
        setTimeout(resolve, 900)
      })

      setPaymentStep('Payment simulation complete, creating order...')

      await performCheckout(
        cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      )

      await onCheckoutSuccess?.()
      navigate('/orders', { replace: true })
    } catch (error) {
      setErrorMessage(error.message || 'Checkout failed. Please try again.')
    } finally {
      setIsPaying(false)
      setPaymentStep('')
    }
  }

  return (
    <Box className="mx-auto max-w-3xl py-6">
      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', p: { xs: 3, md: 4 } }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h5">Checkout</Typography>
            <Typography variant="body2" color="text.secondary">
              Review your cart and complete the simulated payment.
            </Typography>
          </Box>

          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
          {paymentStep ? <Alert severity="info">{paymentStep}</Alert> : null}

          {cartItems.length === 0 ? (
            <Stack spacing={2}>
              <Alert severity="warning">Your cart is empty. Add products before checking out.</Alert>
              <Box>
                <Button component={Link} to="/" variant="outlined">
                  Back to home
                </Button>
              </Box>
            </Stack>
          ) : (
            <>
              <Stack spacing={1.5}>
                {cartItems.map((item) => (
                  <Box
                    key={item.id}
                    className="flex items-center justify-between gap-4"
                    sx={{ py: 1, borderBottom: '1px solid #f1f5f9' }}
                  >
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Qty {item.quantity}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 700 }}>
                      EUR {(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              <Divider />

              <Box className="flex items-center justify-between">
                <Typography variant="h6">Total</Typography>
                <Typography variant="h5" color="primary.main">
                  EUR {cartSubtotal.toFixed(2)}
                </Typography>
              </Box>

              <Button
                variant="contained"
                size="large"
                startIcon={<AddShoppingCartRoundedIcon />}
                onClick={handlePayment}
                disabled={isPaying}
              >
                {isPaying ? 'Processing...' : 'Pay now'}
              </Button>
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  )
}

export default CheckoutPage
