import GoogleIcon from '@mui/icons-material/Google'
import LoginRoundedIcon from '@mui/icons-material/LoginRounded'
import { Alert, Avatar, Box, Button, Divider, Paper, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { login as loginUser } from '../services/auth'

function LoginPage({ currentUser, isAuthBusy, onLoginSuccess }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    identifier: '',
    password: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [googlePlaceholderMessage, setGooglePlaceholderMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const searchParams = new URLSearchParams(location.search)
  const authErrorCode = searchParams.get('authError')
  const oauthErrorMessage =
    authErrorCode === 'google_auth_failed'
      ? 'Google authentication failed. Please try again.'
      : authErrorCode === 'google_not_configured'
        ? 'Google login is not configured on the server.'
        : ''

  useEffect(() => {
    if (!fieldErrors.identifier && !fieldErrors.password) {
      return
    }

    if (form.identifier.trim() && fieldErrors.identifier) {
      setFieldErrors((current) => ({ ...current, identifier: '' }))
    }

    if (form.password && fieldErrors.password) {
      setFieldErrors((current) => ({ ...current, password: '' }))
    }
  }, [fieldErrors.identifier, fieldErrors.password, form.identifier, form.password])

  if (currentUser) {
    return <Navigate to="/" replace />
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const validateForm = () => {
    const nextFieldErrors = {}

    if (!form.identifier.trim()) {
      nextFieldErrors.identifier = 'Username or email is required.'
    }

    if (!form.password) {
      nextFieldErrors.password = 'Password is required.'
    }

    setFieldErrors(nextFieldErrors)
    return Object.keys(nextFieldErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')
    setGooglePlaceholderMessage('')

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await loginUser({
        identifier: form.identifier.trim(),
        password: form.password,
      })

      onLoginSuccess?.(response.user)
      navigate('/', { replace: true })
    } catch (error) {
      setSubmitError(error.message || 'Login failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormBusy = isSubmitting || isAuthBusy

  const handleGoogleLogin = () => {
    setGooglePlaceholderMessage(
      'Google login is not implemented yet. Please use username/email login.',
    )
  }

  return (
    <Box className="mx-auto max-w-md py-8">
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, border: '1px solid #e2e8f0' }}>
        <Stack component="form" spacing={3} onSubmit={handleSubmit} noValidate>
          <Stack spacing={1} alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <LoginRoundedIcon />
            </Avatar>
            <Typography variant="h5">Login</Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Sign in with your username or email and password.
            </Typography>
          </Stack>

          {oauthErrorMessage ? <Alert severity="error">{oauthErrorMessage}</Alert> : null}
          {submitError ? <Alert severity="error">{submitError}</Alert> : null}
          {googlePlaceholderMessage ? (
            <Alert severity="info">{googlePlaceholderMessage}</Alert>
          ) : null}

          <TextField
            label="Username or Email"
            name="identifier"
            value={form.identifier}
            onChange={handleInputChange}
            error={Boolean(fieldErrors.identifier)}
            helperText={fieldErrors.identifier}
            fullWidth
            disabled={isFormBusy}
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleInputChange}
            error={Boolean(fieldErrors.password)}
            helperText={fieldErrors.password}
            fullWidth
            disabled={isFormBusy}
          />

          <Button variant="contained" size="large" type="submit" disabled={isFormBusy}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>

          <Divider>or</Divider>

          <Button
            variant="outlined"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            disabled={isFormBusy}
          >
            Continue with Google
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}

export default LoginPage
