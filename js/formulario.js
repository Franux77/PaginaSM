import { doc, runTransaction } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import { db } from "./firebase-config.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("appointment-form");
    const backButton = document.getElementById("back-button");

    // ✅ Botón para volver al inicio
    backButton.addEventListener("click", () => {
        window.location.href = "/inicio/inicio.html";
    });

    // ✅ Leer parámetros de la URL con validación
    const params = new URLSearchParams(window.location.search);
    const selectedDate = params.get("date");
    const selectedHour = params.get("hora");

    if (!selectedDate || !selectedHour || !/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
        console.error("⚠ Fecha u hora inválida:", selectedDate, selectedHour);
        document.getElementById("appointment-info").textContent = "Fecha u hora no válida.";
        return;
    }

    // ✅ Mostrar la fecha y hora seleccionadas
    const appointmentInfo = document.getElementById("appointment-info");
    appointmentInfo.textContent = ` ${selectedDate} a las ${selectedHour}.`;

    // ✅ Función con transacción para reservar el turno de forma segura
    async function reservarHorario(date, horaSeleccionada, nombre, correo, telefono) {
        const docRef = doc(db, "horarios", date);

        await runTransaction(db, async (transaction) => {
            const docSnapshot = await transaction.get(docRef);

            if (!docSnapshot.exists()) {
                throw new Error("No existe documento para esa fecha en horarios.");
            }

            const data = docSnapshot.data();
            if (!data.horarios || !Array.isArray(data.horarios)) {
                throw new Error("El documento no contiene un array de horarios válido.");
            }

            const horarioIndex = data.horarios.findIndex(h => h.hora === horaSeleccionada);
            if (horarioIndex === -1) {
                throw new Error("Horario no encontrado en ese día.");
            }

            const horario = data.horarios[horarioIndex];

            if (!horario.disponible) {
                throw new Error("Este horario ya fue reservado por otra persona.");
            }

            const horariosActualizados = [...data.horarios];
            horariosActualizados[horarioIndex] = {
                ...horario,
                disponible: false,
                nombre,
                correo,
                telefono
            };

            transaction.set(docRef, { horarios: horariosActualizados });
        });

        console.log(`✅ Horario ${horaSeleccionada} reservado con éxito.`);
    }

    // ✅ Manejo del envío del formulario
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const submitButton = form.querySelector("button.topp");
        submitButton.disabled = true;
        submitButton.classList.add("processing");
        submitButton.innerHTML = '<span>Estamos procesando tu reserva</span>';

        const progressBar = document.createElement("div");
        progressBar.style.position = "absolute";
        progressBar.style.top = "0";
        progressBar.style.left = "0";
        progressBar.style.height = "100%";
        progressBar.style.background = "#ffffff84";
        progressBar.style.zIndex = "0";
        progressBar.style.width = "0%";
        progressBar.style.borderRadius = "inherit";
        progressBar.style.transition = "width 0.3s ease";
        submitButton.appendChild(progressBar);

        const updateProgress = (value) => {
            progressBar.style.width = `${value}%`;
        };

        // ✅ Recolectar datos del formulario
        const nombre = document.getElementById("nombre").value.trim();
        const correo = document.getElementById("correo").value.trim();
        const telefono = document.getElementById("telefono").value.trim();
        const serviciosSeleccionados = Array.from(document.querySelectorAll('input[name="servicios"]:checked'))
            .map(checkbox => checkbox.value).join(", ");
        const metodosSeleccionados = Array.from(document.querySelectorAll('input[name="metodos"]:checked'))
            .map(checkbox => checkbox.value).join(", ");

        // ✅ Validaciones
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!nombre || !telefono) {
            alert("⚠ Por favor completa todos los campos requeridos.");
            submitButton.disabled = false;
            return;
        }

        if (correo && !emailRegex.test(correo)) {
            alert("⚠ El correo ingresado no tiene un formato válido.");
            submitButton.disabled = false;
            return;
        }

        if (!serviciosSeleccionados) {
            alert("⚠ Por favor, selecciona al menos un servicio.");
            submitButton.disabled = false;
            return;
        }

        if (!metodosSeleccionados) {
            alert("⚠ Por favor, selecciona al menos un método de pago.");
            submitButton.disabled = false;
            return;
        }

        try {
            updateProgress(20);

            await reservarHorario(selectedDate, selectedHour, nombre, correo, telefono);
            updateProgress(50);

            const templateParamsCliente = {
                to_email: correo,
                nombre,
                telefono,
                servicios: serviciosSeleccionados,
                metodosPago: metodosSeleccionados,
                fecha: selectedDate,
                hora: selectedHour
            };

            const templateParamsAdmin = {
                to_email: "sandredaii57@gmail.com",
                nombre,
                correo,
                telefono,
                servicios: serviciosSeleccionados,
                metodosPago: metodosSeleccionados,
                fecha: selectedDate,
                hora: selectedHour
            };

            console.log("✅ Datos enviados a EmailJS - Cliente:", templateParamsCliente);
            console.log("✅ Datos enviados a EmailJS - Administrador:", templateParamsAdmin);
            updateProgress(80);

            // **Correo al cliente**
            // ✅ Solo enviar al cliente si hay correo ingresado
            if (correo) {
                await emailjs.send("service_vbbkerg", "template_9j35rxk", templateParamsCliente);
                console.log("📧 Correo al cliente enviado con éxito.");
            } else {
                console.log("⚠ No se ingresó correo del cliente, se omite el envío.");
            }

            // // **Correo al administrador**
            await emailjs.send("service_vbbkerg", "template_27y74zo", templateParamsAdmin);
            console.log("📧 Correo al administrador enviado con éxito.");

            updateProgress(100);

            setTimeout(() => {
                window.location.replace("/inicio/gracias.html");
            }, 300);
        } catch (error) {
            console.error("⚠ Error al procesar la reserva:", error);
            alert(error.message || "❌ Hubo un problema al programar la cita. Por favor, intenta nuevamente.");

            submitButton.disabled = false;
            submitButton.classList.remove("processing");
            submitButton.innerHTML = '<span>Reservar turno</span>';
        }
    });
});
