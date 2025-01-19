import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Snackbar,
    Grid,
} from '@mui/material';
import { ref, get, set, remove, push } from 'firebase/database';
import { db } from './firebaseConfig';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import lumarfoto from './lumar.png';


function Stock() {
    const [productos, setProductos] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [nombre, setNombre] = useState('');
    const [stock, setStock] = useState('');
    const [precioCompra, setPrecioCompra] = useState('');
    const [precioVenta, setPrecioVenta] = useState('');
    const [stockMinimo, setStockMinimo] = useState('');
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [alertaStock, setAlertaStock] = useState(false);
    const [mensajeAlerta, setMensajeAlerta] = useState('');
    const [productosConAlerta, setProductosConAlerta] = useState([]);
    const navigate = useNavigate();

    // Cargar productos desde Firebase
    const cargarProductos = async () => {
        const productosRef = ref(db, 'productos');
        const productosSnapshot = await get(productosRef);
        const productosData = productosSnapshot.exists() ? productosSnapshot.val() : {};

        // Incluye el ID como una propiedad de cada producto
        const productosConId = Object.entries(productosData).map(([key, value]) => ({ id: key, ...value }));
        setProductos(productosConId);
        verificarStockBajo(productosConId);
    };

    useEffect(() => {
        cargarProductos();
    }, []);

    // Guardar un nuevo producto
    const guardarProducto = async () => {
        if (!nombre) return;

        const nuevoProducto = {
            nombre,
            stock: Number(stock),
            precioCompra: Number(precioCompra),
            precioVenta: Number(precioVenta),
            stockMinimo: Number(stockMinimo),
        };

        const nuevoProductoRef = push(ref(db, 'productos'));
        await set(nuevoProductoRef, nuevoProducto);

        setProductos([...productos, { id: nuevoProductoRef.key, ...nuevoProducto }]);

        setNombre('');
        setStock('');
        setPrecioCompra('');
        setPrecioVenta('');
        setStockMinimo('');
        verificarStockBajo([...productos, { id: nuevoProductoRef.key, ...nuevoProducto }]);
    };

    // Eliminar un producto
    const eliminarProducto = async (idProducto) => {
        await remove(ref(db, `productos/${idProducto}`));
        const productosActualizados = productos.filter((producto) => producto.id !== idProducto);
        setProductos(productosActualizados);
        verificarStockBajo(productosActualizados);
    };

    // Abrir diálogo de edición
    const abrirDialogoEditar = (producto) => {
        setProductoSeleccionado(producto);
    };

    // Cerrar diálogo de edición
    const cerrarDialogoEditar = () => {
        setProductoSeleccionado(null);
    };

    // Guardar cambios en un producto
    const guardarCambios = async () => {
        if (productoSeleccionado) {
            const { id, nombre, stock, precioCompra, precioVenta, stockMinimo } = productoSeleccionado;

            await set(ref(db, `productos/${id}`), {
                nombre,
                stock: Number(stock),
                precioCompra: Number(precioCompra),
                precioVenta: Number(precioVenta),
                stockMinimo: Number(stockMinimo),
            });

            const productosActualizados = productos.map((producto) =>
                producto.id === id ? { id, nombre, stock, precioCompra, precioVenta, stockMinimo } : producto
            );

            setProductos(productosActualizados);
            cerrarDialogoEditar();
            verificarStockBajo(productosActualizados);
        }
    };

    // Verificar stock bajo
    const verificarStockBajo = (productos) => {
        const productosConStockBajo = productos.filter(
            (producto) => producto.stock <= producto.stockMinimo
        );

        productosConStockBajo.forEach((producto) => {
            if (!productosConAlerta.includes(producto.nombre)) {
                setMensajeAlerta(`Stock bajo: ${producto.nombre} (Stock: ${producto.stock})`);
                setAlertaStock(true);
                setProductosConAlerta((prev) => [...prev, producto.nombre]);
            }
        });
    };

    // Filtrar productos
    const productosFiltrados = productos.filter((producto) =>
        producto.nombre?.toLowerCase().includes(filtro.toLowerCase())
    );

    const AlertSnackbar = styled(Snackbar)({
        '& .MuiSnackbarContent-root': {
            backgroundColor: 'red',
            color: 'white',
            fontWeight: 'bold',
        },
    });

    return (
        <Box sx={{ width: '100%' }}>
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
            <Typography variant="h5" textAlign="center" sx={{ mb: 2 }}>
                Ingresar Stock
            </Typography>

            <Grid
                container
                spacing={2}
                justifyContent="center"
                sx={{ mb: 2 }}
                onKeyDown={(e) => e.key === 'Enter' && guardarProducto()} // Confirmar con Enter
            >
                <Grid item xs={12} sm={4}>
                    <TextField label="Nombre" fullWidth value={nombre} onChange={(e) => setNombre(e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={2}>
                    <TextField type="number" label="Stock" fullWidth value={stock} onChange={(e) => setStock(e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={2}>
                    <TextField
                        type="number"
                        label="Precio de Compra"
                        fullWidth
                        value={precioCompra}
                        onChange={(e) => setPrecioCompra(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} sm={2}>
                    <TextField
                        type="number"
                        label="Precio de Venta"
                        fullWidth
                        value={precioVenta}
                        onChange={(e) => setPrecioVenta(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} sm={2}>
                    <TextField
                        type="number"
                        label="Stock Mínimo"
                        fullWidth
                        value={stockMinimo}
                        onChange={(e) => setStockMinimo(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} sm={2}>
                    <Button
                        sx={{ height: '100', borderRadius:7}}
                        onClick={guardarProducto}
                        variant="contained"
                        color="primary"
                    >
                        Agregar
                    </Button>
                </Grid>
            </Grid>

            <TextField
                label="Buscar producto"
                fullWidth
                variant="outlined"
                sx={{
                    mb: 2,
                    mt: 2,
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '20px',
                    },
                }}
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
            />
            <List>
                {productosFiltrados.map((producto) => (
                    <ListItem
                        key={producto.id}
                        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                        <ListItemText
                            primary={producto.nombre}
                            secondary={`Stock: ${producto.stock}, Precio Compra: $${producto.precioCompra}, Precio Venta: $${producto.precioVenta}, Stock Mínimo: ${producto.stockMinimo}`}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ mr: 2, borderRadius: 7 }}
                            onClick={() => abrirDialogoEditar(producto)}
                        >
                            Editar
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            sx={{ borderRadius: 5 }}
                            onClick={() => eliminarProducto(producto.id)}
                        >
                            Eliminar
                        </Button>
                    </ListItem>
                ))}
            </List>

            {productoSeleccionado && (
                <Dialog open={true} onClose={cerrarDialogoEditar}>
                    <DialogTitle>Editar Producto</DialogTitle>
                    <DialogContent
                        onKeyDown={(e) => e.key === 'Enter' && guardarCambios()} // Confirmar con Enter
                    >
                        <TextField
                            label="Nombre"
                            fullWidth
                            value={productoSeleccionado.nombre}
                            onChange={(e) =>
                                setProductoSeleccionado({ ...productoSeleccionado, nombre: e.target.value })
                            }
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Stock"
                            type="number"
                            fullWidth
                            value={productoSeleccionado.stock}
                            onChange={(e) =>
                                setProductoSeleccionado({ ...productoSeleccionado, stock: e.target.value })
                            }
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Precio de Compra"
                            type="number"
                            fullWidth
                            value={productoSeleccionado.precioCompra}
                            onChange={(e) =>
                                setProductoSeleccionado({ ...productoSeleccionado, precioCompra: e.target.value })
                            }
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Precio de Venta"
                            type="number"
                            fullWidth
                            value={productoSeleccionado.precioVenta}
                            onChange={(e) =>
                                setProductoSeleccionado({ ...productoSeleccionado, precioVenta: e.target.value })
                            }
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Stock Mínimo"
                            type="number"
                            fullWidth
                            value={productoSeleccionado.stockMinimo}
                            onChange={(e) =>
                                setProductoSeleccionado({ ...productoSeleccionado, stockMinimo: e.target.value })
                            }
                            sx={{ mb: 2 }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={cerrarDialogoEditar} color="secondary">
                            Cancelar
                        </Button>
                        <Button onClick={guardarCambios} color="primary">
                            Guardar
                        </Button>
                    </DialogActions>
                </Dialog>
            )}

            <AlertSnackbar
                open={alertaStock}
                autoHideDuration={6000}
                onClose={() => setAlertaStock(false)}
                message={mensajeAlerta}
            />
        </Box>
    );
}

export default Stock;

