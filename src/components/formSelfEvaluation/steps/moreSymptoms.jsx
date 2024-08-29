"use client"

import { useState, useEffect } from "react";
import { discomfortIncreases, discomfortDecreases, geralState, headNeck, thoraxRespiratory, cardioVascular, gastroIntestinal, genitoUrinary } from "@/utils/inputsData";

export function MoreSymptoms({ data, onDataChange }) {
    const [localData, setLocalData] = useState(data);

    useEffect(() => {
        setLocalData(data);
    }, [data]);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        let updatedData;

        if (type === 'checkbox') {
            const currentValues = localData[name] || [];
            updatedData = {
                ...localData,
                [name]: checked
                    ? [...currentValues, value]
                    : currentValues.filter(item => item !== value)
            };
        } else {
            updatedData = { ...localData, [name]: value };
        }

        setLocalData(updatedData);
        onDataChange(updatedData);
    };

    return (
        <div className="text-base font-medium textSwitch">
            <div className="flex flex-col items-center lg:flex-row lg:justify-between">
                <div className="w-full  lg:w-[47%]">
                    <h3 className="font-medium my-5 text-xl text-center textSwitch">
                        O desconforto aumenta com:<br />
                        (selecione todas as opções compatíveis) <span className="text-vermelho-900 font-bold">*</span>
                    </h3>
                    <div className="flex flex-col items-center gap-1 sm:flex-row sm:justify-center sm:flex-wrap">
                        {discomfortIncreases.map((discomfort) => (
                            <div key={discomfort.id} className='w-full sm:w-[24%] text-sm'>
                                <input
                                    type="checkbox"
                                    id={discomfort.id}
                                    name='discomfortIncreases'
                                    value={discomfort.name}
                                    className="radio-input"
                                    checked={(localData.discomfortIncreases || []).includes(discomfort.name)}
                                    onChange={handleChange}
                                />
                                <label htmlFor={discomfort.id} className="radio-label">{discomfort.name}</label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-full lg:w-[47%]">
                    <h3 className="font-medium my-5 text-xl text-center textSwitch">
                        O desconforto diminui com:<br />
                        (selecione todas as opções compatíveis) <span className="text-vermelho-900 font-bold">*</span>
                    </h3>
                    <div className="flex flex-col items-center gap-1 sm:flex-row sm:justify-center sm:flex-wrap">
                        {discomfortDecreases.map((discomfort) => (
                            <div key={discomfort.id} id={`ajusteInput${discomfort.id}`} className='w-full sm:w-[24%] text-sm'>
                                <input
                                    type="checkbox"
                                    id={discomfort.id}
                                    name='discomfortDecreases'
                                    value={discomfort.name}
                                    className="radio-input"
                                    checked={(localData.discomfortDecreases || []).includes(discomfort.name)}
                                    onChange={handleChange}
                                />
                                <label htmlFor={discomfort.id} className="radio-label">{discomfort.name}</label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <h2 className='text-center font-medium mt-9 text-xl md:text-2xl textSwitch'>Selecione as informações sobre sua saúde em geral e qualidade de vida:</h2>

            <div className='flex flex-col items-center min-[860px]:items-stretch min-[860px]:flex-row min-[860px]:justify-between'>

                <div className='w-full min-[860px]:w-[19%]'>
                    <h3 className='text-base text-center font-medium mt-9 textSwitch'>Estado Geral</h3>
                    {geralState.map((state) => (
                        <div key={state.id} className='text-sm text-center mb-2'>
                            <input
                                type="checkbox"
                                id={state.id}
                                name='geralState'
                                value={state.name}
                                className="radio-input"
                                checked={(localData.geralState || []).includes(state.name)}
                                onChange={handleChange}
                            />
                            <label htmlFor={state.id} className="radio-label">{state.name}</label>
                        </div>
                    ))}
                </div>

                <div className='w-full min-[860px]:w-[19%]'>
                    <h3 className='text-base text-center font-medium mt-9 textSwitch'>Cabeça e Pescoço</h3>
                    {headNeck.map((state) => (
                        <div key={state.id} className='text-sm text-center mb-2'>
                            <input
                                type="checkbox"
                                id={state.id}
                                name='headNeck'
                                value={state.name}
                                className="radio-input"
                                checked={(localData.headNeck || []).includes(state.name)}
                                onChange={handleChange}
                            />
                            <label htmlFor={state.id} className="radio-label">{state.name}</label>
                        </div>
                    ))}
                </div>

                <div className='w-full min-[860px]:w-[19%]'>
                    <h3 className='text-base text-center font-medium mt-9 textSwitch'>Tórax/Respiratório</h3>
                    {thoraxRespiratory.map((state) => (
                        <div key={state.id} className='text-sm text-center mb-2'>
                            <input
                                type="checkbox"
                                id={state.id}
                                name='thoraxRespiratory'
                                value={state.name}
                                className="radio-input"
                                checked={(localData.thoraxRespiratory || []).includes(state.name)}
                                onChange={handleChange}
                            />
                            <label htmlFor={state.id} className="radio-label">{state.name}</label>
                        </div>
                    ))}
                </div>

                <div className='w-full min-[860px]:w-[19%]'>
                    <h3 className='text-base text-center font-medium mt-9 textSwitch'>Cardio-Vascular</h3>
                    {cardioVascular.map((state) => (
                        <div key={state.id} className='text-sm text-center mb-2'>
                            <input
                                type="checkbox"
                                id={state.id}
                                name='cardioVascular'
                                value={state.name}
                                className="radio-input"
                                checked={(localData.cardioVascular || []).includes(state.name)}
                                onChange={handleChange}
                            />
                            <label htmlFor={state.id} className="radio-label">{state.name}</label>
                        </div>
                    ))}

                    <div>
                        <h3 className='text-base text-center font-medium mt-9 textSwitch'>Gastro-Intestinal</h3>
                        {gastroIntestinal.map((state) => (
                            <div key={state.id} className='text-sm text-center mb-2'>
                                <input
                                    type="checkbox"
                                    id={state.id}
                                    name='gastroIntestinal'
                                    value={state.name}
                                    className="radio-input"
                                    checked={(localData.gastroIntestinal || []).includes(state.name)}
                                    onChange={handleChange}
                                />
                                <label htmlFor={state.id} className="radio-label">{state.name}</label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className='w-full min-[860px]:w-[19%]'>
                    <h3 className='text-base text-center font-medium mt-9 textSwitch'>Gênito-Urinário</h3>
                    {genitoUrinary.map((state) => (
                        <div key={state.id} className='text-sm text-center mb-2'>
                            <input
                                type="checkbox"
                                id={state.id}
                                name='genitoUrinary'
                                value={state.name}
                                className="radio-input"
                                checked={(localData.genitoUrinary || []).includes(state.name)}
                                onChange={handleChange}
                            />
                            <label htmlFor={state.id} className="radio-label">{state.name}</label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}