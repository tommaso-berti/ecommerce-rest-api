import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded'
import { Avatar, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'

function RegisterPage() {
  return (
    <Box className="mx-auto max-w-md py-8">
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, border: '1px solid #e2e8f0' }}>
        <Stack spacing={3}>
          <Stack spacing={1} alignItems="center">
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              <PersonAddAltRoundedIcon />
            </Avatar>
            <Typography variant="h5">Register</Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Form iniziale per la registrazione, senza logica auth reale in questa fase.
            </Typography>
          </Stack>

          <TextField label="Nome" fullWidth />
          <TextField label="Email" type="email" fullWidth />
          <TextField label="Password" type="password" fullWidth />

          <Button variant="contained" color="secondary" size="large">
            Crea account
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}

export default RegisterPage
