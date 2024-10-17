"use client"

import { useState } from "react";
import Link from "next/link";
import { PersonalDetails } from "@/components/formSelfEvaluation/steps/personalDetails";
import { errorAlert, loadingAlert } from "@/utils/alerts";
import { isValidCPF, isValidDate, isValidEmail } from "@/utils/validations";
import { api } from "@/lib/axios";


export default function NewPatient({params}) {   
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        personalDetails: {},
    });

    const handleDataChange = (step, data) => {
        setFormData(prevFormData => ({
            ...prevFormData,
            [step]: data
        }));
    };
    
    const validationForm = () => {
        const { personalDetails } = formData;

        if (!personalDetails.name ||
            !personalDetails.birth_date ||
            !personalDetails.phone ||
            !personalDetails.profession ||
            !personalDetails.how_know_us) {
            errorAlert(`Preencha todos os campos obrigatórios!`);
        } else if (personalDetails.cpf && !isValidCPF(personalDetails.cpf)) {
            errorAlert('CPF inválido!');
        }
        else if (personalDetails.email && !isValidEmail(personalDetails.email)) {
            errorAlert('Email inválido!');

        }

        else if (!isValidDate(personalDetails.birth_date)) {
            errorAlert('Data de nascimento inválida!');
        } else if (personalDetails.phone.length < 14) {
            errorAlert('Telefone inválido!');
        } else {
            submitForm()
        }
    }

    const submitForm = async () => {
        setLoading(true);

        const { name, birth_date, phone, cpf, profession, email, address, how_know_us } = formData.personalDetails;

        const promise = api.post('/api/patient', {
            name,
            birth_date,
            phone,
            cpf,
            profession,
            email,
            address,
            how_know_us
        }, {
            params: {
                clinicId: params.clinic
            }
        });

        loadingAlert("Cadastrando...", promise);

        promise.then((response) => {
            if (response.status === 200) {
                window.location.reload()
                clearForm()
            }
        }).finally(() => {
            setLoading(false)
        });
    };

    const clearForm = () => {
        setFormData({
            personalDetails: {},
        });
    }

    return(
        <section>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-medium text-center pt-8 pb-2 text-azul-900">Pré-cadastro - Prontuário de Atendimento de Quiropraxia</h2>
            <form className="overflow-y-auto max-h-[calc(100vh-270px)]">
                <PersonalDetails data={formData.personalDetails} onDataChange={(data) => handleDataChange('personalDetails', data)} />
            </form>

            <div className="flex w-full flex-row justify-between pt-6 gap-0">
                <Link href={'/inicio/pacientes'}
                    className={`w-full rounded-md bg-transparent text-azul-900 py-2 max-w-20 text-base min-[470px]:text-lg min-[470px]:max-w-32 border border-azul-900 text-center`}
                >
                    Cancelar
                </Link>

                <button
                    onClick={validationForm}
                    disabled={loading}
                    className={`w-full rounded-md text-white py-2 max-w-20 text-base min-[470px]:text-lg  ${loading ? 'min-[470px]:max-w-40 bg-verde-900/50 cursor-not-allowed' : 'min-[470px]:max-w-32 bg-verde-900'}`}
                >
                    Concluir
                </button>
            </div>
        </section>
    )
}