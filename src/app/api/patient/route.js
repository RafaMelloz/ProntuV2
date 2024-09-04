import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req){
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: 'Acesso negado' }, { status: 400 });
    }

    const clinicId = req.nextUrl.searchParams.get('clinicId');
    const { name, birth_date, phone, cpf, profession, email, address, how_know_us, } = await req.json();


    try {

        if (email) {    
            const isEmailAvailable = await prisma.user.count({
                where: {
                    email,
                    idClinic: parseInt(clinicId),
                }
            }) === 0;

            if (!isEmailAvailable) {
                return NextResponse.json({ message: 'Email já cadastrado' }, { status: 400 });
            }
        }

        const isPhoneAvailable = await prisma.patient.count({
            where: {
                phone,
                idClinic: parseInt(clinicId),
            }
        }) === 0;

        const isCpfAvailable = await prisma.patient.count({
            where: {
                cpf,
                idClinic: parseInt(clinicId),
            }
        }) === 0;

        if (!isPhoneAvailable) {
            return NextResponse.json({ message: 'Telefone já nesta clinica cadastrado' }, { status: 400 });
        }

        if (!isCpfAvailable) {
            return NextResponse.json({ message: 'CPF já nesta clinica cadastrado' }, { status: 400 });
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