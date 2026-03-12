import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getOrderById, getOrders } from '../services/orders'

function formatCurrency(value) {
  return `EUR ${Number(value).toFixed(2)}`
}

function formatDate(value) {
  const date = new Date(value)
  return date.toLocaleString('en-US')
}

function OrdersPage({ currentUser, isAuthLoading }) {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [detailsByOrderId, setDetailsByOrderId] = useState({})

  useEffect(() => {
    if (isAuthLoading || !currentUser) {
      return
    }

    let isMounted = true

    async function loadOrders() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const response = await getOrders()
        if (!isMounted) {
          return
        }

        setOrders(response.orders ?? [])
      } catch (error) {
        if (!isMounted) {
          return
        }

        setOrders([])
        setErrorMessage(error.message || 'Failed to load orders.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadOrders()

    return () => {
      isMounted = false
    }
  }, [currentUser, isAuthLoading])

  const loadOrderDetails = async (orderId) => {
    if (detailsByOrderId[orderId]?.items || detailsByOrderId[orderId]?.isLoading) {
      return
    }

    setDetailsByOrderId((current) => ({
      ...current,
      [orderId]: {
        isLoading: true,
        error: '',
        items: null,
      },
    }))

    try {
      const response = await getOrderById(orderId)

      setDetailsByOrderId((current) => ({
        ...current,
        [orderId]: {
          isLoading: false,
          error: '',
          items: response.items ?? [],
        },
      }))
    } catch (error) {
      setDetailsByOrderId((current) => ({
        ...current,
        [orderId]: {
          isLoading: false,
          error: error.message || 'Failed to load order details.',
          items: null,
        },
      }))
    }
  }

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

  return (
    <Box className="mx-auto max-w-4xl py-6">
      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', p: { xs: 3, md: 4 } }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h5">I miei ordini</Typography>
            <Typography variant="body2" color="text.secondary">
              Review your order history and expand items for details.
            </Typography>
          </Box>

          {isLoading ? (
            <Box className="flex items-center gap-3 py-2">
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary">
                Loading orders...
              </Typography>
            </Box>
          ) : null}

          {!isLoading && errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

          {!isLoading && !errorMessage && orders.length === 0 ? (
            <Alert severity="info">You have not created any orders yet.</Alert>
          ) : null}

          {!isLoading && !errorMessage && orders.length > 0 ? (
            <Stack spacing={1.5}>
              {orders.map((order) => {
                const detailsState = detailsByOrderId[order.id]

                return (
                  <Accordion
                    key={order.id}
                    disableGutters
                    elevation={0}
                    onChange={(_event, isExpanded) => {
                      if (isExpanded) {
                        loadOrderDetails(order.id)
                      }
                    }}
                    sx={{ border: '1px solid #e2e8f0', borderRadius: '12px !important' }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                      <Box className="grid w-full gap-2 md:grid-cols-4">
                        <Typography variant="subtitle2">#{order.id}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(order.created_at)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Status: {order.status}
                        </Typography>
                        <Typography variant="subtitle2" color="primary.main">
                          {formatCurrency(order.total_amount)}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      {detailsState?.isLoading ? (
                        <Box className="flex items-center gap-3 py-1">
                          <CircularProgress size={20} />
                          <Typography variant="body2" color="text.secondary">
                            Loading order details...
                          </Typography>
                        </Box>
                      ) : null}

                      {detailsState?.error ? <Alert severity="error">{detailsState.error}</Alert> : null}

                      {detailsState?.items ? (
                        <Stack spacing={1.2}>
                          {detailsState.items.map((item) => (
                            <Box
                              key={item.id}
                              className="flex items-center justify-between gap-3"
                              sx={{ py: 0.75, borderBottom: '1px solid #f1f5f9' }}
                            >
                              <Typography variant="body2">
                                {item.product_name || `Product #${item.product_id}`}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Qty {item.quantity}
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {formatCurrency(item.price_at_purchase)}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      ) : null}
                    </AccordionDetails>
                  </Accordion>
                )
              })}
            </Stack>
          ) : null}
        </Stack>
      </Paper>
    </Box>
  )
}

export default OrdersPage
