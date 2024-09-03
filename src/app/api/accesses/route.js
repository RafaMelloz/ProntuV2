import { NextResponse } from "next/server";
import { generateEmailTemplate }  from "../../../components/templates/userEmail";
import resend from "@/lib/resend";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hash } from "@/lib/argon2";

export async function POST(req){
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ message: 'Você não possui permissão' }, { status: 401 });
    }

    const {name,email,role} = await req.json();
    const clinicId = req.nextUrl.searchParams.get('clinicId');

    try {

        const clinic = await prisma.clinic.findUnique({ where: { idClinic: parseInt(clinicId) }})

        const isEmailAvailable = await prisma.user.count({where: { email }}) === 0;

        const countUser = await prisma.user.findMany({
            where: {
                idClinic: parseInt(clinicId)
            },
            select: {
                idUser: true,
                name: true,
                email: true,
                role: true
            }
        })

        if (role !== 'secretaria' && role !== 'quiropraxista') {
            return NextResponse.json({message: 'Cargo inválido!'} , {status: 400});
        }

        if (countUser.length === 6) {
            return NextResponse.json({ message: 'Limite de usuários atingido'} , {status: 400});
        }

        if (!isEmailAvailable) {
            return NextResponse.json({ message: 'Email ja cadastrado em uma clinica'} , {status: 400});
        }


        const prefixEmail = email.substring(0, 5).toUpperCase();
        const randomFistNumber = Math.floor(Math.random() * 100);
        const randomSecondNumber = Math.floor(Math.random() * 100);
        const password = `${randomFistNumber}${prefixEmail}${randomSecondNumber}`;
        const hashedPassword = await hash(password); 

        const user = await prisma.user.create({
            data: {
                name,
                email,
                role,
                idClinic: parseInt(clinicId),
                password: hashedPassword
            }
        });

        if (user) {
            await resend.emails.send({
                // from: 'contato@prontue.com',
                from: 'Acme <onboarding@resend.dev>',
                to: email,
                subject: 'Bem-vindo ao Prontu e Ponto!',
                html: generateEmailTemplate(name, clinic.nameClinic, clinic.codeClinic, email, password),
            });
        }
        
        return NextResponse.json({ message: "Acesso cadastrado!" });

    }catch(e){
        console.log(e);
        return NextResponse.json({ message: "Erro ao cadastrar acesso" },{status:500});
    }
}