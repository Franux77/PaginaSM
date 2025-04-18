export function setupSearch() {
    const searchBar = document.getElementById("search-bar");
    const searchBtn = document.getElementById("search-btn");
    const clearSearchBtn = document.getElementById("clear-search-btn"); // Botón para limpiar búsqueda

    // ** Función de búsqueda dinámica en tiempo real **
    function performSearch(query) {
        const turnosElements = document.querySelectorAll(".turno-card"); // Elementos de turnos
        let resultsFound = false; // Bandera para saber si hay resultados
        let firstMatch = null; // Para hacer scroll a la primera coincidencia

        turnosElements.forEach(turno => {
            const textContent = turno.textContent.toLowerCase();
            if (textContent.includes(query)) {
                turno.style.display = "block"; // Mostrar coincidencia
                if (!firstMatch) {
                    firstMatch = turno; // Guardar la primera coincidencia
                }
                resultsFound = true;
            } else {
                turno.style.display = "none"; // Ocultar los que no coinciden
            }
        });

        if (resultsFound && firstMatch) {
            // Mostrar el contenedor si está colapsado
            const parentContainer = firstMatch.closest(".turnos-list");
            if (parentContainer && parentContainer.style.display === "none") {
                parentContainer.style.display = "block";
            }

            // Hacer scroll a la primera coincidencia
            firstMatch.scrollIntoView({ behavior: "smooth", block: "start" });
            firstMatch.classList.add("highlight");
            setTimeout(() => firstMatch.classList.remove("highlight"), 2000);
        } else if (!query) {
            // Restaurar todos los elementos si no hay búsqueda
            turnosElements.forEach(turno => (turno.style.display = "block"));
        } else {
            alert("No se encontraron resultados para la búsqueda.");
        }
    }

    // ** Escuchar en tiempo real mientras se escribe **
    searchBar.addEventListener("input", () => {
        const query = searchBar.value.toLowerCase().trim();
        performSearch(query);
    });

    // ** Realizar búsqueda al hacer clic en el botón de búsqueda **
    searchBtn.addEventListener("click", () => {
        const query = searchBar.value.toLowerCase().trim();
        if (!query) {
            alert("Por favor, ingresa un término de búsqueda.");
            return;
        }
        performSearch(query);
    });

    // ** Limpiar la búsqueda y restablecer el estado inicial **
    clearSearchBtn.addEventListener("click", () => {
        searchBar.value = ""; // Vaciar barra de búsqueda
        const turnosElements = document.querySelectorAll(".turno-card");
        turnosElements.forEach(turno => (turno.style.display = "block")); // Mostrar todos los turnos
    });
}