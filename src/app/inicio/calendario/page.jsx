import { Sidebar } from "@/components/sidebar";
import { CalendarComponent } from "./componentsToPage/calendarComponent";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function CalendarPage(){
    
    const session = await getServerSession(authOptions);
    const slug = session.user.clinic.slug;    
    const clinicId = session.user.clinic.id;

    const professional = await prisma.user.findMany({
        where: {
            idClinic: session.user.clinic.id,
            OR: [
                { role: 'quiropraxista' },
                { role: 'admin' }
            ]
        },
        select: {
            idUser: true,
            name: true,
        }
    });

    const consults = await prisma.calendar.findMany({
        where: {
            idClinic: session.user.clinic.id,
        },
        select: {
            IdConsult: true,
            patientName: true,
            dateForListing: true,
            dateConsult: true,
            hourConsult: true,
            consultType: true,
            qntReturns: true,
            patientId: true,
            currentReturn: true,
            notes: true,
            phone: true,
            professionalId: true,
        }
    });

    return(
        <section className="w-full !h-full flex justify-between gap-4">
            <Sidebar />
            <CalendarComponent professional={professional} consults={consults} slug={slug} clinicId={clinicId}/>
        </section>
    )
}