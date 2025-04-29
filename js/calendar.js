import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";
import { db } from "./firebase-config.js";

// Verificación de autenticación
const auth = getAuth();
auth.onAuthStateChanged(user => {
    if (!user || user.email !== "sandredaii57@gmail.com") {  
        alert("Acceso restringido. Debes iniciar sesión.");
        window.location.href = "/inicio/login.html";
    } else {
        inicializarCalendario();
    }
});

// DOM
const calendar = document.getElementById("calendar");
const monthDisplay = document.getElementById("current-month");
const weekdaysContainer = document.querySelector(".weekdays");
const loadingSpinner = document.getElementById("calendar-loading");
const prevButton = document.getElementById("prev-month");
const nextButton = document.getElementById("next-month");

if (!calendar || !monthDisplay || !weekdaysContainer || !loadingSpinner || !prevButton || !nextButton) {
    alert("Error al cargar elementos del calendario. Recarga la página.");
    throw new Error("Faltan elementos necesarios en el DOM.");
}

// Configuración inicial
let currentDate = new Date();
const minMonths = 0;
const maxMonths = 2;
const weekdays = ["DOM.", "LUN.", "MAR.", "MIÉ.", "JUE.", "VIE.", "SÁB."];

// Inicializar semana
function initializeWeekdays() {
    weekdaysContainer.innerHTML = "";
    weekdays.forEach(day => {
        const dayElement = document.createElement("div");
        dayElement.textContent = day;
        weekdaysContainer.appendChild(dayElement);
    });
}

// Función para formatear fechas de manera precisa
function formatDate(date) {
    return new Date(date.setHours(0, 0, 0, 0)).toISOString().split("T")[0];
}

// Renderizar calendario
function renderCalendar() {
    loadingSpinner.classList.add("show");  // Mostrar el spinner
    calendar.innerHTML = "";                // Limpiar calendario

    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    monthDisplay.textContent = currentDate.toLocaleString("es-ES", { month: "long", year: "numeric" });

    updateNavigationButtons();

    let diasProcesados = 0;
    const totalDias = daysInMonth;

    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.classList.add("empty-day");
        calendar.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const today = new Date().setHours(0, 0, 0, 0);
        const dateKey = formatDate(date);
        const dayElement = document.createElement("div");

        dayElement.textContent = day;
        dayElement.classList.add("day");

        const row = Math.floor((firstDay + day - 1) / 7);
        dayElement.style.animationDelay = `${row * 100}ms`;
        dayElement.classList.add("fade-in-day");

        if (date < today) {
            dayElement.classList.add("unavailable");
            dayElement.onclick = () => alert("No puedes seleccionar un día pasado.");
            calendar.appendChild(dayElement);
            diasProcesados++;
            if (diasProcesados === totalDias) {
                loadingSpinner.classList.remove("show"); // Ocultar spinner al completar
            }
        } else {
            const horariosRef = doc(db, "horarios", dateKey);

            onSnapshot(horariosRef, snapshot => {
                dayElement.classList.remove("available", "fully-booked", "disabled", "error-day");

                if (snapshot.exists()) {
                    const horarios = snapshot.data().horarios || [];
                    const hayHorarios = horarios.length > 0;
                    const hayDisponibles = horarios.some(horario => horario.disponible);

                    if (hayDisponibles) {
                        dayElement.classList.add("available");
                        dayElement.onclick = () => {
                            window.location.href = `/inicio/calendario-admin/horarios.html?date=${dateKey}`;
                        };
                    } else if (hayHorarios) {
                        dayElement.classList.add("fully-booked");
                        dayElement.onclick = () => {
                            window.location.href = `/inicio/calendario-admin/horarios.html?date=${dateKey}`;
                        };
                    } else {
                        dayElement.classList.add("disabled");
                    }
                } else {
                    dayElement.classList.add("disabled");
                }

                calendar.appendChild(dayElement);
                diasProcesados++;
                if (diasProcesados === totalDias) {
                    loadingSpinner.style.display = "none"; // Ocultar spinner al completar
                }
            }, error => {
                console.error(`Error al obtener disponibilidad para ${dateKey}:`, error);
                dayElement.classList.add("error-day");
                dayElement.onclick = () => alert("Error al cargar los horarios. Inténtalo de nuevo.");
                calendar.appendChild(dayElement);
                diasProcesados++;
                if (diasProcesados === totalDias) {
                    loadingSpinner.style.display = "none"; // Ocultar spinner al completar
                }
            });
        }
    }
}

// Cambio de mes con restricciones
function changeMonth(step) {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + step, 1);
    const today = new Date();
    const minDate = new Date(today.getFullYear(), today.getMonth() - minMonths, 1);
    const maxDate = new Date(today.getFullYear(), today.getMonth() + maxMonths, 1);

    if (newDate >= minDate && newDate <= maxDate) {
        currentDate = newDate;
        renderCalendar(); // Llamar a renderCalendar para actualizar el calendario
    } else {
        alert("No puedes seleccionar un mes fuera del rango permitido.");
    }
}


// Actualizar estado de botones
function updateNavigationButtons() {
    const today = new Date();
    const minDate = new Date(today.getFullYear(), today.getMonth() - minMonths, 1);
    const maxDate = new Date(today.getFullYear(), today.getMonth() + maxMonths, 1);
    const currentMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    prevButton.disabled = currentMonthDate.getTime() <= minDate.getTime();
    nextButton.disabled = currentMonthDate.getTime() >= maxDate.getTime();
}
// Mostrar el spinner
loadingSpinner.classList.add("show");

// Ocultar el spinner
loadingSpinner.classList.remove("show");

// Inicializar el calendario
function inicializarCalendario() {
    initializeWeekdays();
    renderCalendar();
}

// Eventos
window.changeMonth = changeMonth;
