"use client"

import Link from "next/link";
import { useState } from "react";
import { GoPlus } from "react-icons/go";
import { IoIosSearch } from "react-icons/io";
import { PatientsTable } from "../componentsToPage/patientsTable";
import { InputText } from "@/components/inputText";
import { errorAlert, loadingAlert } from "@/utils/alerts";
import { api } from "@/lib/axios";
import { isValidEmail } from "@/utils/validations";
import { useRouter } from "next/navigation";

export function PatientsContent({ idClinic, patients, role}) {
    const [searchValue, setSearchValue] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const [openModal, setOpenModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState({});
    const [editPatient, setEditPatient] = useState({});

    const searchPatient = (event) => {
        setSearchValue(event.target.value.toString().toLowerCase());
    };

    const changeEditPatient = (id, value) => {
        setEditPatient(prevData => ({
            ...prevData,
            [id]: value,
        }));
    };

    const openModalHandler = (id) => {
        patients.filter(patient => patient.idPatient === id).map((patient) => (
            setEditPatient({
                id: patient.idPatient,
                name: patient.name,
                email: patient.email,
                phone: patient.phone,
                profession: patient.profession,
                address: patient.address,
            })
        ));


        setOpenModal(true);
    };

    const closeModalHandler = () => {
        setOpenModal(false);
        setSelectedPatient({});
    };

    const validateForm = () => {
        if (!editPatient.phone || !editPatient.profession || !editPatient.address) {
            return errorAlert('Somente o campo email não é obrigatório!');
        } else if (editPatient.email && !isValidEmail(editPatient.email)) {
            return errorAlert('Email inválido!');
        } else if (editPatient.phone.length < 14) {
            return errorAlert('Telefone inválido!');
        } else {
            submitForm();
        }
    }


    const submitForm = async () => {
        setLoading(true);

        const { name, email, phone, profession, address } = editPatient;

        const promise = api.put('/api/patient', {
            name,
            phone,
            email,
            address,
            profession
        }, {
            params: {
                clinicId:idClinic,
                id: editPatient.id
            }
        });

        loadingAlert("Editando...", promise);

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

    return(
        <div className="w-full overflow-hidden rounded-3xl shadow dark:shadow-dark pt-3 px-6">
            <div className="flex justify-between">
                <label className="bg-azul-800 border-cinza-900/20 dark:bg-dark-800 dark:border-dark-100 px-3 py-1.5 w-full max-w-60 border-2 rounded-full flex items-center gap-3" htmlFor="inputBusca">
                    <IoIosSearch size={28} className="text-cinza-900" />
                    <input
                        id="inputBusca"
                        value={searchValue}
                        onChange={searchPatient}
                        className="bg-transparent text-black dark:text-white outline-none border-0 p-0 text-sm focus:ring-0 w-full"
                        type="search"
                        placeholder="Nome ou telefone"
                    />
                </label>

                <Link href={`/inicio/pacientes/${idClinic}`} className="text-white font-semibold bg-azul-900 w-full max-w-48 flex items-center justify-center rounded-full hover:bg-azul-900/80 text-nowrap">
                    <GoPlus className="stroke-2 mr-2" />Adicionar pacientes
                </Link>
            </div>

            <PatientsTable patients={patients} role={role} searchValue={searchValue} openModalHandler={openModalHandler} />

            {openModal && (
                <div className="bg-[#000000cc] fixed z-40 top-0 right-0 left-0 bottom-0 h-full w-full">
                    <div className="p-4 max-w-xl mx-auto relative left-0 right-0 overflow-hidden mt-24">
                        <div className="bg-white text-black dark:bg-dark-800 dark:text-white shadow w-full rounded-lg overflow-hidden block p-8">
                            <>
                                <label htmlFor="patientName" className='w-full flex justify-between gap-2 items-center mb-5'>
                                    <input
                                        autoComplete='off'
                                        type="text"
                                        id='patientName'
                                        name='patientName'
                                        className='bg-transparent border-b border-black dark:border-gray-500 pb-2 mb-2 text-xl w-full outline-none'
                                        placeholder='Nome do paciente'
                                        value={editPatient.name}
                                        readOnly
                                    />
                                    <div className="border-2 border-azul-900 bg-azul-900/10 px-2 py-0.5 rounded">
                                        <span className="whitespace-nowrap">ID: {editPatient.id}</span>
                                    </div>
                                </label>

                                <InputText InputId={'email'} labelName={'E-mail:'} max={60} val={editPatient.email} onChange={changeEditPatient} />
                                <div className="flex gap-5 my-5">
                                    <InputText InputId={'phone'} labelName={'Telefone:'} mask="phone" max={14} val={editPatient.phone} onChange={changeEditPatient} />
                                    <InputText InputId={'profession'} labelName={'Profissão:'} val={editPatient.profession} onChange={changeEditPatient} />
                                </div>
                                <InputText InputId={'address'} labelName={'Endereço:'} max={30} val={editPatient.address} onChange={changeEditPatient} />

                                <div className="flex justify-between mt-10">
                                    <button
                                        type="button"
                                        className="bg-transparent  text-azul-900 font-semibold py-2 px-4 border border-azul-900 rounded-lg shadow-sm mr-2"
                                        onClick={closeModalHandler}
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        className={`rounded-lg text-white font-semibold py-2 px-4 ${loading ? 'bg-azul-900/50 cursor-not-allowed' : 'bg-azul-900'}`}
                                        onClick={validateForm}
                                        disabled={loading}
                                    >
                                        Editar Dados
                                    </button>
                                </div>
                            </>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}