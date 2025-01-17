import React, { useState } from 'react';
import { Box, Typography, Container, Button, TextField, Snackbar } from '@mui/material';
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
    navigate('/estadisticas');
  };

  const goToVentas = () => {
    navigate('/ventas'); // Redirige al componente Ventas sin necesidad de estar logueado
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', mb: 10, mt: 5, maxWidth: 300 }}>
        <Typography variant="h2" textAlign="left" sx={{ mb: 3 }}>Lumar</Typography>

        {!usuarioLogueado ? (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>Iniciar sesión para acceder al sistema</Typography>
            <TextField
              label="Usuario"
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
            />
            <TextField
              label="Contraseña"
              type="password"
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
            />
            <Button
              onClick={handleLogin}
              variant="contained"
              color="primary"
            >
              Iniciar sesión
            </Button>
          </>
        ) : (
          <>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Bienvenido, Rubén
            </Typography>
            <Button
              onClick={handleLogout}
              variant="contained"
              color="warning"
              sx={{ mb: 2 }}
            >
              Cerrar sesión
            </Button>

            <Button
              onClick={goToEstadisticas}
              variant="contained"
              color="secondary"
              sx={{ mt: 2 }}
            >
              Ir a Estadísticas
            </Button>
          </>
        )}

        {/* Acceso a ventas, siempre visible sin estar logueado */}
        <Button
          onClick={goToVentas}
          variant="contained"
          color="success"
          sx={{ mt: 2 }}
        >
          Ir a Ventas
        </Button>

        {usuarioLogueado && (
          <>
            <Typography variant="h6" sx={{ mt: 4 }}>
              Acceso al Stock:
            </Typography>
            <Stock />
          </>
        )}
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={mensaje}
      />
    </Container>
  );
}

export default App;
