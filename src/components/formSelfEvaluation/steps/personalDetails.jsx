"use client"

import { useState, useEffect } from "react";
import { InputText } from "../../inputText";

export function PersonalDetails({ data, onDataChange }){
    const [localData, setLocalData] = useState(data);

    const optionComoConheceu = [
        { id: 'RedesSociais', name: 'Redes sociais' },
        { id: 'google', name: 'Google' },
        { id: 'indicacao', name: 'Indicação' },
        { id: 'outros', name: 'Outros' }
    ]

    useEffect(() => {
        setLocalData(data);
    }, [data]);

    const handleChange = (InputId, value) => {
        const updatedData = { ...localData, [InputId]: value };
        setLocalData(updatedData);
        onDataChange(updatedData);
    };

    const handleChangeRadio = (event) => {
        const { name, value } = event.target;
        const updatedData = { ...localData, [name]: value };
        setLocalData(updatedData);
        onDataChange(updatedData);
    };

    return (
        <section className="flex max-w-screen-lg m-auto flex-col gap-5 text-base font-medium">
            <InputText
                InputId={'name'}
                labelName={'Nome:'}
                onChange={handleChange}
                val={localData.name || ""}
                max={50}
                required
            />

            <div className="flex gap-5 flex-col md:flex-row">
                <InputText
                    InputId={'birth_date'}
                    labelName={'Data de nascimento:'}
                    onChange={handleChange}
                    val={localData.birth_date || ""}
                    classLabel={'md:w-1/3'}
                    mask="date"
                    max={10}
                    required
                />

                <InputText
                    InputId={'phone'}
                    labelName={'Telefone de Contato:'}
                    onChange={handleChange}
                    val={localData.phone || ""}
                    classLabel={'md:w-1/3'}
                    mask="phone"
                    max={14}
                    required
                />

                <InputText
                    InputId={'cpf'}
                    labelName={'CPF:'}
                    onChange={handleChange}
                    val={localData.cpf || ""}
                    classLabel={'md:w-1/3'}
                    mask="cpf"
                    max={14}
                />
            </div>

            <div className="flex gap-5 flex-col md:flex-row">
                <InputText
                    InputId={'profession'}
                    labelName={'Profissão:'}
                    onChange={handleChange}
                    val={localData.profession || ""}
                    classLabel={'md:w-1/4'}
                    max={30}
                    required
                />
                <InputText
                    InputId={'email'}
                    labelName={'E-mail:'}
                    onChange={handleChange}
                    val={localData.email || ""}
                    classLabel={'md:w-1/2'}
                    max={60}
                />
            </div>

            <InputText
                InputId={'address'}
                labelName={'Endereço:'}
                onChange={handleChange}
                val={localData.address || ""}
                max={60}
                required
            />


            <p className="textSwitch">Como você nos conheceu? <span className="text-vermelho-900 font-bold">*</span></p>
            <div className='flex  w-full gap-2 flex-col min-[710px]:flex-row'>
                {optionComoConheceu.map((option) => (
                    <div key={option.id} >
                        <input
                            type="radio"
                            id={option.id}
                            name='how_know_us'
                            value={option.name}
                            className="radio-input"
                            checked={localData.how_know_us === option.name}
                            onChange={handleChangeRadio}
                        />
                        <label htmlFor={option.id} className="radio-label">{option.name}</label>
                    </div>
                ))}
            </div>
        </section>
    );
}