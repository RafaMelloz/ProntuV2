import { Header } from '@/components/header'
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function HomeLayout({ children }) {

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        redirect("/login");
    }

    const status = await prisma.clinic.findUnique({
        where: { idClinic: session.user.clinic.id }
    })

    if (status.stripeCustomerId === null || status.stripeSubscriptionId === null || status.stripeSubscriptionStatus === null) {
        redirect("/planos");
    }

    return(
        <>
            <Header  user={session.user}  clinic={session.user.clinic}/>
            <main className='fit-container h-screen-header py-4'>
                {children}
            </main>
        </>
    )
}