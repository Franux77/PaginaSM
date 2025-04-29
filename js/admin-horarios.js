import { db } from "./firebase-config.js";
import { doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";

// --- Variables principales ---
const auth = getAuth();
const params = new URLSearchParams(window.location.search);
const selectedDate = params.get("date");
const fechaTitulo = document.getElementById("fecha-titulo");
const horariosContainer = document.getElementById("horarios-container");
const agregarHorarioBtn = document.getElementById("agregar-horario");
const agregarEstandarBtn = document.getElementById("agregar-estandar");
const guardarCambiosBtn = document.getElementById("guardar-cambios");

let horarios = [];
let cambiosPendientes = false;
let filtroActual = "todos"; // puede ser 'todos', 'disponibles', 'reservados'

const contadorTodos = document.getElementById("contador-todos");
const contadorDisponibles = document.getElementById("contador-disponibles");
const contadorReservados = document.getElementById("contador-reservados");

// --- Funciones de Validación ---
function validarFecha(fechaString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(fechaString)) return false;

    const fecha = new Date(`${fechaString}T00:00:00`);
    if (isNaN(fecha.getTime())) return false;

    const [año, mes, dia] = fechaString.split("-").map(Number);
    return (
        fecha.getFullYear() === año &&
        fecha.getMonth() === mes - 1 &&
        fecha.getDate() === dia
    );
}

function esFechaPasada(fechaString) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fecha = new Date(`${fechaString}T00:00:00`);
    return fecha < hoy;
}

function formatearFecha(fecha) {
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-ES", opciones);
}

function redirigirCalendario(mensaje) {
    alert(mensaje);
    window.location.href = "/inicio/calendario-admin/calendario.html";
}

// --- Spinner ---
function mostrarSpinner() {
    horariosContainer.innerHTML = `
        <div class="spinner-container">
            <div class="spinner"></div>
        </div>
    `;
}

function ocultarSpinner() {
    horariosContainer.innerHTML = "";
}

// --- Autenticación ---
auth.onAuthStateChanged(user => {
    if (!user || user.email !== "sandredaii57@gmail.com") {
        alert("Acceso restringido. Redirigiendo...");
        window.location.href = "/inicio/login.html";
    } else {
        validarYInicializar();
    }
});

// --- Validar y Inicializar ---
function validarYInicializar() {
    if (!selectedDate || !validarFecha(selectedDate)) {
        redirigirCalendario("Fecha inválida. Serás redirigido al calendario.");
        throw new Error("Fecha inválida en la URL.");
    }

    if (esFechaPasada(selectedDate)) {
        redirigirCalendario("No puedes gestionar horarios de días pasados. Redirigiendo...");
        throw new Error("Fecha pasada detectada.");
    }

    fechaTitulo.textContent = formatearFecha(selectedDate);
    cargarHorarios();
}

// --- Cargar horarios de Firestore ---
function cargarHorarios() {
    try {
        const horariosRef = doc(db, "horarios", selectedDate);

        mostrarSpinner(); // <-- Mostrar spinner antes de cargar

        onSnapshot(horariosRef, (snapshot) => {
            if (snapshot.exists()) {
                const dataFirestore = snapshot.data().horarios || [];
                horarios = dataFirestore.map(item => ({
                    hora: item.hora || "",
                    disponible: item.disponible !== undefined ? item.disponible : true
                }));

                horarios.sort((a, b) => a.hora.localeCompare(b.hora));
                renderizarHorarios();
            } else {
                redirigirCalendario("No existen horarios para esta fecha. Serás redirigido al calendario.");
                throw new Error("No existen horarios para la fecha seleccionada.");
            }
        });

    } catch (error) {
        console.error("Error cargando horarios:", error);
        alert("Ocurrió un error al cargar los horarios.");
    }
}

// --- Renderizar horarios ---
function renderizarHorarios() {
    ocultarSpinner(); // <-- Ocultar spinner cuando se va a renderizar

    let horariosFiltrados = horarios;
    if (filtroActual === "disponibles") {
        horariosFiltrados = horarios.filter(h => h.disponible);
    } else if (filtroActual === "reservados") {
        horariosFiltrados = horarios.filter(h => !h.disponible);
    }

    // Actualizar contadores
    contadorTodos.textContent = horarios.length;
    contadorDisponibles.textContent = horarios.filter(h => h.disponible).length;
    contadorReservados.textContent = horarios.filter(h => !h.disponible).length;

    if (horariosFiltrados.length === 0) {
        horariosContainer.innerHTML = `<p class="sin-horarios">No hay horarios para esta vista.</p>`;
        return;
    }

    horariosFiltrados.forEach((horario, index) => {
        const horarioElement = document.createElement("div");
        horarioElement.classList.add("horario-item");

        if (!horario.disponible) {
            horarioElement.classList.add("horario-bloqueado");
        }

        horarioElement.innerHTML = `
            <input type="time" value="${formatearHora(horario.hora)}" data-index="${index}" ${horario.disponible ? "" : "disabled"}/>
            ${horario.disponible ? `<button class="eliminar-horario" data-index="${index}">Eliminar</button>` : `<span class="icono-bloqueado">Reservado</span>`}
        `;

        horariosContainer.appendChild(horarioElement);
    });

    document.querySelectorAll(".eliminar-horario").forEach(btn => {
        btn.addEventListener("click", eliminarHorario);
    });

    document.querySelectorAll("input[type='time']").forEach(input => {
        input.addEventListener("change", actualizarHora);
    });
}

// --- Formatear Hora ---
function formatearHora(hora) {
    if (!hora) return "";
    const [h, m] = hora.split(":");
    return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
}

// --- Eliminar Horario ---
function eliminarHorario(e) {
    const index = e.target.dataset.index;

    if (!horarios[index].disponible) {
        alert("Este horario no se puede eliminar porque está reservado o bloqueado.");
        return;
    }

    const confirmar = confirm("¿Estás seguro de que deseas eliminar este horario?");
    if (!confirmar) return;

    horarios.splice(index, 1);
    cambiosPendientes = true;
    renderizarHorarios();
}

// --- Actualizar Hora ---
function actualizarHora(e) {
    const index = e.target.dataset.index;
    const nuevaHora = e.target.value;

    if (horarios.some((h, i) => h.hora === nuevaHora && i !== parseInt(index))) {
        alert("Ya existe un horario con esa hora.");
        e.target.value = horarios[index].hora;
        return;
    }

    horarios[index].hora = nuevaHora;
    horarios.sort((a, b) => a.hora.localeCompare(b.hora));
    cambiosPendientes = true;
    renderizarHorarios();
}

// --- Agregar Horario Manual ---
function agregarHorario() {
    horarios.unshift({ hora: "", disponible: true });
    cambiosPendientes = true;
    renderizarHorarios();
}

// --- Agregar Horarios Estándar ---
function agregarHorariosEstandar() {
    const estandares = [
        { hora: "08:00", disponible: true },
        { hora: "10:00", disponible: true },
        { hora: "14:00", disponible: true },
        { hora: "16:00", disponible: true },
        { hora: "18:00", disponible: true },
        { hora: "20:00", disponible: true },
    ];

    estandares.forEach(horario => {
        if (!horarios.some(h => h.hora === horario.hora)) {
            horarios.push(horario);
        }
    });

    horarios.sort((a, b) => a.hora.localeCompare(b.hora));
    cambiosPendientes = true;
    renderizarHorarios();
}

// --- Guardar Cambios ---
async function guardarCambios() {
    if (!cambiosPendientes) {
        alert("No hay cambios pendientes.");
        return;
    }

    const confirmar = confirm("¿Quieres guardar los cambios?");
    if (!confirmar) return;

    try {
        const horariosRef = doc(db, "horarios", selectedDate);
        await setDoc(horariosRef, { horarios });
        alert("Cambios guardados correctamente.");
        cambiosPendientes = false;
    } catch (error) {
        console.error("Error guardando cambios:", error);
        alert("Error guardando cambios en Firestore.");
    }
}

// --- Eventos de botones ---
agregarHorarioBtn.addEventListener("click", agregarHorario);
agregarEstandarBtn.addEventListener("click", agregarHorariosEstandar);
guardarCambiosBtn.addEventListener("click", guardarCambios);

// --- Inicializar ---
function inicializarPagina() {
    cargarHorarios();
}
