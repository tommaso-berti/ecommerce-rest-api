import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
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
  Typography,
} from '@mui/material'

function CartDrawer({ cartItems, cartSubtotal, isOpen, onCheckout, onClose, onRemoveItem }) {
  return (
    <Drawer anchor="right" open={isOpen} onClose={onClose}>
      <Box sx={{ width: { xs: 320, sm: 380 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box className="flex items-center justify-between px-6 py-5">
          <Box>
            <Typography variant="h6">Il tuo carrello</Typography>
            <Typography variant="body2" color="text.secondary">
              Rivedi gli articoli selezionati
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
              Carrello vuoto
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Aggiungi qualche prodotto dalla home per iniziare.
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
                    <Button color="inherit" onClick={() => onRemoveItem(item.id)}>
                      Rimuovi
                    </Button>
                  }
                  sx={{ py: 1.5 }}
                >
                  <ListItemText
                    primary={item.name}
                    secondary={`Qty ${item.quantity} • EUR ${(item.price * item.quantity).toFixed(2)}`}
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                </ListItem>
              ))}
            </List>

            <Divider />

            <Stack spacing={2} sx={{ p: 3 }}>
              <Box className="flex items-center justify-between">
                <Typography variant="subtitle1">Subtotale</Typography>
                <Typography variant="h6" color="primary.main">
                  EUR {cartSubtotal.toFixed(2)}
                </Typography>
              </Box>
              <Button variant="contained" size="large" onClick={onCheckout}>
                Vai al checkout
              </Button>
            </Stack>
          </>
        )}
      </Box>
    </Drawer>
  )
}

export default CartDrawer
