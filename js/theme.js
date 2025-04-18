const body = document.body;
const btn = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme');

// Aplica el tema guardado al cargar
if (savedTheme === 'dark') {
  body.classList.add('dark');
} else {
  body.classList.remove('dark');
}

// Si el botón existe (solo en inicio), actualiza su estado visual según el tema guardado
if (btn) {
  if (body.classList.contains('dark')) {
    btn.classList.add('active'); // luna -> sol
  } else {
    btn.classList.remove('active'); // sol -> luna
  }

  // Al hacer clic, cambia tema y guarda
  btn.addEventListener('click', () => {
    const isNowDark = body.classList.toggle('dark');
    btn.classList.toggle('active', isNowDark);
    localStorage.setItem('theme', isNowDark ? 'dark' : 'light');
  });
}
