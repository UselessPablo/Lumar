import React from 'react';
import { Routes, Route, HashRouter, BrowserRouter } from 'react-router-dom';
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
            <Route path="/Ventas" element={<Ventas />} />
            {/* Ruta opcional para Stock */}
            <Route path="/Stock" element={<Stock />} />
            <Route path="/Estadisticas" element={<Estadisticas />} />
        </Routes>
    </HashRouter>
);

export default Router;
