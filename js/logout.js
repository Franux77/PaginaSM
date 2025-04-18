import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";  

export function setupLogout() {
    const logoutButton = document.getElementById("logout-btn");

    if (!logoutButton) {
        console.error("⚠️ Botón de cierre de sesión no encontrado.");
        return;
    }

    logoutButton.addEventListener("click", function (event) {
        event.preventDefault();

        console.log("🔹 Botón de logout presionado."); 

        this.classList.add("pressed");

        setTimeout(() => {
            this.classList.remove("pressed");

            setTimeout(() => {
                const confirmLogout = confirm("¿Seguro que quieres cerrar sesión?");
                if (confirmLogout) {
                    console.log("✅ Usuario confirmó cerrar sesión.");

                    try {
                        const auth = getAuth(); // ✅ Ahora `getAuth()` está correctamente importado
                        signOut(auth)
                            .then(() => {
                                console.log("🚀 Sesión cerrada correctamente.");
                                localStorage.removeItem("isAuthenticated");
                                window.location.href = "/inicio/login.html";
                            })
                            .catch(error => {
                                console.error("❌ Error al cerrar sesión:", error);
                                alert(`Hubo un problema al cerrar sesión: ${error.code}. Intenta nuevamente.`);
                            });
                    } catch (error) {
                        console.error("❌ Error inesperado:", error);
                        alert(`Hubo un problema inesperado: ${error.message}`);
                    }
                } else {
                    console.log("❌ Usuario canceló el cierre de sesión.");
                }
            }, 50); 
        }, 150); 
    });
}