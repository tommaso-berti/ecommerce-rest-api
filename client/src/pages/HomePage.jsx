import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import { Box, Chip, Stack, Typography } from '@mui/material'
import ProductGrid from '../components/ProductGrid'

function HomePage({ products, onAddToCart }) {
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
            Una vetrina e-commerce pulita, pronta per collegarsi alla tua REST API.
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(248,250,252,0.84)' }}>
            Catalogo mockato, carrello laterale e routing base: abbastanza semplice da estendere, già utile per
            iniziare il frontend.
          </Typography>
        </Stack>
      </Box>

      <Box className="space-y-4">
        <Box className="flex items-end justify-between gap-4">
          <Box>
            <Typography variant="h5" gutterBottom>
              Prodotti in evidenza
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Mock data locali, facilmente sostituibili con fetch verso backend.
            </Typography>
          </Box>
        </Box>

        <ProductGrid products={products} onAddToCart={onAddToCart} />
      </Box>
    </Stack>
  )
}

export default HomePage
