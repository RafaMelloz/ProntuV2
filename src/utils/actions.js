'use server'
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
// import prisma from "@/lib/prisma";
import { createCheckoutSession } from "@/lib/stripe";
import { redirect } from "next/navigation";

export async function createSubscriptionAction() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return null
    }

    const checkOutSession = await createCheckoutSession(session.user.id, session.user.email)
    

    if (!checkOutSession.url) return null
    redirect(checkOutSession.url)
}