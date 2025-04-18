import { doc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import { db } from "./firebase-config.js";

// ** Bloquear día (eliminando el documento si existe) **
export function setupDateManagement() {
    const blockDateBtn = document.getElementById("block-date-btn");
    const datePicker = document.getElementById("date-picker");

    blockDateBtn.addEventListener("click", async () => {
        const selectedDate = datePicker.value;

        if (!selectedDate) {
            alert("Por favor, selecciona una fecha.");
            return;
        }

        try {
            const horariosRef = doc(db, "horarios", selectedDate);
            const horariosSnapshot = await getDoc(horariosRef);

            if (!horariosSnapshot.exists()) {
                alert(`⚠️ El día ${selectedDate} no existe en la base de datos. No se puede bloquear.`);
                return;
            }

            // Confirmar antes de eliminar
            const confirmacion = confirm(`¿Estás seguro que querés bloquear (eliminar) el día ${selectedDate}? Esta acción no se puede deshacer.`);
            if (!confirmacion) return;

            await deleteDoc(horariosRef);
            alert(`🗑️ El día ${selectedDate} ha sido bloqueado (eliminado de Firestore).`);

        } catch (error) {
            console.error("❌ Error al intentar bloquear el día:", error);
            alert("❌ Ocurrió un error al intentar bloquear el día. Revisa la consola.");
        }
    });
}
