function updateClock() {
    const hourElement = document.getElementById('hour');
    const minuteElement = document.getElementById('minute');
    const secondElement = document.getElementById('second');

    const now = new Date();

    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    // Añadir un 0 delante si el número es menor a 10
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    // Actualizar los elementos con el tiempo
    hourElement.textContent = hours;
    minuteElement.textContent = minutes;
    secondElement.textContent = seconds;
}

// Actualizar el reloj cada segundo
setInterval(updateClock, 1000);

// Llamar a la función una vez para mostrar el reloj al cargar la página
updateClock();
