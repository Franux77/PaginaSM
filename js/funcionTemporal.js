// import { collection, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
// import { db } from "./firebase-config.js";

// export async function eliminarDocumentosPasados() {
//     try {
//         const horariosCollection = collection(db, "horarios");
//         const snapshot = await getDocs(horariosCollection);
//         const hoy = new Date();

//         snapshot.forEach(async (docSnap) => {
//             const fecha = docSnap.id;
//             const partesFecha = fecha.split("-");
//             if (partesFecha.length === 3) {
//                 const año = parseInt(partesFecha[0], 10);
//                 const mes = parseInt(partesFecha[1], 10) - 1;
//                 const dia = parseInt(partesFecha[2], 10);
//                 const fechaDocumento = new Date(año, mes, dia);

//                 if (fechaDocumento < hoy) {
//                     const docRef = doc(db, "horarios", fecha);
//                     await deleteDoc(docRef);
//                     console.log(`Documento con fecha ${fecha} eliminado exitosamente.`);
//                 }
//             }
//         });

//         console.log("Procesamiento de eliminación completado.");
//     } catch (error) {
//         console.error("❌ Error al eliminar documentos pasados:", error);
//     }
// }