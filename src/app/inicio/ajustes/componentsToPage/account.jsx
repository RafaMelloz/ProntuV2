"use client"

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";


import { ThemeSwitch } from "@/components/themeSwitch";
import { InputText } from "@/components/inputText";
import { InputFile } from "@/components/inputFile";



import { GoUpload } from "react-icons/go";
import { isValidEmail } from "@/utils/validations";
import { errorAlert, loadingAlert } from "@/utils/alerts"
import { useSession } from "next-auth/react";


export function Account() {
    const [loadingForm, setLoadingForm] = useState(false);
    const [editProfile, setEditProfile] = useState({});
    const [removeImg, setRemoveImg] = useState(false);
    const [inputFileData, setInputFileData] = useState(null);

    const { data: session, update } = useSession();    
    const handleFileName = (event) => {
        const file = event.target.files[0];
        const fileData = {
            name: file.name
        };
        setInputFileData(fileData);
        changeDataProfile('image', file);
    };

    const removeImgProfile = () => {
        setRemoveImg(!removeImg);
        setInputFileData(null);

        if (!removeImg) {
            changeDataProfile('image', 'removed');
        } else {
            changeDataProfile('image', null);
        }
    };

    const changeDataProfile = (id, value) => {
        setEditProfile(prevData => ({
            ...prevData,
            [id]: value,
        }));
    };

    const validateForm = () => {
        const { name, email, password, confirmPassword } = editProfile;

        if (!name && !email) {
            errorAlert('Nome e Email devem ser preenchidos!');
        } else if (!isValidEmail(email)) {
            errorAlert('Email inválido!');
        } else if (password && !confirmPassword) {
            errorAlert('Confirme sua senha!');
        } else if (password && password !== confirmPassword) {
            errorAlert('Senhas não conferem!');
        } else if (password && password.length < 6) {
            errorAlert('Senha deve ter no mínimo 6 caracteres!');
        } else {
            submitForm();
        }
    }

    const submitForm = async () => {
        setLoadingForm(true);
        const { name, email, password, image } = editProfile;

        const promise = api.put('/api/user', {
            name,
            email,
            password,
            image,
            userId: session.user.id,
            clinicId: session.user.clinic.id,
        }, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        loadingAlert("Atualizando...", promise);
        
        let newImage = (await promise).data.image;

        promise.finally(() => {
            setLoadingForm(false)
            update({ name, email, img: newImage, clinic: { nameClinic: session.user.clinic.nameClinic, logoClinic: session.user.clinic.logoClinic } });
        });               

        setTimeout(() => {
            window.location.reload()
        }, 100);
    };

    useEffect(() => {
        changeDataProfile('name', session.user.name);
        changeDataProfile('email', session.user.email);
    }, []);
    


    return (
        <section className="w-full !h-full">
            <div className="flex justify-between items-center">
                <h2 className="text-black dark:text-white text-2xl font-semibold mb-2">Conta</h2>
                <ThemeSwitch />
            </div>

            {!removeImg && (
                <InputFile name={"fotoPerfil"} inputFileData={inputFileData} func={handleFileName}/>
            )}

            {session.user.img && (
                <div className="w-full flex d">
                    <label htmlFor="removeLogo" className="text-black dark:text-white font-medium block mt-2">
                        Remover foto de perfil:
                        <input type="checkbox" id="removeLogo" name="removeLogo" className="ml-2" onChange={removeImgProfile} />
                    </label>
                </div>
            )}


            <div className="flex gap-5 w-full mt-4">
                <InputText InputId="name" labelName="Nome:" onChange={changeDataProfile} val={session.user.name} />
                <InputText InputId="email" labelName="E-mail:" onChange={changeDataProfile} val={session.user.email} />
            </div>

            <h2 className="text-black dark:text-white text-2xl font-semibold my-5">Redefinição de senha</h2>

            <div className="flex gap-5 w-full">
                <InputText InputId="password" labelName="Nova senha:" password onChange={changeDataProfile} />
                <InputText InputId="confirmPassword" labelName="Confirme sua senha:" password onChange={changeDataProfile} />
            </div>

            <div className="w-full flex justify-end mt-5">
                <button disabled={loadingForm} className={`text-white rounded-md py-2 px-4 ${loadingForm ? "bg-azul-900/50 cursor-not-allowed" : "bg-azul-900"}`} onClick={validateForm}>
                    Salvar alterações
                </button>
            </div>
        </section>
    )
}