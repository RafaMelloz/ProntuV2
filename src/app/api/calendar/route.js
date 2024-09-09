import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req){
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: 'Acesso negado' }, { status: 400 });
    }

    const clinicId = req.nextUrl.searchParams.get('clinicId');
    const { patientName, dateForListing, dateConsult, hourConsult, consultType, qntReturns, currentReturn, professionalId, phone, notes } = await req.json();

    try {
        const existProfessional = await prisma.user.findUnique({
            where: {
                idUser: parseInt(professionalId),
                idClinic: parseInt(clinicId),
                OR: [
                    { role: 'quiropraxista' },
                    { role: 'admin' }
                ]
            }
        });

        if (!existProfessional) {
            return NextResponse.json({ message: "Profissional não encontrado" }, { status: 404 });
        }

        const existPatient = await prisma.patient.findFirst({
            where: {
                phone,
                idClinic: parseInt(clinicId)
            }
        });   

        await prisma.calendar.create({
            data: {
                idClinic: parseInt(clinicId),
                patientId: existPatient ? existPatient.idPatient : null,
                professionalId: parseInt(professionalId),
                patientName,
                dateForListing,
                dateConsult,
                hourConsult,
                consultType,
                qntReturns: parseInt(qntReturns),
                currentReturn: parseInt(currentReturn),
                phone,
                notes,
            }
        });


        return NextResponse.json({message: "Consulta agendada com sucesso"} , {status: 200});
    } catch (error) {
        console.log(error);
        return NextResponse.json({message: "Erro ao agendar consulta"} , {status: 500});
        
    }
}

export async function DELETE(req){
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: 'Acesso negado' }, { status: 400 });
    }

    const consultId = req.nextUrl.searchParams.get('consultId');

    try {
        await prisma.calendar.delete({
            where: {
                IdConsult: parseInt(consultId)
            }
        });

        return NextResponse.json({message: "Consulta deletada com sucesso"} , {status: 200});
    } catch (error) {
        console.log(error);
        return NextResponse.json({message: "Erro ao deletar consulta"} , {status: 500});
        
    }
}


const MINIMUM_DURATION = 20;
const convertTimeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};
const isTimeSlotAvailable = (hourConsult, selectedDoctor, existingConsult, currentEventId) => {
    const [newStart, newEnd] = hourConsult.split(' - ').map(convertTimeToMinutes);
    const newDuration = newEnd - newStart;

    if (newDuration < MINIMUM_DURATION) {
        return false;
    }

    if (existingConsult && existingConsult.professionalId === parseInt(selectedDoctor)) {
        const [start, end] = existingConsult.hourConsult.split(' - ').map(convertTimeToMinutes);
        if (
            existingConsult.IdConsult !== currentEventId &&
            ((newStart >= start && newStart < end) || (newEnd > start && newEnd <= end) || (newStart <= start && newEnd >= end))
        ) {
            return false;
        }
    }

    return true;
};

export async function PUT(req){

    
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: 'Acesso negado' }, { status: 400 });
    }

    const { IdConsult, patientName, dateForListing, dateConsult, hourConsult, consultType, qntReturns, currentReturn, professionalId, phone, notes } = await req.json();

    try {
        const existingConsult = await prisma.calendar.findUnique({
            where: { IdConsult },
        });

        if (!existingConsult) {
            return NextResponse.json({ message: 'Consulta não encontrada' }, { status: 404 });
        }

        const existProfessional = await prisma.user.findUnique({
            where: {
                idUser: parseInt(professionalId),
                idClinic: session.user.clinic.id,
                OR: [
                    { role: 'quiropraxista' },
                    { role: 'admin' }
                ]
            }
        });

        if (!existProfessional) {
            return NextResponse.json({ message: "Profissional não encontrado" }, { status: 404 });
        }

        const existPatient = await prisma.patient.findFirst({
            where: {
                phone,
                idClinic: session.user.clinic.id
            }
        }); 

        const otherConsults = await prisma.calendar.findMany({
            where: {
                professionalId: parseInt(professionalId),
                dateConsult,
                IdConsult: {
                    not: IdConsult
                }
            }
        });

        for (const consult of otherConsults) {
            if (!isTimeSlotAvailable(hourConsult, professionalId, consult, IdConsult)) {
                return NextResponse.json({ message: 'Horário indisponível' }, { status: 400 });
            }
        }

          

        await prisma.calendar.update({
            where: { IdConsult: parseInt(IdConsult) },
            data: {
                patientName,
                dateForListing,
                dateConsult,
                hourConsult,
                consultType,
                qntReturns: parseInt(qntReturns),
                patientId: existPatient ? existPatient.idPatient : null,
                currentReturn: parseInt(currentReturn),
                phone,
                notes,
                professionalId: parseInt(professionalId),
            },
        });

        return NextResponse.json({message: "Consulta atualizada com sucesso"} , {status: 200});
    } catch (error) {
        console.log(error);
        return NextResponse.json({message: "Erro ao atualizar consulta"} , {status: 500});
        
    }
}
