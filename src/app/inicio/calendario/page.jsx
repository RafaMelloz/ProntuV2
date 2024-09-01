import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation";

export default async function CalendarPage(){

    const session = await getServerSession(authOptions);

    console.log(session);

    if (!session || !session.user) {
        redirect("/login");
    }
    

    return(
        <div>
            logado
        </div>
    )
}