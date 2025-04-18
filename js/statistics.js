import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import { db } from "./firebase-config.js";

// 🔥 Función para obtener la fecha actual en formato `YYYY-MM-DD`
function getTodayStr() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split('T')[0];
}

export function updateStatistics() {
    const totalTurnosElement = document.getElementById("total-turnos");

    if (!totalTurnosElement) {
        return;
    }

    const horariosCollection = collection(db, "horarios");

    onSnapshot(horariosCollection, (snapshot) => {
        let turnosReservados = 0;
        const todayStr = getTodayStr(); // Obtener fecha actual en cada actualización

        snapshot.forEach(doc => {
            const docDateStr = doc.id;
            const horarios = doc.data()?.horarios || [];

            if (!/^\d{4}-\d{2}-\d{2}$/.test(docDateStr)) {
                return;
            }

            // 🔥 Se ajusta la comparación para incluir hoy y los futuros
            if (docDateStr >= todayStr) {
                turnosReservados += horarios.filter(horario => 
                    horario.hasOwnProperty("disponible") && horario.disponible === false
                ).length;
            }
        });

        totalTurnosElement.textContent = turnosReservados;
    });

    // 🔥 **Verificación automática cada minuto para actualizar la fecha**
    setInterval(() => {
        updateStatistics(); // Recargar estadísticas automáticamente si cambia el día
    }, 60000); // Se ejecuta cada minuto
}