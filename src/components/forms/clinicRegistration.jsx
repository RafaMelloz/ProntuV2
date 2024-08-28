"use client"

import { GoUpload } from "react-icons/go";
import { InputText } from "../inputText"
import { InputFile } from "../inputFile"

import { useState } from "react";

export function ClinicRegistration() {

    const [inputFileData, setInputFileData] = useState("");
    const [register, setRegister] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileName = (event) => {
        const files = Array.from(event.target.files);
        const fileData = files.map(file => ({
            url: URL.createObjectURL(file),
            name: file.name
        }));
        setInputFileData(fileData);
        changeRegister('logoClinic', fileData[0].url);
    };

    const changeRegister = (id, value) => {
        setRegister(prevData => ({
            ...prevData,
            [id]: value,
        }));
    };

    const formValidation = () => {
        if (
            !register.responsibleName ||
            !register.cpfCnpj ||
            !register.address ||
            !register.email ||
            !register.phone ||
            !register.password ||
            !register.passwordConfirm ||
            !register.nameClinic
        ) {
            toastErrorAlert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }
        if (register.password !== register.passwordConfirm) {
            toastErrorAlert("As senhas não coincidem.");
            return;
        }
        formSubmit(register);
    };

    // const formSubmit = (data) => {
    //     setIsSubmitting(true);
    //     axios.post(`${process.env.API_URL}signup`, data)
    //         .then(function (res) {
    //             let clinic = res.data.codeClinic;
    //             let msg = res.data.msg;

    //             Swal.fire({
    //                 title: `${msg}`,
    //                 text: `O código da sua clínica é ${clinic}`,
    //                 icon: "success",
    //                 showConfirmButton: false,
    //                 timer: 1500
    //             })
    //         })
    //         .catch(function (err) {
    //             toastErrorAlert(err.response.data.error);
    //         })
    //         .finally(() => {
    //             setIsSubmitting(false);
    //         });
    // };
    return (
        <form className="w-full max-w-[628px] flex flex-col gap-3 px-5">
            <div>
                <h2 className="text-4xl font-semibold text-center sm:text-left">Crie uma conta</h2>
                <p className="text-center sm:text-left">Por favor, preencha os campos abaixo com as informações necessárias.</p>
            </div>

            <InputText InputId={"responsibleName"} labelName={'Nome completo:'} required={true} onChange={changeRegister} />

            <div className="flex justify-between gap-10">
                <InputText InputId={"cpfCnpj"} labelName={'CPF/CNPJ:'} required={true} onChange={changeRegister} />
                <InputText InputId={"address"} labelName={'Endereço:'} required={true} onChange={changeRegister} />
            </div>

            <div className="flex justify-between gap-10">
                <InputText InputId={"email"} labelName={'E-mail:'} required={true} onChange={changeRegister} />
                <InputText InputId={"phone"} labelName={'Telefone:'} required={true} onChange={changeRegister} />
            </div>

            <div className="flex justify-between  gap-10">
                <InputText InputId={"password"} password labelName={'Senha:'} required={true} onChange={changeRegister} />
                <InputText InputId={"passwordConfirm"} password labelName={'Confirme sua senha:'} required={true} onChange={changeRegister} />
            </div>

            <hr className="mt-3 border-black/40 dark:border-zinc-50/40" />

            <div className="flex justify-between gap-10">
                <InputText InputId={"nameClinic"} labelName={'Nome da clinica:'} required={true} onChange={changeRegister} />

                <InputFile label={'Logo da clínica'} name={'logoClinic'} func={handleFileName} inputFileData={inputFileData}/>
            </div>

            <div className="flex flex-col gap-3 items-center mt-3 sm:gap-0 sm:flex-row sm:justify-end">
                <button
                    onClick={formValidation}
                    type="button"
                    className={`bg-azul-900 text-white min-w-20 rounded-lg py-2.5 px-5 font-medium ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-azul-900/70'}`}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
                </button>
            </div>
        </form>
    )
}