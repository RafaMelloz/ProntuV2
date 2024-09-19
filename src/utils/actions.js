// 'use server'

// import prisma from "@/lib/prisma";

// export async function createConsult(clinicId, newEvent) {
//     const { patientName, dateForListing, dateConsult, hourConsult, consultType, qntReturns, currentReturn, professionalId, phone, notes } = newEvent;

//     const existPatient = await prisma.patient.findFirst({
//         where: {
//             phone,
//             idClinic: parseInt(clinicId)
//         }
//     });

//     const newConsult = await prisma.calendar.create({
//         data: {
//             idClinic: parseInt(clinicId),
//             patientId: existPatient ? existPatient.idPatient : null,
//             professionalId: parseInt(professionalId),
//             patientName,
//             dateForListing,
//             dateConsult,
//             hourConsult,
//             consultType,
//             qntReturns: parseInt(qntReturns),
//             currentReturn: parseInt(currentReturn),
//             phone,
//             notes,
//         }
//     });

//     return newConsult;
// }