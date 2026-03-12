import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded'
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded'
import {
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const baseNavItems = [
  { label: 'Home', to: '/' },
]

const authNavItems = [
  { label: 'Orders', to: '/orders' },
]

const guestNavItems = [
  { label: 'Login', to: '/login' },
  { label: 'Register', to: '/register' },
]

function Header({ authError, cartItemCount, currentUser, isAuthBusy, onLogout, onOpenCart }) {
  const [localLogoutError, setLocalLogoutError] = useState('')
  const isAuthenticated = Boolean(currentUser)

  const handleLogoutClick = async () => {
    if (!onLogout || isAuthBusy) {
      return
    }

    setLocalLogoutError('')

    try {
      await onLogout()
    } catch (error) {
      setLocalLogoutError(error.message || 'Errore durante il logout. Riprova.')
    }
  }

  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #e2e8f0' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters className="flex min-h-0 items-center justify-between py-3">
          <Box component={Link} to="/" className="flex items-center gap-3">
            <Box
              sx={{
                display: 'grid',
                placeItems: 'center',
                width: 44,
                height: 44,
                borderRadius: '14px',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              }}
            >
              <StorefrontRoundedIcon />
            </Box>
            <Box>
              <Typography variant="h6" color="text.primary">
                Terra Shop
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Essentials for everyday living
              </Typography>
            </Box>
          </Box>

          <Box className="hidden items-center gap-2 md:flex">
            {baseNavItems.map((item) => (
              <Button
                key={item.to}
                component={NavLink}
                to={item.to}
                color="inherit"
                sx={{
                  px: 2,
                  color: 'text.secondary',
                  '&.active': {
                    color: 'primary.main',
                    bgcolor: 'rgba(15, 118, 110, 0.08)',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}

            {isAuthenticated ? (
              <>
                {authNavItems.map((item) => (
                  <Button
                    key={item.to}
                    component={NavLink}
                    to={item.to}
                    color="inherit"
                    sx={{
                      px: 2,
                      color: 'text.secondary',
                      '&.active': {
                        color: 'primary.main',
                        bgcolor: 'rgba(15, 118, 110, 0.08)',
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
                <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                  {currentUser.username}
                </Typography>
                <Button
                  color="inherit"
                  onClick={handleLogoutClick}
                  disabled={isAuthBusy}
                  sx={{ px: 2, color: 'text.secondary' }}
                >
                  {isAuthBusy ? 'Logout...' : 'Logout'}
                </Button>
              </>
            ) : (
              guestNavItems.map((item) => (
                <Button
                  key={item.to}
                  component={NavLink}
                  to={item.to}
                  color="inherit"
                  sx={{
                    px: 2,
                    color: 'text.secondary',
                    '&.active': {
                      color: 'primary.main',
                      bgcolor: 'rgba(15, 118, 110, 0.08)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))
            )}
          </Box>

          <Box className="flex items-center gap-2">
            {(localLogoutError || authError) && isAuthenticated ? (
              <Typography variant="caption" color="error.main">
                {localLogoutError || authError}
              </Typography>
            ) : null}
            <IconButton color="primary" onClick={onOpenCart} aria-label="Open cart">
              <Badge badgeContent={cartItemCount} color="secondary">
                <ShoppingCartRoundedIcon />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default Header
