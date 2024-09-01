"use client";

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaRegCalendarAlt } from 'react-icons/fa';
import { GoGear } from 'react-icons/go';
import { HiMiniUsers } from 'react-icons/hi2';
import { TbLogin } from 'react-icons/tb';

export function Sidebar() {
    const pathname = usePathname();    
    const isProntuario = pathname.startsWith('/inicio/pacientes/prontuario');

    if (isProntuario) return null;

    const linkClasses = (path) => (
        `${pathname === path
            ? 'bg-azul-900 border-azul-900 text-white'
            : 'bg-white text-black/70 dark:bg-dark-900 dark:text-white/70  border-cinza-900/20  hover:border-azul-900/50'} 
      border-2 w-14 h-14 rounded-full flex items-center justify-center`
    );

    return (
        <aside className="bg-azul-800 border-cinza-900/20 dark:bg-dark-800 dark:border-dark-100 border-2 min-w-[70px] max-w-[102px] w-1/12 min-h-[546px] h-full  rounded-full">
            <nav className='w-full flex flex-col p-5 gap-6 items-center'>
                <Link href="/inicio/calendario" className={linkClasses('/inicio/calendario')}>
                    <FaRegCalendarAlt  size={24}/>
                </Link>

                <Link href="/inicio/pacientes" className={linkClasses('/inicio/pacientes')}>
                    <HiMiniUsers size={24} />
                </Link>

                <Link href="/inicio/ajustes" className={linkClasses('/inicio/ajustes')}>
                    <GoGear size={24} />
                </Link>

                <button href="/inicio/ajustes" onClick={() => signOut()} className={"bg-white text-black/70 dark:bg-dark-900 dark:text-white/70  border-cinza-900/20  hover:border-azul-900/50 border-2 w-14 h-14 rounded-full flex items-center justify-center"}>
                    <TbLogin size={24} />
                </button>
            </nav>
        </aside>
    );
}
