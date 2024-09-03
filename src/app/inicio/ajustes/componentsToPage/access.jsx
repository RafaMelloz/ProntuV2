"use client"

import { useEffect, useState } from "react";

import { FaPlus } from "react-icons/fa";
import { DefaultUser } from "@/components/defaultUser";
import { isValidEmail } from "@/utils/validations";
import { api } from "@/lib/axios";
import { errorAlert, loadingAlert } from "@/utils/alerts"
import { InputText } from "@/components/inputText";
import { useSession } from "next-auth/react";

export function Access(){
    const [access, setAccess] = useState([]);
    const [newAccess, setNewAccess] = useState({ name: '', email: '', role: '' });
    const [loading, setLoading] = useState(false);

    const [editAccessStatus, setEditAccessStatus] = useState(false);
    const [editUserId, setEditUserId] = useState(null);
    const {data:session} = useSession()

    const changeNewAccess = (id, value) => {
        setNewAccess(prevData => ({
            ...prevData,
            [id]: value,
        }));
    };

    const changeNewAccessesList = (event) => {
        let val = event.target.value;
        changeNewAccess('role', val.toLowerCase());
    };

    const editStatus = (id, name, email, role) => {
        setEditAccessStatus(true);
        setEditUserId(id);
        setNewAccess({
            name: name,
            email: email,
            role: role
        });
    };

    const cancelEdit = () => {
        setEditAccessStatus(false);
        clearForm();
    };

    const validateForm = (submitForm) => {
        if (!newAccess.name || !newAccess.email || !newAccess.role) {
            return errorAlert('Preencha todos os campos');
        } else if (newAccess.role !== 'secretaria' && newAccess.role !== 'quiropraxista') {
            return errorAlert('O tipo de acesso deve ser "Secretaria" ou "Quiropraxista"');
        } else if (!isValidEmail(newAccess.email)) {
            return errorAlert('Email inválido!');
        } else {
            submitForm();
        }
    };

    const clearForm = () => {
        setNewAccess({
            name: '',
            email: '',
            role: ''
        });
    };


    const newAccessForm = async () => {
        setLoading(true);
        const { name, email, role } = newAccess;

        const promise = api.post('/api/accesses', {
            name,
            email,
            role,
        }, {
            params: {
                clinicId: session.user.clinic.id,
            }
        });

        loadingAlert("Cadastrando...", promise);

        promise.finally(() => {
            setLoading(false)
        });
    };

    

    return (
        <section className="w-full !h-full">
            <h2 className="text-2xl font-semibold">Acessos</h2>
            <p className="mb-5">Você poderá escolher até 5 acessos para o aplicativo.</p>
                {/* /
                /
                /
                / */}
            <h2 className="text-2xl font-semibold my-8">Novo acesso</h2>
            <div className="max-w-xl flex flex-col gap-5">
                <InputText
                    InputId="name"
                    labelName="Nome completo do funcionário:"
                    required
                    onChange={changeNewAccess}
                    val={newAccess.name}
                />

                <div className="flex gap-3">
                    <InputText
                        InputId="email"
                        labelName="E-mail:"
                        required
                        onChange={changeNewAccess}
                        val={newAccess.email}
                    />

                    <label htmlFor="role">
                        Tipo de acesso: <b className="text-vermelho-900">*</b>
                        <input
                            autoComplete="off"
                            type="text"
                            id="role"
                            name="role"
                            className="w-full custom-input mt-2 capitalize"
                            onChange={changeNewAccessesList}
                            list="roles"
                            value={newAccess.role}
                        />
                        <datalist id="roles">
                            <option value="Secretaria" />
                            <option value="Quiropraxista" />
                        </datalist>

                    </label>
                </div>

                {editAccessStatus && (
                    <div className="flex gap-4">
                        {/* <ButtonLoading statusLoading={loadingForm} textLoading={'Editando...'} onClickFunction={() => validateForm(editAccess)}>
                            Confirmar edição
                        </ButtonLoading> */}


                        <button
                            className={`bg-vermelho-900 font-medium flex items-center text-white rounded-lg p-3  justify-center ${loadingForm ? 'hidden' : ''}`}
                            onClick={cancelEdit}
                        >
                            Cancelar edição
                        </button>
                    </div>
                )}

                {!editAccessStatus && (
                    <button disabled={loading} className={`text-white rounded-md py-2 font-semibold px-4 flex w-fit items-center ${loading ? "bg-azul-900/50 cursor-not-allowed" : "bg-azul-900"}`} onClick={() => validateForm(newAccessForm)}>
                        Criar mais acessos <FaPlus className="ml-2" />
                    </button>
                )}
            </div>
        </section>
    )
}