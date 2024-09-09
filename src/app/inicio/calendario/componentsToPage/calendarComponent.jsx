"use client"

import { useState, useEffect } from 'react';
import { InputText } from '@/components/inputText';
import { calculateEventPosition, calculateEventHeight, isTimeSlotAvailable, validateHourConsult } from '@/utils/calendarFunctions';
import { loadingAlert, errorAlert, successAlert } from '@/utils/alerts';

import { LuPencil, LuTrash2 } from 'react-icons/lu';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { api } from '@/lib/axios';
import Link from 'next/link';

const DAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const HOURS_COLUMN = Array.from({ length: 14 }, (_, i) => {
    const hour = i + 6;
    return `${hour < 10 ? '0' : ''}${hour}:00`;
});

const consultType = [
    { id: 'fistConsult', value: '1° Consulta' },
    { id: 'fistReturn', value: '1° Retorno' },
    { id: 'return', value: 'Ret. Avulso' },
    { id: 'plan', value: 'Plano' },
];

export function CalendarComponent({ professional, consults, slug, clinicId }) {

    const [currentDate, setCurrentDate] = useState(new Date());
    const [week, setWeek] = useState([]);

    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [doctors, setDoctors] = useState(professional);

    const [emptyCalendar, setEmptyCalendar] = useState([]);
    const [events, setEvents] = useState(consults);
    const [newEvent, setNewEvent] = useState({});
    const [statusEditing, setStatusEditing] = useState(false);

    const [loading, setLoading] = useState(false);
    const [openViewModal, setViewModal] = useState(false);
    const [openEventModal, setOpenEventModal] = useState(false);
    const [openStartAppointmentModal, setOpenStartAppointmentModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    const filteredEvents = selectedDoctor
        ? events.filter(event => event.professionalId === selectedDoctor)
        : emptyCalendar;

    const updateWeek = () => {
        const startOfWeek = new Date(currentDate);
        const dayOfWeek = startOfWeek.getDay();
        const dayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        startOfWeek.setDate(currentDate.getDate() + dayOffset);
        const weekArray = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            return date;
        });
        setWeek(weekArray);
    };

    const isToday = (date) => {
        const today = new Date();
        return today.toDateString() === date.toDateString();
    };

    const handlePreviousWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    const handleNextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 7);
        setCurrentDate(newDate);
    };

    const handleCurrentDate = () => {
        const newDate = new Date();
        setCurrentDate(newDate);
    };

    const showNewEventModal = (date) => {
        setNewEvent({
            ...newEvent,
            dateForListing: date.toDateString(),
            dateConsult: date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'long' }),
        });
        setOpenEventModal(true);
    };
    const showViewModal = (id) => {
        setViewModal(true);
        setSelectedPatient(id);
    };

    const closeModal = (modal) => {
        modal(false);
        clearNewConsult();
        setStatusEditing(false);
    };

    const showEditEventModal = (eventId) => {
        const eventToEdit = events.find(event => event.IdConsult === eventId);
        setNewEvent(eventToEdit);
        console.log(newEvent);
        setOpenEventModal(true);
        setViewModal(false);
        setStatusEditing(true);
    };

    const startAppointment = (id) => {
        setViewModal(false);
        setOpenStartAppointmentModal(true);
        setSelectedPatient(id);
    };

    const copyDomainToClipboard = async () => {
        await navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
        setOpenStartAppointmentModal(false);
        successAlert('Link copiado para a área de transferência!');
    };

    const handleChange = (InputId, value) => {
        const updatedData = { ...newEvent, [InputId]: value };
        setNewEvent(updatedData);
    };
    const handleChangeProfessional = (e) => {
        let value = e.target.value;
        const updatedData = { ...newEvent, professionalId: value };
        setNewEvent(updatedData);
        setSelectedDoctor(parseInt(value));
    };
    const clearNewConsult = () => {
        setNewEvent([]);
    }


    const validateConsultation = () => {
        const validationError = validateHourConsult(newEvent.hourConsult);
        const filteredEvents = events.filter(event => new Date(event.dateForListing).toDateString() === new Date(newEvent.dateForListing).toDateString());

        if (!newEvent.patientName || !newEvent.consultType || !newEvent.hourConsult || !newEvent.professionalId || !newEvent.phone) {
            errorAlert("Somente o campo de anotações pode ser vazio");
            return
        } else if (newEvent.phone.length < 14) {
            errorAlert("Telefone inválido");
            return
        } else if (validationError) {
            errorAlert(validationError);
            return;
        } else if (!isTimeSlotAvailable(filteredEvents, newEvent, selectedDoctor)) {
            errorAlert("Horário indisponível");
            return;
        } else if (newEvent.consultType === 'Plano' && (!newEvent.qntReturns || !newEvent.currentReturn)) {
            errorAlert("Preencha a quantidade de retornos");
            return
        } else if (newEvent.qntReturns && parseInt(newEvent.qntReturns) < parseInt(newEvent.currentReturn)) {
            errorAlert("Os retornos acabaram");
            return;
        } else {
            addEvent()
        }
    }

    const validateEdit = () => {
        const validationError = validateHourConsult(newEvent.hourConsult);

        if (!newEvent.patientName || !newEvent.consultType || !newEvent.hourConsult || !newEvent.professionalId || !newEvent.phone) {
            errorAlert("Somente o campo de anotações pode ser vazio");
            return
        } else if (newEvent.phone.length < 14) {
            errorAlert("Telefone inválido");
            return
        } else if (validationError) {
            errorAlert(validationError);
            return;
        } else if (newEvent.consultType === 'Plano' && (!newEvent.qntReturns || !newEvent.currentReturn)) {
            errorAlert("Preencha a quantidade de retornos");
            return
        } else if (newEvent.qntReturns && parseInt(newEvent.qntReturns) < parseInt(newEvent.currentReturn)) {
            errorAlert("Os retornos acabaram");
            return;
        } else {
            editConsult();
        }
    } 

    const addEvent = async () => {
        setLoading(true);

        const { patientName, dateForListing, dateConsult, hourConsult, consultType, qntReturns, currentReturn, professionalId, phone, notes } = newEvent;

        const promise = api.post('/api/calendar', {
            patientName,
            dateForListing,
            dateConsult,
            hourConsult,
            consultType,
            qntReturns,
            currentReturn,
            professionalId,
            phone,
            notes
        }, {
            params: {
                clinicId
            }
        });

        loadingAlert("Salvando...", promise);

        promise
            .then((response) => {
                if (response.status === 200) {
                    window.location.reload();  
                }
        })
            .finally(() => {
            setLoading(false);
        });
    };

    const removeEvent = async (id) => {
        setLoading(true);

        const promise = api.delete('/api/calendar', {
            params: {
                consultId: id
            }
        });

        loadingAlert("Deletando...", promise);

        promise
            .then((response) => {
                if (response.status === 200) {
                    window.location.reload();
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const editConsult = async () => {
        setLoading(true);

        const { IdConsult, patientName, dateForListing, dateConsult, hourConsult, consultType, qntReturns, currentReturn, professionalId, phone, notes } = newEvent;

        const promise = api.put('/api/calendar', {
            IdConsult,
            patientName,
            dateForListing,
            dateConsult,
            hourConsult,
            consultType,
            qntReturns,
            currentReturn,
            professionalId,
            phone,
            notes
        });

        loadingAlert("Salvando...", promise);

        promise
            .then((response) => {
                if (response.status === 200) {
                    window.location.reload();
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        updateWeek();
    }, [currentDate]);

    return (
        <section className='w-full overflow-y-auto shadow dark:shadow-dark rounded-lg'>    
            <div className="w-full rounded-lg text-gray-600 dark:text-zinc-100  overflow-hidden">

                {/* Cabeçalho do calendário */}
                <div className="flex items-center justify-between py-2 px-6 mb-5">
                    <div className='flex gap-5'>
                        <div onClick={handleCurrentDate} className='px-6 flex items-center text-base font-semibold cursor-pointer  bg-azul-900/20 text-azul-900 border border-azul-900 rounded-lg'>
                            <span >Hoje</span>
                        </div>

                        <div className="bg-azul-900 rounded-lg border border-[#93C4F1] flex flex-nowrap">
                            <button
                                type="button"
                                className={`p-2.5 rounded-s-lg transition hover:bg-black/20 border-r border-[#93C4F1] `}
                                onClick={handlePreviousWeek}
                            >
                                <FaChevronLeft className="text-white " />
                            </button>
                            <button
                                type="button"
                                className={`p-2.5 rounded-e-lg transition hover:bg-black/20 `}
                                onClick={handleNextWeek}
                            >
                                <FaChevronRight className="text-white  " />
                            </button>
                        </div>

                        {week.length > 0 && (
                            <div className='px-2.5 flex items-center gap-1 text-base font-medium  bg-azul-900/10 text-azul-900 border border-azul-900 rounded-lg'>
                                <span className="capitalize">{week[0].toLocaleDateString('pt-BR', { month: 'long' })}</span>
                                <span className='text-nowrap'>de {week[0].toLocaleDateString('pt-BR', { year: 'numeric' })}</span>
                            </div>
                        )}
                    </div>

                    <select
                        className="custom-input"
                        value={selectedDoctor || ''}
                        onChange={(e) => setSelectedDoctor(parseInt(e.target.value))}
                    >
                        <option value=''>Selecionar um profissional</option>
                        {doctors.map((doctor) => (
                            <option key={doctor.idUser} value={doctor.idUser}>{doctor.name}</option>
                        ))}
                    </select>
                </div>

                    <div className="-mx-1 -mb-1 dark:-mx-0 dark:-mb-0 relative">
                        {/* Simulação dos dias */}
                        <div className="w-full flex flex-col absolute r-0">
                            <div className="h-8"></div>
                            {HOURS_COLUMN.map((hour, hourIndex) => (
                                <div className='flex items-center' key={hourIndex}  >
                                    <p className="w-[11.2%] h-24 font-semibold flex items-center justify-center ">
                                        {hour}
                                    </p>
                                    <hr className='h-1 w-full dark:border-dark-600' />
                                </div>
                            ))}
                        </div>

                        {/* Coluna dos Dias */}
                        <div className='flex justify-end z-20 relative'>
                            {week.map((date, dateIndex) => (
                                <div
                                    key={dateIndex}
                                    className="w-[12.85%] bg-transparent"
                                    onClick={() => showNewEventModal(date)}
                                >
                                    <div className="flex flex-col h-full">
                                        <div className={`text-sm tracking-wide font-normal text-center`}>
                                            <span className={`${isToday(date) ? 'text-azul-900' : 'text-gray-600 dark:text-zinc-50'}`}>{DAYS[date.getDay()]}</span>
                                        </div>
                                        <div className="flex justify-center items-center mt-1 mb-4 h-9">
                                            <span className={`${isToday(date) ? 'text-azul-900' : 'text-gray-600 dark:text-zinc-50'} text-3xl tracking-wide font-normal`}>{date.getDate()}</span>
                                        </div>

                                        {/* cada dia da semana */}
                                        <div className='h-[1344px] border-x dark:border-dark-600 relative cursor-pointer'>
                                            {filteredEvents.filter(e => new Date(e.dateForListing).toDateString() === date.toDateString()).map((event) => {
                                                const [startTime, endTime] = event.hourConsult.split(' - ');
                                                const eventHeight = calculateEventHeight(startTime, endTime);
                                                const eventPosition = calculateEventPosition(startTime);
                                                const isSmallEvent = eventHeight < 68;

                                                return (
                                                    <div
                                                        key={event.IdConsult}
                                                        className={`px-2 z-30 py-1 rounded-lg border dark:border-dark-100 text-white cursor-pointer w-full overflow-hidden ${isSmallEvent && 'flex justify-between items-center'}  ${event.consultType === '1° Consulta' ? 'bg-[#A95ADA]' : ''}${event.consultType === '1° Retorno' ? 'bg-[#DA5AB6]' : ''}${event.consultType === 'Ret. Avulso' ? 'bg-[#5A9CDA]' : ''}${event.consultType === 'Plano' ? 'bg-[#5ADA76]' : ''}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            showViewModal(event.IdConsult);
                                                        }}
                                                        style={{ height: `${eventHeight}px`, top: `${eventPosition}px`, position: 'absolute' }}
                                                    >
                                                        <span className={`${isSmallEvent ? 'text-xs' : 'text-base'} max-w-20 font-semibold truncate leading-none capitalize`}>{event.patientName}</span>
                                                        <span className={`${isSmallEvent && 'hidden'} text-xs bg-white/30 font-medium px-1 rounded w-fit block`}>{event.consultType}</span>
                                                        <span className='text-xs font-medium text-nowrap leading-none'>{event.hourConsult}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
            </div>

            {openEventModal && (
                <div className="bg-[#000000cc] fixed z-50 top-0 right-0 left-0 bottom-0 h-full w-full">
                    <div className="p-4 max-w-xl mx-auto relative overflow-hidden  top-[50%] translate-y-[-50%]">
                        <div className="bg-white text-black dark:bg-dark-800 dark:text-white shadow w-full rounded-lg overflow-hidden block p-8">
                            <label htmlFor="patientName" className='w-full pb-2'>
                                <input
                                    autoComplete='off'
                                    type="text"
                                    id='patientName'
                                    name='patientName'
                                    className='bg-transparent border-b border-black/80 dark:border-gray-500 pb-2 mb-6 text-xl w-full outline-none'
                                    placeholder='Nome do paciente'
                                    value={newEvent.patientName || ''}
                                    onChange={(e) => setNewEvent({ ...newEvent, patientName: e.target.value })}
                                />
                            </label>

                            <div className='flex gap-5'>
                                <InputText
                                    InputId={"dateConsult"}
                                    onChange={handleChange}
                                    val={newEvent.dateConsult || ''}
                                    classInput={'cursor-not-allowed text-center'}
                                    readonly={true}
                                />
                                <InputText
                                    InputId={"hourConsult"}
                                    onChange={handleChange}
                                    val={newEvent.hourConsult || ''}
                                    classInput={'text-center'}
                                    placeholder={'XX:XX - XX:XX'}
                                    mask={'hour'}
                                />
                            </div>

                            <div className={`flex justify-between  ${newEvent.consultType === 'Plano' ? 'mt-8 mb-2' : 'my-8'}`}>
                                {consultType.map((consult) => (
                                    <label htmlFor={consult.IdConsult} className='text-sm font-medium checked:bg-red-400' key={consult.IdConsult}>
                                        <input
                                            type="radio"
                                            name='consultType'
                                            id={consult.IdConsult}
                                            className='mr-2 bg-azul-900'
                                            value={consult.value}
                                            checked={newEvent.consultType === consult.value}
                                            onChange={(e) => setNewEvent({ ...newEvent, consultType: e.target.value })}
                                        />
                                        {consult.value}
                                    </label>
                                ))}
                            </div>

                            {newEvent.consultType === 'Plano' && (
                                <div className='bg-slate-300/30 w-full mb-5 p-2 rounded flex justify-around'>
                                    <label htmlFor='qntReturns' className='text-lg'>
                                        Qnt total retornos
                                        <input
                                            type="number"
                                            name="qntReturns"
                                            id="qntReturns"
                                            min={'1'}
                                            max={'20'}
                                            maxLength={2}
                                            className='custom-input max-h-9 max-w-14 ml-2 bg-transparent'
                                            onChange={(e) => setNewEvent({ ...newEvent, qntReturns: e.target.value })}
                                            value={newEvent.qntReturns || ''}
                                        />
                                    </label>

                                    <label htmlFor='currentReturn' className='text-lg'>
                                        Retorno atual
                                        <input
                                            type="number"
                                            name="currentReturn"
                                            id="currentReturn"
                                            min={'1'}
                                            max={'20'}
                                            value={newEvent.currentReturn || ''}
                                            maxLength={2}
                                            className='custom-input max-h-9 max-w-14 ml-2 bg-transparent'
                                            onChange={(e) => setNewEvent({ ...newEvent, currentReturn: e.target.value })}
                                        />
                                    </label>
                                </div>
                            )}

                            <label htmlFor="professionalId" className='flex text-nowrap items-center gap-5 font-semibold'>
                                Profissional:
                                <select
                                    id='professionalId'
                                    name='professionalId'
                                    className='custom-input w-full'
                                    value={newEvent.professionalId || ''}
                                    onChange={(e) => handleChangeProfessional(e)}
                                >
                                    <option value=''>Selecionar</option>
                                    {doctors.map((doctor) => (
                                        <option key={doctor.idUser} value={doctor.idUser}>{doctor.name}</option>
                                    ))}
                                </select>
                            </label>

                            <InputText
                                labelName={"Tel. Contato:"}
                                classLabel={'flex items-center gap-4 text-nowrap'}
                                InputId={"phone"}
                                onChange={handleChange}
                                mask="phone"
                                max={14}
                                val={newEvent.phone || ''}
                            />
                            <InputText
                                labelName={"Anotações:"}
                                classLabel={'flex items-center gap-6 text-nowrap '}
                                InputId={"notes"}
                                onChange={handleChange}
                                val={newEvent.notes || ''}
                            />

                            <div className="flex justify-between mt-10">
                                <button
                                    type="button"
                                    className="bg-transparent text-azul-900 font-semibold py-2 px-4 border border-azul-900 rounded-lg shadow-sm mr-2"
                                    onClick={() => closeModal(setOpenEventModal)}
                                >
                                    Cancelar
                                </button>

                                {statusEditing ? (
                                    <button className={`text-white font-semibold rounded-lg py-2 px-4 ${loading ? 'bg-azul-900/50 cursor-not-allowed' : 'bg-azul-900'}`} disabled={loading} onClick={validateEdit}>
                                        Salvar edições
                                    </button>
                                ) : (
                                    <button className={`text-white font-semibold rounded-lg py-2 px-4 ${loading ? 'bg-azul-900/50 cursor-not-allowed' : 'bg-azul-900'}`} disabled={loading} onClick={validateConsultation}>
                                        Salvar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {openViewModal && (
                <div className="bg-[#000000cc] fixed z-50 top-0 right-0 left-0 bottom-0 h-full w-full">
                    <div className="p-4 max-w-xl mx-auto relative overflow-hidden top-[50%] translate-y-[-50%]">
                        <div className="bg-white text-black dark:bg-dark-800 dark:text-white shadow w-full rounded-lg  overflow-hidden block p-8">
                            {selectedPatient && events.filter(event => event.IdConsult === selectedPatient).map((patient) => (
                                <div key={patient.IdConsult}>
                                    <div className='flex justify-end text-2xl'>
                                        <IoClose onClick={() => closeModal(setViewModal)} className='cursor-pointer' />
                                    </div>

                                    <span className='text-2xl font-medium capitalize'>{patient.patientName}</span>

                                    <div>
                                        <span className='bg-azul-900/15 font-medium px-2 py-1 my-2 rounded w-fit text-azul-900 block'>
                                            {patient.consultType}
                                            {
                                                patient.consultType === 'Plano' && (
                                                    <>
                                                        <span> {patient.qntReturns}/{patient.currentReturn} </span>
                                                    </>
                                                )
                                            }
                                        </span>
                                    </div>
                                    <p className='w-full first-letter:uppercase'>{patient.dateConsult} - {patient.hourConsult}</p>
                                    <div className='flex items-center gap-2 my-2'>
                                        <span className='w-fit font-semibold'>Tel. Contato:</span>
                                        <span>{patient.phone}</span>
                                    </div>
                                    <div className='flex items-start gap-2'>
                                        <span className='w-fit font-semibold'>Anotações:</span>
                                        <p className='first-letter:uppercase'>{patient.notes}</p>
                                    </div>

                                    <div className="flex justify-between mt-10 gap-2">
                                        <div className='flex gap-5'>
                                            <button
                                                className="bg-azul-900 font-medium text-white p-2 rounded-md text-2xl"
                                                onClick={() => showEditEventModal(patient.IdConsult)}
                                            >
                                                <LuPencil />
                                            </button>

                                            <button
                                                className="bg-vermelho-900 font-medium text-white p-2 rounded-md text-2xl"
                                                onClick={() => removeEvent(patient.IdConsult)}
                                            >
                                                <LuTrash2 />
                                            </button>
                                        </div>

                                        {patient.patientId !== null
                                            ? (
                                                <Link href={`/inicio/pacientes/prontuario/${patient.patientId}`} className='bg-verde-900 font-medium  text-white p-2 rounded-md'>
                                                    Iniciar atendimento
                                                </Link>
                                            ) : (
                                                <button
                                                    className="bg-verde-900 font-medium  text-white p-2 rounded-md"
                                                    onClick={() => startAppointment(patient.IdConsult)}
                                                >
                                                    Iniciar atendimento
                                                </button>
                                            )
                                        }
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {openStartAppointmentModal && (
                <div className="bg-[#000000cc] fixed z-50 top-0 right-0 left-0 bottom-0 h-full w-full">
                    <div className="p-4 max-w-xl mx-auto relative overflow-hidden top-[50%] translate-y-[-50%]">
                        <div className="bg-white text-black dark:bg-dark-800 dark:text-white shadow w-full rounded-lg  overflow-hidden block p-8">
                            {selectedPatient && events.filter(event => event.IdConsult === selectedPatient).map((patient) => (
                                <div key={patient.IdConsult}>
                                    <p className='text-center text-2xl mb-5'>Deseja iniciar a autoavaliação nesse dispositivo ou enviar ao paciente?</p>

                                    <div className='flex justify-around'>
                                        <Link href={`/${slug}`} target='_blank' className='border border-azul-900 py-2 px-3 text-azul-900 rounded text-lg font-medium'>
                                            Iniciar neste dispositivo
                                        </Link>

                                        <button className='bg-azul-900 text-white rounded py-2 px-3 text-lg font-medium' onClick={copyDomainToClipboard} >
                                            Enviar link ao paciente
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}