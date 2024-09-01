import Image from "next/image";
import { Authentication } from "@/components/forms/authentication";

export default function LoginPage(){
    return (
        <main className="flex w-full flex-col sm:flex-row h-screen">
            <div className="w-full py-10 sm:bg-azul-900 sm:p-0  sm:w-1/2 flex items-center justify-center">
                <Image
                    src={"/assets/logo.svg"}
                    priority={true}
                    alt="Logo"
                    width={300}
                    height={300}
                    className="hidden sm:block w-auto h-auto"
                />

                <Image
                    src={"/assets/minLogo.svg"}
                    priority={true}
                    alt="Logo"
                    width={150}
                    height={150}
                    className="block sm:hidden w-auto h-auto"
                />
            </div>

            <div className="w-full bg-white dark:bg-dark-900 sm:w-1/2 flex items-center justify-center textSwitch">
                <Authentication />
            </div>
        </main>
    )
}