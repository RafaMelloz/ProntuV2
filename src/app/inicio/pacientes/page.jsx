import { Sidebar } from "@/components/sidebar";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { FaPlus } from "react-icons/fa";

export default async function PatientsPage() {

    const session = await getServerSession(authOptions)    
    const idClinic = session.user.clinic.id

    const patients = await prisma.patient.findMany({
        where:{
            idClinic
        },

    })

    console.log(patients);
    

    return (
        <section className="w-full !h-full flex">
            <Sidebar />
            
            <Link href={`/inicio/pacientes/${idClinic}`}>
                <FaPlus/> Adicionar Paciente
            </Link>
            
        </section>
    )
}