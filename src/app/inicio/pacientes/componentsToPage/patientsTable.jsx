"use client"

import Link from "next/link";
import { useState } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { LuPencil } from "react-icons/lu";
import { TbChevronLeft, TbChevronRight, TbChevronsLeft, TbChevronsRight } from "react-icons/tb";

export function PatientsTable({patients, role, searchValue, openModalHandler}) {
    const [page, setPage] = useState(1);

    const filteredPacientes = patients.filter(patient =>
        searchValue === '' ||
        patient.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        patient.phone.toLowerCase().includes(searchValue.toLowerCase())
    );

    const sortedPacientes = filteredPacientes;

    // Calcula o total de páginas
    const totalPages = Math.max(Math.ceil(sortedPacientes.length / 9), 1);

    // Paginação
    const paginatedPacientes = sortedPacientes.slice((page - 1) * 9, page * 9);

    const goToNextPage = () => setPage(page + 1);
    const goToLastPage = () => setPage(totalPages);
    const goToFirstPage = () => setPage(1);
    const goToPreviousPage = () => setPage(page - 1);

    return(
        <table className="w-full bg-azul-700 text-black dark:bg-dark-700 dark:text-white mt-2">
            <thead>
                <tr className="bg-white dark:bg-dark-900  text-base min-[790px]:text-xl">
                    <th className="py-2 font-medium">ID</th>
                    <th className="py-2 font-medium">Nome</th>
                    <th className="py-2 font-medium">CPF</th>
                    <th className="py-2 font-medium">Telefone</th>
                    <th className="py-2 font-medium">Data Nascimento</th>
                    <th className="py-2 font-medium">Ações</th>
                </tr>
            </thead>

            <tbody>
                {paginatedPacientes.length > 0 ? (
                    paginatedPacientes.map(patient => (
                        <tr key={patient.idPatient} className="even:bg-white dark:even:bg-dark-900 text-sm min-[790px]:text-base">
                            <td className="text-center h-10">{patient.idPatient}</td>
                            <td className="text-center h-10">
                                <span className="m-auto truncate max-w-[120px] block">
                                    {patient.name}
                                </span>
                            </td>
                            <td className="text-center h-10">{patient.cpf && patient.cpf !== "null" ? patient.cpf : '----------'}</td>
                            <td className="text-center h-10">{patient.phone}</td>
                            <td className="text-center h-10">{patient.birth_date}</td>
                            
                            <td className="bg-white dark:bg-dark-900 flex gap-1 justify-center h-10">
                                {role === 'secretaria' &&
                                    <button className="bg-azul-900 text-white h-full px-2.5 rounded-lg" onClick={() => openModalHandler(patient.idPatient)}>
                                        <LuPencil />
                                    </button>
                                }
                                {role === 'quiropraxista' &&
                                    <Link href={`/inicio/pacientes/prontuario/${patient.idPatient}`} className="bg-azul-900 text-white h-full px-2.5 rounded-lg flex items-center">
                                        <FaExternalLinkAlt />
                                    </Link>
                                }
                                {role === 'admin' &&
                                    <>
                                        <button className="bg-azul-900 text-white h-full px-2.5 rounded-lg" onClick={() => openModalHandler(patient.idPatient)}>
                                            <LuPencil />
                                        </button>
                                        <Link href={`/inicio/pacientes/prontuario/${patient.idPatient}`} className="bg-azul-900 text-white h-full px-2.5 rounded-lg flex items-center">
                                            <FaExternalLinkAlt />
                                        </Link>
                                    </>
                                }
                            </td>
                        </tr>
                        

                    ))
                ) : (
                    <tr>
                        <td colSpan={6} className="text-center py-4">
                            Nenhum paciente encontrado
                        </td>
                    </tr>
                )}
            </tbody>

            <tfoot>                                                                             
                <tr className="bg-white dark:bg-dark-900">
                    {/* <td colSpan={1} className="font-semibold">
                        {sortedPacientes.length} itens
                    </td>
                     */}
                    <td colSpan={6} className=" pt-4 ">
                        <div className={`items-center gap-8 inline-flex justify-between w-full pr-0 lg:pr-9`}>

                            <div className="flex gap-1.5">
                                <button
                                    onClick={goToFirstPage}
                                    disabled={page === 1}
                                    className={`p-2 rounded border-[1px] border-azul-900 ${page === 1 ? 'bg-azul-900/50 cursor-not-allowed' : ''}`}
                                >
                                    <TbChevronsLeft className={`size-4 ${page === 1 ? 'stroke-black/50 cursor-not-allowed' : ''}`} />
                                </button>

                                <button
                                    onClick={goToPreviousPage}
                                    disabled={page === 1}
                                    className={`p-2 rounded border-[1px] border-azul-900 ${page === 1 ? 'bg-azul-900/50' : ''}`}
                                >
                                    <TbChevronLeft className={`size-4 ${page === 1 ? 'stroke-black/50' : ''}`} />
                                </button>
                            </div>
                            
                            <span>Página {page} de {totalPages}</span>


                            <div className="flex gap-1.5">
                                <button
                                    onClick={goToNextPage}
                                    disabled={page === totalPages}
                                    className={`p-2 rounded border-[1px] border-azul-900 ${page === totalPages ? 'bg-azul-900/50 cursor-not-allowed' : ''}`}
                                >
                                    <TbChevronRight className={`size-4 ${page === totalPages ? 'stroke-black/50' : ''}`} />
                                </button>

                                <button
                                    onClick={goToLastPage}
                                    disabled={page === totalPages}
                                    className={`p-2 rounded border-[1px] border-azul-900 ${page === totalPages ? 'bg-azul-900/50 cursor-not-allowed' : ''}`}
                                >
                                    <TbChevronsRight className={`size-4 ${page === totalPages ? 'stroke-black/50' : ''}`} />
                                </button>
                            </div>
                        </div>
                    </td>
                </tr>
            </tfoot>
        </table>
    )
}