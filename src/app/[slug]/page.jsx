import { notFound } from "next/navigation";
import { FormSelfEvaluation } from "../../components/formSelfEvaluation";
import { Header } from "../../components/header";
import prisma from "@/lib/prisma";

export default async function SelfEvaluation({params}){

    const clinic = await prisma.clinic.findUnique({
        where:{
            clinicSlug: params.slug
        },select:{
            nameClinic: true,
            logoClinic: true,
            idClinic: true,
        }
    })

    if (!clinic) {
        notFound()
    }

    return(
        <>
            <Header subtitle={"Autoavaliação Prontuário de Atendimento de Quiropraxia"} clinic={clinic} />
            <FormSelfEvaluation clinicID={clinic.idClinic}/>
        </>
    )
}
