import { Header } from '@/components/header'
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { LuAlertTriangle } from 'react-icons/lu';

export default async function HomeLayout({ children }) {

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        redirect("/login");
    }

    const status = await prisma.clinic.findUnique({
        where: { idClinic: session.user.clinic.id }
    })

    if (status.stripePriceId === "price_1Q31xB2NQAhIsjZC3gDXWNU1") {
        redirect("/planos");
    }

    return(
        <>
            <Header  user={session.user}  clinic={session.user.clinic}/>

            {status.stripeSubscriptionStatus === 'past_due' && (
                <div className='p-6 text-white absolute bottom-4 right-4 z-50 rounded border-4 bg-red-900 border-vermelho-900 text-center'>
                    <LuAlertTriangle  size={48} className='m-auto animate-bounce ease-in-out'/>
                    <h3 className='text-2xl font-semibold'>Sua assinatura venceu!</h3>
                    <p>Para ter acesso as funções do sistema novamente,<br/> por favor reative seu plano na tela de ajustes</p>
                </div>
            )}

            <main className='fit-container h-screen-header py-4'>
                {children}
            </main>
        </>
    )
}