import { getAuth, sendPasswordResetEmail, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";
import { app } from "./firebase-config.js";

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const errorMessage = document.getElementById("error-message");
    const auth = getAuth(app);
    const loginButton = document.querySelector("button[type='submit']");
    const passwordInput = document.getElementById("password");

    let failedAttempts = 0;
    const maxAttempts = 4;
    let isLocked = false;
    const lockTime = 900000;

    alert("⚠️ ACCESO RESTRINGIDO: Solo el administrador autorizado puede ingresar.\nToda actividad será monitoreada y registrada.\nEl acceso indebido puede resultar en consecuencias.");

    // 👁️ Mostrar/Ocultar contraseña (manteniendo tu código original)
    const wrapper = document.createElement("div");
    wrapper.classList.add("password-wrapper");
    passwordInput.parentNode.insertBefore(wrapper, passwordInput);
    wrapper.appendChild(passwordInput);

    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.classList.add("toggle-password");

    toggleBtn.innerHTML = `
        <svg class="eye-icon open" xmlns="http://www.w3.org/2000/svg" height="24" width="24" fill="#00ffff">
            <path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>
        </svg>
        <svg class="eye-icon closed" xmlns="http://www.w3.org/2000/svg" height="22" width="22" fill="none" stroke="#00ffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;">
            <path d="M3 3l18 18M1 12s4-7 11-7 11 7 11 7-4 7-11 7c-2.14 0-4.1-.52-5.79-1.42M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
        </svg>
    `;
    wrapper.appendChild(toggleBtn);

    toggleBtn.addEventListener("click", () => {
        const openIcon = toggleBtn.querySelector(".open");
        const closedIcon = toggleBtn.querySelector(".closed");

        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            openIcon.style.display = "none";
            closedIcon.style.display = "inline";
        } else {
            passwordInput.type = "password";
            openIcon.style.display = "inline";
            closedIcon.style.display = "none";
        }
    });

    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();

        if (isLocked) {
            alert("🚨 Acceso bloqueado temporalmente.");
            return;
        }

        const email = document.getElementById("email").value.trim();
        const password = passwordInput.value.trim();

        // ✅ Verificación de campos antes de cambiar el botón
        if (!email || !password) {
            alert("⚠️ Completa todos los campos.");
            return;
        }

        // 🏆 Aplicar efecto de hundimiento y cambio de texto
        loginButton.innerText = "Verificando...";
        loginButton.classList.add("pressed");
        loginButton.disabled = true;

        setTimeout(() => {
            loginButton.classList.add("released");
            setTimeout(() => {
                loginButton.classList.remove("pressed", "released");
            }, 100);
        }, 100);

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;

                if (user.email === "sandredaii57@gmail.com") {
                    console.log("✅ Bienvenido, administrador.");
                    failedAttempts = 0;
                    window.location.href = "/inicio/admin.html";
                } else {
                    errorMessage.style.display = "block";
                    console.error("❌ Acceso denegado.");
                    resetButton();
                }
            })
            .catch((error) => {
                failedAttempts++;

                if (failedAttempts < maxAttempts) {
                    alert(`⚠️ Contraseña incorrecta. Intentos restantes: ${maxAttempts - failedAttempts}`);
                } else {
                    isLocked = true;
                    alert("🚨 Acceso bloqueado temporalmente. Intenta más tarde.");

                    if (email.includes("@")) {
                        sendPasswordResetEmail(auth, email)
                            .then(() => console.log("📧 Correo de recuperación enviado."))
                            .catch(error => console.error("❌ Error al enviar correo:", error.message));
                    }

                    setTimeout(() => {
                        isLocked = false;
                        failedAttempts = 0;
                        console.log("🔓 Bloqueo levantado.");
                    }, lockTime);
                }

                errorMessage.style.display = "block";
                console.error(`❌ Intento fallido (${failedAttempts}/${maxAttempts}):`, error.message);
                resetButton();
            });
    });

    function resetButton() {
        loginButton.innerText = "Iniciar Sesión";
        loginButton.classList.remove("pressed", "released");
        loginButton.disabled = false;
    }
});