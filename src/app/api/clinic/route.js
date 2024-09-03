import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "argon2";
import cloudinary  from 'cloudinary';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

export async function POST(req) {
    const formData = await req.formData();
    const nameClinic = formData.get('nameClinic')
    const logoClinic = formData.get('logoClinic')
    const address = formData.get('address')
    const responsibleName = formData.get('responsibleName')
    const cpfCnpj = formData.get('cpfCnpj')
    const email = formData.get('email')
    const phone = formData.get('phone')
    const password = formData.get('password')

    const fileBuffer = logoClinic ? await logoClinic.arrayBuffer() : null;
    const fileStream = fileBuffer !== null ? Buffer.from(fileBuffer): null;
    let logoClinicUrl = "";

    try {
        // Verificações
        const isEmailAvailable = await prisma.user.count({ where: { email } }) === 0;
        const isPhoneAvailable = await prisma.user.count({ where: { phone } }) === 0;
        const isCnpjAvailable = await prisma.clinic.count({ where: { cpfCnpj } }) === 0;

        if (!isEmailAvailable) return NextResponse.json({ message: 'Email já cadastrado na plataforma' }, { status: 400 });
        if (!isPhoneAvailable) return NextResponse.json({ message: 'Telefone já cadastrado na plataforma' }, { status: 400 });
        if (!isCnpjAvailable) return NextResponse.json({ message: 'CPF ou CNPJ já cadastrado na plataforma' }, { status: 400 });
        if (nameClinic.length < 3) return NextResponse.json({ message: 'O nome da clínica deve ter pelo menos 3 caracteres' }, { status: 400 });


        if (logoClinic !== null) {
            const uploadResult = await new Promise((resolve, reject) => {
                cloudinary.v2.uploader.upload_stream({ resource_type: "auto", public_id: `logo_${nameClinic}` },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }).end(fileStream);
            });
            logoClinicUrl = uploadResult.secure_url;
        }

        
        const prefix = nameClinic.substring(0, 3).toUpperCase();
        const result = await prisma.$transaction(async (prisma) => {
            const clinic = await prisma.clinic.create({
                data: {
                    nameClinic,
                    logoClinic: logoClinicUrl,
                    address,
                    responsibleName,
                    cpfCnpj,
                },
            });
            if (!clinic) {
                throw new Error('Falha ao criar a clínica');
            }

            const codeClinic = `${prefix}${clinic.idClinic}`;
            const updatedClinic = await prisma.clinic.update({
                where: { idClinic: clinic.idClinic },
                data: { codeClinic },
            });
            if (!updatedClinic) {
                throw new Error('Falha ao atualizar o codeClinic da clínica');
            }

            const hashedPassword = await hash(password);
            const user = await prisma.user.create({
                data: {
                    name: responsibleName,
                    email,
                    phone,
                    password: hashedPassword,
                    role: 'admin',
                    idClinic: clinic.idClinic,
                },
            });

            if (!user) {
                throw new Error('Falha ao criar o usuário');
            }
            return { user, updatedClinic };
        });

        return NextResponse.json({ message: 'Cadastrado com sucesso!' });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: 'Erro ao cadastrar a clínica' }, { status: 500 });
    }
}

export async function PUT(req){
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ message: 'Você não possui permissão' }, { status: 401 });
    }


    const formData = await req.formData();
    const nameClinic = formData.get('nameClinic')
    const logoClinic = formData.get('logoClinic')
    const clinicId = formData.get('clinicId')

    const fileBuffer = logoClinic && logoClinic !== "removed" ? await logoClinic.arrayBuffer() : null;
    const fileStream = fileBuffer !== null ? Buffer.from(fileBuffer) : null;
    let imgUrl;

    const clinic = await prisma.clinic.findUnique({
        where: { idClinic: parseInt(clinicId) },
        select: { codeClinic: true, logoClinic: true, nameClinic: true }
    });

    if (!clinic) {
        return NextResponse.json({ message: 'Clínica não encontrada' }, { status: 404 });
    }

    if (nameClinic === '') {
        return NextResponse.json({ message: 'Nome da clínica não pode estar vazio' }, { status: 400 });
    }

    try {
        if (logoClinic && logoClinic === 'removed') {
            await cloudinary.v2.uploader.destroy(`logo_${clinic.nameClinic}`);
            imgUrl = "";
        } else if (logoClinic) {
            if (clinic.logoClinic) {
                await cloudinary.v2.uploader.destroy(`logo_${clinic.nameClinic}`);
            }

            imgUrl = await new Promise((resolve, reject) => {
                cloudinary.v2.uploader.upload_stream({ resource_type: "auto", public_id: `logo_${clinic.nameClinic}` },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }).end(fileStream);
            });

        }
        const updatedLogo = logoClinic === "removed" ? ""
        : imgUrl && imgUrl.secure_url ? imgUrl.secure_url
        : clinic.logoClinic;
        
        await prisma.clinic.update({
            where: { idClinic: parseInt(clinicId) },
            data: {
                nameClinic ,
                logoClinic: updatedLogo
            },
        });

            return NextResponse.json({ message: 'Clinica atualizada com sucesso', image: updatedLogo });
    } catch (e) {
        console.log(e);
        return NextResponse.json({ message: 'Erro ao atualizar a clinica' }, { status: 500 });
    }
}
