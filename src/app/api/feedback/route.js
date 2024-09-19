import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
    const { question, isUseful } = await req.json();

    try {
        await prisma.feedback.create({
            data: {
                question,
                isUseful,
            },
        });

        return NextResponse.json({ message: 'Avaliação recebida' }, { status: 201 });
    } catch (error) {
        console.error('Error creating user:', error); // Log do erro para depuração
        return NextResponse.json({ message: 'Erro ao avaliar' }, { status: 500 });
    }
}