import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req){
    const session = await getServerSession(authOptions);
    const statusClinic = await prisma.clinic.findUnique({ where: { idClinic: session.user.clinic.id }, select: { stripeSubscriptionStatus: true } });

    if (!session) {
        return NextResponse.json({ message: 'Acesso negado' }, { status: 400 });
    }

    if (statusClinic.stripeSubscriptionStatus === 'canceled' || statusClinic.stripeSubscriptionStatus === 'past_due') {
        return NextResponse.json({ message: 'O plano da sua clinica foi cancelado ou esta inativo!' }, { status: 401 });
    }

    const clinicId = req.nextUrl.searchParams.get('clinicId');
    const { name, birth_date, phone, cpf, profession, email, address, how_know_us, } = await req.json();


    try {

        if (email) {    
            const isEmailAvailable = await prisma.patient.count({
                where: {
                    email,
                    idClinic: parseInt(clinicId),
                }
            }) === 0;

            if (!isEmailAvailable) {
                return NextResponse.json({ message: 'Email já cadastrado nesta clinica' }, { status: 400 });
            }
        }

        const isPhoneAvailable = await prisma.patient.count({
            where: {
                phone,
                idClinic: parseInt(clinicId),
            }
        }) === 0;

        if(cpf){
            const isCpfAvailable = await prisma.patient.count({
                where: {
                    cpf,
                    idClinic: parseInt(clinicId),
                }
            }) === 0;

            if (!isCpfAvailable) {
                return NextResponse.json({ message: 'CPF já nesta clinica cadastrado' }, { status: 400 });
            }
        }

        if (!isPhoneAvailable) {
            return NextResponse.json({ message: 'Telefone já nesta clinica cadastrado' }, { status: 400 });
        }

        


        await prisma.patient.create({
            data: {
                name,
                birth_date,
                phone,
                cpf,
                profession,
                email,
                address,
                how_know_us,
                idClinic: parseInt(clinicId),
            }
        });

        return NextResponse.json({ message: "Paciente cadastrado!" });
    } catch (e) {
        console.log(e);
        return NextResponse.json({ message: "Erro ao cadastrar paciente" },{status:500});
    }
}

export async function PUT(req){
    const session = await getServerSession(authOptions);
    const statusClinic = await prisma.clinic.findUnique({ where: { idClinic: session.user.clinic.id }, select: { stripeSubscriptionStatus: true } });

    if (!session) {
        return NextResponse.json({ message: 'Acesso negado' }, { status: 400 });
    }

    if (statusClinic.stripeSubscriptionStatus === 'canceled' || statusClinic.stripeSubscriptionStatus === 'past_due') {
        return NextResponse.json({ message: 'O plano da sua clinica foi cancelado ou esta inativo!' }, { status: 401 });
    }

    const clinicId = req.nextUrl.searchParams.get('clinicId');
    const id = req.nextUrl.searchParams.get('id');

    const { name, email, phone, profession, address } = await req.json();

    try {
        const existingPatient = await prisma.patient.findUnique({
            where: { idPatient: parseInt(id) },
        });
        

        if (email) {
            const isEmailAvailable = await prisma.patient.count({
                where: {
                    email,
                    idPatient: { not: parseInt(id) },
                    idClinic: parseInt(clinicId)
                }
            }) === 0;

            if (!isEmailAvailable) {
                return NextResponse.json({ message: 'Email já cadastrado nesta clinica' }, { status: 400 });
            }
        }

        const isPhoneAvailable = await prisma.patient.count({
            where: {
                phone,
                idPatient: { not: parseInt(id) },
                idClinic: parseInt(clinicId),
            }
        }) === 0;

        if (!existingPatient || existingPatient.idClinic !== parseInt(clinicId)) {
            return NextResponse.json({ message: 'Paciente não encontrado' }, { status: 404 });
        } 

        if (!isPhoneAvailable) {
            return NextResponse.json({ message: 'Telefone já nesta clinica cadastrado' }, { status: 400 });
        }

        await prisma.patient.update({
            where: { idPatient: parseInt(id) },
            data: {
                name,
                email,
                phone,
                profession,
                address
            },
        });

        return NextResponse.json({ message: "Paciente editado!" });
    } catch (e) {
        console.log(e);
        return NextResponse.json({ message: "Erro ao editar paciente" },{status:500});
    }
}