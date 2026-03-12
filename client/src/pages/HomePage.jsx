import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import { Alert, Box, Chip, CircularProgress, Stack, Typography } from '@mui/material'
import ProductGrid from '../components/ProductGrid'

function HomePage({ products, productsError, productsLoading, onAddToCart }) {
  return (
    <Stack spacing={5}>
      <Box
        sx={{
          px: { xs: 3, md: 6 },
          py: { xs: 4, md: 6 },
          borderRadius: 6,
          background: 'linear-gradient(135deg, #0f766e 0%, #155e75 100%)',
          color: '#f8fafc',
        }}
      >
        <Stack spacing={2} maxWidth={560}>
          <Chip
            icon={<BoltRoundedIcon />}
            label="MVP storefront"
            sx={{ width: 'fit-content', bgcolor: 'rgba(255,255,255,0.16)', color: 'inherit' }}
          />
          <Typography variant="h4">
            A clean e-commerce storefront ready to connect to your REST API.
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(248,250,252,0.84)' }}>
            Live backend catalog, side cart, and base routing: a solid foundation to evolve your frontend.
          </Typography>
        </Stack>
      </Box>

      <Box className="space-y-4">
        <Box className="flex items-end justify-between gap-4">
          <Box>
            <Typography variant="h5" gutterBottom>
              Featured products
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Data loaded from REST APIs.
            </Typography>
          </Box>
        </Box>

        {productsLoading ? (
          <Box className="flex items-center gap-3 py-6">
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary">
              Loading products...
            </Typography>
          </Box>
        ) : null}

        {!productsLoading && productsError ? <Alert severity="error">{productsError}</Alert> : null}

        {!productsLoading && !productsError && products.length === 0 ? (
          <Alert severity="info">No products available right now.</Alert>
        ) : null}

        {!productsLoading && !productsError && products.length > 0 ? (
          <ProductGrid products={products} onAddToCart={onAddToCart} />
        ) : null}
      </Box>
    </Stack>
  )
}

export default HomePage
