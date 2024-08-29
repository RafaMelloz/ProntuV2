"use client"

import { useState, useEffect } from "react";
import { causes, discomforts, frequencies } from "@/utils/inputsData";

export function Symptoms({ data, onDataChange }) {
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
        <section className='text-base font-medium max-w-screen-lg m-auto'>
            <h2 className='text-2xl text-center font-bold mb-5 textSwitch'>Descreva seus sintomas abaixo </h2>
            <label htmlFor="txt-sintoma" className='custom-label !block'>
                Sintomas: <span className="text-vermelho-900 font-bold">*</span><br />
                <textarea
                    name='description'
                    id='description'
                    className="w-full h-24 custom-input resize-none mt-2"
                    value={localData['description'] || ""}
                    onChange={handleChange}
                ></textarea>
            </label>

            <h3 className='text-center font-medium my-5 text-lg md:text-xl textSwitch'>Como começaram os sintomas? <span className="text-vermelho-900 font-bold">*</span></h3>
            <div className='flex  w-full justify-center gap-2 flex-col min-[710px]:flex-row'>
                {causes.map((cause) => (
                    <div key={cause.id}>
                        <input
                            type="radio"
                            id={cause.id}
                            name='cause'
                            value={cause.name}
                            className="radio-input"
                            checked={localData.cause === cause.name}
                            onChange={handleChange}
                        />
                        <label htmlFor={cause.id} className="radio-label">{cause.name}</label>
                    </div>
                ))}
            </div>

            <h3 className='text-center font-medium my-5 text-lg md:text-xl textSwitch'>Qual o tipo de desconforto? (selecione todas as opções compatíveis) <span className="text-vermelho-900 font-bold">*</span></h3>
            <div className='flex flex-wrap gap-1 m-auto justify-center max-w-[700px] w-full flex-col min-[520px]:flex-row'>
                {discomforts.map((discomfort) => (
                    <div className='w-full min-[520px]:w-[24%]' key={discomfort.id}>
                        <input
                            type="checkbox"
                            id={discomfort.id}
                            name='discomforts'
                            value={discomfort.name}
                            className="radio-input"
                            checked={(localData.discomforts || []).includes(discomfort.name)}
                            onChange={handleChange}
                        />
                        <label htmlFor={discomfort.id} className="radio-label justify-center">{discomfort.name}</label>
                    </div>
                ))}
            </div>

            <h3 className='text-center font-medium my-5 text-lg md:text-xl textSwitch'>Qual a frequência dos sintomas? <span className="text-vermelho-900 font-bold">*</span></h3>

            <div className='flex justify-center gap-2 items-end'>
                {frequencies.map((frequency) => (
                    <div key={frequency.id} className='input-escada'>
                        <input
                            type="radio"
                            id={frequency.id}
                            name="frequency"
                            value={frequency.name}
                            className="radio-input"
                            checked={localData.frequency === frequency.name}
                            onChange={handleChange}
                        />
                        <label htmlFor={frequency.id} className="radio-label !items-end">{frequency.name}</label>
                    </div>
                ))}
            </div>
        </section>
    );
}