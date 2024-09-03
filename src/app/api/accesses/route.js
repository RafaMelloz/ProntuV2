import { NextResponse } from "next/server";
import { generateEmailTemplate }  from "../../../components/templates/userEmail";
import resend from "@/lib/resend";

export async function POST(req){

    const {email} = await req.json();

    const { data, error } = await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to: email,
        subject: 'Bem Vindo!',
        html: generateEmailTemplate(email),
    });

    return NextResponse.json({ message: "Hello World" });
}