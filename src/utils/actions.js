'use server'
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
// import prisma from "@/lib/prisma";
import { createBillingSession, createCheckoutSession } from "@/lib/stripe";
import { redirect } from "next/navigation";

export async function createSubscriptionAction() {
    const session = await getServerSession(authOptions);
    const clinic = session.user.clinic

    if (!session || !session.user) {
        return null
    }

    const checkOutSession = await createBillingSession(session.user.id, session.user.email, clinic.stripeSubscriptionId)
    // console.log('session', session);
    
    if (!checkOutSession.url) return null
    redirect(checkOutSession.url)
}


export async function recreateSubscriptionAction() {
    const session = await getServerSession(authOptions);
    const clinic = session.user.clinic

    if (!session || !session.user) {
        return null
    }

    const checkOutSession = await createCheckoutSession(session.user.id, session.user.clinic.stripeCustomerId)
    // console.log('session', session);

    if (!checkOutSession.url) return null
    redirect(checkOutSession.url)
}