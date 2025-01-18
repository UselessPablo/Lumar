import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, Snackbar, Container } from '@mui/material';
import { ref, get, set, push } from 'firebase/database';
import { db } from './firebaseConfig';
import { useNavigate } from 'react-router-dom';

function Ventas() {
    const [productos, setProductos] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [itemsSeleccionados, setItemsSeleccionados] = useState([]);
    const [cantidadVenta, setCantidadVenta] = useState({});
    const [mensaje, setMensaje] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [totalVentasDiarias, setTotalVentasDiarias] = useState(0);
    const [totalVentasMensuales, setTotalVentasMensuales] = useState(0);
    const navigate = useNavigate();

    const fechaActual = new Date();
    const mesActual = fechaActual.toISOString().slice(0, 7); // 'YYYY-MM'

    const cargarDatos = async () => {
        const productosRef = ref(db, 'productos');
        const ventasRef = ref(db, 'ventas');
        const acumuladoMensualRef = ref(db, `acumuladoMensual/${mesActual}`);

        const productosSnapshot = await get(productosRef);
        setProductos(productosSnapshot.exists() ? Object.values(productosSnapshot.val()) : []);

        const ventasSnapshot = await get(ventasRef);
        if (ventasSnapshot.exists()) {
            const ventas = Object.values(ventasSnapshot.val());
            const ventasDelDia = ventas.filter((venta) => venta.fecha === fechaActual.toISOString().split('T')[0]);

            const totalDelDia = ventasDelDia.reduce((total, venta) => total + venta.totalVenta, 0);
            setTotalVentasDiarias(totalDelDia);
        }

        const acumuladoMensualSnapshot = await get(acumuladoMensualRef);
        if (acumuladoMensualSnapshot.exists()) {
            setTotalVentasMensuales(acumuladoMensualSnapshot.val());
        } else {
            await set(acumuladoMensualRef, 0); // Inicializar el acumulado para el mes actual
            setTotalVentasMensuales(0);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const agregarItem = (producto) => {
        const cantidad = Number(cantidadVenta[producto.nombre] || 0);
        if (cantidad <= 0 || cantidad > producto.stock) {
            setMensaje('Cantidad no válida');
            setSnackbarOpen(true);
            return;
        }

        const existente = itemsSeleccionados.find((item) => item.nombre === producto.nombre);
        if (existente) {
            existente.cantidad += cantidad;
        } else {
            setItemsSeleccionados([...itemsSeleccionados, { ...producto, cantidad }]);
        }

        setCantidadVenta({ ...cantidadVenta, [producto.nombre]: '' });
        setMensaje(`Producto agregado: ${producto.nombre}, Cantidad: ${cantidad}`);
        setSnackbarOpen(true);
    };

    const confirmarVenta = async () => {
        if (itemsSeleccionados.length === 0) {
            setMensaje('No hay productos seleccionados para la venta');
            setSnackbarOpen(true);
            return;
        }

        let totalVenta = 0;

        for (const item of itemsSeleccionados) {
            const producto = productos.find((p) => p.nombre === item.nombre);
            if (producto) {
                producto.stock -= item.cantidad;
                const totalItem = item.cantidad * producto.precioVenta;
                totalVenta += totalItem;

                await set(ref(db, `productos/${producto.nombre}`), producto);
                await push(ref(db, 'ventas'), {
                    producto: producto.nombre,
                    cantidad: item.cantidad,
                    totalVenta: totalItem,
                    fecha: fechaActual.toISOString().split('T')[0],
                });
            }
        }

        const acumuladoMensualRef = ref(db, `acumuladoMensual/${mesActual}`);
        const nuevoTotalMensual = totalVentasMensuales + totalVenta;
        await set(acumuladoMensualRef, nuevoTotalMensual);

        setItemsSeleccionados([]);
        setTotalVentasDiarias((prev) => prev + totalVenta);
        setTotalVentasMensuales(nuevoTotalMensual);
        setMensaje(`Venta confirmada. Total de la venta: $${totalVenta.toFixed(2)}`);
        setSnackbarOpen(true);

        cargarDatos();
    };

    const imprimirTicket = () => {
        const contenido = `
         Lumar

        *** Ticket de Compra ***
        
        Fecha: ${new Date().toLocaleString()}

        Productos:
        ${itemsSeleccionados
                .map(
                    (item) =>
                        `- ${item.nombre} | Cantidad: ${item.cantidad} | Total: $${(
                            item.cantidad * item.precioVenta
                        ).toFixed(2)}`
                )
                .join('\n')}

        Subtotal: $${subtotal.toFixed(2)}

        *** Gracias por su compra ***
        `;
        const ventana = window.open('', '_blank');
        ventana.document.write(`<pre>${contenido}</pre>`);
        ventana.document.close();
        ventana.print();
    };

    const subtotal = itemsSeleccionados.reduce((total, item) => total + item.cantidad * item.precioVenta, 0);

    const productosFiltrados = productos.filter((producto) =>
        typeof producto.nombre === 'string' && producto.nombre.toLowerCase().includes(filtro.toLowerCase())
    );
    const manejarClick = () => {
        imprimirTicket();
        confirmarVenta();
    };

    return (
        <Container maxWidth='lg'>
            <Box sx={{ mt: 4 }}>
                <Typography variant="h4" textAlign="center" sx={{ mb: 3 }}>Lumar</Typography>
                <Typography variant="h5" textAlign="center" sx={{ mb: 3 }}>Gestión de Ventas</Typography>

                <TextField
                    label="Buscar producto"
                    fullWidth
                    variant="outlined"
                    sx={{ mb: 2 }}
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                />

                <List sx={{ padding: 0 }}>
                    {productosFiltrados.map((producto, index) => (
                        <ListItem key={index} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, mb: 2 }}>
                            <ListItemText
                                primary={producto.nombre}
                                secondary={`Stock: ${producto.stock}, Precio Venta: $${producto.precioVenta}`}
                                sx={{ mb: { xs: 1, sm: 0 }, mr: { sm: 2 } }}
                            />
                            <TextField
                                sx={{ mb: { xs: 2, sm: 0 }, mr: 2 }}
                                type="number"
                                label="Cantidad"
                                value={cantidadVenta[producto.nombre] || ''}
                                onChange={(e) => setCantidadVenta({ ...cantidadVenta, [producto.nombre]: e.target.value })}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => agregarItem(producto)}
                            >
                                Agregar
                            </Button>
                        </ListItem>
                    ))}
                </List>

                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Productos seleccionados:</Typography>
                    <List>
                        {itemsSeleccionados.map((item, index) => (
                            <ListItem key={index}>
                                <ListItemText
                                    primary={item.nombre}
                                    secondary={`Cantidad: ${item.cantidad}, Total: $${(item.cantidad * item.precioVenta).toFixed(2)}`}
                                />
                            </ListItem>
                        ))}
                    </List>

                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Subtotal: ${subtotal.toFixed(2)}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 3, mb:4, ml:45 }}>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={confirmarVenta}
                    >
                        Confirmar Venta
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={manejarClick}
                    >
                        Imprimir Ticket
                    </Button>
                </Box>
            </Box>

            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)} message={mensaje} />

            <Button
                variant="contained"
                color="warning"
                onClick={() => navigate(-1)}
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                }}
            >
                Volver
            </Button>
        </Container>
    );
}

export default Ventas;
