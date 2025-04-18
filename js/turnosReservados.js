import { collection, onSnapshot, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";
import { db } from "./firebase-config.js";

const reservedTurnosContainer = document.getElementById("reserved-turnos-list");

// 🔥 Función para obtener la fecha actual en formato `YYYY-MM-DD`
function getTodayStr() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split('T')[0];
}

// 🔥 Función para formatear la fecha correctamente
function formatFecha(fechaStr) {
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const partes = fechaStr.split("-");
    if (partes.length === 3) {
        return `${partes[2]} de ${meses[parseInt(partes[1], 10) - 1]} de ${partes[0]}`;
    }
    return fechaStr;
}

let currentTodayStr = getTodayStr();

export function loadReservedTurnos() {
    const auth = getAuth();
    
    auth.onAuthStateChanged(user => {
        if (!user || user.email !== "sandredaii57@gmail.com") {  
            reservedTurnosContainer.innerHTML = "<p class='aviso'>Acceso restringido.</p>";
            return;
        }

        try {
            const horariosCollection = collection(db, "horarios");

            onSnapshot(horariosCollection, (snapshot) => {
                reservedTurnosContainer.innerHTML = "";
                const todayStr = getTodayStr();

                if (snapshot.empty) {
                    reservedTurnosContainer.innerHTML = "<p>No hay turnos registrados en Firestore.</p>";
                    return;
                }

                const turnosPorFecha = new Map();

                snapshot.forEach(docSnapshot => {
                    const fecha = docSnapshot.id;

                    if (fecha >= todayStr) {
                        const data = docSnapshot.data();
                        const horarios = Array.isArray(data.horarios) ? data.horarios : [];

                        const turnosReservados = horarios.filter(horario => horario && horario.disponible === false);

                        if (turnosReservados.length > 0) {
                            turnosPorFecha.set(fecha, turnosReservados);
                        }
                    }
                });

                if (turnosPorFecha.size === 0) {
                    reservedTurnosContainer.innerHTML = "<p class='aviso'>No hay turnos reservados.</p>";
                    return;
                }

                turnosPorFecha.forEach((turnos, fecha) => {
                    const fechaElement = document.createElement("div");
                    fechaElement.className = "fecha-container";
                    fechaElement.textContent = `📅 ${formatFecha(fecha)}`;
                    
                    const turnosList = document.createElement("div");
                    turnosList.className = "turnos-list";
                    turnosList.style.display = "none";
                    
                    fechaElement.addEventListener("click", () => {
                        turnosList.style.display = turnosList.style.display === "none" ? "block" : "none";
                    });

                    turnos.forEach(turno => {
                        const turnoElement = document.createElement("div");
                        turnoElement.className = "turno-card";

                        turnoElement.innerHTML = `
                            <p><strong>⏰ Hora:</strong> ${turno.hora || "<span style='color: red;'>No especificado</span>"}</p>
                            <p><strong>👤 Nombre:</strong> ${turno.nombre || "<span style='color: red;'>No especificado</span>"}</p>
                            <p><strong>📞 Teléfono:</strong> ${turno.telefono || "<span style='color: red;'>No especificado</span>"}</p>
                            <p><strong>📧 Correo:</strong> ${turno.correo || "<span style='color: red;'>No especificado</span>"}</p>
                            <button class="cancel-btn">Cancelar turno</button>
                        `;

                        // ✨ Modificación: Efecto de hundimiento antes de la confirmación
                        turnoElement.querySelector(".cancel-btn").addEventListener("click", function () {
                            this.classList.add("pressed");
                        
                            // 🔄 Recuperar tamaño antes de mostrar el confirm
                            setTimeout(() => {
                                this.classList.remove("pressed");
                        
                                setTimeout(() => {
                                    const confirmacion = confirm(`¿Estás seguro de que quieres cancelar el turno de la hora ${turno.hora}? El horario volverá a estar disponible en la página.`);
                                    if (confirmacion) {
                                        cancelTurno(fecha, turno.hora);
                                    }
                                }, 50); // Pequeña espera antes del confirm para que el botón vuelva a su tamaño
                            }, 150); // El botón se hunde y vuelve antes de confirmar
                        });

                        turnosList.appendChild(turnoElement);
                    });

                    reservedTurnosContainer.appendChild(fechaElement);
                    reservedTurnosContainer.appendChild(turnosList);
                });
            });

        } catch (error) {
            reservedTurnosContainer.innerHTML = "<p>Hubo un error al cargar los turnos. Intenta nuevamente.</p>";
        }
    });

    setInterval(() => {
        const newTodayStr = getTodayStr();
        if (newTodayStr !== currentTodayStr) {
            currentTodayStr = newTodayStr;
            loadReservedTurnos(); 
        }
    }, 60000); 
}

async function cancelTurno(fecha, hora) {
    try {
        const docRef = doc(db, "horarios", fecha);
        const docSnapshot = await getDoc(docRef);

        if (docSnapshot.exists()) {
            const horarios = docSnapshot.data().horarios || [];
            const horariosActualizados = horarios.map(horario => {
                if (horario.hora === hora) {
                    return { ...horario, disponible: true, nombre: null, telefono: null, correo: null };
                }
                return horario;
            });

            await updateDoc(docRef, { horarios: horariosActualizados });
            alert(`El turno de la hora ${hora} ha sido cancelado.`);
        }
    } catch (error) {
        console.error("❌ Error al cancelar el turno:", error);
    }
}

loadReservedTurnos();