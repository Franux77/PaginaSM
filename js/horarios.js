import { collection, doc, onSnapshot, getDoc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import { db } from "./firebase-config.js";

const scheduleContainer = document.getElementById("schedule");
const selectedDateTitle = document.getElementById("selected-date");
const loader = document.getElementById("loader");

// Extraer la fecha seleccionada desde la URL
const urlParams = new URLSearchParams(window.location.search);
const selectedDate = urlParams.get("date");

// Validación de fecha
if (!selectedDate || !/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
    alert("Fecha inválida o no especificada. Redirigiendo a la página principal.");
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
        alert("Error al procesar la fecha seleccionada.");
        console.error("Error formateando fecha:", error);
        window.location.href = "/inicio/inicio.html";
    }
}

// Función para calcular la diferencia en horas
function calculateHoursDifference(dateTime) {
    const now = new Date();
    const difference = (new Date(dateTime) - now) / (1000 * 60 * 60);
    return difference;
}

// Eliminar horarios pasados del límite de 1 hora
async function handleExpiredSchedules(date) {
    const docRef = doc(db, "horarios", date);
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
        console.log(`No se encontró el documento para la fecha ${date}.`);
        return;
    }

    const horarios = docSnapshot.data().horarios || [];

    const horariosActualizados = horarios.filter(horario => {
        const horarioDateTime = new Date(`${date}T${horario.hora}:00`);
        const hoursDifference = calculateHoursDifference(horarioDateTime);
        return hoursDifference > 1;
    });

    if (horariosActualizados.length > 0) {
        await setDoc(docRef, { horarios: horariosActualizados });
        console.log(`Horarios actualizados para la fecha ${date}.`);
    } else {
        await deleteDoc(docRef);
        console.log(`El documento para la fecha ${date} ha sido eliminado porque no quedan horarios.`);
    }
}

// Escucha en tiempo real para actualizar horarios disponibles
function setupRealTimeSchedules() {
    try {
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
                alert("No hay horarios para esta fecha. Redirigiendo.");
                loader.style.display = "none";
                setTimeout(() => window.location.href = "/inicio/inicio.html", 2000);
                return;
            }

            const horariosDisponibles = horariosDelDia.filter(horario => horario.disponible);

            if (horariosDisponibles.length === 0) {
                scheduleContainer.innerHTML = "<p>Todos los horarios ya están reservados para este día.</p>";
                setTimeout(() => window.location.href = "/inicio/inicio.html", 3000);
                loader.style.display = "none";
                return;
            }

            horariosDisponibles.forEach(horario => {
                const horarioElement = document.createElement("div");
                horarioElement.classList.add("schedule-item");
                horarioElement.textContent = horario.hora;

                horarioElement.onclick = () => {
                    window.location.href = `/inicio/formulario.html?date=${selectedDate}&hora=${horario.hora}`;
                };

                scheduleContainer.appendChild(horarioElement);
            });

            loader.style.display = "none";
        }, (error) => {
            console.error("Error en onSnapshot:", error);
            alert("No se pudieron cargar los horarios. Intenta nuevamente.");
            loader.style.display = "none";
        });
    } catch (error) {
        console.error("Error al configurar horarios:", error);
        alert("Hubo un error inesperado al cargar los turnos.");
        loader.style.display = "none";
    }
}

// Bloquear día si no tiene reservas reales
async function blockDay(date) {
    if (!date) {
        alert("Por favor, selecciona una fecha.");
        return;
    }

    const docRef = doc(db, "horarios", date);

    try {
        const docSnapshot = await getDoc(docRef);

        if (docSnapshot.exists()) {
            const horarios = docSnapshot.data().horarios;
            const tieneReservas = horarios.some(horario => !horario.disponible);

            if (tieneReservas) {
                alert(`El día ${date} tiene reservas reales y no se puede eliminar.`);
            } else {
                await deleteDoc(docRef);
                alert(`El día ${date} fue bloqueado y eliminado correctamente de Firestore.`);
            }
        } else {
            alert(`No se encontró información para el día ${date}.`);
        }
    } catch (error) {
        console.error("Error al bloquear y eliminar el día:", error);
        alert("Hubo un error al intentar bloquear el día. Intenta nuevamente.");
    }
}

// Reservar horario
async function reservarHorario(date, horaSeleccionada) {
    const docRef = doc(db, "horarios", date);
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
        console.error("No se encontró información para esta fecha.");
        return;
    }

    const horariosActualizados = docSnapshot.data().horarios.map(horario => {
        if (horario.hora === horaSeleccionada) {
            return { ...horario, disponible: false };
        }
        return horario;
    });

    await setDoc(docRef, { ...docSnapshot.data(), horarios: horariosActualizados });
    console.log(`El horario ${horaSeleccionada} ha sido reservado correctamente.`);
}

// Inicializar si la fecha es válida
if (selectedDate && /^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
    handleExpiredSchedules(selectedDate);
    setupRealTimeSchedules();
}
