import { ThemeSwitch } from "./themeSwitch";
import { DefaultUser } from "./defaultUser";

export function Header({ subtitle, user }) {

    //TODO: Implementar a props clinicSettings e user

    const clinicSettings = {
        name: "Arkham",
        img: ""
    }
    
    return (
        <header>
            <nav className="bg-azul-800 border-cinza-900/20 dark:bg-dark-800 dark:border-dark-100 w-full h-20 flex justify-between  border-b-2 ">
                <div className="flex items-center">
                    <div className="border-cinza-900/20 dark:border-dark-100 h-full w-24 flex justify-center items-center border-r-2 ">
                        {/* {
                            clinicSettings.logoClinic
                                ? <img className="w-12 h-12 rounded-full" src={clinicSettings.logoClinic} alt="Logo da clinica" fetchPriority="high" />
                                : <DefaultUser clinic />
                        } */}

                        <DefaultUser clinic />
                    </div>

                    <span className="text-xl text-azul-900 font-semibold pl-2 sm:text-2xl sm:pl-4">
                        {clinicSettings.name}
                    </span>
                </div> 

                {user ?(
                    <div className="flex items-center flex-row-reverse pr-4">
                        {
                            user.profileImg
                                ? <img className="w-12 h-12 rounded-full" src={user.profileImg} alt="Foto de perfil" fetchPriority="high" />
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