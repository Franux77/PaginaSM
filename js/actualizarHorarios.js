// import { doc, getDoc, setDoc, writeBatch } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
// import { db } from "./firebase-config.js";

// export async function generateSchedulesUntilMonth(horariosPorDia, endMonth) {
//     if (!horariosPorDia || Object.keys(horariosPorDia).length === 0) {
//         console.log("Ejecutando generateSchedulesUntilMonth...");
//         console.error("Se requieren horarios personalizados por día.");
//         alert("Por favor, proporciona horarios válidos para cada día.");
//         return;
//     }

//     const today = new Date();
//     const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
//     const endDate = new Date(today.getFullYear(), endMonth + 1, 0);
//     const diasSemana = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

//     const batch = writeBatch(db); // Crear batch para operaciones en lote
//     let currentDate = new Date(startDate);
//     let cambios = 0;

//     while (currentDate <= endDate) {
//         const dateKey = currentDate.toISOString().split("T")[0];
//         const dayName = diasSemana[currentDate.getDay()];
//         const predefinedHorarios = horariosPorDia[dayName] || [];

//         if (predefinedHorarios.length > 0) {
//             try {
//                 const docRef = doc(db, "horarios", dateKey);
//                 const docSnapshot = await getDoc(docRef);
                
//                 if (!docSnapshot.exists()) {
//                     batch.set(docRef, { horarios: predefinedHorarios });
//                     cambios++;
//                 } else {
//                     const existingData = docSnapshot.data();
//                     if (!existingData.bloqueado) {
//                         batch.set(docRef, { horarios: predefinedHorarios }, { merge: true });
//                         cambios++;
//                     }
//                 }
//             } catch (error) {
//                 console.error(`Error al procesar ${dateKey}:`, error);
//             }
//         }
//         currentDate.setDate(currentDate.getDate() + 1);
//     }

//     if (cambios > 0) {
//         await batch.commit(); // Enviar todos los cambios juntos
//         alert(`Se han creado/actualizado ${cambios} días en Firestore.`);
//     } else {
//         alert("No hubo cambios en los horarios.");
//     }
// }
