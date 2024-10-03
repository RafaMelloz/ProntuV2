import { Sidebar } from "@/components/sidebar";
import { SettingsPanel } from "./componentsToPage/settingsPanel";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { getLinkForEditPayment, getSubscriptionDetails} from "@/lib/stripe";
import prisma from "@/lib/prisma";

export default async function ConfigPage() {
    const session = await getServerSession(authOptions);    
    let stripeStatus;

    // function formatDate(unixTimestamp) {
    //     const date = new Date(unixTimestamp * 1000); 
    //     const day = String(date.getDate()).padStart(2, '0');
    //     const month = String(date.getMonth() + 1).padStart(2, '0'); 
    //     const year = date.getFullYear(); 
    //     return `${day}/${month}/${year}`; 
    // }

    if (session.user.role === 'admin') {
        stripeStatus = await prisma.clinic.findUnique({
            where: { idClinic: session.user.clinic.id },
            select: {
                stripeCustomerId: true,
                stripeSubscriptionId: true,
                stripeSubscriptionStatus: true,
                stripePriceId: true, 
            }
        });

        // const subscriptionDetails = await getSubscriptionDetails(stripeStatus.stripeSubscriptionId);
        // stripeStatus.nextBillingDate = formatDate(subscriptionDetails.current_period_end);

        const billingPortalUrl = await getLinkForEditPayment(stripeStatus.stripeCustomerId);

        stripeStatus.billingPortalUrl = billingPortalUrl; // Passar o link para o componente
    }


    return (
        <section className="w-full !h-full flex justify-between gap-4">
            <Sidebar />
            <SettingsPanel session={session} stripeStatus={stripeStatus}/>
        </section>
    )
}