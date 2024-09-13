import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import resend from "@/lib/resend";
import { PasswordEmail } from "@/components/templates/passwordEmail";

export async function POST(req){
    const {codeClinic, email} = await req.json();

    try {
        const clinic = await prisma.clinic.findFirst({ where: { codeClinic } });
        if (!clinic) {
            return NextResponse.json({ message: "Clínica não encontrada" },{status:404});
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({ message: "Usuário não encontrado" },{status:404});
        }

        const name = await user.name;
        const dateLocal = new Date();

        // Gera um token de reset aleatório e define o tempo de expiração
        const token = randomBytes(6).toString("hex").slice(0, 6).toUpperCase(); // Código de 6 dígitos
        // Define a expiração para 5 minutos a partir de agora
        const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos = 5 * 60 * 1000 ms

        const tokenVerification = await prisma.VerificationToken.create({
            data: {
                identifier: email,
                token,
                expires,
            },
        });


        if (tokenVerification) {
            await resend.emails.send({
                // from: 'contato@prontue.com',
                from: process.env.RESEND_FROM,
                to: email,
                subject: 'Mudança de senha',
                react: PasswordEmail(name, token, dateLocal),
            });
        }        
        
        return NextResponse.json({ message: "Token para reset de senha enviada para o email" });
    } catch (e) {
        console.log(e);
        return NextResponse.json({ message: "Erro desconhecido no servidor" },{status:500});
    }
}