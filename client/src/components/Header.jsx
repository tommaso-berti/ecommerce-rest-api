import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded'
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded'
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded'
import {
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

const baseNavItems = [
  { label: 'Home', to: '/' },
]

function Header({ authError, cartItemCount, currentUser, isAuthBusy, onLogout, onOpenCart }) {
  const navigate = useNavigate()
  const [localLogoutError, setLocalLogoutError] = useState('')
  const [accountAnchorEl, setAccountAnchorEl] = useState(null)
  const isAuthenticated = Boolean(currentUser)
  const isAccountMenuOpen = Boolean(accountAnchorEl)

  const closeAccountMenu = () => {
    setAccountAnchorEl(null)
  }

  const handleOpenAccountMenu = (event) => {
    setAccountAnchorEl(event.currentTarget)
  }

  const handleNavigateFromMenu = (to) => {
    closeAccountMenu()
    navigate(to)
  }

  const handleLogoutClick = async () => {
    if (!onLogout || isAuthBusy) {
      return
    }

    setLocalLogoutError('')

    try {
      await onLogout()
      closeAccountMenu()
    } catch (error) {
      setLocalLogoutError(error.message || 'Logout failed. Please try again.')
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
          </Box>

          <Box className="flex items-center gap-2">
            {(localLogoutError || authError) && isAuthenticated ? (
              <Typography variant="caption" color="error.main">
                {localLogoutError || authError}
              </Typography>
            ) : null}
            <IconButton
              color="primary"
              onClick={handleOpenAccountMenu}
              aria-label="Open account menu"
            >
              <AccountCircleRoundedIcon />
            </IconButton>
            <Menu
              anchorEl={accountAnchorEl}
              open={isAccountMenuOpen}
              onClose={closeAccountMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              {isAuthenticated ? (
                [
                  <MenuItem key="orders" onClick={() => handleNavigateFromMenu('/orders')}>
                    My Orders
                  </MenuItem>,
                  <MenuItem key="logout" onClick={handleLogoutClick} disabled={isAuthBusy}>
                    {isAuthBusy ? 'Logging out...' : 'Logout'}
                  </MenuItem>,
                ]
              ) : (
                [
                  <MenuItem key="login" onClick={() => handleNavigateFromMenu('/login')}>
                    Login
                  </MenuItem>,
                  <MenuItem key="register" onClick={() => handleNavigateFromMenu('/register')}>
                    Register
                  </MenuItem>,
                ]
              )}
            </Menu>
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
