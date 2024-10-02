"use client"

import { useEffect, useState } from "react";
import { OptionsService } from "../componentsToPage/optionsService";

import { api } from "@/lib/axios";
import { errorAlert, loadingAlert } from "@/utils/alerts"
import { isValidDate } from "@/utils/validations"


import { FaRegTrashCan } from "react-icons/fa6";
import { LuCamera, LuPaperclip } from "react-icons/lu";
import { PiFilePngDuotone } from "react-icons/pi";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";


const camposSelect = {
    C: ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "Occ"],
    T: ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12",],
    L: ["L1", "L2", "L3", "L4", "L5"],
    PS: ["PS", "AI", "BP", "S2", "S3"],
    PI: ["PI", "AS", "IN", "EX"],
    Coccix: ["Coccix"]
}

export function MedicalContent({ symptoms, medicalRecord, gallery, exams, services, idClinic, idPatient }) {

    const [loading, setLoading] = useState(false);

    // Estados para controlar a galeria de imagens
    const [pastGallery, setPastGallery] = useState(gallery);
    const [newGallery, setNewGallery] = useState([]);
    const [newGalleryView, setNewGalleryView] = useState([]);

    // Estados para controlar a visualização de imagens
    const [isViewImageOpen, setIsViewImageOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    // Estados para controlar os exames
    const [pastExams, setPastExams] = useState(exams);
    const [newExams, setNewExams] = useState([]);
    const [newExamsView, setNewExamsView] = useState([]);

    
    // Estado para controlar a avaliação subjetiva e observações
    const [subjectiveEvaluation, setSubjectiveEvaluation] = useState(medicalRecord ? medicalRecord.subjectiveEvaluation : '');
    const [observation, setObservation] = useState(medicalRecord ? medicalRecord.observations : '');
    
    // Estados para controlar os atendimentos
    const [pastServices, setPastServices] = useState(services);
    const [newService, setNewService] = useState({ nameService: '', dateService: '', descriptionService: '', adjustmentAreas: {} });
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);
    const [isNewAccordionOpen, setIsNewAccordionOpen] = useState(false);
    const [selectedNewOption, setSelectedNewOption] = useState(null);

    const [editDescriptionService, setEditDescriptionService] = useState('')
    const [editingIndex, setEditingIndex] = useState(null);


    // Funções para manipular a galeria de imagens e modal de visualização
    const handleGalleryChange = (event) => {
        const files = Array.from(event.target.files);
        const newFiles = files.map(file => ({
            url: URL.createObjectURL(file),
            name: file.name
        }));
        setNewGallery(prevNewGallery => [...prevNewGallery, ...files]);
        setNewGalleryView(prevNewGallery => [...prevNewGallery, ...newFiles])
    };
    const handleImageClick = (image) => {
        setSelectedImage(image);
        setIsViewImageOpen(true);
    };
    const handleCloseModal = () => {
        setIsViewImageOpen(false);
        setSelectedImage(null);
    };
    const handleRemoveImage = (fileNameToRemove, event) => {
        event.preventDefault()
        setNewGallery(prevNewGallery => prevNewGallery.filter(file => file.name !== fileNameToRemove));
        setNewGalleryView(prevNewGallery => prevNewGallery.filter(file => file.name !== fileNameToRemove));

    };


    // Funções para manipular os exames
    const handleExamsChange = (event) => {
        const files = Array.from(event.target.files);
        const fileData = files.map(file => ({
            url: URL.createObjectURL(file),
            name: file.name
        }));
        setNewExams(prevNewExams => [...prevNewExams, ...files]);
        setNewExamsView(prevNewExams => [...prevNewExams, ...fileData])
    };
    const handleRemoveFile = (fileNameToRemove, event) => {
        event.preventDefault()
        setNewExams(prevNewExams => prevNewExams.filter(file => file.name !== fileNameToRemove));
        setNewExamsView(prevNewExams => prevNewExams.filter(file => file.name !== fileNameToRemove));
    };


    // Funções para manipular os atendimentos
    const toggleAccordion = (i) => {
        setIsAccordionOpen(isAccordionOpen === i ? null : i);
        setIsNewAccordionOpen(false);
    };
    const newToggleAccordion = () => {
        setIsNewAccordionOpen(!isNewAccordionOpen);
        setIsAccordionOpen(null);
    };


    //// Função que verifica se algum checkbox está marcado para uma opção específica
    const isAnyCheckboxChecked = (option, index) => {
        return pastServices[index].adjustmentAreas[option] && pastServices[index].adjustmentAreas[option].length > 0;
    };
    const isAnyNewCheckboxChecked = (option) => {
        return newService.adjustmentAreas[option] && newService.adjustmentAreas[option].length > 0;
    };

    //// Função que lida com o clique em uma opção, alternando a seleção entre ela e 'null' se já estiver selecionada
    const handleNewOptionClick = (option) => {
        setSelectedNewOption(selectedNewOption === option ? null : option);
    };

    //// Função que lida com a mudança de texto na área de texto, atualizando a observação no serviceData
    const handleTextareaService = (e) => {
        const newValue = e.target.value;
        const checkboxPart = Object.entries(newService.adjustmentAreas).flatMap(([option, values]) => values.map(value => `${option}-${value}`)).join(', ');
        const newObservacao = newValue.substring(checkboxPart.length + 2); // +2 para ignorar "; " após os checkboxes

        setNewService(prevData => ({
            ...prevData,
            descriptionService: newObservacao
        }));
    };

    //// Função que lida com a mudança de estado de um checkbox, adicionando ou removendo valores conforme necessário
    const handleCheckboxChange = (event, option) => {
        const { name, checked } = event.target;
        setNewService(prevData => {
            const newData = { ...prevData };
            const checkboxValues = newData.adjustmentAreas[option] || [];
            if (checked) {
                if (!checkboxValues.includes(name)) {
                    newData.adjustmentAreas[option] = [...checkboxValues, name];
                }
            } else {
                newData.adjustmentAreas[option] = checkboxValues.filter(value => value !== name);
                if (newData.adjustmentAreas[option].length === 0) {
                    delete newData.adjustmentAreas[option];
                }
            }
            return newData;
        });
    };

    //// Função que retorna a classe de cor correspondente a uma opção, com base nas categorias de camposSelect
    const getColorClass = (option) => {
        if (camposSelect.C.includes(option)) return 'bg-[#F19393] dark:bg-[#db3131]';
        if (camposSelect.T.includes(option)) return 'bg-[#F1E893] dark:bg-[#e9d949]';
        if (camposSelect.L.includes(option)) return 'bg-[#C2F193] dark:bg-[#91e93a]';
        if (camposSelect.PS.includes(option)) return 'bg-[#93F1EB] dark:bg-[#61ebe1]';
        if (camposSelect.PI.includes(option)) return 'bg-[#93C4F1] dark:bg-[#4a9be7]';
        if (camposSelect.Coccix.includes(option)) return 'bg-[#F1CB93] dark:bg-[#df9f41]';
    };

    //// Função que lida com a edição de um serviço, abrindo a área de texto e preenchendo-a com a descrição atual
    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Mês começa do zero
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const editingService = (index, event, val) => {
        event.preventDefault()
        setEditingIndex(index);
        setEditDescriptionService(val);
    };

    const cancelEditingService = (event) => {
        event.preventDefault()
        setEditingIndex(null);
        setEditDescriptionService('');
    };

    const handleEditingService = (e, i) => {
        const newValue = e.target.value;
        const checkboxPart = Object.entries(pastServices[i].adjustmentAreas).flatMap(([option, values]) => values.map(value => `${option}-${value}`)).join(', ');
        const newObservacao = newValue.substring(checkboxPart.length + 2); // +2 para ignorar "; " após os checkboxes
        setEditDescriptionService(newObservacao);
    };

    const confirmEditingService = async (event, id) => {
        event.preventDefault()
        setLoading(true);
        let idService = id; 
        
        
        const promise = api.put("/api/medicalRecord", {
            editDescriptionService
        },
        {
            params:{
                idService
            }
        });

        loadingAlert('Atualizando atendimento...', promise);

        promise
        .then((response) => {
            if (response.status === 200) { 
                window.location.reload(); 
            }
        })
        .finally(() => {
            setLoading(false);
        });

    }


    const validateForm = (event) => {
        event.preventDefault()
        console.log(newService);
        if (!newService.nameService || !newService.dateService || Object.keys(newService.adjustmentAreas).length === 0) {
            return errorAlert('Preencha todos os campos de atendimento!');
        } else if (!isValidDate(newService.dateService)) {
            return errorAlert('Data de invalida!');
        } else {
            submitForm()
        }
    }

    const submitForm = async () => {
        setLoading(true);
        const { nameService, dateService, adjustmentAreas, descriptionService } = newService;

        const promise = api.post("/api/medicalRecord", {
            newGallery,
            newExams,

            observation,
            subjectiveEvaluation,

            nameService,
            dateService,
            adjustmentAreas,
            descriptionService
        },
        {
            params:{
                idClinic,
                idPatient
            },
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });

        loadingAlert('Salvando atendimento...', promise);

        promise
        .then((response) => {
            if (response.status === 200) { // Verifica se o status da resposta é de sucesso
                window.location.reload();  // Recarrega a página se a resposta for sucesso
            }
        })
        .finally(() => {
            setLoading(false);
        });
    };



    useEffect(() => {
        const today = new Date();
        const formattedDate = formatDate(today);
        setNewService(prevData => ({
            ...prevData,
            dateService: formattedDate
        }));
    }, [])

    return(
        <form action="" className="flex flex-col gap-10">
            {symptoms !== null && (
                <section className="w-full py-5 px-10 bg-azul-700 dark:bg-dark-500 textSwitch rounded-lg">
                    <h2 className="text-azul-900 text-2xl font-bold text-center mb-5">Autoavaliação</h2>

                    <div className="flex gap-10">
                        <img className="max-w-80 w-full max-h-80 rounded-lg dark:invert" src={symptoms.uncomfortableAreas} alt="areas desconfortáveis" />

                        <div className="flex flex-col justify-center gap-3">
                            <div className="font-semibold flex gap-2">
                                <span>Sintomas:</span>
                                <p className="first-letter:uppercase lowercase font-normal">{symptoms.description}</p>
                            </div>
                            <div className="font-semibold flex gap-2">
                                <span>Como começaram os sintomas:</span>
                                <p className="first-letter:uppercase lowercase font-normal">{symptoms.cause}</p>
                            </div>
                            <div className="font-semibold flex gap-2">
                                <span>Qual o tipo de desconforto:</span>
                                <p className="first-letter:uppercase lowercase font-normal">{symptoms.discomforts.join(", ")}</p>
                            </div>
                            <div className="font-semibold flex gap-2">
                                <span>Qual a frequência dos sintomas:</span>
                                <p className="first-letter:uppercase lowercase font-normal">{symptoms.frequency}</p>
                            </div>
                            <div className="font-semibold flex gap-2">
                                <span>O desconforto aumenta com:</span>
                                <p className="first-letter:uppercase lowercase font-normal">{symptoms.discomfortIncreases.join(", ")}</p>
                            </div>
                            <div className="font-semibold flex gap-2">
                                <span>O desconforto diminui com:</span>
                                <p className="first-letter:uppercase lowercase font-normal">{symptoms.discomfortDecreases.join(", ")}</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 flex flex-col gap-4">
                        <h2 className="text-azul-900 text-2xl font-bold my-2">Informações sobre saúde em geral e qualidade de vida:</h2>

                        <div className="font-semibold flex gap-2">
                            <span>Estado Geral:</span>
                            <p className="first-letter:uppercase lowercase font-normal">{symptoms.geralState.length > 0 ? symptoms.geralState.join(", ") : '---'}</p>
                        </div>
                        <div className="font-semibold flex gap-2">
                            <span>Cabeça e Pescoço:</span>
                            <p className="first-letter:uppercase lowercase font-normal">{symptoms.headNeck.length > 0 ? symptoms.headNeck.join(", ") : '---'}</p>
                        </div>
                        <div className="font-semibold flex gap-2">
                            <span>Tórax/Respiratório:</span>
                            <p className="first-letter:uppercase lowercase font-normal">{symptoms.thoraxRespiratory.length > 0 ? symptoms.thoraxRespiratory.join(", ") : '---'}</p>
                        </div>
                        <div className="font-semibold flex gap-2">
                            <span>Cardio-Vascular:</span>
                            <p className="first-letter:uppercase lowercase font-normal">{symptoms.cardioVascular.length > 0 ? symptoms.cardioVascular.join(", ") : '---'}</p>
                        </div>
                        <div className="font-semibold flex gap-2">
                            <span>Gastro-Intestinal:</span>
                            <p className="first-letter:uppercase lowercase font-normal">{symptoms.gastroIntestinal.length > 0 ? symptoms.gastroIntestinal.join(", ") : '---'}</p>
                        </div>
                        <div className="font-semibold flex gap-2">
                            <span>Gênito-Urinário:</span>
                            <p className="first-letter:uppercase lowercase font-normal">{symptoms.genitoUrinary.length > 0 ? symptoms.genitoUrinary.join(", ") : '---'}</p>
                        </div>
                    </div>
                </section>
            )}

            {symptoms === null && (
                <section className="w-full py-5 px-10 bg-azul-700 dark:bg-dark-500 textSwitch rounded-lg">
                    <h2 className="text-azul-900 text-2xl font-bold text-center">Galeria</h2>

                    <div className="flex justify-end mb-4 min-w-[980px]:mb-0">
                        <label htmlFor="fileGallery"
                            className="bg-azul-900 text-white py-3 px-4 cursor-pointer rounded-lg flex items-center mt-5 md:mt-0 font-semibold">
                            <LuCamera size={20} className="mr-3"/> Anexar ficha existente
                            <input
                                accept="image/*"
                                type="file"
                                id="fileGallery"
                                name="fileGallery"
                                className="hidden"
                                multiple
                                onChange={handleGalleryChange}
                            />
                        </label>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {pastGallery.map((file, index) => (
                            <div key={index} className={`w-full max-w-52 h-36 relative flex  flex-col items-center`}>
                                <img src={file.url} alt={file.name} className="w-full h-full rounded-lg" onClick={() => handleImageClick(file)} />
                                <span className="text-sm flex justify-between absolute w-full bg-black/50 text-white p-2 bottom-0 rounded-b-lg">
                                    <span>{file.name}</span>
                                </span>
                            </div>
                        ))}

                        {newGalleryView.map((file, index) => (
                            <div key={index} className={`w-full max-w-52 h-36 relative flex  flex-col items-center`}>
                                <img src={file.url} alt={file.name} className="w-full h-full rounded-lg" onClick={() => handleImageClick(file)} />
                                <span className="text-sm flex justify-between absolute w-full bg-black/50 text-white p-2 bottom-0 rounded-b-lg">
                                    <span>{file.name}</span>
                                    <button
                                        className="bg-vermelho-900 text-white p-1.5 rounded-lg"
                                        onClick={(event) => handleRemoveImage(file.name, event)}>
                                        <FaRegTrashCan />
                                    </button>
                                </span>
                            </div>
                        ))}
                    </div>

                    {isViewImageOpen && selectedImage && (
                        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center" onClick={handleCloseModal}>
                            <div className="relative">
                                <img src={selectedImage.url} alt={selectedImage.name} className="w-full h-full max-w-2xl" />
                            </div>
                        </div>
                    )}
                </section>
            )}

            <section className="w-full py-5 px-10  bg-azul-700 dark:bg-dark-500 textSwitch rounded-lg">
                <h2 className="text-azul-900 text-2xl font-bold text-center">Exames do paciente</h2>

                <div className="flex justify-end">
                    <label htmlFor="fileExames"
                        className="bg-azul-900 text-white py-3 px-4 cursor-pointer rounded-lg flex items-center mt-5 md:mt-0 font-semibold">
                        <LuPaperclip size={20} className="mr-3" /> Anexar documentos
                        <input
                            type="file"
                            id="fileExames"
                            name="fileExames"
                            className="hidden"
                            multiple
                            accept="image/*, application/pdf,.docx,.doc"
                            onChange={handleExamsChange}
                        />
                    </label>
                </div>

                <div className="flex justify-center flex-wrap gap-2">
                    {pastExams.map((file, index) => (
                        <div key={index} className="bg-white dark:bg-dark-600 px-2 py-3 my-2 rounded-lg flex justify-between items-center gap-2">
                            <a href={file.url} target="_blank" download={file.name} className="flex items-center gap-2">
                                <PiFilePngDuotone className="size-6" />
                                <span className="max-w-40 truncate">{file.name}</span>
                            </a>
                        </div>
                    ))}
                    {newExamsView.map((file, index) => (
                        <div key={index} className="bg-white dark:bg-dark-600 px-2 py-3 my-2 rounded-lg flex justify-between items-center gap-2">
                            <a href={file.url} download={file.name} className="flex items-center gap-2">
                                <PiFilePngDuotone className="size-6" />
                                <span className="max-w-40 truncate">{file.name}</span>
                            </a>
                            <button
                                className="bg-vermelho-900 text-white p-1.5 rounded-lg"
                                onClick={(event) => handleRemoveFile(file.name, event)}
                            >
                                <FaRegTrashCan />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <section className="w-full text-center">
                <h2 className="text-azul-900 text-2xl font-bold mb-6">Avaliação Objetiva/Subjetiva</h2>
                <textarea name="evaluation" id="evaluation" onChange={(event) => setSubjectiveEvaluation(event.target.value)} value={subjectiveEvaluation} className="custom-input w-full h-40 p-4 resize-none"></textarea>
            </section>

            <section className="w-full text-center">
                <h2 className="text-azul-900 text-2xl font-bold mb-6">Observações</h2>
                <textarea name="observacao" id="observacao" onChange={(event) => setObservation(event.target.value)} value={observation} className="custom-input w-full h-40 p-4 resize-none"></textarea>
            </section>

            <section className="w-full text-center">
                <h2 className="text-azul-900 text-2xl font-bold mb-6">Atendimentos</h2>

                {pastServices.sort((a, b) => a.idService - b.idService).map((service, i) => (
                    <div key={service.idService} className="mb-2 bg-white dark:bg-dark-800 textSwitch border-2 border-azul-900 rounded-lg overflow-hidden">
                        <div className="flex justify-between items-center py-2 px-4">
                            <div className="flex gap-10">
                                <span className="max-w-60 text-start min-w-40 text-nowrap truncate">{service.nameService}</span>
                                <span className="max-w-20">{service.dateService}</span>
                                <span className="max-w-96 truncate">
                                    {`${Object.entries(service.adjustmentAreas).flatMap(([option, values]) => values.map(value => `${option}-${value}`)).join(', ')} ${service.descriptionService}`}
                                </span>
                            </div>
                            <span className="rounded-full hover:bg-azul-900/40 p-1 cursor-pointer" onClick={() => toggleAccordion(i)}>
                                {isAccordionOpen === i ? <FaChevronRight /> : <FaChevronDown />}
                            </span>
                        </div>

                        {isAccordionOpen === i && (
                            <div className="px-10 py-5 flex flex-col gap-2">
                                {Object.entries(camposSelect).map(([category, options]) => (
                                    <div key={category} className="flex flex-row">
                                        {options.map((option) => (
                                            <div
                                                key={option}
                                                className={`py-1 px-3 border border-black relative ${isAnyCheckboxChecked(option, i) ? getColorClass(option) : ''}`}
                                            >
                                                <div className="cursor-pointer">
                                                    {option}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}


                                {editingIndex === i ? (
                                    <>
                                        <textarea
                                            className="resize-none custom-input w-full h-20 rounded-lg p-4 mt-4 "
                                            value={`${Object.entries(pastServices[i].adjustmentAreas).flatMap(([option, values]) => values.map(value => `${option}-${value}`)).join(', ')}; ${editDescriptionService}`}
                                            onChange={(e) => handleEditingService(e, i)}
                                        ></textarea>
                                        <div className="w-full flex justify-end gap-5 mt-2">

                                            <button className={`bg-azul-900 text-white font-semibold rounded p-2`} onClick={(e) => confirmEditingService(e, service.idService)}>
                                                Confirmar edição
                                            </button>
                                            <button onClick={(e) => cancelEditingService(e)} className="bg-vermelho-900 text-white  px-2 rounded font-semibold">Cancelar</button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <textarea
                                            className="resize-none custom-input w-full h-24 rounded-lg p-4 mt-4 hover:border-cinza-700 dark:hover:border-dark-600"
                                            value={`${Object.entries(pastServices[i].adjustmentAreas).flatMap(([option, values]) => values.map(value => `${option}-${value}`)).join(', ')}; ${pastServices[i].descriptionService}`}
                                            readOnly
                                        ></textarea>
                                        <div className="w-full flex justify-end gap-5 mt-2">
                                            <button onClick={(e) => editingService(i, e, pastServices[i].descriptionService)} className="bg-azul-900 text-white p-2 rounded font-semibold">Editar observação</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                <div className="bg-white dark:bg-dark-800 textSwitch border-2 border-azul-900 rounded-lg overflow-hidden">
                    <div className="flex justify-between items-center py-2 px-4">
                        <div className="flex gap-10">
                            <input
                                type="text"
                                autoComplete="off"
                                name={`nomeAtendimento`}
                                id={`nomeAtendimento`}
                                value={newService.nameService}
                                placeholder="Nome do atendimento"
                                className="font-semibold w-full max-w-48 px-1 hover:border-b focus:border-b border-b-azul-900 bg-transparent focus:outline-none"
                                onChange={(e) => {
                                    setNewService(prevData => ({
                                        ...prevData,
                                        nameService: e.target.value
                                    }));
                                }}
                            />
                            <input
                                type="text"
                                name={`dataAtendimento`}
                                autoComplete="off"
                                id={`dataAtendimento`}
                                value={newService.dateService}
                                readOnly
                                placeholder="XX/XX/XXXX"
                                maxLength={10}
                                className="max-w-24 bg-transparent px-1  focus:outline-none "
                                onChange={(e) => {
                                    setNewService(prevData => ({
                                        ...prevData,
                                        dateService: formatDate(e.target.value)
                                    }));
                                }}
                            />
                            <span className="w-72 overflow-hidden whitespace-nowrap text-ellipsis">
                                {`${Object.entries(newService.adjustmentAreas).flatMap(([option, values]) => values.map(value => `${option}-${value}`)).join(', ')} ${newService.descriptionService}`}
                            </span>
                        </div>
                        <span className="rounded-full hover:bg-azul-900/40 p-1 cursor-pointer" onClick={newToggleAccordion}>
                            {isNewAccordionOpen ? <FaChevronRight /> : <FaChevronDown />}
                        </span>
                    </div>

                    {isNewAccordionOpen && (
                        <div className="px-10 py-5 flex flex-col gap-2">
                            {Object.entries(camposSelect).map(([category, options]) => (
                                <div key={category} className="flex flex-row">
                                    {options.map((option) => (
                                        <div
                                            key={option}
                                            className={`py-1 px-3 border border-black relative ${isAnyNewCheckboxChecked(option) ? getColorClass(option) : ''}`}
                                        >
                                            <div onClick={() => handleNewOptionClick(option)} className="cursor-pointer">
                                                {option}
                                            </div>
                                            {selectedNewOption === option && (
                                                <div className="flex gap-2 border-black bg-white dark:bg-dark-600 border min-w-20 p-1 rounded absolute -left-px -bottom-11 z-10">
                                                    {category === "C" && (
                                                        <>
                                                            {option === "C1" ? (
                                                                <>
                                                                    <OptionsService option={option} width={'w-1/2'} value={'E'} id={'-E'} newService={newService} func={(event) => handleCheckboxChange(event, option)} />
                                                                    <OptionsService option={option} width={'w-1/2'} value={'D'} id={'-D'} newService={newService} func={(event) => handleCheckboxChange(event, option)} />
                                                                </>
                                                            ) : option === "Occ" ? (
                                                                <>
                                                                    <OptionsService option={option} width={'w-1/4'} value={'E'} id={'-E'} newService={newService} func={(event) => handleCheckboxChange(event, option)} />
                                                                    <OptionsService option={option} width={'w-1/4'} value={'D'} id={'-D'} newService={newService} func={(event) => handleCheckboxChange(event, option)} />
                                                                    <OptionsService option={option} width={'w-1/4 px-6'} value={'POST'} id={'-POST'} newService={newService} func={(event) => handleCheckboxChange(event, option)} />
                                                                    <OptionsService option={option} width={'w-1/4 px-6'} value={'ANT'} id={'-ANT'} newService={newService} func={(event) => handleCheckboxChange(event, option)} />
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <OptionsService option={option} width={'w-1/3'} value={'E'} id={'-E'} newService={newService} func={(event) => handleCheckboxChange(event, option)} />
                                                                    <OptionsService option={option} width={'w-1/3'} value={'PE'} id={'-PE'} newService={newService} func={(event) => handleCheckboxChange(event, option)} />
                                                                    <OptionsService option={option} width={'w-1/3'} value={'D'} id={'-D'} newService={newService} func={(event) => handleCheckboxChange(event, option)} />
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                    {category === "T" && (
                                                        <>
                                                            <OptionsService option={option} width={'w-1/6'} value={'E'} id={'-E'} newService={newService} func={(event) => handleCheckboxChange(event, option)} />
                                                            <OptionsService option={option} width={'w-1/6'} value={'PE'} id={'-PE'} newService={newService} func={(event) => handleCheckboxChange(event, option)} />
                                                            <OptionsService option={option} width={'w-1/6'} value={'PT'} id={'-PT'} newService={newService} func={(event) => handleCheckboxChange(event, option)} />
                                                            <OptionsService option={option} width={'w-1/6'} value={'D'} id={'-D'} newService={newService} func={(event) => handleCheckboxChange(event, option)} />
                                                            <OptionsService option={option} width={'w-3/6'} value={'COST E'} id={'-COST E'} newService={newService} func={(event) => handleCheckboxChange(event, option)} />
                                                            <OptionsService option={option} width={'w-3/6'} value={'COST D'} id={'-COST D'} newService={newService} func={(event) => handleCheckboxChange(event, option)} />
                                                        </>
                                                    )}
                                                    {category === "L" && (
                                                        <>
                                                            <OptionsService option={option} width={'w-1/4'} value={'E'} id={'-E'} newService={newService} func={(event) => handleCheckboxChange(event, option)} />
                                                            <OptionsService option={option} width={'w-1/4'} value={'PE'} id={'-PE'} newService={newService} func={(event) => handleCheckboxChange(event, option)} />
                                                            <OptionsService option={option} width={'w-1/4'} value={'D'} id={'-D'} newService={newService} func={(event) => handleCheckboxChange(event, option)} />
                                                            <OptionsService option={option} width={'w-1/4'} value={'PM'} id={'-PM'} newService={newService} func={(event) => handleCheckboxChange(event, option)} />
                                                        </>
                                                    )}
                                                    {category === "PS" && (
                                                        <>
                                                            <OptionsService option={option} width={'w-1/2'} value={'E'} id={'-E'} newService={newService} func={(event) => handleCheckboxChange(event, option)} />
                                                            <OptionsService option={option} width={'w-1/2'} value={'D'} id={'-D'} newService={newService} func={(event) => handleCheckboxChange(event, option)} />
                                                        </>
                                                    )}
                                                    {category === "PI" && (
                                                        <>
                                                            <OptionsService option={option} width={'w-1/2'} value={'E'} id={'-E'} newService={newService} func={(event) => handleCheckboxChange(event, option)} />
                                                            <OptionsService option={option} width={'w-1/2'} value={'D'} id={'-D'} newService={newService} func={(event) => handleCheckboxChange(event, option)} />
                                                        </>
                                                    )}
                                                    {category === "Coccix" && (
                                                        <OptionsService option={option} width={'w-full'} value={'Coccix'} id={''} newService={newService} func={(event) => handleCheckboxChange(event, option)} />
                                                    )}
                                                </div>
                                            )}

                                        </div>
                                    ))}
                                </div>
                            ))}
                            <textarea
                                className="resize-none custom-input w-full h-24 rounded-lg p-4 mt-4"
                                value={`${Object.entries(newService.adjustmentAreas).flatMap(([option, values]) => values.map(value => `${option}-${value}`)).join(', ')}; ${newService.descriptionService}`}
                                onChange={handleTextareaService}
                            ></textarea>
                        </div>
                    )}
                </div>
            </section>

            <section className="w-full flex justify-end mb-5">
                {editingIndex === null && (
                    <button className={`font-semibold p-4 rounded-lg text-white ${loading ? 'bg-azul-900/50 cursor-not-allowed' : 'bg-azul-900'}`} disabled={loading} onClick={(event) => validateForm(event)}>
                        Salvar e encerrar atendimento
                    </button>
                )}
            </section>
        </form>
    )

}