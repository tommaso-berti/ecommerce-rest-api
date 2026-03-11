import LoginRoundedIcon from '@mui/icons-material/LoginRounded'
import { Avatar, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'

function LoginPage() {
  return (
    <Box className="mx-auto max-w-md py-8">
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, border: '1px solid #e2e8f0' }}>
        <Stack spacing={3}>
          <Stack spacing={1} alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <LoginRoundedIcon />
            </Avatar>
            <Typography variant="h5">Login</Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Pagina placeholder pronta da collegare alla tua autenticazione reale.
            </Typography>
          </Stack>

          <TextField label="Email" type="email" fullWidth />
          <TextField label="Password" type="password" fullWidth />

          <Button variant="contained" size="large">
            Accedi
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}

export default LoginPage
