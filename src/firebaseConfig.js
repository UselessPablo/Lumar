import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, child } from 'firebase/database';
import { getAuth } from 'firebase/auth';  // Importa auth desde el módulo 'firebase/auth'

const firebaseConfig = {
    apiKey: "AIzaSyDuHL596-B77sK-HClxSMVk19JEhq1wNZA",
    authDomain: "lumar-4ab97.firebaseapp.com",
    databaseURL: "https://lumar-4ab97-default-rtdb.firebaseio.com",  // URL de Realtime Database
    projectId: "lumar-4ab97",
    storageBucket: "lumar-4ab97.appspot.com",
    messagingSenderId: "152910143945",
    appId: "1:152910143945:web:22d1b491f3931866978818",
    measurementId: "G-MWVR473PEK"
};

// Inicializar la aplicación de Firebase
const app = initializeApp(firebaseConfig);

// Obtener la referencia de la base de datos
const db = getDatabase(app);

// Obtener la referencia de la autenticación
const auth = getAuth(app);

export { db, ref, set, get, child, auth }; // Exportar auth desde el módulo correcto

