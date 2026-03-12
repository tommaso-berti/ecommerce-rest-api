import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded'
import RemoveShoppingCartRoundedIcon from '@mui/icons-material/RemoveShoppingCartRounded'
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'

function CartDrawer({
  cartItems,
  cartSubtotal,
  isOpen,
  isSyncing,
  onCheckout,
  onClose,
  onDecreaseItem,
  onIncreaseItem,
}) {
  return (
    <Drawer anchor="right" open={isOpen} onClose={onClose}>
      <Box sx={{ width: { xs: 320, sm: 380 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box className="flex items-center justify-between px-6 py-5">
          <Box>
            <Typography variant="h6">Your cart</Typography>
            <Typography variant="body2" color="text.secondary">
              Review your selected items
            </Typography>
          </Box>
          <IconButton onClick={onClose} aria-label="Close cart">
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        <Divider />

        {cartItems.length === 0 ? (
          <Box className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <RemoveShoppingCartRoundedIcon color="disabled" sx={{ fontSize: 42, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Cart is empty
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add some products from the home page to get started.
            </Typography>
          </Box>
        ) : (
          <>
            <List sx={{ flexGrow: 1, px: 2, py: 1 }}>
              {cartItems.map((item) => (
                <ListItem
                  key={item.id}
                  disablePadding
                  secondaryAction={
                    <Box className="flex items-center gap-1">
                      <Tooltip title="Decrease quantity">
                        <IconButton
                          size="small"
                          onClick={() => onDecreaseItem(item.id)}
                          disabled={isSyncing}
                        >
                          <RemoveRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Typography variant="body2" sx={{ minWidth: 28, textAlign: 'center' }}>
                        {item.quantity}
                      </Typography>
                      <Tooltip title="Increase quantity">
                        <IconButton
                          size="small"
                          onClick={() => onIncreaseItem(item.id)}
                          disabled={isSyncing}
                        >
                          <AddRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                  sx={{ py: 1.5 }}
                >
                  <ListItemText
                    primary={item.name}
                    secondary={`EUR ${(item.price * item.quantity).toFixed(2)}`}
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                </ListItem>
              ))}
            </List>

            <Divider />

            <Stack spacing={2} sx={{ p: 3 }}>
              <Box className="flex items-center justify-between">
                <Typography variant="subtitle1">Subtotal</Typography>
                <Typography variant="h6" color="primary.main">
                  EUR {cartSubtotal.toFixed(2)}
                </Typography>
              </Box>
              <Button variant="contained" size="large" onClick={onCheckout} disabled={isSyncing}>
                Go to checkout
              </Button>
            </Stack>
          </>
        )}
      </Box>
    </Drawer>
  )
}

export default CartDrawer
