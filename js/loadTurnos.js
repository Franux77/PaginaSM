import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";
import { db } from "./firebase-config.js";

export function loadTurnos() {
    const auth = getAuth();

    onAuthStateChanged(auth, async (user) => {
        if (!user || user.email !== "sandredaii57@gmail.com") {
            return;
        }

        try {
            const horariosCollection = collection(db, "horarios");
            const horariosSnapshot = await getDocs(horariosCollection);

            const adminContainer = document.getElementById("reserved-turnos-list");
            adminContainer.innerHTML = "";

            if (horariosSnapshot.empty) {
                adminContainer.innerHTML = "<p>No hay turnos registrados.</p>";
                return;
            }

            horariosSnapshot.docs.forEach(doc => {
                const horarioData = doc.data();
                const fecha = doc.id;

                if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
                    return; // Filtramos documentos sin formato de fecha válido
                }

                const fechaAjustada = new Date(fecha);
                fechaAjustada.setHours(0, 0, 0, 0);

                const dayName = fechaAjustada.toLocaleDateString("es", { weekday: "long" });
                const formattedDate = fechaAjustada.toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" });

                // 🔥 Extraer correctamente los turnos reservados
                const horariosReservados = horarioData.horarios.filter(horario => horario.disponible === false);

                if (horariosReservados.length === 0) return;

                const collapsible = document.createElement("button");
                collapsible.className = "collapsible";
                collapsible.textContent = `${dayName}, ${formattedDate}`;

                const content = document.createElement("div");
                content.className = "content";

                horariosReservados.forEach(horario => {
                    const turnoItem = document.createElement("div");
                    turnoItem.className = "turno";

                    turnoItem.innerHTML = `
                        <span><strong>Nombre:</strong> ${horario.nombre || "---"}</span>
                        <span><strong>Hora:</strong> ${horario.hora}</span>
                        <button class="delete-btn" data-date="${fecha}" data-hora="${horario.hora}">Cancelar</button>
                    `;
                    content.appendChild(turnoItem);
                });

                adminContainer.appendChild(collapsible);
                adminContainer.appendChild(content);

                collapsible.addEventListener("click", () => {
                    content.style.display = content.style.display === "block" ? "none" : "block";
                });
            });

        } catch (error) {
            console.error("❌ Error al cargar turnos desde Firestore:", error);
            document.getElementById("reserved-turnos-list").innerHTML = "<p>Error al cargar turnos. Intenta nuevamente.</p>";
        }
    });
}