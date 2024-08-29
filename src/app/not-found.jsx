import Image from "next/image";

export default function NotFoundPage(){
    return(
        <section className="w-full h-screen flex flex-col items-center justify-center">
            <Image 
                src="/assets/404.svg" 
                alt="404" 
                width={240} 
                height={240} 
            />

           <div className="px-5 sm:px-0">
                <h1 className="font-bold text-azul-900 mb-5 text-center text-6xl">Opa!</h1>
                <span className="text-cinza-950 dark:text-cinza-700 text-3xl font-normal text-center">
                    Não encontramos a página que você tentou acessar
                </span>
           </div>
        </section>
    )
}