"use client"

import { getPlanByPriceId } from "@/lib/stripe";

export function Payment({ stripeStatus }) {
    const planName = getPlanByPriceId(stripeStatus.stripePriceId);
    
    return (
        <section className="w-full !h-full overflow-y-auto overflow-x-hidden">
            <div className="flex justify-between items-center">
                <h2 className="text-black dark:text-white text-2xl font-semibold mb-2 ml-1">Seu plano atual</h2>
            </div>

            <div className="flex justify-between items-center w-full max-w-md p-3 ml-1 rounded-lg shadow-[0px_1px_6px_0px_#00000040] dark:shadow-[0px_0px_6px_0px_#ffffff0] dark:border dark:border-dark-600/30">
                <div className="flex flex-col gap-2">
                    <h3 className="text-black dark:text-white text-lg font-semibold flex gap-2 items-center">{planName.name}
                        <span className={`text-xs p-1 rounded ${stripeStatus.stripeSubscriptionStatus === 'active' ? 'bg-green-900 text-verde-900' : 'bg-red-900 text-red-500'}`}>{stripeStatus.stripeSubscriptionStatus === 'active' ? 'Ativo' : 'Inativo'}</span>
                    </h3>

                    {/* <p className="text-sm">Proxima cobrança: <span className="text-base">{stripeStatus.nextBillingDate}</span></p> */}
                </div>
                <a rel="stylesheet" href={stripeStatus.billingPortalUrl} className="bg-azul-900 text-white py-1 px-2 h-fit rounded font-semibold">Ver plano</a>
           </div>
        </section>
    )
}