"use client"

import { useState } from "react";
import { InputText } from "../inputText";
import { signIn } from "next-auth/react";
import { errorAlert } from "@/utils/alerts";
import { useRouter } from "next/navigation";

export function Login() {
    const [statusLogin, setStatusLogin] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loginData, setDataLogin] = useState({});

    const router = useRouter()

    const changeLoginData = (id, value) => {
        setDataLogin((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };


    const formValidationLogin = (e) => {
        e.preventDefault();
        if (!loginData.codeClinic || !loginData.email || !loginData.password) {
            errorAlert("Por favor, preencha todos os campos.");
            return;
        }
        const formateData = {
            ...loginData,
            codeClinic: loginData.codeClinic.toUpperCase(),
        };
        formSubmitLogin(formateData);
    };

    const formSubmitLogin = async (data) => {
        const signInData = await signIn("credentials", {
            codeClinic: data.codeClinic,
            email: data.email,
            password: data.password,
            redirect: false,
        });
        
       if (signInData.error) {
         errorAlert(signInData.error);   
       } else{
              router.push("/inicio/calendario");
       }
        
    };


    return (
            <section className="bg-white dark:bg-dark-900 w-full flex items-center justify-center textSwitch">
                {statusLogin === false ? (
                    <form className="w-full max-w-[440px] flex flex-col gap-5 px-5">
                        <div className="mb-5">
                            <h2 className="text-4xl font-semibold text-center sm:text-left">Olá</h2>
                            <p className="text-center sm:text-left">Informe seus dados para acessar a plataforma.</p>
                        </div>

                        <InputText
                            InputId={"codeClinic"}
                            onChange={changeLoginData}
                            labelName={'Código da clínica:'}
                            classInput={'uppercase'}
                            val={loginData.codeClinic}
                        />
                        <InputText
                            InputId={"email"}
                            onChange={changeLoginData}
                            labelName={'Email:'}
                            val={loginData.email}
                        />
                        <InputText
                            InputId={"password"}
                            onChange={changeLoginData}
                            labelName={'Senha:'}
                            password={true}
                            val={loginData.password}
                        />

                        <div className="flex flex-col gap-3 overflow-hidden sm:h-11 items-center sm:gap-0 sm:flex-row sm:justify-between">
                            <button type="button" onClick={() => setStatusLogin(true)} className="border-2 border-azul-900 text-azul-900 rounded-lg py-2 px-4 ">
                                Esqueci minha senha
                            </button>

                        <button type="submit" onClick={(e) => formValidationLogin(e)} className="border-2 border-azul-900 bg-azul-900 text-white rounded-lg py-2 px-4 ">
                                Entrar
                            </button>
                        </div>
                    </form>
                ) : (
                    <form className="w-full max-w-[440px] flex flex-col gap-5 px-5">
                        <div className="mb-5">
                            <h2 className="text-xl sm:text-4xl font-semibold text-center sm:text-left">Recuperação de senha</h2>
                            <p className="text-center sm:text-left">Informe os dados necessários para recuperar sua senha</p>
                        </div>

                        <InputText
                            InputId={"codeClinic"}
                            onChange={changeLoginData}
                            labelName={'Código da clínica:'}
                            classInput={'uppercase'}
                            val={loginData.codeClinic}
                        />
                        <InputText
                            InputId={"email"}
                            onChange={changeLoginData}
                            labelName={'Email:'}
                            val={loginData.email}
                        />

                        <div className="flex flex-col-reverse gap-3 items-center sm:gap-0 sm:flex-row sm:justify-between">
                            <button type="button" onClick={() => setStatusLogin(false)} className="border-2 border-azul-900 text-azul-900 rounded-lg py-2 px-4">
                                Voltar
                            </button>

                            <button type="button" className="bg-azul-900 text-white rounded-lg py-2 px-4 hover:bg-azul-900/70">
                                Enviar recuperação de senha
                            </button>
                        </div>
                    </form>
                )}
            </section>
    );
}