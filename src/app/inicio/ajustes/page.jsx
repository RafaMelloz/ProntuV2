import { Sidebar } from "@/components/sidebar";
import { SettingsPanel } from "./componentsToPage/settingsPanel";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";



export default async function ConfigPage() {

    const session = await getServerSession(authOptions);

    return (
        <section className="w-full !h-full flex justify-between gap-4">
            <Sidebar />
            <SettingsPanel session={session}/>
        </section>
    )
}