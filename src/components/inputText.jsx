import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { twMerge } from "tailwind-merge";
import { formatCPF, formatDate, formatHour, formatPhone } from "../utils/mask";

export function InputText({ InputId, labelName, required, password, onChange, val, classInput, classLabel, mask, max, readonly, placeholder }) {
    const [type, setType] = useState('password');
    const [iconPass, setIconPass] = useState(true);
    const [formattedValue, setFormattedValue] = useState('');

    useEffect(() => {
        // Atualiza formattedValue sempre que val ou mask mudam
        setFormattedValue(mask ? formatInput(val, mask) : val);
    }, [val, mask]);

    const handleToggle = () => {
        if (type === 'password') {
            setType('text');
            setIconPass(false);
        } else {
            setType('password');
            setIconPass(true);
        }
    };

    const handleChange = (event) => {
        let value = event.target.value;
        const formatted = mask ? formatInput(value, mask) : value;
        setFormattedValue(formatted);
        onChange(InputId, formatted);
    };

    const formatInput = (value, mask) => {
        switch (mask) {
            case 'phone':
                return formatPhone(value);
            case 'date':
                return formatDate(value);
            case 'cpf':
                return formatCPF(value);
            case 'hour':
                return formatHour(value);
            default:
                return value;
        }
    };


    return (
        <label htmlFor={InputId} className={twMerge("text-black dark:text-white relative font-medium w-full", classLabel)}>
            {labelName} {required && <span className="text-vermelho-900">*</span>}
            <input
                readOnly={readonly}
                autoComplete='off'
                maxLength={max}
                type={password ? type : "text"}
                name={InputId}
                id={InputId}
                onChange={handleChange}
                value={formattedValue || ''} // Garante que o valor seja uma string vazia, não undefined
                className={twMerge("w-full custom-input mt-2", classInput)}
                placeholder={placeholder ? placeholder : ""}
            />
            {password && (
                <button type="button" className="absolute right-4 bottom-3.5 " onClick={handleToggle}>
                    {iconPass ? <FaEye className="textSwitch" /> : <FaEyeSlash className="textSwitch" />}
                </button>
            )}
        </label>
    );
}
