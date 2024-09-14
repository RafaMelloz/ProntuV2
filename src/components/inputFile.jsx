import { GoUpload } from "react-icons/go";

export function InputFile({label, name, func, inputFileData}){
    return(
        <label htmlFor={name} className="text-black dark:text-white font-medium block w-60">
            {label}
            <label
                htmlFor={name}
                className="file-prontuario"
            >
                <GoUpload className="size-5 stroke-1 mr-3" />

                <span className="truncate">
                    {inputFileData ? inputFileData.name : 'Subir Imagem'}
                </span>
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