"use client"

import { useEffect, useState } from "react";

import { FaPlus } from "react-icons/fa";
import { DefaultUser } from "@/components/defaultUser";
import { isValidEmail } from "@/utils/validations";
import { api } from "@/lib/axios";
import { confirmAlert, errorAlert, loadingAlert } from "@/utils/alerts"
import { InputText } from "@/components/inputText";
import { useSession } from "next-auth/react";
import { ImSpinner8 } from "react-icons/im";
import Image from "next/image";

export function Access(){
    const [accesses, setAccesses] = useState([]);
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
            clearForm()
            getAccesses();
        });
    };

    const editAccessForm = async () => {        
        setLoading(true);
        const { name, email, role } = newAccess;
        const promise = api.put('/api/accesses', {
            name,
            email,
            role,
        }, {
            params: {
                clinicId: session.user.clinic.id,
                id: editUserId
            }
        });

        loadingAlert("Editando...", promise);

        promise.finally(() => {
            setLoading(false)
            clearForm()
            getAccesses();
        });
    };

    const confirmDel = async (id) => {
        confirmAlert('Deseja realmente excluir este acesso?', async () => {
            const promise = api.delete('/api/accesses', {
                params: {
                    clinicId: session.user.clinic.id,
                    id: id
                }
            });

            loadingAlert("Excluindo...", promise);

            promise.finally(() => {
                    getAccesses();
                }
            );
        });
    }

    const getAccesses = async () => {
        setLoading(true);
        try {
            const result = await api.get('/api/accesses', {
                params: {
                    clinicId: session.user.clinic.id,
                }
            });
            setAccesses(result.data);
        } catch (error) {
            errorAlert('Erro ao buscar acessos');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getAccesses();
    }, []);

    

    return (
        <section className="w-full max-h-full overflow-y-auto pb-4">
            <h2 className="text-2xl font-semibold">Acessos</h2>
            <p className="mb-5">Você poderá escolher até 5 acessos para o aplicativo.</p>

            <div className="flex flex-col gap-5 max-w-4xl max-h-64 overflow-y-auto py-2 px-2">
                {loading
                    ? <ImSpinner8 className="animate-spin m-auto text-azul-900/80" size={32}/>
                    : (
                        accesses.length === 0
                            ? (
                                <div className="border rounded-lg py-8 shadow-[0px_1px_6px_0px_#00000040] dark:shadow-[0px_0px_6px_0px_#ffffff0] dark:border dark:border-dark-600/30">
                                    <h3 className="text-lg text-center font-semibold">Nenhum acesso encontrado</h3>
                                </div>
                            ) : (
                                accesses.map(access => (
                                    <div key={access.idUser} className="rounded-lg py-3 px-5 shadow-[0px_1px_6px_0px_#00000040] dark:shadow-[0px_0px_6px_0px_#ffffff0] dark:border dark:border-dark-600/30">
                                        <h3 className="text-lg font-bold mb-3">{access.name}</h3>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-8">
                                                {
                                                    access.profileImg
                                                        ? <Image width={48} height={48} className="rounded-full" src={access.profileImg} alt="Foto de perfil" />
                                                        : <DefaultUser user />
                                                }
                                                <div>
                                                    <p><b>Email:</b> {access.email}</p>
                                                    <p><b>Tipo de acesso:</b> {access.role}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => confirmDel(access.idUser)} className="text-vermelho-900 font-semibold p-2 ">Excluir</button>
                                                <button onClick={() => editStatus(access.idUser, access.name, access.email, access.role)} className="text-white bg-azul-900 p-2 rounded-lg font-semibold">Editar</button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )
                    )}
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-2">Novo acesso</h2>
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
                        <button disabled={loading} className={`text-white rounded-md py-2 font-semibold px-4 flex w-fit items-center ${loading ? "bg-azul-900/50 cursor-not-allowed" : "bg-azul-900"}`} onClick={() => validateForm(editAccessForm)}> 
                            Confirmar edição
                        </button>


                        <button
                            className={`bg-vermelho-900 font-medium flex items-center text-white rounded-lg px-3 py-2 justify-center ${loading ? 'hidden' : ''}`}
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