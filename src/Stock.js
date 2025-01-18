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
import { ref, get, set, remove, push } from 'firebase/database';  // Agregar `push` a la importación
import { db } from './firebaseConfig';
import { styled } from '@mui/system';

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

    // Cargar productos desde Firebase
    const cargarProductos = async () => {
        const productosRef = ref(db, 'productos');
        const productosSnapshot = await get(productosRef);
        const productosData = productosSnapshot.exists() ? productosSnapshot.val() : {};
        setProductos(Object.values(productosData));
        verificarStockBajo(Object.values(productosData));
    };

    useEffect(() => {
        cargarProductos();
    }, []);

    // Guardar un nuevo producto
    const guardarProducto = async () => {
        if (!nombre) return; // Validar que el nombre no esté vacío
        const nuevoProducto = {
            nombre,
            stock: Number(stock),
            precioCompra: Number(precioCompra),
            precioVenta: Number(precioVenta),
            stockMinimo: Number(stockMinimo),
        };

        // Usar la función push para agregar un nuevo producto a Firebase
        const nuevoProductoRef = push(ref(db, 'productos'));
        await set(nuevoProductoRef, nuevoProducto);

        // Agregar el nuevo producto a la lista local
        setProductos([...productos, { id: nuevoProductoRef.key, ...nuevoProducto }]);

        // Limpiar campos
        setNombre('');
        setStock('');
        setPrecioCompra('');
        setPrecioVenta('');
        setStockMinimo('');

        // Verificar si hay stock bajo
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

            // Actualizar el producto en Firebase usando el ID único
            await set(ref(db, `productos/${id}`), {
                nombre,
                stock: Number(stock),
                precioCompra: Number(precioCompra),
                precioVenta: Number(precioVenta),
                stockMinimo: Number(stockMinimo),
            });

            // Actualizar el producto en la lista local
            const productosActualizados = productos.map((producto) =>
                producto.id === id ? { ...productoSeleccionado } : producto
            );

            setProductos(productosActualizados);

            // Cerrar el diálogo de edición
            cerrarDialogoEditar();

            // Verificar si hay stock bajo
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
        producto.nombre && typeof producto.nombre === 'string'
            ? producto.nombre.toLowerCase().includes(filtro.toLowerCase())
            : false
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
            <Typography variant="h5" textAlign="center" sx={{ mb: 2 }}>Gestión de Stock</Typography>
            <TextField
                label="Buscar producto"
                fullWidth
                variant="outlined"
                sx={{ mb: 2 }}
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
            />

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
                    <TextField type="number" label="Precio de Compra" fullWidth value={precioCompra} onChange={(e) => setPrecioCompra(e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={2}>
                    <TextField type="number" label="Precio de Venta" fullWidth value={precioVenta} onChange={(e) => setPrecioVenta(e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={2}>
                    <TextField type="number" label="Stock Mínimo" fullWidth value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={2}>
                    <Button sx={{ height: '100%' }} onClick={guardarProducto} variant="contained" color="primary">Agregar</Button>
                </Grid>
            </Grid>

            <List>
                {productosFiltrados.map((producto) => (
                    <ListItem key={producto.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <ListItemText
                            primary={producto.nombre}
                            secondary={`Stock: ${producto.stock}, Precio Compra: $${producto.precioCompra}, Precio Venta: $${producto.precioVenta}, Stock Mínimo: ${producto.stockMinimo}`}
                        />
                        <Button variant="outlined" color="primary" onClick={() => abrirDialogoEditar(producto)}>Editar</Button>
                        <Button variant="outlined" color="error" onClick={() => eliminarProducto(producto.id)}>Eliminar</Button>
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
                        <Button onClick={cerrarDialogoEditar} color="secondary">Cancelar</Button>
                        <Button onClick={guardarCambios} color="primary">Guardar</Button>
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

