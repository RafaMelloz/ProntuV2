"use client"

import { useRef, useState } from "react";

import { PersonalDetails } from "./steps/personalDetails";
import { UncomfortableAreas } from "./steps/uncomfortableAreas";
import { Symptoms } from "./steps/symptoms";
import { MoreSymptoms } from "./steps/moreSymptoms";


export function FormSelfEvaluation() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        personalDetails: {},
        uncomfortableAreas: {},
        symptoms: {},
        moreSymptoms: {}
    });
    const sectionScroll = useRef(null);
    const [modal, setModal] = useState(false);
    const [terms, setTerms] = useState(false);


    const scrollToTop = () => {
        if (sectionScroll.current) {
            sectionScroll.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    const handleDataChange = (step, data) => {
        setFormData(prevFormData => ({
            ...prevFormData,
            [step]: data
        }));
    };

    const getCompStep = () => {
        switch (step) {
            case 1:
                return <PersonalDetails data={formData.personalDetails} onDataChange={(data) => handleDataChange('personalDetails', data)} />;
            case 2:
                return <UncomfortableAreas setFormData={setFormData} />;
            case 3:
                return <Symptoms data={formData.symptoms} onDataChange={(data) => handleDataChange('symptoms', data)} />;
            case 4:
                return <MoreSymptoms data={formData.moreSymptoms} onDataChange={(data) => handleDataChange('moreSymptoms', data)} />;
            default:
                return <PersonalDetails data={formData.personalDetails} onDataChange={(data) => handleDataChange('personalDetails', data)} />;
        }
    };

    const conditionsForNextStep = () => {
        if (step !== 4) {
            setStep(step + 1);	
            scrollToTop(); 
        } else{
            setModal(true);
        }
        // const { personalDetails, uncomfortableAreas, symptoms, moreSymptoms } = formData;

        // if (step === 1) {
        //     if (!personalDetails.name || !personalDetails.birth_date || !personalDetails.phone || !personalDetails.cpf || !personalDetails.profession || !personalDetails.how_know_us) {
        //         toastErrorAlert('Preencha todos os campos obrigatórios para continuar!');
        //     } else if (!isValidCPF(personalDetails.cpf)) {
        //         toastErrorAlert('CPF inválido!');
        //     } else if (!isValidDate(personalDetails.birth_date)) {
        //         toastErrorAlert('Data de nascimento inválida!');
        //     } else if (personalDetails.phone.length < 14) {
        //         toastErrorAlert('Telefone inválido!');
        //     } else {
        //         setStep(step + 1);
        //         scrollToTop();
        //     }
        // }

        // if (step === 2) {
        //     if (!uncomfortableAreas.blob) {
        //         toastErrorAlert('Tire a captura da imagem!');
        //     } else {
        //         setStep(step + 1);
        //         scrollToTop();
        //     }
        // }

        // if (step === 3) {
        //     if (!symptoms.description || !symptoms.cause || !symptoms.discomforts || symptoms.discomforts.length === 0 || !symptoms.frequency) {
        //         toastErrorAlert('Preencha todos os campos obrigatórios para continuar!');
        //     } else {
        //         setStep(step + 1);
        //         scrollToTop();
        //     }
        // }

        // if (step === 4) {
        //     if (!moreSymptoms.discomfortIncreases || moreSymptoms.discomfortIncreases.length === 0 || !moreSymptoms.discomfortDecreases || moreSymptoms.discomfortDecreases.length === 0) {
        //         toastErrorAlert('Preencha todos os campos obrigatórios para continuar!');
        //     } else {
        //         setModal(true);
        //     }
        // }
    };

    const retornaStep = () => {
        setStep(step - 1);
        scrollToTop();
    };
    

    const cancelSubmit = () => {
        setModal(false);
        setStep(1);
        setTerms(false);
        scrollToTop();
    };

    const changeTerms = (e) => {
        setTerms(e.target.checked);
    }

    return (
        <main className="fit-container screen-with-subtitle pt-9 pb-5 flex flex-col justify-between" ref={sectionScroll} >
            <form className="overflow-y-auto sm:max-h-[calc(100vh-260px)]">
                {getCompStep()}
            </form>


            <div className="flex w-full flex-row justify-between gap-0  pt-3 sm:pt-0">
                <button
                    className={`w-full rounded-md py-2 max-w-20 text-base min-[470px]:text-lg min-[470px]:max-w-32 ${step === 1 ? 'bg-gray-500/20 border border-gray-500/20 cursor-not-allowed text-white' : 'bg-transparent text-azul-900 border border-azul-900'}`}
                    onClick={retornaStep}
                    disabled={step === 1}
                >
                    Voltar
                </button>

                <button
                    className={`w-full rounded-md py-2 max-w-20 text-base min-[470px]:text-lg min-[470px]:max-w-32 text-white 
                ${step === 4 ? 'bg-verde-900' : 'bg-azul-900'}`}
                    onClick={conditionsForNextStep}
                >
                    {step === 4 ? 'Concluir' : 'Próximo'}
                </button>
            </div> 

            {modal && (
                <div className="bg-[#000000cc] fixed z-50 top-0 right-0 left-0 bottom-0 h-full w-full">
                    <div className="p-4 max-w-xl mx-auto relative overflow-hidden  top-[50%] translate-y-[-50%]">
                        <div className="bg-white text-black dark:bg-dark-800 dark:text-white shadow w-full rounded-lg overflow-hidden block p-8">
                            <h3 className="text-azul-900 text-xl font-semibold">Deseja confirmar a auto-avaliação?</h3>
                            <span>Após concluída, as informações não poderão ser alteradas</span>

                            <div className="border border-azul-900 rounded-md mt-6 p-3">
                                <h4 className="text-azul-900 text-base font-semibold">Termo de compromisso</h4>
                                <label htmlFor="terms" className="flex items-center gap-4">
                                    <input id="terms" type="checkbox" value={terms} onChange={(e) => changeTerms(e)} />
                                    <span className="text-sm">
                                        Declaro que as informações anteriores prestadas são verdadeiras, e assumo a inteira responsabilidade pelas mesmas
                                    </span>
                                </label>
                            </div>
                            <span className="text-[0.68rem]">*As informações fornecidas estão protegidas segundo a lei LGPD (Lei Geral de Proteção de Dados).</span>

                            <div className="flex flex-wrap mt-6 justify-between ">
                                <button className="text-azul-900 border text-center center border-azul-900 rounded-lg p-3 text-nowrap" onClick={cancelSubmit}>
                                    Editar auto-avaliação
                                </button>

                                <button className="text-azul-900 border text-center center border-azul-900 rounded-lg p-3 text-nowrap" onClick={cancelSubmit}>
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )} 
        </main>
    )
}