"use client"

import { InputText } from "../inputText"
import { InputFile } from "../inputFile"
import { errorAlert, loadingAlert } from "@/utils/alerts";
import { api } from "@/lib/axios";

import { useState } from "react";
import { formatCardExpiry, formatCardNumber } from "@/utils/mask";
import Image from "next/image";

export function ClinicRegistration() {
    const plans = [
        { id: 'monthly', name: 'Mensal' },
        { id: 'quarterly', name: 'Trimestral' },
        { id: 'semi-yearly', name: 'Semestral' },
        { id: 'yearly', name: 'Anual' }
    ]

    const [step, setStep] = useState(2);
    const [inputFileData, setInputFileData] = useState("");
    const [register, setRegister] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    
    const handleFileName = (event) => {
        const file = event.target.files[0];
        const fileData = {
            name: file.name
        };
        setInputFileData(fileData);
        changeRegister('logoClinic', file);
    };


    const changeRegister = (id, value) => {
        setRegister(prevData => ({
            ...prevData,
            [id]: value,
        }));
    };

    const formValidation = () => {
       if (step === 1) {
           if (
               !register.responsibleName ||
               !register.cpf ||
               !register.address ||
               !register.email ||
               !register.phone ||
               !register.password ||
               !register.passwordConfirm ||
               !register.nameClinic
           ) {
               errorAlert("Preencha todos os campos obrigatórios");
               return;
           }
           if (register.password !== register.passwordConfirm) {
               errorAlert("As senhas não coincidem");
               return;
           }
        //    formSubmit(register);
           setStep(2);
       }

         if (step === 2) {
            if (
                !register.numCard ||
                !register.dateValid ||
                !register.cvv ||
                !register.nameCard ||
                !register.plan
            ) {
                errorAlert("Preencha os dados de pagamento");
                console.log(register);
                
                return;
            }
            console.log(register);
        }
    };


    const formSubmit = async (data) => {
        setIsSubmitting(true);

        const promise = api.post("/api/clinic", {
            nameClinic: data.nameClinic,
            logoClinic: data.logoClinic,
            address: data.address ? data.address : null,
            cpfCnpj: data.cpfCnpj,
            responsibleName: data.responsibleName,
            email: data.email,
            phone: data.phone,
            password: data.password
        },{
            headers:{
                'Content-Type': 'multipart/form-data'
            }
        });
        // Use toast.promise com a Promise
        loadingAlert("Cadastrando...", promise);
        
        // Garantir que isSubmitting será atualizado após a requisição
        promise.finally(() => {
            setIsSubmitting(false)
        });        
    }

    return (
        <form className="w-full h-full max-w-[628px] p-5">

            <section className="h-[90%] flex flex-col gap-3 justify-center">
                {step === 1 ? (
                    <>
                        <div>
                            <h2 className="text-4xl font-semibold text-center sm:text-left">Crie uma conta</h2>
                            <p className="text-center sm:text-left">Por favor, preencha os campos abaixo com as informações necessárias.</p>
                        </div>

                        <InputText InputId={"responsibleName"} labelName={'Nome completo:'} required={true} onChange={changeRegister} val={register.responsibleName || ""} />

                        <div className="flex justify-between gap-10">
                            <InputText InputId={"cpf"} labelName={'CPF/CNPJ:'} required={true} onChange={changeRegister} val={register.cpf || ""} />
                            <InputText InputId={"address"} labelName={'Endereço:'} required={true} onChange={changeRegister} val={register.address || ""} />
                        </div>

                        <div className="flex justify-between gap-10">
                            <InputText InputId={"email"} labelName={'E-mail:'} required={true} onChange={changeRegister} val={register.email || ""} />
                            <InputText InputId={"phone"} labelName={'Telefone:'} required={true} onChange={changeRegister} mask={"phone"} val={register.phone || ""} max={14} />
                        </div>

                        <div className="flex justify-between  gap-10">
                            <InputText InputId={"password"} password labelName={'Senha:'} required={true} onChange={changeRegister} val={register.password || ""} />
                            <InputText InputId={"passwordConfirm"} password labelName={'Confirme sua senha:'} required={true} onChange={changeRegister} val={register.passwordConfirm || ""} />
                        </div>

                        <hr className="mt-3 border-black/40 dark:border-zinc-50/40" />

                        <div className="flex justify-between gap-10">
                            <InputText InputId={"nameClinic"} labelName={'Nome da clinica:'} required={true} onChange={changeRegister} val={register.nameClinic || ""} />
                            <InputFile label={'Logo da clínica'} name={'logoClinic'} func={handleFileName} inputFileData={inputFileData} />
                        </div>
                    </>
                ): (
                    <>
                        <div>
                            <h2 className="text-4xl font-semibold text-center sm:text-left">Pagamento</h2>
                            <p className="text-center sm:text-left">Registre seu cartão de crédito com segurança. E fique tranquilo, a cobrança é realizada mensalmente no dia de sua escolha e não afetará seu limite disponível.</p>
                        </div>

                        {/* <InputText InputId={"numCard"} labelName={'Numero do cartão:'} required={true} onChange={changeRegister} val={register.numCard || ""} />

                        <div className="flex justify-between gap-10">
                            <InputText InputId={"dateValid"} labelName={'Data de vencimento:'} required={true} onChange={changeRegister} val={register.dateValid || ""} />
                            <InputText InputId={"cvv"} labelName={'CVV:'} required={true} onChange={changeRegister} val={register.cvv || ""} />
                        </div>

                        <div className="flex justify-between gap-10">
                            <InputText InputId={"nameCard"} labelName={'Nome impresso no cartão:'} required={true} onChange={changeRegister} val={register.nameCard || ""} />
                            <InputText InputId={"plan"} labelName={'Plano:'} required={true} onChange={changeRegister} val={register.plan || ""} />
                        </div> */}

                        <InputText InputId={"nameCard"} labelName={'Nome impresso no cartão:'} required={true} onChange={changeRegister} val={register.nameCard || ""} />

                        <label className="font-medium">Informações do cartão <span className="text-vermelho-900">*</span></label>
                        <div className="w-full border border-cinza-700 dark:border-dark-600 rounded-lg flex flex-col">

                            <div className="border-cinza-700 dark:border-dark-600 border-b w-full relative">
                                    <input
                                        type="text"
                                        id="numCard"
                                        placeholder="Numero do cartão"
                                        onChange={(e) => changeRegister('numCard', formatCardNumber(e.target.value))}
                                        maxLength={19}
                                        value={formatCardNumber(register.numCard) || ""}
                                        className="focus:outline-0 rounded-t-lg px-2 py-[10px] w-full bg-azul-800 text-black  dark:bg-dark-800 dark:text-white"
                                    />

                                <div className="flex gap-2 absolute top-4 right-4">
                                    <Image src={"/assets/Visa.jpg"} width={24} height={16} alt="Visa" className="rounded border border-cinza-700 dark:border-dark-600"/>
                                    <Image src={"/assets/Mastercard.png"} width={24} height={16} alt="Mastercard" className="rounded border border-cinza-700 dark:border-dark-600"/>
                                </div>
                            </div>
                                
                            <div className="flex justify-between divide-x-2 divide-cinza-700 dark:divide-dark-600">
                                <input
                                    type="text"
                                    id="dateValid"
                                    placeholder="Data de vencimento"
                                    onChange={(e) => changeRegister('dateValid', formatCardExpiry(e.target.value))}
                                    value={formatCardExpiry(register.dateValid) || ""}
                                    className="focus:outline-0 w-1/2 rounded-bl px-2 py-[10px] bg-azul-800 text-black dark:bg-dark-800 dark:text-white"
                                    />
                                <input 
                                    id="cvv"
                                    type="text" 
                                    placeholder="CVV" 
                                    onChange={(e) => changeRegister('cvv', e.target.value)} 
                                    val={register.cvv || ""} 
                                    maxLength={3}
                                    className="focus:outline-0 w-1/2 rounded-br-lg px-2 py-[10px] bg-azul-800 text-black dark:bg-dark-800 dark:text-white"
                                />
                            </div>
                        </div>

                        <label className="font-medium">Tipo de plano: <span className="text-vermelho-900">*</span></label>
                        <div className='flex w-full gap-2 flex-col md:flex-row'>
                            {plans.map((plan) => (
                                <div key={plan.id} className="w-full">
                                    <input
                                        type="radio"
                                        id={plan.id}
                                        name='plans'
                                        value={plan.id}
                                        className="radio-input"
                                        checked={register.plan === plan.id}
                                        onChange={(e) => changeRegister('plan', e.target.value)}
                                    />
                                    <label htmlFor={plan.id} className="radio-label">{plan.name}</label>
                                </div>
                            ))}
                        </div>

                    </>
                )}
            </section>

            <div className={` flex flex-col gap-3 items-center mt-3 sm:gap-0 sm:flex-row ${step === 1 ? "sm:justify-end" : "sm:justify-between"} `}>
                {step != 1 && (
                    <button
                        type="button"
                        className={`border border-azul-900 text-azul-900 min-w-20 rounded-lg py-2.5 px-5 font-medium hover:bg-azul-900/10`}
                        onClick={() => setStep(1)}
                    >
                        Voltar
                    </button>
                )}

                <button
                    type="button"
                    className={`bg-azul-900 text-white min-w-20 rounded-lg py-2.5 px-5 font-medium ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-azul-900/70'}`}
                    disabled={isSubmitting}
                    onClick={formValidation}
                >
                    Cadastrar
                </button>
            </div>
        </form>
    )
}