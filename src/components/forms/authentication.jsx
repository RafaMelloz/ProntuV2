"use client"

import { useState } from "react";
import { InputText } from "../inputText";
import { signIn } from "next-auth/react";
import { errorAlert, loadingAlert } from "@/utils/alerts";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/axios";

export function Authentication() {
    const [statusLogin, setStatusLogin] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loginData, setDataLogin] = useState({});
    const router = useRouter();


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
        setIsSubmitting(true);
        const signInPromise = signIn("credentials", {
            codeClinic: data.codeClinic,
            email: data.email,
            password: data.password,
            redirect: false,
        });

        toast.promise(
            signInPromise.then((signInData) => {
                if (signInData.error) {
                    throw new Error(signInData.error); 
                     // Força o toast a exibir a mensagem de erro
                }
                return signInData;
            }),
            {
                loading: 'Fazendo login...',
                success: 'Login realizado com sucesso!',
                error: 'Erro no login. Por favor, verifique suas credenciais.',
            },
            {
                position: 'top-right'
            }
        ).then(() => {
            router.push("/inicio/calendario");
            setIsSubmitting(false);
        }).finally(() => {
            setIsSubmitting(false);
        });
    };

    const formForgotPassword = async (e) => {
        e.preventDefault();

        if (!loginData.codeClinic || !loginData.email) {
            errorAlert("Por favor, preencha todos os campos.");
            return;
        }

        const data = {
            ...loginData,
            codeClinic: loginData.codeClinic.toUpperCase(),
        };

        
        setIsSubmitting(true);
        const promise = api.post("/api/forgotPassword", {
            codeClinic: data.codeClinic,
            email: data.email,
        });
        	

        loadingAlert('Verificando usuário...', promise);

        promise
        .then((response) => {
            if (response.status === 200) { // Verifica se o status da resposta é de sucesso
                router.push("/resetarSenha"); 
            }
        })
        .finally(() => {
            setIsSubmitting(false);
        });
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

                            <button type="submit" disabled={isSubmitting} onClick={(e) => formValidationLogin(e)} className={`border-2 text-white rounded-lg py-2 px-4 ${isSubmitting ? "bg-azul-900/50 border-azul-900/20 cursor-not-allowed" : "border-azul-900 bg-azul-900"}`}>
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

                            <button type="submit" disabled={isSubmitting} onClick={(e) => formForgotPassword(e)} className={`border-2 text-white rounded-lg py-2 px-4 ${isSubmitting ? "bg-azul-900/50 border-azul-900/20 cursor-not-allowed" : "border-azul-900 bg-azul-900"}`}>
                                Enviar recuperação de senha
                            </button>
                        </div>
                    </form>
                )}
            </section>
    );
}