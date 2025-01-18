import React, { useState } from 'react';
import { Box, Typography, Container, Button, TextField, Snackbar, Grid } from '@mui/material';
import Stock from './Stock';
import { useNavigate } from 'react-router-dom';

function App() {
  const [usuario, setUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [usuarioLogueado, setUsuarioLogueado] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    if (usuario === 'ruben' && contraseña === 'ñandu1234') {
      setUsuarioLogueado(true);
      setMensaje('Inicio de sesión exitoso');
    } else {
      setMensaje('Usuario o contraseña incorrectos');
    }
    setSnackbarOpen(true);
  };

  const handleLogout = () => {
    setUsuarioLogueado(false);
    setUsuario('');
    setContraseña('');
    setMensaje('Sesión cerrada');
    setSnackbarOpen(true);
  };

  const goToEstadisticas = () => {
    navigate('/Estadisticas');
  };

  const goToVentas = () => {
    navigate('/Ventas');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', mb: 10, mt: 5 }}>
        <Typography variant="h2" textAlign="left" sx={{ mb: 3 }}>Lumar</Typography>

        {/* Sección de login */}
        <Grid container spacing={2} justifyContent="center">
          {!usuarioLogueado ? (
            <Grid item xs={12} sm={8} md={6} lg={4}>
              <Typography variant="h6" sx={{ mb: 2 }}>Iniciar sesión para acceder al sistema</Typography>
              <TextField
                label="Usuario"
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                onKeyDown={handleKeyDown} // Detectar tecla Enter
              />
              <TextField
                label="Contraseña"
                type="password"
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                onKeyDown={handleKeyDown} // Detectar tecla Enter
              />
              <Button
                onClick={handleLogin}
                variant="contained"
                color="primary"
                fullWidth
              >
                Iniciar sesión
              </Button>
            </Grid>
          ) : (
            <Grid item xs={12} sm={8} md={6} lg={4}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Bienvenido, Rubén
              </Typography>
              <Button
                onClick={handleLogout}
                variant="contained"
                color="warning"
                fullWidth
                sx={{ mb: 2 }}
              >
                Cerrar sesión
              </Button>

              <Button
                onClick={goToEstadisticas}
                variant="contained"
                color="secondary"
                fullWidth
                sx={{ mb: 2 }}
              >
                Ir a Estadísticas
              </Button>
            </Grid>
          )}
        </Grid>

        {/* Botón de acceso a ventas */}
        <Button
          onClick={goToVentas}
          variant="contained"
          color="success"
          fullWidth
          sx={{ mt: 2 }}
        >
          Ir a Ventas
        </Button>

        {/* Si el usuario está logueado, mostrar el acceso a Stock */}
        {usuarioLogueado && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6">
              Acceso al Stock:
            </Typography>
            <Stock />
          </Box>
        )}

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          message={mensaje}
        />
      </Box>
    </Container>
  );
}

export default App;

