import { GoUpload } from "react-icons/go";

export function InputFile({label, name, func, inputFileData}){
    return(
        <label htmlFor="logoClinic" className="font-medium w-1/2">
            {label}
            <label
                htmlFor={name}
                className="file-prontuario">
                <GoUpload className="size-5 stroke-1 mr-3" />
                {inputFileData.length === 0 ? 'Subir Imagem' : inputFileData[0].name}
            </label>
            <input
                type="file"
                id={name}
                name={name}
                className="hidden"
                accept="image/*"
                onChange={func}
            />
        </label>
    )
}