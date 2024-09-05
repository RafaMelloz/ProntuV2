import { Sidebar } from "@/components/sidebar";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PatientsContent } from "./componentsToPage/patientsContent";

export default async function PatientsPage() {
    const session = await getServerSession(authOptions)    
    const idClinic = session.user.clinic.id
    const role = session.user.role

    const patients = await prisma.patient.findMany({
        where:{
            idClinic
        },
        orderBy:{
            idPatient: 'asc'
        }
    })

    return (
        <section className="w-full !h-full flex justify-between gap-4">
            <Sidebar />
            <PatientsContent patients={patients} idClinic={idClinic} role={role} />
        </section>
    )
}