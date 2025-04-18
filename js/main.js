import { loadTurnos } from './loadTurnos.js';
import { setupCancellation } from './cancelTurnos.js';
import { setupDateManagement } from './manageDates.js';
import { setupScheduleManagement } from './scheduleManagement.js';
import { loadReservedTurnos } from './turnosReservados.js';
import { updateStatistics } from './statistics.js';
import { setupSearch } from './search.js';
import { setupLogout } from './logout.js';
// import { generateSchedulesUntilMonth } from './actualizarHorarios.js'; // Importación corregida

import { doc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";
import { db } from "./firebase-config.js";

async function setupBlockDate() {
    const auth = getAuth();

    auth.onAuthStateChanged(user => {
        if (!user || user.email !== "sandredaii57@gmail.com") {  
            console.warn("⛔ Acceso restringido: Redirigiendo a login...");
            window.location.href = "/inicio/login.html"; // 🔥 Si no está autenticado, lo manda al login
            return;
        }

        const blockDateBtn = document.getElementById("block-date-btn");
        const datePicker = document.getElementById("date-picker");

        blockDateBtn?.addEventListener("click", async () => {
            const selectedDate = datePicker?.value;

            if (!selectedDate) {
                alert("Por favor, selecciona una fecha.");
                return;
            }

            const docRef = doc(db, "horarios", selectedDate);

        });
    });
}

// const horariosPorDia = {
//     lunes: [
//         { hora: "08:00", disponible: true },
//         { hora: "10:00", disponible: true },
//         { hora: "14:00", disponible: true },
//         { hora: "16:00", disponible: true },
//         { hora: "18:00", disponible: true },
//         { hora: "20:00", disponible: true }
//     ],
//     martes: [
//         { hora: "08:00", disponible: true },
//         { hora: "10:00", disponible: true },
//         { hora: "14:00", disponible: true },
//         { hora: "16:00", disponible: true },
//         { hora: "18:00", disponible: true },
//         { hora: "20:00", disponible: true }
//     ],
//     miércoles: [
//         { hora: "08:00", disponible: true },
//         { hora: "10:00", disponible: true },
//         { hora: "14:00", disponible: true },
//         { hora: "16:00", disponible: true },
//         { hora: "18:00", disponible: true },
//         { hora: "20:00", disponible: true }
//     ],
//     jueves: [
//         { hora: "08:00", disponible: true },
//         { hora: "10:00", disponible: true },
//         { hora: "14:00", disponible: true },
//         { hora: "16:00", disponible: true },
//         { hora: "18:00", disponible: true },
//         { hora: "20:00", disponible: true }
//     ],
//     viernes: [
//         { hora: "08:00", disponible: true },
//         { hora: "10:00", disponible: true },
//         { hora: "14:00", disponible: true },
//         { hora: "16:00", disponible: true },
//         { hora: "18:00", disponible: true },
//         { hora: "20:00", disponible: true }
//     ],
//     sábado: [
//         { hora: "08:00", disponible: true },
//         { hora: "10:00", disponible: true },
//         { hora: "14:00", disponible: true },
//         { hora: "16:00", disponible: true },
//         { hora: "18:00", disponible: true },
//         { hora: "20:00", disponible: true }
//     ]
// };

document.addEventListener('DOMContentLoaded', async () => {
    const auth = getAuth();

    auth.onAuthStateChanged(async user => {
        if (!user || user.email !== "sandredaii57@gmail.com") {
            console.warn("⛔ Usuario no autenticado. Redirigiendo a login...");
            window.location.href = "/inicio/login.html"; // 🔥 Redirección automática si no está autenticado
            return;
        }

        try {
            // await generateSchedulesUntilMonth(horariosPorDia, 6);
            // setupLogout();
            await loadTurnos();
            setupCancellation();
            setupDateManagement();
            setupScheduleManagement();
            await setupBlockDate();
            await loadReservedTurnos();
            updateStatistics();
            setupSearch();
            setupLogout(); // ✅ Asegurar que setupLogout() se ejecuta aquí

        } catch (error) {
            console.error("Error al inicializar el panel administrativo:", error);
        }
    });
});