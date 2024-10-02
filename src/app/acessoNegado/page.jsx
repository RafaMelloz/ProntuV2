import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";

export default async function AccessDeniedPage() {
    const session = await getServerSession(authOptions);

    return(
        <section className="flex flex-col items-center justify-center h-screen">
            <Image src={"/assets/erro403.svg"} alt="Erro 403" className="w-full max-w-32"  width={128} height={128}/>

            <h2 className="text-6xl font-bold text-azul-900 mb-5 text-center">Acesso negado!</h2>

            <span className="text-cinza-950 dark:text-cinza-700 text-3xl font-semibold text-center">
                Não encontramos a página que você tentou acessar
            </span>
            <span className="text-cinza-950 dark:text-cinza-700 text-2xl font-semibold text-center">
                Verifique se seu login está correto ou se possui autorização de acesso
            </span>

            {
                session && (
                    <Link href="/inicio/calendario" className="mt-5 text-white bg-azul-900 rounded-full py-2 px-3 font-semibold text-2xl md:text-xl">
                            Voltar para a página inicial
                    </Link>
                )
            }
        </section>
    )

}