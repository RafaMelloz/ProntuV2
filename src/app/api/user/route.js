import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "argon2";
import cloudinary from 'cloudinary';
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});


export async function PUT(req) {

    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: 'Rota indisponível' }, { status: 401 });
    }

    const formData = await req.formData();

    const clinicId = formData.get('clinicId');
    const userId = formData.get('userId');
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const image = formData.get('image')

    const fileBuffer = image && image !== "removed" ? await image.arrayBuffer() : null;
    const fileStream = fileBuffer !== null ? Buffer.from(fileBuffer) : null;
    let imgUrl;

    try {
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
            return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
        }

        if (!isEmailAvailable) {
            return NextResponse.json({ message: 'Email não disponível' }, { status: 400 });
        }

        if (image && image === 'removed') {
            await cloudinary.v2.uploader.destroy(`profileImg${userId}`);
            imgUrl = "";
        } else if (image) {
            if (user.profileImg) {
                await cloudinary.v2.uploader.destroy(`profileImg${userId}`);
            }

            imgUrl = await new Promise((resolve, reject) => {
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

        const updatedProfileImg = image === "removed" ? ""
            : imgUrl && imgUrl.secure_url ? imgUrl.secure_url
            : user.profileImg;

        const dataToUpdate = {
            name,
            email,
            profileImg: updatedProfileImg
        };

        if (password && password.value !== '') {
            dataToUpdate.password = await hash(password);
        }

        await prisma.user.update({
            where: { idUser: parseInt(userId) },
            data: dataToUpdate
        });

        return NextResponse.json({ message: 'Usuário atualizado com sucesso!', image: updatedProfileImg });

    } catch (e) {
        console.log(e);
        return NextResponse.json({ message: 'Erro ao atualizar o usuário' }, { status: 500 });
    }
}


