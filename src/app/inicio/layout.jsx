import { Header } from '@/components/header'
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function HomeLayout({ children }) {

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/login");
    }

    return(
        <>
            <Header  user={session.user}  clinic={session.user.clinic}/>
            <main className='fit-container h-screen-header'>
                {children}
            </main>
        </>
    )
}