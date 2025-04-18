import { doc, deleteDoc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import { db } from "./firebase-config.js";
import { loadTurnos } from './loadTurnos.js';

export function setupCancellation() {
    document.addEventListener("click", async (event) => {
        if (event.target.classList.contains("delete-btn")) {
            const turnoId = event.target.getAttribute("data-id");
            const date = event.target.getAttribute("data-date");
            const hora = event.target.getAttribute("data-hora");

            await cancelTurno(turnoId, date, hora);
        }
    });
}

async function cancelTurno(turnoId, date, hora) {
    try {
        if (turnoId) {
            const turnoRef = doc(db, "turnos", turnoId);
            await deleteDoc(turnoRef);
        }

        const horariosRef = doc(db, "horarios", date);
        const horariosSnapshot = await getDoc(horariosRef);

        if (horariosSnapshot.exists()) {
            const horariosActualizados = horariosSnapshot.data().horarios.map(horario => {
                if (horario.hora === hora) {
                    return { ...horario, disponible: true };
                }
                return horario;
            });

            await setDoc(horariosRef, { ...horariosSnapshot.data(), horarios: horariosActualizados });
        }

        alert(`El turno de las ${hora} en ${date} ha sido cancelado.`);
        await loadTurnos();
    } catch (error) {
        console.error("Error al cancelar turno:", error);
        alert("Hubo un error al cancelar el turno. Intenta nuevamente.");
    }
}