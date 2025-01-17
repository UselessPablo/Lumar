import React from 'react';
import { Routes, Route, HashRouter } from 'react-router-dom';
import App from './App'; // Ruta principal
import Ventas from './Ventas'; // Ruta para Ventas
import Stock from './Stock'; // Ruta opcional para Stock
import Estadisticas from './Estadisticas';

const Router = () => (
    <HashRouter>
        <Routes>
            {/* Ruta principal */}
            <Route path="/" element={<App />} />
            {/* Ruta para Ventas */}
            <Route path="/ventas" element={<Ventas />} />
            {/* Ruta opcional para Stock */}
            <Route path="/stock" element={<Stock />} />
            <Route path="/estadisticas" element={<Estadisticas />} />
        </Routes>
    </HashRouter>
);

export default Router;
