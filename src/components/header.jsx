import { ThemeSwitch } from "./themeSwitch";
import { DefaultUser } from "./defaultUser";
import Image from "next/image";

export function Header({ subtitle, user, clinic}) {

    //TODO: Implementar a props clinicSettings e user
    const { nameClinic, logoClinic } = clinic;
    
    return (
        <header>
            <nav className="bg-azul-800 border-cinza-900/20 dark:bg-dark-800 dark:border-dark-100 w-full h-20 flex justify-between  border-b-2 ">
                <div className="flex items-center">
                    <div className="border-cinza-900/20 dark:border-dark-100 h-full w-24 flex justify-center items-center border-r-2 ">
                        {
                            logoClinic
                                ? <Image src={logoClinic} alt="Logo da clinica" width={48} height={48} className="rounded-full"/>
                                : <DefaultUser clinic />
                        }
                    </div>

                    <span className="text-xl text-azul-900 font-semibold pl-2 sm:text-2xl sm:pl-4">
                        {nameClinic}
                    </span>
                </div> 

                {user ?(
                    <div className="flex items-center flex-row-reverse pr-4">
                        {
                            user.img
                                ? <Image src={user.img} alt="Logo da clinica" width={48} height={48} className="rounded-full"/>
                                : <DefaultUser user />
                        }
                        <span className="text-black dark:text-white text-sm pr-2 sm:text-base font-medium capitalize sm:pr-4">Olá, {user.name}</span>
                    </div>   
                ):(
                    <div className="flex items-center flex-row-reverse pr-4">
                        <ThemeSwitch />
                    </div>
                )}
            </nav>
            
            {subtitle && (
                <h3 className="text-xl md:text-2xl lg:text-3xl font-medium text-center px-4 pt-8 text-azul-900">
                    {subtitle}
                </h3>
            )}
        </header>
    );
}
