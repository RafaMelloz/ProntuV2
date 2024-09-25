import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { createSubscriptionAction } from "@/utils/actions"
import { redirect } from "next/navigation";
import { LuCheck } from "react-icons/lu";

export default async function PagePlans() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        redirect("/login");
    }
    return(
        <section className="h-screen flex flex-col justify-center items-center p-4">
            <div className="text-center mb-8">
                <h2 className="font-bold text-2xl md:text-4xl text-azul-900 mb-2">Bem-vindo(a) {session.user.name}!</h2>
                <h3 className="text-base md:text-xl font-semibold text-zinc-800 dark:text-gray-300">Você esta a apenas um passo de desbloquear todo o potencial do Prontu e Ponto</h3> 
            </div>

            <form action={createSubscriptionAction} className="max-w-md w-full bg-white rounded-lg shadow-md dark:shadow-sm text-black p-4">
                <div class="flex flex-col space-y-1.5 p-6">
                    <h3 class="whitespace-nowrap tracking-tight text-2xl font-bold text-center text-azul-900">Plano Mensal Premium</h3>
                    <p class="text-sm  text-gray-800 text-center">Comece a otimizar sua gestão hoje</p>
                </div>

                <div className="space-y-6 px-4">
                    <div className="text-4xl font-bold text-azul-900 text-center text-primary">R$ 300,00<span className="text-xl font-normal text-gray-800">/mês</span></div>

                    <div className="h-2 w-full bg-zinc-400/40 relative rounded">
                        <div className="w-3/4 h-full bg-azul-900/80 rounded"></div>
                    </div>

                    <p className="text-sm text-center text-gray-800">Conta criada. Falta apenas confirmar sua assinatura!</p>


                    <ul>
                        <li className="flex items-center gap-3 text-lg text-gray-800"><LuCheck className="text-verde-900 size-6"/>  Suporte prioritário 24/7</li>
                        <li className="flex items-center gap-3 text-lg text-gray-800"><LuCheck className="text-verde-900 size-6" />Atualizações gratuitas</li>
                    </ul>
                </div>

                <button className="bg-azul-900 rounded py-2 w-full text-white text-xl font-semibold hover:bg-azul-900/70 duration-300 mt-10 flex items-center gap-2 justify-center">Assinar e Começar</button>
            </form>

            <div className="mt-8 text-black dark:text-gray-400 text-center text-sm">
                <p>Tem dúvidas antes de assinar?</p>
                <a href="#" className="hover:underline">Fale conosco!</a>
            </div>
        </section>
    )
}