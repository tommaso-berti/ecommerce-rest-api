import { Grid } from '@mui/material'
import ProductCard from './ProductCard'

function ProductGrid({ products, onAddToCart }) {
  return (
    <Grid container spacing={3}>
      {products.map((product) => (
        <Grid key={product.id} size={{ xs: 12, sm: 6, lg: 4 }}>
          <ProductCard product={product} onAddToCart={onAddToCart} />
        </Grid>
      ))}
    </Grid>
  )
}

export default ProductGrid
