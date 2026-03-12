import LoginRoundedIcon from '@mui/icons-material/LoginRounded'
import { Alert, Avatar, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { login as loginUser } from '../services/auth'

function LoginPage({ currentUser, isAuthBusy, onLoginSuccess }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    identifier: '',
    password: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      nextFieldErrors.identifier = 'Username o email obbligatori.'
    }

    if (!form.password) {
      nextFieldErrors.password = 'La password è obbligatoria.'
    }

    setFieldErrors(nextFieldErrors)
    return Object.keys(nextFieldErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')

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
      setSubmitError(error.message || 'Errore durante il login. Riprova.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormBusy = isSubmitting || isAuthBusy

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
              Accedi con username o email e la tua password.
            </Typography>
          </Stack>

          {submitError ? <Alert severity="error">{submitError}</Alert> : null}

          <TextField
            label="Username o Email"
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
            {isSubmitting ? 'Accesso in corso...' : 'Accedi'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}

export default LoginPage
