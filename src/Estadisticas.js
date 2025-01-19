import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText, Divider } from '@mui/material';
import { ref, get } from 'firebase/database';
import { db } from './firebaseConfig';
import { useNavigate } from 'react-router-dom';
import lumarfoto from './lumar.png';

function Estadisticas() {
    const [totalVentasDiarias, setTotalVentasDiarias] = useState(0);
    const [totalVentasMensuales, setTotalVentasMensuales] = useState(0);
    const [acumuladoHoy, setAcumuladoHoy] = useState(0);
    const [gananciaDiaria, setGananciaDiaria] = useState(0);
    const [gananciaMensual, setGananciaMensual] = useState(0);
    const [detalleProductos, setDetalleProductos] = useState([]);
    const fechaActual = new Date();
    const mesActual = fechaActual.toISOString().slice(0, 7); // 'YYYY-MM'
    const fechaHoy = fechaActual.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    const navigate = useNavigate();

    useEffect(() => {
        const cargarEstadisticas = async () => {
            const ventasRef = ref(db, 'ventas');
            const acumuladoMensualRef = ref(db, `acumuladoMensual/${mesActual}`);

            const ventasSnapshot = await get(ventasRef);
            if (ventasSnapshot.exists()) {
                const ventas = Object.values(ventasSnapshot.val());
                console.log("Ventas descargadas:", ventas);

                // Calcular ventas y ganancias del día
                const ventasDelDia = ventas.filter((venta) => venta.fecha === fechaHoy);
                const totalDelDia = ventasDelDia.reduce((total, venta) => total + venta.totalVenta, 0);
                const gananciaDelDia = ventasDelDia.reduce(
                    (ganancia, venta) =>
                        ganancia + (venta.totalVenta - venta.precioCompra * venta.cantidad),
                    0
                );

                setTotalVentasDiarias(totalDelDia);
                setGananciaDiaria(gananciaDelDia);

                // Calcular acumulado hasta hoy y ganancias
                const ventasHastaHoy = ventas.filter((venta) => venta.fecha <= fechaHoy);
                const totalHastaHoy = ventasHastaHoy.reduce((total, venta) => total + venta.totalVenta, 0);
                setAcumuladoHoy(totalHastaHoy);

                const gananciaTotalMensual = ventasHastaHoy.reduce(
                    (ganancia, venta) =>
                        ganancia + (venta.totalVenta - venta.precioCompra * venta.cantidad),
                    0
                );
                setGananciaMensual(gananciaTotalMensual);

                // Generar detalle de productos vendidos
                const productosVendidos = ventas.map((venta) => ({
                    nombre: venta.producto,
                    cantidad: venta.cantidad,
                    total: venta.totalVenta,
                }));
                setDetalleProductos(productosVendidos);
            } else {
                console.log("No se encontraron ventas en la base de datos.");
            }

            // Obtener acumulado mensual
            const acumuladoMensualSnapshot = await get(acumuladoMensualRef);
            if (acumuladoMensualSnapshot.exists()) {
                setTotalVentasMensuales(acumuladoMensualSnapshot.val());
            }
        };

        cargarEstadisticas();
    }, [mesActual, fechaHoy]);

  
    return (
        <Box sx={{ mt: 4, paddingX: { xs: 2, sm: 4 }, maxWidth: '100%' }}>
      <Box
            component="img"
            src={lumarfoto} // O usa "/images/mi-imagen.jpg" si está en public
            alt="Descripción de la imagen"
            sx={{
              width: '15%', // Ajusta el tamaño
              maxWidth: 400, // Máximo ancho
              borderRadius: '8px', // Bordes redondeados
              // Sombra de Material-UI
            }}
          />
            <Typography textAlign='center' variant="h4" sx={{ mb: 3, mt: 3 }}>Estadísticas de Ventas</Typography>
            <Typography textAlign='right' sx={{ mr: { xs: 2, sm: 4 }, mt: 2 }} variant="h6">Fecha: {fechaHoy}</Typography>
            <Typography sx={{ mt: 5, ml: { xs: 1, sm: 2 } }} variant="h6">Total ventas diarias: ${totalVentasDiarias.toFixed(2)}</Typography>
            <Typography sx={{ mt: 1, ml: { xs: 1, sm: 3 } }} variant="h6">Ganancia diaria: ${gananciaDiaria.toFixed(2)}</Typography>
            <Typography sx={{ mt: 1, ml: { xs: 1, sm: 3 } }} variant="h6">Acumulado mensual: ${totalVentasMensuales.toFixed(2)}</Typography>
            <Typography sx={{ mt: 1, ml: { xs: 1, sm: 4 } }} variant="h6">Ganancia mensual: ${gananciaMensual.toFixed(2)}</Typography>
            <Typography sx={{ mt: 1, ml: { xs: 1, sm: 4 } }} variant="h6">Acumulado hasta hoy: ${acumuladoHoy.toFixed(2)}</Typography>

            <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>Detalle de Productos Vendidos</Typography>
            <List>
                {detalleProductos.map((producto, index) => (
                    <React.Fragment key={index}>
                        <ListItem>
                            <ListItemText
                                primary={producto.nombre}
                                secondary={`Cantidad: ${producto.cantidad} | Total: $${producto.total.toFixed(2)}`}
                            />
                        </ListItem>
                        {index < detalleProductos.length - 1 && <Divider />}
                    </React.Fragment>
                ))}
            </List>

            <Button
                variant="contained"
                color="warning"
                onClick={() => navigate(-1)} // Volver a la página anterior
                sx={{
                    position: 'fixed',
                    bottom: { xs: 16, sm: 24 },
                    right: { xs: 16, sm: 24 },
                }}
            >
                Volver
            </Button>
        </Box>
    );
}

export default Estadisticas;

