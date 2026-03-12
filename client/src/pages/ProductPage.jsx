import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded'
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getProductById } from '../services/products'

function ProductPage({ onAddToCart }) {
  const { productId } = useParams()
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isNotFound, setIsNotFound] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadProduct() {
      setIsLoading(true)
      setErrorMessage('')
      setIsNotFound(false)

      try {
        const response = await getProductById(productId)
        if (!isMounted) {
          return
        }

        setProduct({
          ...response.product,
          price: Number(response.product.price),
        })
      } catch (error) {
        if (!isMounted) {
          return
        }

        setProduct(null)
        if (error.status === 404) {
          setIsNotFound(true)
          return
        }

        setErrorMessage(error.message || 'Errore nel caricamento del prodotto.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProduct()

    return () => {
      isMounted = false
    }
  }, [productId])

  if (isLoading) {
    return (
      <Box className="flex items-center gap-3 py-8">
        <CircularProgress size={24} />
        <Typography variant="body2" color="text.secondary">
          Caricamento prodotto...
        </Typography>
      </Box>
    )
  }

  if (isNotFound) {
    return <Alert severity="warning">Prodotto non trovato.</Alert>
  }

  if (errorMessage) {
    return <Alert severity="error">{errorMessage}</Alert>
  }

  if (!product) {
    return <Alert severity="info">Nessun prodotto disponibile.</Alert>
  }

  return (
    <Box className="mx-auto max-w-3xl py-6">
      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', p: { xs: 3, md: 4 } }}>
        <Stack spacing={3}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
              <Inventory2RoundedIcon />
            </Avatar>
            <Box>
              <Typography variant="h5">{product.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                ID prodotto: {product.id}
              </Typography>
            </Box>
          </Stack>

          <Typography variant="body1" color="text.secondary">
            {product.description}
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Typography variant="h4" color="primary.main">
              EUR {product.price.toFixed(2)}
            </Typography>
            <Chip label={`Stock: ${product.stock}`} color="primary" variant="outlined" />
          </Stack>

          <Button
            variant="contained"
            size="large"
            startIcon={<AddShoppingCartRoundedIcon />}
            onClick={() => onAddToCart(product)}
            sx={{ width: { xs: '100%', sm: 'fit-content' } }}
          >
            Aggiungi al carrello
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}

export default ProductPage
