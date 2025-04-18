// Importar Firebase desde CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAXm9c5k1xMDmxJ44i1agnaWzZJo-RVxjM",
    authDomain: "pagina-de-turnoss.firebaseapp.com",
    projectId: "pagina-de-turnoss",
    storageBucket: "pagina-de-turnoss.appspot.com",
    messagingSenderId: "1004593104922",
    appId: "1:1004593104922:web:8d0fdf9209f2aeda39e9a3"
};

// Inicializar Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Exportar módulos correctamente
export { app, db, auth };