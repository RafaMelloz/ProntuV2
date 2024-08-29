import { NextResponse } from "next/server";
import  prisma  from "@/lib/prisma"
import { hash } from "argon2";

export async function POST(req){
    const { nameClinic, logoClinic, address, cpfCnpj, responsibleName, email, phone, password } = await req.json();

    console.log( nameClinic, logoClinic, address, cpfCnpj, responsibleName, email, phone, password);
    

    try {
        //verificações
        const isEmailAvailable = await prisma.user.count({
            where: { email }
        }) === 0;
        const isCnpjAvailable = await prisma.clinic.count({
            where: { cpfCnpj }
        }) === 0;
        const isPhoneAvailable = await prisma.user.count({
            where: { phone }
        }) === 0;

        if (!isEmailAvailable) { return NextResponse.json({ message: 'Email já cadastrado na plataforma'})};

        if (!isCnpjAvailable) { return NextResponse.json({message: 'CPF ou CNPJ já cadastrado na plataforma'})};

        if (!isPhoneAvailable) { return NextResponse.json({message: 'Telefone já cadastrado na plataforma'})};

        if (nameClinic.length < 3) { return NextResponse.json({message: 'O nome da clinica deve ter pelo menos 3 caracteres'})};

        const prefix = nameClinic.substring(0, 3).toUpperCase();
        const result = await prisma.$transaction(async (prisma) => {
            const clinic = await prisma.clinic.create({
                data: {
                    nameClinic,
                    logoClinic,
                    address,
                    responsibleName,
                    cpfCnpj
                }
            });
            if (!clinic) {
                throw new Error('Falha ao criar a clínica');
            }

            // Concatena o prefixo com o ID da clínica e dps Atualiza a clínica com o codeClinic
            const codeClinic = `${prefix}${clinic.idClinic}`;
            const updatedClinic = await prisma.clinic.update({
                where: { idClinic: clinic.idClinic },
                data: { codeClinic }
            });
            if (!updatedClinic) {
                throw new Error('Falha ao atualizar o codeClinic da clínica');
            }

            // Cria o usuário e associa a clínica ao usuário
            const hashedPassword = await hash(password); // Hash da senha
            const user = await prisma.user.create({
                data: {
                    name: responsibleName,
                    email,
                    phone,
                    password: hashedPassword,
                    role: 'admin',
                    idClinic: clinic.idClinic // Associa o usuário à clínica
                }
            });

            if (!user) {
                throw new Error('Falha ao criar o usuário');
            }
            return { user, updatedClinic };
        });

        return NextResponse.json({message: 'Cadastrado com sucesso!'});


    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: 'Erro ao cadastrar a clínica' }, { status: 500 });
    }
} 