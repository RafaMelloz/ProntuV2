"use client"

import { useEffect, useState } from "react";
import { GoUpload } from "react-icons/go";
import { InputText } from "@/components/inputText";
import { errorAlert, loadingAlert } from "@/utils/alerts";
import { api } from "@/lib/axios";
import { useSession } from "next-auth/react";
import { InputFile } from "@/components/inputFile";

export const ClinicConfig = () => {
    const [loadingForm, setLoadingForm] = useState(false);
    const { data: session, update } = useSession();    

    const [editClinic, setEditClinic] = useState({
        nameClinic: session?.user?.clinic?.nameClinic || '',
    });

    const [removeLogo, setRemoveLogo] = useState(false);
    const [inputFileData, setInputFileData] = useState(null);

    const handleFileName = (event) => {
        const file = event.target.files[0];
        const fileData = {
            name: file.name
        };
        setInputFileData(fileData);
        changeDataClinic('logoClinic', file);
    };

    const changeDataClinic = (id, value) => {
        setEditClinic(prevData => ({
            ...prevData,
            [id]: value,
        }));
    };

    const removeLogoClinic = () => {
        setRemoveLogo(!removeLogo);
        setInputFileData(null);

        if (!removeLogo) {
            changeDataClinic('logoClinic', 'removed');
        } else {
            changeDataClinic('logoClinic', null);
        }
    };

    const validateForm = () => {
        if (!editClinic.nameClinic) {
            errorAlert('Campo nome não pode estar vazio!');
            return false;
        }
        submitForm();
    };

    const submitForm = async () => {
        setLoadingForm(true);
        const { nameClinic, logoClinic } = editClinic;

        const promise = api.put('/api/clinic', {
            nameClinic,
            logoClinic,
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
            update({ name: session.user.name, email: session.user.email, img: session.user.img, clinic: { nameClinic, logoClinic: newImage } });
        });

        setTimeout(() => {
            window.location.reload()
        }, 1000);
    };

    return (
        <section className="w-full !h-full">
            <h2 className="text-2xl font-semibold">Clinica</h2>
            <h3 className="text-lg mt-5 font-semibold">Código da clinica: <span className="border ml-2 border-azul-900 bg-azul-900/10 rounded py-1 px-2">{session.user.clinic.codeClinic}</span></h3>
            <div className="flex gap-10 my-5 items-end">
                <InputText InputId="nameClinic" labelName="Nome da clinica:" onChange={changeDataClinic} val={session.user.clinic.nameClinic} />
                {!removeLogo && (
                    <InputFile name={"logoClinic"} inputFileData={inputFileData} func={handleFileName}/>
                )}

                <button disabled={loadingForm} className={`text-white rounded-md py-2 font-semibold text-nowrap px-4 ${loadingForm ? "bg-azul-900/50 cursor-not-allowed" : "bg-azul-900"}`} onClick={validateForm}>
                    Salvar alterações
                </button>
            </div>

                {session.user.clinic.logoClinic && (
                    <div className="w-full flex justify-end">
                        <label htmlFor="removeLogo" className="text-black dark:text-white font-medium block">
                            Remover logo:
                            <input type="checkbox" id="removeLogo" name="removeLogo" className="ml-2" onChange={removeLogoClinic} />
                        </label>
                    </div>
                )}
                
        </section>
    )
}
