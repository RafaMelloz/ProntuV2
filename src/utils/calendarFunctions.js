// Constantes que definem a escala de tempo e a duração mínima
const PIXELS_PER_HOUR = 96; // Número de pixels que representam uma hora no calendário
const MINUTES_PER_HOUR = 60; // Número de minutos em uma hora
const MINIMUM_DURATION = 20; // Duração mínima para um evento, em minutos
const PIXELS_PER_MINUTE = PIXELS_PER_HOUR / MINUTES_PER_HOUR; // Número de pixels que representam um minuto no calendário (1.6)

// Calcula a posição do evento em pixels a partir do horário de início
export const calculateEventPosition = (startTime) => {
    // Divide o horário de início em horas e minutos
    const [startHour, startMinutes] = startTime.split(':').map(Number);

    // Converte o horário de início para minutos desde o início do dia (08:00)
    const startInMinutes = (startHour - 6) * MINUTES_PER_HOUR + startMinutes;

    // Converte minutos para pixels 
    return startInMinutes * PIXELS_PER_MINUTE;
};

// Calcula a altura do evento em pixels a partir dos horários de início e fim
export const calculateEventHeight = (startTime, endTime) => {
    // Divide os horários de início e fim em horas e minutos
    const [startHour, startMinutes] = startTime.split(':').map(Number);
    const [endHour, endMinutes] = endTime.split(':').map(Number);
    // Calcula a duração do evento em minutos
    const durationInMinutes = (endHour - startHour) * MINUTES_PER_HOUR + (endMinutes - startMinutes);
    // Converte a duração do evento para pixels
    return durationInMinutes * PIXELS_PER_MINUTE;
};

// Converte um horário (hh:mm) para minutos desde o início do dia
export const convertTimeToMinutes = (time) => {
    const [hour, minute] = time.split(':').map(Number);
    return hour * MINUTES_PER_HOUR + minute;
};

// Verifica se um horário está disponível para um determinado médico
export const isTimeSlotAvailable = (events, newEvent, selectedDoctor) => {
    // Converte os horários de início e fim do novo evento para minutos
    const [newStart, newEnd] = newEvent.hourConsult.split(' - ').map(convertTimeToMinutes);
    const newDuration = newEnd - newStart;

    // Verifica se a duração do novo evento é menor que a duração mínima permitida
    if (newDuration < MINIMUM_DURATION) {
        return false;
    }

    // Itera sobre os eventos existentes para verificar conflitos
    for (const event of events) {
        // Verifica se o evento atual é do mesmo médico selecionado
        if (event.professionalId === parseInt(selectedDoctor)) {
            // Converte os horários de início e fim do evento existente para minutos
            const [start, end] = event.hourConsult.split(' - ').map(convertTimeToMinutes);
            // Verifica se há conflito de horário entre o novo evento e o evento existente
            if ((newStart >= start && newStart < end) || (newEnd > start && newEnd <= end) || (newStart <= start && newEnd >= end)) {
                return false;
            }
        }
    }

    // Retorna true se não houver conflitos de horário
    return true;
};

// Valida o formato e a faixa de horário de uma consulta
export const validateHourConsult = (hourConsult) => {
    // Expressão regular para validar o formato do horário (hh:mm - hh:mm)
    const regex = /^(0[6-9]|1[0-9]|20):[0-5]\d - (0[6-9]|1[0-9]|20):[0-5]\d$/;
    if (!regex.test(hourConsult)) {
        return "Formato de horário inválido";
    }

    // Converte os horários de início e fim para minutos
    const [start, end] = hourConsult.split(' - ').map(convertTimeToMinutes);
    // Define os limites do dia em minutos (08:00 - 18:00)
    const startOfDay = 6 * MINUTES_PER_HOUR;
    const endOfDay = 20 * MINUTES_PER_HOUR;
    const duration = end - start;

    // Verifica se o horário está fora do intervalo permitido ou se o horário de início é igual ou posterior ao horário de fim
    if (start < startOfDay || end > endOfDay || start >= end) {
        return "Horário fora do intervalo permitido (06:00 - 20:00)";
    }

    // Verifica se a duração é menor que a mínima permitida
    if (duration < MINIMUM_DURATION) {
        return "A duração mínima para um agendamento é de 20 minutos.";
    }

    // Retorna null se não houver erro (indica que o horário é válido)
    return null;
};