import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material'
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded'
import { useNavigate } from 'react-router-dom'

function ProductCard({ product, onAddToCart }) {
  const navigate = useNavigate()
  const gradient = 'linear-gradient(135deg, #0f766e 0%, #155e75 100%)'

  const handleOpenProduct = () => {
    navigate(`/products/${product.id}`)
  }

  const handleAddToCart = (event) => {
    event.stopPropagation()
    onAddToCart(product)
  }

  return (
    <Card
      elevation={0}
      onClick={handleOpenProduct}
      sx={{
        height: '100%',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
      }}
    >
      <Box
        sx={{
          minHeight: 180,
          background: gradient,
          display: 'grid',
          placeItems: 'center',
          p: 3,
        }}
      >
        <Avatar sx={{ width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.2)' }}>
          <Inventory2RoundedIcon />
        </Avatar>
      </Box>

      <CardContent sx={{ flexGrow: 1 }}>
        <Stack spacing={1.5}>
          <Typography variant="h6">{product.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {product.description}
          </Typography>
          <Typography variant="h6" color="primary.main">
            EUR {product.price.toFixed(2)}
          </Typography>
          <Chip
            label={`Stock: ${product.stock}`}
            sx={{
              width: 'fit-content',
              bgcolor: 'rgba(15, 118, 110, 0.12)',
              color: 'primary.main',
              fontWeight: 600,
            }}
          />
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddShoppingCartRoundedIcon />}
          onClick={handleAddToCart}
        >
          Add to cart
        </Button>
      </CardActions>
    </Card>
  )
}

export default ProductCard
