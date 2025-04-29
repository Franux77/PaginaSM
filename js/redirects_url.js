// document.addEventListener("DOMContentLoaded", () => {
//     const rutasLimpias = {
//       "/inicio/inicio.html": "/inicio",
//       "/inicio/login.html": "/login",
//       "/inicio/admin.html": "/admin",
//       "/inicio/formulario.html": "/formulario",
//       "/inicio/gracias.html": "/gracias",
//       "/inicio/horarios.html": "/horarios",
//       "/inicio/calendario-admin/calendario.html": "/calendario-admin",
//       "/inicio/calendario-admin/horarios.html": "/horarios-admin",
//       "/index.html": "/"
//     };
  
//     const limpiarURL = () => {
//       const rutaActual = window.location.pathname; // solo la ruta sin query
//       const queryParams = window.location.search; // lo que esté después del ?
//       let nuevaURL = rutasLimpias[rutaActual];
  
//       if (!nuevaURL) {
//         // si no existe exacta, probamos quitando ".html" si lo tuviera
//         if (rutaActual.endsWith(".html")) {
//           const rutaSinHtml = rutaActual.replace(".html", "");
//           nuevaURL = rutasLimpias[rutaSinHtml + ".html"] || rutaSinHtml;
//         } else {
//           nuevaURL = rutaActual; // mantener como está
//         }
//       }
  
//       if (rutaActual !== nuevaURL) {
//         window.history.replaceState(null, "", nuevaURL + queryParams);
//       }
//     };
  
//     limpiarURL();
  
//     window.addEventListener("popstate", limpiarURL);
  
//     // también limpiar al hacer click en enlaces internos
//     document.body.addEventListener("click", (e) => {
//       const link = e.target.closest("a");
//       if (link && link.href.startsWith(window.location.origin)) {
//         setTimeout(limpiarURL, 50);
//       }
//     });
//   });
  