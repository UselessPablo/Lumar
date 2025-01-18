import React, { useState } from 'react';
import { Box, Typography, Container, Button, TextField, Snackbar, Grid, Avatar } from '@mui/material';
import Stock from './Stock';
import { useNavigate } from 'react-router-dom';
import foto from './/IMG_20221031_211846.jpg'

function App() {
  const [usuario, setUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [usuarioLogueado, setUsuarioLogueado] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();

  // Lista de mensajes aleatorios para el inicio de sesión
  const mensajesBienvenida = [
    '¡Deberías caminar más, te noto más gordito!',
    'Dormir la siesta es bueno.',
    'Recuerda comprar sahumerios para Pablo.',
    'Recuerda llamar a Ale.',
    'Buenos días, hoy va a llover.',
  ];

  // Función para obtener un mensaje aleatorio
  const obtenerMensajeAleatorio = () => {
    const indiceAleatorio = Math.floor(Math.random() * mensajesBienvenida.length);
    return mensajesBienvenida[indiceAleatorio];
  };

  const handleLogin = () => {
    if (usuario === 'ruben' && contraseña === 'ñandu1234') {
      setUsuarioLogueado(true);
      setMensaje(obtenerMensajeAleatorio());  // Establece un mensaje aleatorio al iniciar sesión
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
              <Typography variant="h5" sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Avatar al lado del texto */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ width: 40, height: 40, mr: 2 }} alt="Rubén" src={foto} />
                  <Typography>Bienvenido, Rubén</Typography>
                </Box>
                <Typography variant="h6" sx={{ ml: 2, fontStyle: 'italic', color: 'gray' }}>
                  {mensaje}
                </Typography>
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
