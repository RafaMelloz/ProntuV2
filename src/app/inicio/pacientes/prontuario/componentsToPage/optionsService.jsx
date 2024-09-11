import { twMerge } from "tailwind-merge";

export function OptionsService({ option, width, value, id, newService, func }) {
    return (
        <>
            <input
                type="checkbox"
                className="options-input"
                name={value}
                id={`${option}${id}`}
                checked={newService.adjustmentAreas[option]?.includes(value) || false}
                onChange={func}
            />
            <label htmlFor={`${option}${id}`} className={twMerge('options-label text-nowrap', width)}>{value}</label>
        </>

    )
}