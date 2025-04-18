// Función para alternar la visibilidad de las secciones
document.querySelectorAll('.toggle-header').forEach(header => {
    header.addEventListener('click', () => {
        const section = header.parentElement; // Obtiene la sección principal
        section.classList.toggle('active'); // Agrega o elimina la clase 'active'
    });
});
