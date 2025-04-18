import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import { db } from "./firebase-config.js";

export function setupScheduleManagement() {
    const scheduleDatePicker = document.getElementById("schedule-date-picker");
    const scheduleInputsContainer = document.getElementById("schedule-inputs-container");
    const addScheduleBtn = document.getElementById("add-schedule-btn");
    const addStandardScheduleBtn = document.getElementById("add-standard-schedule-btn");
    const saveScheduleBtn = document.getElementById("save-schedule-btn");
    const blockDateBtn = document.getElementById("block-date-btn");
    const datePicker = document.getElementById("date-picker");

    // ** Agregar horario manualmente **
    addScheduleBtn.addEventListener("click", () => {
        const scheduleInput = document.createElement("div");
        scheduleInput.className = "schedule-input";
        scheduleInput.innerHTML = `
            <label>Hora:</label>
            <input type="time" class="schedule-time" required>
            <button class="remove-schedule-btn">Eliminar</button>
        `;
        scheduleInput.querySelector(".remove-schedule-btn").addEventListener("click", () => {
            scheduleInput.remove();
        });
        scheduleInputsContainer.appendChild(scheduleInput);
    });

    // ** Agregar horarios estándar al contenedor **
    addStandardScheduleBtn.addEventListener("click", () => {
        const standardSchedules = ["08:00", "10:00", "14:00", "16:00", "18:00", "20:00"];

        standardSchedules.forEach(hora => {
            const existingInputs = new Set(
                Array.from(scheduleInputsContainer.querySelectorAll(".schedule-time")).map(input => input.value)
            );

            if (!existingInputs.has(hora)) {
                const scheduleInput = document.createElement("div");
                scheduleInput.className = "schedule-input";
                scheduleInput.innerHTML = `
                    <label>Hora:</label>
                    <input type="time" class="schedule-time" value="${hora}" required>
                    <button class="remove-schedule-btn">Eliminar</button>
                `;
                scheduleInput.querySelector(".remove-schedule-btn").addEventListener("click", () => {
                    scheduleInput.remove();
                });
                scheduleInputsContainer.appendChild(scheduleInput);
            }
        });
    });

    // ** Guardar horarios en Firestore **
    saveScheduleBtn.addEventListener("click", async () => {
        const selectedDate = scheduleDatePicker.value;

        if (!selectedDate) {
            alert("Por favor, selecciona una fecha.");
            return;
        }

        const scheduleTimes = Array.from(document.querySelectorAll(".schedule-time"))
            .map(input => input.value)
            .filter(Boolean);

        if (scheduleTimes.length === 0) {
            alert("Por favor, agrega al menos un horario.");
            return;
        }

        const horarios = scheduleTimes.map(hora => ({
            hora,
            disponible: true
        }));

        try {
            const docRef = doc(db, "horarios", selectedDate);
            const docSnapshot = await getDoc(docRef);

            if (docSnapshot.exists()) {
                await updateDoc(docRef, { horarios });
                alert(`✅ Horarios actualizados para el día ${selectedDate}.`);
            } else {
                await setDoc(docRef, { horarios });
                alert(`✅ Horarios guardados para el día ${selectedDate}.`);
            }

            scheduleInputsContainer.innerHTML = ""; 
            scheduleDatePicker.value = ""; 
        } catch (error) {
            console.error("❌ Error al guardar horarios:", error);
            alert("❌ Hubo un error al guardar los horarios. Revisa la consola para más detalles.");
        }
    });

    // ** Bloquear día y eliminar documento si es necesario **
    // blockDateBtn.addEventListener("click", async () => {
    //     const selectedDate = datePicker.value;

    //     if (!selectedDate) {
    //         alert("Por favor, selecciona una fecha.");
    //         return;
    //     }

    //     const docRef = doc(db, "horarios", selectedDate);

    //     try {
    //         const docSnapshot = await getDoc(docRef);

    //         if (docSnapshot.exists()) {
    //             await deleteDoc(docRef);
    //             alert(`✅ El día ${selectedDate} fue bloqueado y eliminado correctamente de Firestore.`);
    //         } else {
    //             alert(`❌ No se puede bloquear el día ${selectedDate} porque no tiene horarios o no existe.`);
    //         }
    //     } catch (error) {
    //         console.error("❌ Error al bloquear el día:", error);
    //         alert("❌ Hubo un error al intentar bloquear el día. Revisa la consola para más detalles.");
    //     }
    // });
}