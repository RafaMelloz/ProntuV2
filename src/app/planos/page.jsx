import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { createSubscriptionAction } from "@/utils/actions"
import { redirect } from "next/navigation";

export default async function PagePlans() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        redirect("/login");
    }

    const plans = [
        { id: 'monthly-plan', name: 'Mensal', price: "300,00" },
        { id: 'quarterly-plan', name: 'Trimestral', price: "900,00" },
        { id: 'semester-plan', name: 'Semestral', price: "1600,00" },
        { id: 'yearly-plan', name: 'Anual', price: "3200,00" }
    ]

    return(
        <section className="h-screen flex flex-col justify-center items-center gap-10">
            <div className="text-center">
                <h2 className="font-bold text-4xl text-azul-900">Ola {session.user.name}</h2>
                <h3 className="text-3xl font-semibold">Seja bem-vindo(a) ao Prontu e Ponto!</h3> 
            </div>
            
            <div>
                <p className="text-xl text-center mb-4">Para começar, escolha o plano que deseja assinar:</p>
                <div className="flex gap-10">
                    {plans.map(plan => (
                        <form action={createSubscriptionAction} key={plan.id} className="border-2 border-azul-900 rounded p-5 w-full min-w-40 text-center">
                            <h2 className="text-center font-semibold text-2xl">{plan.name}</h2>

                            <h4>R$ {plan.price}</h4>
                            <input type="hidden" name="plan" value={plan.id}/>
                            <button className="bg-azul-900 rounded py-1 w-full mt-2 font-semibold hover:bg-azul-900/70 duration-300">Assinar</button>
                        </form>
                    ))}
                </div>
            </div>
        </section>
    )
}