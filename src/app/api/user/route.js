import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "argon2";
import cloudinary from 'cloudinary';
import { parse } from "path";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});


export async function PUT(req){
    const formData = await req.formData();    

    const clinicId = formData.get('clinicId');
    const userId = formData.get('userId');
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const image = formData.get('image')

    const fileBuffer = image ? await image.arrayBuffer() : null;
    const fileStream = fileBuffer !== null ? Buffer.from(fileBuffer) : null;
    let uploadResult
    

    try{
        const user = await prisma.user.findUnique({
            where: { idUser: parseInt(userId) },
            select: { profileImg: true, idClinic: true }
        });

        const isEmailAvailable = await prisma.user.count({
            where: {
                email,
                idUser: { not: parseInt(userId) }
            }
        }) === 0;

        if (!user || user.idClinic !== parseInt(clinicId)) {
            return NextResponse.json({message: 'Usuário não encontrado'}, {status: 404});
        }

        if (!isEmailAvailable) {
            return NextResponse.json({ message: 'Email não disponível' }, { status: 400 });
        }


        if (image && image.value === 'removed') {
            cloudinary.v2.uploader.destroy(`profileImg${userId}`)
        } else if (image) {
            if (user.profileImg) {
                cloudinary.v2.uploader.destroy(`profileImg${userId}`)
            }

            uploadResult = await new Promise((resolve, reject) => {
                cloudinary.v2.uploader.upload_stream({ resource_type: "auto", public_id: `profileImg${userId}` },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }).end(fileStream);
            });
        }
        	        

        if (password && password.value !== '') {
            const hashedPassword = await hash(password);
            await prisma.user.update({
                where: { idUser: parseInt(userId) },
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    profileImg: uploadResult ? uploadResult.secure_url : user.profileImg
                },
            });
        } else {
            await prisma.user.update({
                where: { idUser: parseInt(userId) },
                data: {
                    name,
                    email,
                    profileImg: uploadResult ? uploadResult.secure_url : user.profileImg
                }
            });
        }

        return NextResponse.json({ message: 'Usuário atualizado com sucesso!' });

    }catch(e){
        console.log(e)
        return NextResponse.json({message: 'Erro ao atualizar o usuário'}, {status: 500});
    }

}

