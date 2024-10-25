import Link from "next/link";
import prisma  from "@/lib/prisma";
import { TbChevronLeft } from "react-icons/tb";
import { MedicalContent } from "../componentsToPage/medicalContent";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PatientsRecordPage({params}) {

    const session = await getServerSession(authOptions);

    if (session.user.role === 'secretaria') {
        redirect('/acessoNegado')
    }

    const transformAdjustmentAreasBack = (adjustmentAreasArray) => {
        const adjustmentAreas = {};

        adjustmentAreasArray.forEach(item => {
            const [key, value] = item.split(':');
            if (!adjustmentAreas[key]) {
                adjustmentAreas[key] = [];
            }
            adjustmentAreas[key].push(value);
        });

        return adjustmentAreas;
    }
    
    const personalDetails = await prisma.patient.findUnique({
        where: {
            idPatient: parseInt(params.id)
        },
    });

    const symptoms = await prisma.symptom.findFirst({
        where: {
            patientId: parseInt(params.id)
        },
    });

    const medicalRecord = await prisma.medicalRecord.findFirst({
        where: {
            patientId: parseInt(params.id)
        },
        select: {
            idMedicalRecord: true,
            subjectiveEvaluation: true,
            observations: true
        }
    });

    let gallery = [];
    let exams = [];
    let services = [];

    if (medicalRecord) {
        const docs = await prisma.documents.findFirst({
            where: {
                medicalRecordId: medicalRecord.idMedicalRecord
            },
            select: {
                nameImagesEvaluation: true,
                imagesEvaluation: true,
                examsName: true,
                exams: true
            }
        });

        services = await prisma.services.findMany({
            where: {
                medicalRecordId: medicalRecord.idMedicalRecord
            },
            select: {
                idService: true,
                nameService: true,
                dateService: true,
                adjustmentAreas: true,
                descriptionService: true
            }
        });

        services.forEach(service => {
            service.adjustmentAreas = transformAdjustmentAreasBack(service.adjustmentAreas);
        });

        gallery = docs.imagesEvaluation.map((url, index) => ({
            url,
            name: docs.nameImagesEvaluation[index]
        }));

        exams = docs.exams.map((url, index) => ({
            url,
            name: docs.examsName[index]
        }));
    }
    
    const calculateAge = (birthDate) => {
        const [day, month, year] = birthDate.split('/');
        const date = new Date(year, month - 1, day);
        const age = Math.floor((new Date() - date) / (365.25 * 24 * 60 * 60 * 1000));
        return age;
    };
    console.log(symptoms);
    
    return (
        <>
            <div className="flex items-center relative mb-10">
                <Link href={'/inicio/pacientes'} className="textSwitch outline-none w-14 h-14 rounded-full border-2 border-cinza-900/20 flex items-center justify-center hover:bg-black/10">
                    <TbChevronLeft className="size-8"  size={32}/>
                </Link>

                <h3 className="text-xl md:text-2xl lg:text-3xl font-medium text-center text-azul-900 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    Prontuário de Atendimento de Quiropraxia
                </h3>
            </div>

            <section className="w-full bg-section p-3 text-base text-center rounded-lg mb-10 bg-azul-700 dark:bg-dark-500 textSwitch">
                <h2 className="font-bold text-2xl">{personalDetails.name}</h2>

                <p className="m-5">
                    <span className="font-semibold">{calculateAge(personalDetails.birth_date)} anos</span> - {personalDetails.birth_date}
                </p>

                <div className="flex justify-center flex-col md:flex-row gap-5">
                    <p>
                        <span className="font-semibold mr-2">Profissão:</span>
                        {personalDetails.profession}
                    </p>
                    {
                        personalDetails.cpf && personalDetails.cpf !== "null" && (
                            <p>
                                <span className="font-semibold mr-2">CPF:</span>
                                {personalDetails.cpf}
                            </p>
                        )
                    }
                    <p>
                        <span className="font-semibold mr-2">Tel. Contato:</span>
                        {personalDetails.phone}
                    </p>
                    {
                        personalDetails.email && (
                            <p>
                                <span className="font-semibold mr-2">Email:</span>
                                {personalDetails.email}
                            </p>
                        )
                    }
                </div>

                <p className="my-5">
                    <span className="font-semibold mr-2">Endereço:</span>
                    {personalDetails.address}
                </p>

                <p>
                    <span className="font-semibold mr-2">Como você nos conheceu?</span>
                    {personalDetails.how_know_us}
                </p>
            </section>

            <MedicalContent symptoms={symptoms} medicalRecord={medicalRecord} gallery={gallery} exams={exams} services={services} idClinic={personalDetails.idClinic} idPatient={personalDetails.idPatient}/>
        </>
    )
}