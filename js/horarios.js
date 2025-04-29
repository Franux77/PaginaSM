import { collection, doc, onSnapshot, getDoc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import { db } from "./firebase-config.js";

const scheduleContainer = document.getElementById("schedule");
const selectedDateTitle = document.getElementById("selected-date");
const loader = document.getElementById("loader");

let currentOptions = null;

// Extraer fecha desde la URL
const urlParams = new URLSearchParams(window.location.search);
const selectedDate = urlParams.get("date");

if (!selectedDate || !/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
    alert("Fecha inválida. Redirigiendo.");
    window.location.href = "/inicio/inicio.html";
} else {
    try {
        const [year, month, day] = selectedDate.split("-");
        const adjustedDate = new Date(year, month - 1, day);
        const formattedDate = adjustedDate.toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });
        selectedDateTitle.textContent = `${formattedDate}`;
    } catch (error) {
        alert("Error al procesar fecha.");
        console.error("Error formateando fecha:", error);
        window.location.href = "/inicio/inicio.html";
    }
}

function calculateHoursDifference(dateTime) {
    const now = new Date();
    return (new Date(dateTime) - now) / (1000 * 60 * 60);
}

async function handleExpiredSchedules(date) {
    const docRef = doc(db, "horarios", date);
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) return;

    const horarios = docSnapshot.data().horarios || [];
    const horariosActualizados = horarios.filter(horario => {
        const horarioDateTime = new Date(`${date}T${horario.hora}:00`);
        return calculateHoursDifference(horarioDateTime) > 1;
    });

    if (horariosActualizados.length > 0) {
        await setDoc(docRef, { horarios: horariosActualizados });
    } else {
        await deleteDoc(docRef);
    }
}

function createOptionsButtons(hora, itemElement) {
    const options = document.createElement("div");
    options.className = "schedule-options";

    const reservar = document.createElement("button");
    reservar.className = "option-btn reservar-btn";
    reservar.textContent = "Reservar";
    reservar.onclick = (e) => {
        e.stopPropagation();
        window.location.href = `/inicio/formulario.html?date=${selectedDate}&hora=${hora}`;
    };

    const cancelar = document.createElement("button");
    cancelar.className = "option-btn cancelar-btn";
    cancelar.textContent = "Cancelar";
    cancelar.onclick = (e) => {
        e.stopPropagation();
        options.remove();
        currentOptions = null;
    };

    options.appendChild(cancelar);
    options.appendChild(reservar);
    itemElement.insertAdjacentElement("afterend", options);

    currentOptions = options;
}

function setupRealTimeSchedules() {
    const horariosCollection = collection(db, "horarios");
    loader.style.display = "flex";

    onSnapshot(horariosCollection, (snapshot) => {
        scheduleContainer.innerHTML = "";

        let horariosDelDia = [];

        snapshot.forEach(doc => {
            if (doc.id === selectedDate) {
                horariosDelDia = doc.data().horarios;
            }
        });

        if (horariosDelDia.length === 0) {
            alert("No hay horarios para esta fecha.");
            loader.style.display = "none";
            setTimeout(() => window.location.href = "/inicio/inicio.html", 2000);
            return;
        }

        const horariosDisponibles = horariosDelDia.filter(h => {
            if (!h.disponible) return false;
            const horarioDateTime = new Date(`${selectedDate}T${h.hora}:00`);
            return calculateHoursDifference(horarioDateTime) > 1;
        });

        if (horariosDisponibles.length === 0) {
            scheduleContainer.innerHTML = "<p>No hay horarios disponibles para este día</p>";
            setTimeout(() => window.location.href = "/inicio/inicio.html", 3000);
            loader.style.display = "none";
            return;
        }

        horariosDisponibles.forEach(horario => {
            const horarioElement = document.createElement("div");
            horarioElement.classList.add("schedule-item");
            horarioElement.textContent = horario.hora;

            horarioElement.onclick = (e) => {
                e.stopPropagation();

                if (currentOptions) {
                    currentOptions.remove();
                    currentOptions = null;
                }

                createOptionsButtons(horario.hora, horarioElement);
            };

            scheduleContainer.appendChild(horarioElement);
        });

        loader.style.display = "none";
    }, (error) => {
        console.error("Error en onSnapshot:", error);
        alert("No se pudieron cargar los horarios.");
        loader.style.display = "none";
    });
}

document.addEventListener("click", () => {
    if (currentOptions) {
        currentOptions.remove();
        currentOptions = null;
    }
});

async function blockDay(date) {
    const docRef = doc(db, "horarios", date);

    try {
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
            const horarios = docSnapshot.data().horarios;
            const tieneReservas = horarios.some(h => !h.disponible);

            if (tieneReservas) {
                alert(`El día ${date} tiene reservas reales y no se puede eliminar.`);
            } else {
                await deleteDoc(docRef);
                alert(`El día ${date} fue bloqueado correctamente.`);
            }
        } else {
            alert(`No se encontró información para el día ${date}.`);
        }
    } catch (error) {
        console.error("Error al bloquear el día:", error);
        alert("Error al bloquear el día.");
    }
}

async function reservarHorario(date, horaSeleccionada) {
    const docRef = doc(db, "horarios", date);
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) return;

    const horariosActualizados = docSnapshot.data().horarios.map(horario => {
        if (horario.hora === horaSeleccionada) {
            return { ...horario, disponible: false };
        }
        return horario;
    });

    await setDoc(docRef, { ...docSnapshot.data(), horarios: horariosActualizados });
}

if (selectedDate && /^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
    handleExpiredSchedules(selectedDate);
    setupRealTimeSchedules();
}
