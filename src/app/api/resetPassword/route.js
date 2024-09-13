import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { hash } from "bcrypt";

export async function POST(req) {
    const { token, email, password } = await req.json();

    try {
        // Remove tokens expirados antes de tentar validar o token atual
        await prisma.VerificationToken.deleteMany({
            where: {
                expires: {
                    lt: new Date(), // Exclui tokens que já expiraram
                },
            },
        });

        const verificationToken = await prisma.VerificationToken.findFirst({
            where: {
                identifier: email,
                token,
                expires: {
                    gte: new Date(), // Verifica se o token ainda é válido
                },
            },
        });

        if (!verificationToken) {
            return NextResponse.json({ message: "Token inválido ou expirado" }, { status: 400 });
        }
        

        // Faz o hash da nova senha
        const hashedPassword = await hash(password, 10);

        // Atualiza a senha do usuário
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        });

        // Remove o token de reset após o uso
        await prisma.VerificationToken.delete({
            where: {
                identifier_token: {
                    identifier: email,
                    token: token,
                },
            },
        });

        return NextResponse.json({ message: "Senha atualizada" });
    } catch (e) {
        console.log(e);
        return NextResponse.json({ message: "Erro ao editar senha" }, { status: 500 });
    }
}