"use client"

import { useState } from "react";
import { InputText } from "../inputText";
import Link from "next/link";
import { errorAlert, loadingAlert } from "@/utils/alerts";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";

export function Reset(){
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passwordResetData, setPasswordResetData] = useState({});
    const router = useRouter();


    const changeData = (id, value) => {
        setPasswordResetData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };


    const formValidation = (e) => {
        e.preventDefault();
        if (!passwordResetData.token || !passwordResetData.email || !passwordResetData.password) {
            errorAlert("Por favor, preencha todos os campos.");
            return;
        }
        
        formSubmit();
    };

    const formSubmit = async () => {

        setIsSubmitting(true);
        const promise = api.post("/api/resetPassword", {
            token: passwordResetData.token,
            email: passwordResetData.email,
            password: passwordResetData.password,
        });


        loadingAlert('Atualizando senha...', promise);

        promise
            .then((response) => {
                if (response.status === 200) { // Verifica se o status da resposta é de sucesso
                    router.push("/login");  // Recarrega a página se a resposta for sucesso
                }
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    return(
        <section className="bg-white dark:bg-dark-900 w-full flex items-center justify-center textSwitch">
            <form className="w-full max-w-[440px] flex flex-col gap-5 px-5">
                <div className="mb-5">
                    <h2 className="text-xl sm:text-4xl font-semibold text-center sm:text-left">Trocar senha</h2>
                    <p className="text-center sm:text-left">Informe o token recebido por email e sua nova senha</p>
                </div>

                <InputText
                    InputId={"token"}
                    onChange={changeData}
                    labelName={'Token'}
                    val={passwordResetData.token}
                />
                <InputText
                    InputId={"email"}
                    onChange={changeData}
                    labelName={'Email'}
                    val={passwordResetData.email}
                />
                <InputText
                    InputId={"password"}
                    onChange={changeData}
                    labelName={'Nova senha'}
                    val={passwordResetData.password}
                    password={true}
                />

                <div className="flex flex-col-reverse gap-3 items-center sm:gap-0 sm:flex-row sm:justify-between">
                    <Link href={"/login"} className="border-2 border-azul-900 text-azul-900 rounded-lg py-2 px-4">
                        Voltar
                    </Link>

                    <button type="submit" disabled={isSubmitting} onClick={(e) => formValidation(e)} className={`border-2 text-white rounded-lg py-2 px-4 ${isSubmitting ? "bg-azul-900/50 border-azul-900/20 cursor-not-allowed" : "border-azul-900 bg-azul-900"}`}>
                        Enviar recuperação de senha
                    </button>
                </div>
            </form>
        </section>
    )
}