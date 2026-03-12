import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded'
import { Alert, Avatar, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register as registerUser } from '../services/auth'

const MIN_PASSWORD_LENGTH = 8

function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!successMessage) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      navigate('/login', { replace: true })
    }, 1000)

    return () => window.clearTimeout(timeoutId)
  }, [navigate, successMessage])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))

    if (fieldErrors[name]) {
      setFieldErrors((current) => ({ ...current, [name]: '' }))
    }
  }

  const validateForm = () => {
    const nextFieldErrors = {}

    if (!form.username.trim()) {
      nextFieldErrors.username = 'Il nome utente è obbligatorio.'
    }

    if (!form.email.trim()) {
      nextFieldErrors.email = "L'email è obbligatoria."
    }

    if (!form.password) {
      nextFieldErrors.password = 'La password è obbligatoria.'
    } else if (form.password.length < MIN_PASSWORD_LENGTH) {
      nextFieldErrors.password = `La password deve contenere almeno ${MIN_PASSWORD_LENGTH} caratteri.`
    }

    setFieldErrors(nextFieldErrors)
    return Object.keys(nextFieldErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')
    setSuccessMessage('')

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await registerUser({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      })

      setSuccessMessage('Registrazione completata. Reindirizzamento al login...')
      setForm({ username: '', email: '', password: '' })
    } catch (error) {
      setSubmitError(error.message || 'Errore durante la registrazione. Riprova.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box className="mx-auto max-w-md py-8">
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, border: '1px solid #e2e8f0' }}>
        <Stack component="form" spacing={3} onSubmit={handleSubmit} noValidate>
          <Stack spacing={1} alignItems="center">
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              <PersonAddAltRoundedIcon />
            </Avatar>
            <Typography variant="h5">Register</Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Crea il tuo account per iniziare a fare acquisti.
            </Typography>
          </Stack>

          {submitError ? <Alert severity="error">{submitError}</Alert> : null}
          {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}

          <TextField
            label="Nome"
            name="username"
            value={form.username}
            onChange={handleInputChange}
            error={Boolean(fieldErrors.username)}
            helperText={fieldErrors.username}
            fullWidth
            disabled={isSubmitting}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleInputChange}
            error={Boolean(fieldErrors.email)}
            helperText={fieldErrors.email}
            fullWidth
            disabled={isSubmitting}
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
            disabled={isSubmitting}
          />

          <Button
            variant="contained"
            color="secondary"
            size="large"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registrazione in corso...' : 'Crea account'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}

export default RegisterPage
