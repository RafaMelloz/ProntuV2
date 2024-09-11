import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import cloudinary from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function getFieldFiles(field) {
    const files = [];

    if (Array.isArray(field)) {
        for (const file of field) {
            if (file) {
                const fileBuffer = await file.arrayBuffer();
                files.push({
                    buffer: Buffer.from(fileBuffer),
                    name: file.name  // Nome do arquivo armazenado
                });
            }
        }
    } else if (field && typeof field === 'object' && field.type === 'file') {
        const fileBuffer = await field.arrayBuffer();
        files.push({
            buffer: Buffer.from(fileBuffer),
            name: field.name  // Nome do arquivo armazenado
        });
    }

    return files;
}

async function getAdjustmentAreas(formData) {
    const adjustmentAreas = {};
    for (const [key, value] of formData.entries()) {
        if (key.startsWith('adjustmentAreas[')) {
            const match = key.match(/adjustmentAreas\[(.*?)\]\[(\d+)\]/);
            if (match) {
                const [, area, index] = match;
                if (!adjustmentAreas[area]) {
                    adjustmentAreas[area] = [];
                }
                adjustmentAreas[area][index] = value;
            }
        }
    }
    return adjustmentAreas;
}

async function transformAdjustmentAreas(adjustmentAreas) {
    const result = [];
    for (const area in adjustmentAreas) {
        adjustmentAreas[area].forEach(value => {
            result.push(`${area}:${value}`);
        });
    }
    return result;
}

export async function POST(req) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: 'Acesso negado' }, { status: 400 });
    }

    const formData = await req.formData();
    const clinicId = req.nextUrl.searchParams.get('clinicId');
    const idPatient = req.nextUrl.searchParams.get('idPatient');

    const gallery = await getFieldFiles(formData.getAll('newGallery[]'));
    let galleryUrls = [];

    const exams = await getFieldFiles(formData.getAll('newExams[]'));
    let examsUrls = [];

    const observation = formData.get('observation') || '';
    const subjectiveEvaluation = formData.get('subjectiveEvaluation') || '';

    const nameService = formData.get('nameService');
    const dateService = formData.get('dateService');
    const descriptionService = formData.get('descriptionService');

    // Extraindo e organizando áreas de ajuste
    const adjustmentAreasObj = await getAdjustmentAreas(formData);
    const adjustmentAreas = await transformAdjustmentAreas(adjustmentAreasObj);

    try {
        let medicalRecord = await prisma.medicalRecord.findFirst({
            where: {
                patientId: parseInt(idPatient)
            }
        });

        if (!medicalRecord) {
            medicalRecord = await prisma.medicalRecord.create({
                data: {
                    observations: observation,
                    subjectiveEvaluation,
                    patientId: parseInt(idPatient)
                }
            });
        } else {
            medicalRecord = await prisma.medicalRecord.update({
                where: {
                    idMedicalRecord: medicalRecord.idMedicalRecord
                },
                data: {
                    observations: observation,
                    subjectiveEvaluation
                }
            });
        }

        // Upload da galeria
        if (gallery.length > 0) {
            for (const file of gallery) {
                if (file.buffer) {
                    const uploadResult = await new Promise((resolve, reject) => {
                        cloudinary.v2.uploader.upload_stream(
                            { resource_type: "auto", public_id: `gallery_${file.name}_${idPatient}` },
                            (error, result) => {
                                if (error) {
                                    reject(error);
                                } else {
                                    resolve(result);
                                }
                            }
                        ).end(file.buffer);
                    });

                    galleryUrls.push({
                        name: file.name,
                        secure_url: uploadResult.secure_url
                    });
                }
            }
        }

        // Upload dos exames
        if (exams.length > 0) {
            for (const file of exams) {
                if (file.buffer) {
                    const uploadResult = await new Promise((resolve, reject) => {
                        cloudinary.v2.uploader.upload_stream(
                            { resource_type: "auto", public_id: `exams_${file.name}_${idPatient}` },
                            (error, result) => {
                                if (error) {
                                    reject(error);
                                } else {
                                    resolve(result);
                                }
                            }
                        ).end(file.buffer);
                    });

                    examsUrls.push({
                        name: file.name,
                        secure_url: uploadResult.secure_url
                    });
                }
            }
        }

        // Verificar se já existem documentos
        let docs = await prisma.documents.findFirst({
            where: {
                medicalRecordId: medicalRecord.idMedicalRecord
            }
        });

        if (docs) {
            // Atualizar documentos existentes
            const updatedGalleryNames = [...docs.nameImagesEvaluation, ...gallery.map(g => g.name)];
            const updatedGalleryUrls = [...docs.imagesEvaluation, ...galleryUrls.map(g => g.secure_url)];
            const updatedExamNames = [...docs.examsName, ...exams.map(e => e.name)];
            const updatedExamUrls = [...docs.exams, ...examsUrls.map(e => e.secure_url)];

            docs = await prisma.documents.update({
                where: {
                    idDocuments: docs.idDocuments
                },
                data: {
                    nameImagesEvaluation: updatedGalleryNames,
                    imagesEvaluation: updatedGalleryUrls,
                    examsName: updatedExamNames,
                    exams: updatedExamUrls,
                    medicalRecordId: medicalRecord.idMedicalRecord
                }
            });
        } else {
            // Criar novos documentos
            docs = await prisma.documents.create({
                data: {
                    nameImagesEvaluation: gallery.map(g => g.name),
                    imagesEvaluation: galleryUrls.map(g => g.secure_url),
                    examsName: exams.map(e => e.name),
                    exams: examsUrls.map(e => e.secure_url),
                    medicalRecordId: medicalRecord.idMedicalRecord
                }
            });
        }

        const services = await prisma.services.create({
            data: {
                nameService,
                dateService,
                adjustmentAreas,
                descriptionService,
                medicalRecordId: medicalRecord.idMedicalRecord
            }
        });

        return NextResponse.json({ message: 'Atendimento salvo com sucesso!' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Erro ao salvar atendimento' }, { status: 500 });
    }
}

export async function PUT(req){
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: 'Acesso negado' }, { status: 400 });
    }

    const { editDescriptionService } = await req.json();
    
    const idService = req.nextUrl.searchParams.get('idService');

    try {
        await prisma.services.update({
            where: {
                idService: parseInt(idService)
            },
            data: {
                descriptionService: editDescriptionService
            }
        });

        return NextResponse.json({ message: 'Atendimento atualizado com sucesso!' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Erro ao atualizar atendimento' }, { status: 500 });
    }

} 
