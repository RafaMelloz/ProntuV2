import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import cloudinary from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

function getFieldValues(field) {
    if (Array.isArray(field)) {
        return field; // Retorna o array de strings diretamente
    } else if (field) {
        return [field]; // Retorna um array com o único valor
    } else {
        return [];
    }
}

export async function POST(req) {

    const formData = await req.formData();
    console.log(formData);
    
    const idClinic = formData.get('idClinic');

    const name = formData.get('name');
    const birth_date = formData.get('birth_date');
    const phone = formData.get('phone');
    const cpf = formData.get('cpf');
    const profession = formData.get('profession');
    const email = formData.get('email') ? formData.get('email') : '';
    const address = formData.get('address');
    const how_know_us = formData.get('how_know_us');

    const image = formData.get('image');

    const description = formData.get('description');
    const cause = formData.get('cause');

    const discomforts = getFieldValues(formData.getAll('discomforts[]'));

    const frequency = formData.get('frequency');

    const discomfortIncreases = getFieldValues(formData.getAll('discomfortIncreases[]'));
    const discomfortDecreases =  getFieldValues(formData.getAll('discomfortDecreases[]'));
    const geralState = getFieldValues(formData.getAll('geralState[]'));
    const headNeck = getFieldValues(formData.getAll('headNeck[]'));
    const thoraxRespiratory = getFieldValues(formData.getAll('thoraxRespiratory[]'));
    const cardioVascular = getFieldValues(formData.getAll('cardioVascular[]'));
    const gastroIntestinal = getFieldValues(formData.getAll('gastroIntestinal[]'));
    const genitoUrinary = getFieldValues(formData.getAll('genitoUrinary[]'));

    const fileBuffer = await image.arrayBuffer();
    const fileStream = Buffer.from(fileBuffer);
    let imageUrl;


    try {
        // Verificações
        if (email) {
            const isEmailAvailable = await prisma.patient.count({
                where: {
                    email,
                    idClinic: parseInt(idClinic)
                }
            }) === 0;

            if (!isEmailAvailable) {
                return NextResponse.json({ message: 'Email já cadastrado nesta clínica' }, { status: 400 });
            }
        }

        const isPhoneAvailable = await prisma.patient.count({
            where: {
                phone,
                idClinic: parseInt(idClinic)
            }
        }) === 0;

        const isCpfAvailable = await prisma.patient.count({
            where: {
                cpf,
                idClinic: parseInt(idClinic)
            }
        }) === 0;


        if (!isPhoneAvailable) {
            return NextResponse.json({ message: 'Telefone já cadastrado nesta clínica' }, { status: 400 });
        }

        if (!isCpfAvailable) {
            return NextResponse.json({ message: 'CPF já cadastrado nesta clínica' }, { status: 400 });
        }

        // Criação do paciente
        const patient = await prisma.patient.create({
            data: {
                name,
                birth_date,
                phone,
                cpf,
                profession,
                email,
                address,
                how_know_us,
                idClinic: parseInt(idClinic)
            }
        });



        

        if (image) {
            const uploadResult = await new Promise((resolve, reject) => {
                cloudinary.v2.uploader.upload_stream({ resource_type: "auto", public_id: `uncomfortableAreas_${patient.idClinic}` },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }).end(fileStream);
            });
            imageUrl = uploadResult.secure_url;

        }


        const symptomsData = {
            patientId: patient.idPatient,
            // uncomfortableAreas: imageUrl,
            uncomfortableAreas: imageUrl,

            description,
            cause,
            discomforts,
            frequency,

            discomfortIncreases,
            discomfortDecreases,

            geralState,
            headNeck,
            thoraxRespiratory,
            cardioVascular,
            gastroIntestinal : gastroIntestinal ? gastroIntestinal : [],
            genitoUrinary,
        };

        await prisma.symptom.create({
            data: symptomsData
        });

        return NextResponse.json({ message: 'Cadastrado com sucesso!' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Erro ao cadastrar' }, { status: 500 });
    }    
}