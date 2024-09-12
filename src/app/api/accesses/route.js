import { NextResponse } from "next/server";
import { generateEmailTemplate }  from "../../../components/templates/userEmail";
import resend from "@/lib/resend";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import cloudinary from 'cloudinary';
import { hash } from "bcrypt";



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

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
        const hashedPassword = await hash(password, 10);  

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
                from: process.env.RESEND_FROM,
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

export async function GET(req){
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ message: 'Você não possui permissão' }, { status: 401 });
    }

    const clinicId = req.nextUrl.searchParams.get('clinicId');

    try {
        const users = await prisma.user.findMany({
            where: {
                idClinic: parseInt(clinicId),
                role: {
                    not: 'admin'
                }
            },
            select: {
                idUser: true,
                name: true,
                email: true,
                role: true,
                profileImg: true
            }
        });

        return NextResponse.json(users);
    } catch (e) {
        console.log(e);
        return NextResponse.json({ message: "Erro ao buscar acessos" },{status:500});
    }

    

}

export async function PUT(req) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ message: 'Você não possui permissão' }, { status: 401 });
    }

    const { name, email, role } = await req.json();
    const clinicId = req.nextUrl.searchParams.get('clinicId');
    const id = req.nextUrl.searchParams.get('id');    

    try {
        const existingUser = await prisma.user.findUnique({where: { idUser: parseInt(id) }});
        const isEmailAvailable = await prisma.user.count({
            where: {
                email,
                idUser: { not: parseInt(id) }
            }
        }) === 0;


        if (!existingUser || existingUser.idClinic !== parseInt(clinicId)) {
            return NextResponse.json({
                message: 'Usuário não encontrado'
            }, { status: 404 });
        }

        if (role !== 'secretaria' && role !== 'quiropraxista') {
            return NextResponse.json({ message: 'Cargo inválido!' }, { status: 400 });
        }

        if (!isEmailAvailable) {
            return NextResponse.json({ message: 'Email ja cadastrado em uma clinica' }, { status: 400 });
        }

        await prisma.user.update({
            where: { idUser: parseInt(id) },
            data: {
                name,
                email,
                role,
            },
        });

        return NextResponse.json({ message: "Acesso atualizado!" });
    } catch (e) {
        console.log(e);
        return NextResponse.json({ message: "Erro ao atualizar acesso" },{status:500});
    }
}

export async function DELETE(req) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ message: 'Você não possui permissão' }, { status: 401 });
    }

    const id = req.nextUrl.searchParams.get('id');
    const clinicId = req.nextUrl.searchParams.get('clinicId');

    try {
        const user = await prisma.user.findFirst({
            where: {
                idUser: parseInt(id),
                idClinic: parseInt(clinicId)
            },
            select: {
                role: true,
                profileImg: true
            }
        });

        if (!user) {
            return NextResponse.json({
                message: 'Usuário não encontrado'
            }, { status: 404 });
        }

        if (user.role === 'admin') {
            return NextResponse.json({
                message: 'Você não pode deletar um admin'
            }, { status: 400 });
        }

        if (user.profileImg) {
            await cloudinary.v2.uploader.destroy(`profileImg${id}`);
        }

        await prisma.user.delete({
            where: {
                idUser: parseInt(id)
            }
        });

        await prisma.calendar.deleteMany({
            where: {
                professionalId: parseInt(id)
            }
        });

        return NextResponse.json({ message: "Acesso deletado!" });
    } catch (e) {
        console.log(e);
        return NextResponse.json({ message: "Erro ao deletar acesso" },{status:500});
    }
}