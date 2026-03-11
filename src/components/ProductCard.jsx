import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded'
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material'

function ProductCard({ product, onAddToCart }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          minHeight: 180,
          background: product.gradient,
          display: 'flex',
          alignItems: 'flex-end',
          p: 3,
        }}
      >
        <Chip
          label={product.category}
          sx={{
            bgcolor: 'rgba(255,255,255,0.84)',
            fontWeight: 600,
          }}
        />
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
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddShoppingCartRoundedIcon />}
          onClick={() => onAddToCart(product)}
        >
          Aggiungi al carrello
        </Button>
      </CardActions>
    </Card>
  )
}

export default ProductCard
