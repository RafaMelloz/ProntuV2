"use client"

import { useState } from "react";

import { Access } from "./access";
import { Account } from "./account";
import { ClinicConfig } from "./clinicConfig";
import { SessionProvider } from "next-auth/react";


export function SettingsPanel({session}) {
    const [controller, setController] = useState(1);

    const handleController = (val) => {
        setController(val)
    }

    const getOptions = () => {
        switch (controller) {
            case 1:
                return <Account session={session} />;
            case 2:
                return <Access />;
            case 3:
                return <ClinicConfig />;
            default:
                return <Account />;
        }
    }

    return (
        <div className="w-full overflow-hidden rounded-3xl shadow dark:shadow-dark p-8">
            <div className="flex gap-4 mb-8">
                {session.user.role === 'admin' ? (
                    <>
                        <h3 onClick={() => handleController(1)} className={`text-lg md:text-xl font-semibold px-2 cursor-pointer ${controller === 1 ? 'text-azul-900 border-b-2 border-azul-900' : 'text-cinza-900 border-b-2 border-cinza-900'}`}>Conta e segurança</h3>
                        <h3 onClick={() => handleController(2)} className={`text-lg md:text-xl font-semibold px-2 cursor-pointer ${controller === 2 ? 'text-azul-900 border-b-2 border-azul-900' : 'text-cinza-900 border-b-2 border-cinza-900'}`}>Painel de acessos</h3>
                        <h3 onClick={() => handleController(3)} className={`text-lg md:text-xl font-semibold px-2 cursor-pointer ${controller === 3 ? 'text-azul-900 border-b-2 border-azul-900' : 'text-cinza-900 border-b-2 border-cinza-900'}`}>Configurações da clinica</h3>
                    </>
                ) : <h3 onClick={() => handleController(1)} className={`text-lg md:text-xl font-semibold px-2 cursor-pointer ${controller === 1 ? 'text-azul-900 border-b-2 border-azul-900' : 'text-cinza-900 border-b-2 border-cinza-900'}`}>Conta e segurança</h3>}
            </div>
            <SessionProvider session={session}>
                {getOptions()}
            </SessionProvider>
        </div>
    )
}