document.addEventListener("DOMContentLoaded", () => {
  const rutasLimpias = {
      "/inicio/inicio.html": "/inicio",
      "/inicio/login.html": "/login",
      "/inicio/admin.html": "/admin",
      "/inicio/formulario.html": "/formulario",
      "/inicio/gracias.html": "/gracias",
      "/inicio/horarios.html": "/horarios",
      "/index.html": "/"
  };

  const limpiarURL = () => {
      const rutaActual = window.location.pathname;
      const queryParams = window.location.search;
      const nuevaURL = rutasLimpias[rutaActual] || rutaActual.replace(".html", "");

      if (rutaActual !== nuevaURL) {
          window.history.replaceState(null, "", nuevaURL + queryParams);
      }
  };

  limpiarURL();

  // 🔥 Solución para corregir "/inicio/inicio" y dejarlo solo como "/inicio"
  if (window.location.pathname === "/inicio/inicio") {
      window.history.replaceState(null, "", "/inicio" + window.location.search);
  }

  // 🔥 Solución para corregir "/inicio/login" y dejarlo solo como "/login"
  if (window.location.pathname === "/inicio/login") {
      window.history.replaceState(null, "", "/login" + window.location.search);
  }

  // Mantener la URL limpia cuando el usuario usa el botón "Atrás" del navegador
  window.addEventListener("popstate", limpiarURL);
});