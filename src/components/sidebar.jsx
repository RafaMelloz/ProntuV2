// components/ClientNavbar.jsx
"use client";

import { usePathname } from 'next/navigation';

export function Sidebar() {
    const pathname = usePathname();
    const isProntuario = pathname.startsWith('/inicio/pacientes/prontuario');

    if (isProntuario) return null;

    return (
        <aside>
           navbar
        </aside>
    );
}
