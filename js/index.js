import { collection, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import { db } from "./firebase-config.js";

// DOM
const calendar = document.getElementById("calendar");
const monthDisplay = document.getElementById("current-month");
const weekdaysContainer = document.querySelector(".weekdays");
const loadingSpinner = document.getElementById("calendar-loading");

if (!calendar || !monthDisplay || !weekdaysContainer || !loadingSpinner) {
  alert("Error al cargar elementos del calendario. Por favor recarga la página.");
  throw new Error("Faltan elementos del DOM necesarios para el calendario.");
}

// Config
let currentDate = new Date();
const minMonths = 0;
const maxMonths = 2;
const weekdays = ["DOM.", "LUN.", "MAR.", "MIÉ.", "JUE.", "VIE.", "SÁB."]; // Domingo primero

// Inicializar semana
function initializeWeekdays() {
  weekdaysContainer.innerHTML = "";
  weekdays.forEach(day => {
    const dayElement = document.createElement("div");
    dayElement.textContent = day;
    weekdaysContainer.appendChild(dayElement);
  });
}

// Render del calendario con spinner
function renderCalendar() {
  calendar.innerHTML = "";
  loadingSpinner.style.display = "flex";

  let firstDay, daysInMonth;
  try {
    firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Domingo
    daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    monthDisplay.textContent = currentDate.toLocaleString("es-ES", { month: "long", year: "numeric" });
  } catch (error) {
    console.error("Error procesando la fecha actual:", error);
    alert("No se pudo procesar el mes actual.");
    loadingSpinner.style.display = "none";
    return;
  }

  // Actualizar botones de navegación
  updateNavigationButtons();

  // Espacios vacíos antes del primer día
  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.classList.add("empty-day");
    calendar.appendChild(emptyCell);
  }

  const promises = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const today = new Date().setHours(0, 0, 0, 0);
    const dateKey = date.toISOString().split("T")[0];
    const dayElement = document.createElement("div");

    dayElement.textContent = day;
    dayElement.classList.add("day");

    if (date < today) {
      dayElement.classList.add("unavailable");
    }

    calendar.appendChild(dayElement);

    const p = new Promise(resolve => {
      try {
        const horariosRef = doc(db, "horarios", dateKey);
        const unsubscribe = onSnapshot(horariosRef, (snapshot) => {
          if (snapshot.exists()) {
            const horarios = snapshot.data().horarios || [];
            const isAvailable = horarios.some(horario => horario.disponible);

            if (isAvailable) {
              dayElement.classList.add("available");
              dayElement.classList.remove("disabled");
              dayElement.onclick = () => {
                window.location.href = `/inicio/horarios.html?date=${dateKey}`;
              };
            } else {
              dayElement.classList.add("disabled");
            }
          } else {
            dayElement.classList.add("disabled");
          }

          unsubscribe();
          resolve();
        }, (error) => {
          console.error(`Error al obtener disponibilidad para ${dateKey}:`, error);
          dayElement.classList.add("error-day");
          resolve();
        });
      } catch (e) {
        console.error("Error inesperado:", e);
        resolve();
      }
    });

    promises.push(p);
  }

  Promise.all(promises).then(() => {
    loadingSpinner.style.display = "none";
    if (!calendar.querySelector(".available")) {
      calendar.insertAdjacentHTML("beforeend", `<p class="no-data-msg">No hay turnos disponibles este mes.</p>`);
    }
  });
}

// Cambio de mes
function changeMonth(step) {
  const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + step, 1);
  const today = new Date();
  const minDate = new Date(today.getFullYear(), today.getMonth() - minMonths, 1);
  const maxDate = new Date(today.getFullYear(), today.getMonth() + maxMonths, 1);

  if (newDate >= minDate && newDate <= maxDate) {
    currentDate = newDate;
    renderCalendar();
  }
}

// Botones activación + estilo cuando están en los extremos
function updateNavigationButtons() {
  const prevButton = document.getElementById("prev-month");
  const nextButton = document.getElementById("next-month");

  const today = new Date();
  const minDate = new Date(today.getFullYear(), today.getMonth() - minMonths, 1);
  const maxDate = new Date(today.getFullYear(), today.getMonth() + maxMonths, 1);
  const currentMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

  if (prevButton && nextButton) {
    const isMin = currentMonthDate.getTime() <= minDate.getTime();
    const isMax = currentMonthDate.getTime() >= maxDate.getTime();

    prevButton.disabled = isMin;
    nextButton.disabled = isMax;
  }
}

// Inicializar
window.changeMonth = changeMonth;
initializeWeekdays();
renderCalendar();
