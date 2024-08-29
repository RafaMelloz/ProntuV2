import Image from "next/image";
import { ClinicRegistration } from "../../components/forms/clinicRegistration";

export default function CadastroPage(){
    return(
        <main className="flex w-full flex-col sm:flex-row h-screen">
            <div className="w-full py-10 sm:bg-azul-900 sm:p-0  sm:w-1/2 flex items-center justify-center">
                <Image
                    src={"/logo.svg"}
                    priority={true}
                    alt="Logo"
                    width={300}
                    height={300}
                    className="hidden sm:block w-auto h-auto"  
                />

                <Image
                    src={"/minLogo.svg"}
                    priority={true}
                    alt="Logo"
                    width={150}
                    height={150}
                    className="block sm:hidden w-auto h-auto"
                />
            </div>

            <div className="w-full bg-white dark:bg-dark-900 sm:w-1/2 flex items-center justify-center textSwitch">
                <ClinicRegistration/>
            </div>
        </main>
    )
}