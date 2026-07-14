/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type enUS from './en-US';

const locale: typeof enUS = {
    DATE: {
        description: 'Devuelve el número de serie de una fecha particular',
        abstract: 'Devuelve el número de serie de una fecha particular',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/date-function',
            },
        ],
        functionParameter: {
            year: { name: 'año', detail: 'El valor del argumento año puede incluir de uno a cuatro dígitos. Excel interpreta el argumento año según el sistema de fechas que use su equipo. De forma predeterminada, Univer usa el sistema de fechas de 1900, lo que significa que la primera fecha es el 1 de enero de 1900.' },
            month: { name: 'mes', detail: 'Un entero positivo o negativo que representa el mes del año del 1 al 12 (enero a diciembre).' },
            day: { name: 'día', detail: 'Un entero positivo o negativo que representa el día del mes del 1 al 31.' },
        },
    },
    DATEDIF: {
        description: 'Calcula el número de días, meses o años entre dos fechas. Esta función es útil en fórmulas donde necesita calcular una edad.',
        abstract: 'Calcula el número de días, meses o años entre dos fechas. Esta función es útil en fórmulas donde necesita calcular una edad.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/datedif-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'fecha_inicial', detail: 'Es una fecha que representa la primera o la fecha inicial de un período determinado. Las fechas pueden escribirse como cadenas de texto entre comillas (por ejemplo, "30/01/2001") como números de serie (por ejemplo, 36921, que representa el 30 de junio de 2001, si usa el sistema de fechas de 1900), o bien como resultado de otras fórmulas o funciones (por ejemplo FECHANUMERO("30/01/2001")).' },
            endDate: { name: 'fecha_final', detail: 'Una fecha que representa la última del período o al fecha de finalización.' },
            unit: { name: 'Unidad', detail: 'El tipo de información que desea devolver, donde: Unidad***Devuelve " Y "El número de años completos en el período." M "El número de meses completos en el período". D "El número de días del período". MD "La diferencia entre los días de start_date y end_date. Los meses y años de las fechas se pasan por alto. Importante: No se recomienda usar el argumento "MD", ya que existen limitaciones conocidas con él. Consulta la sección de problemas conocidos que viene a continuación". YM "La diferencia entre los meses de start_date y end_date. Los días y años de las fechas se pasan por alto" YD "La diferencia entre los días de start_date y end_date. Los años de las fechas se pasan por alto.' },
        },
    },
    DATEVALUE: {
        description: 'Convierte una fecha en forma de texto a un número de serie.',
        abstract: 'Convierte una fecha en forma de texto a un número de serie',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/datevalue-function',
            },
        ],
        functionParameter: {
            dateText: { name: 'texto_fecha', detail: 'Texto que representa una fecha en un formato de fecha de Excel, o una referencia a una celda que contiene texto que representa una fecha en un formato de fecha de Excel. Por ejemplo, "30/1/2008" o "30-Ene-2008" son cadenas de texto entre comillas que representan fechas.\\nUsando el sistema de fechas predeterminado en Microsoft Excel para Windows, el argumento texto_fecha debe representar una fecha entre el 1 de enero de 1900 y el 31 de diciembre de 9999. La función DATEVALUE devuelve el valor de error #VALUE! si el valor del argumento texto_fecha está fuera de este rango.\\nSi se omite la parte del año del argumento texto_fecha, la función DATEVALUE usa el año actual del reloj integrado de su equipo. La información de hora en el argumento texto_fecha se ignora.' },
        },
    },
    DAY: {
        description: 'Devuelve el día de una fecha, representado por un número de serie. El día se proporciona como un entero que va del 1 al 31.',
        abstract: 'Convierte un número de serie a un día del mes',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/day-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'número_serie', detail: 'La fecha del día que intenta encontrar. Las fechas deben introducirse usando la función DATE, o como resultados de otras fórmulas o funciones. Por ejemplo, use DATE(2008,5,23) para el día 23 de mayo de 2008.' },
        },
    },
    DAYS: {
        description: 'Devuelve el número de días entre dos fechas',
        abstract: 'Devuelve el número de días entre dos fechas',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/days-function',
            },
        ],
        functionParameter: {
            endDate: { name: 'fecha_final', detail: 'Fecha_inicial y Fecha_final son las dos fechas entre las que desea conocer el número de días.' },
            startDate: { name: 'fecha_inicial', detail: 'Fecha_inicial y Fecha_final son las dos fechas entre las que desea conocer el número de días.' },
        },
    },
    DAYS360: {
        description: 'Calcula el número de días entre dos fechas basándose en un año de 360 días',
        abstract: 'Calcula el número de días entre dos fechas basándose en un año de 360 días',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/days360-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'fecha_inicial', detail: 'Fecha_inicial y Fecha_final son las dos fechas entre las que desea conocer el número de días.' },
            endDate: { name: 'fecha_final', detail: 'Fecha_inicial y Fecha_final son las dos fechas entre las que desea conocer el número de días.' },
            method: { name: 'método', detail: 'Un valor lógico que especifica si se usa el método estadounidense o europeo en el cálculo.' },
        },
    },
    EDATE: {
        description: 'Devuelve el número de serie que representa la fecha que está el número indicado de meses antes o después de una fecha especificada (la fecha_inicial). Use EDATE para calcular fechas de vencimiento o fechas de vencimiento que caen en el mismo día del mes que la fecha de emisión.',
        abstract: 'Devuelve el número de serie de la fecha que está el número indicado de meses antes o después de la fecha inicial',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/edate-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'fecha_inicial', detail: 'Una fecha que representa la fecha inicial. Las fechas deben introducirse usando la función DATE, o como resultados de otras fórmulas o funciones. Por ejemplo, use DATE(2008,5,23) para el día 23 de mayo de 2008. Pueden ocurrir problemas si las fechas se introducen como texto.' },
            months: { name: 'meses', detail: 'El número de meses antes o después de fecha_inicial. Un valor positivo para meses produce una fecha futura; un valor negativo produce una fecha pasada.' },
        },
    },
    EOMONTH: {
        description: 'Devuelve el número de serie del último día del mes antes o después de un número especificado de meses',
        abstract: 'Devuelve el número de serie del último día del mes antes o después de un número especificado de meses',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/eomonth-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'fecha_inicial', detail: 'Una fecha que representa la fecha inicial.' },
            months: { name: 'meses', detail: 'El número de meses antes o después de fecha_inicial.' },
        },
    },
    EPOCHTODATE: {
        description: 'Convierte una marca de tiempo UNIX en segundos, milisegundos o microsegundos en un valor de fecha y hora en tiempo universal coordinado (UTC).',
        abstract: 'Convierte una marca de tiempo UNIX en segundos, milisegundos o microsegundos en un valor de fecha y hora en tiempo universal coordinado (UTC).',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.google.com/docs/answer/13193461?hl=es',
            },
        ],
        functionParameter: {
            timestamp: { name: 'marca_tiempo', detail: 'EPOCHTODATE(1655908429662;2)' },
            unit: { name: 'unidad', detail: 'EPOCHTODATE(1655906710)' },
        },
    },
    HOUR: {
        description: 'Convierte un número de serie a una hora',
        abstract: 'Convierte un número de serie a una hora',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/hour-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'número_serie', detail: 'La fecha del día que intenta encontrar. Las fechas deben introducirse usando la función DATE, o como resultados de otras fórmulas o funciones. Por ejemplo, use DATE(2008,5,23) para el día 23 de mayo de 2008.' },
        },
    },
    ISOWEEKNUM: {
        description: 'Devuelve el número de semana ISO del año para una fecha determinada.',
        abstract: 'Devuelve el número de semana ISO del año para una fecha determinada.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/isoweeknum-function',
            },
        ],
        functionParameter: {
            date: { name: 'fecha', detail: 'Obligatorio. Fecha es el código de fecha-hora que Excel usa para los cálculos de fecha y hora.' },
        },
    },
    MINUTE: {
        description: 'Devuelve los minutos de un valor de hora. Los minutos se expresan como números enteros comprendidos entre 0 y 59.',
        abstract: 'Devuelve los minutos de un valor de hora. Los minutos se expresan como números enteros comprendidos entre 0 y 59.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/minute-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'número_serie', detail: 'Obligatorio. Es la hora que contiene el valor de minutos que desea buscar. Las horas pueden escribirse como cadenas de texto entre comillas (por ejemplo, "6:45 p.m."), como números decimales (por ejemplo, 0,78125, que representa las 6:45 p.m.), o bien como resultado de otras fórmulas o funciones, por ejemplo HORANUMERO("6:45 p.m.").' },
        },
    },
    MONTH: {
        description: 'Devuelve el mes de una fecha representada por un número de serie. El mes se expresa como número entero comprendido entre 1 (enero) y 12 (diciembre).',
        abstract: 'Devuelve el mes de una fecha representada por un número de serie. El mes se expresa como número entero comprendido entre 1 (enero) y 12 (diciembre).',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/month-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'número_serie', detail: 'Obligatorio. Es la fecha del mes que intenta buscar. Inserte las fechas con la función FECHA o como resultado de otras fórmulas o funciones. Por ejemplo, use FECHA(2008,5,23) para el día 23 de mayo de 2008. Puede tener problemas al escribir las fechas como texto .' },
        },
    },
    NETWORKDAYS: {
        description: 'Devuelve el número de días laborables entre fecha_inicial y fecha_final. Los días laborables no incluyen los fines de semana ni otras fechas que se identifiquen en el argumento vacaciones. Use DIAS.LAB para calcular el incremento de los beneficios acumulados de los empleados basándose en el número de días trabajados durante un período específico.',
        abstract: 'Devuelve el número de días laborables entre fecha_inicial y fecha_final. Los días laborables no incluyen los fines de semana ni otras fechas que se identifiquen en el argumento vacaciones. Use DIAS.LAB para calcular el incremento de los beneficios acumulados de los empleados basándose en el número de días trabajados durante un período específico.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/networkdays-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'fecha_inicial', detail: 'Obligatorio. Es una fecha que representa la fecha inicial.' },
            endDate: { name: 'fecha_final', detail: 'Obligatorio. Es una fecha que representa la fecha final.' },
            holidays: { name: 'días_festivos', detail: 'Opcional. Es un rango opcional de una o varias fechas que deben excluirse del calendario laboral, como los días festivos nacionales y locales. La lista puede ser un rango de celdas que contengan las fechas o una constante de matriz de los números de serie que representen las fechas.' },
        },
    },
    NETWORKDAYS_INTL: {
        description: 'Devuelve el número de todos los días laborables entre dos fechas mediante parámetros para indicar cuáles y cuántos son días de fin de semana. Los días de fin de semana y los días que se especifiquen como días festivos no se consideran días laborables.',
        abstract: 'Devuelve el número de todos los días laborables entre dos fechas mediante parámetros para indicar cuáles y cuántos son días de fin de semana. Los días de fin de semana y los días que se especifiquen como días festivos no se consideran días laborables.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/networkdays-intl-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'fecha_inicial', detail: 'Una fecha que representa la fecha inicial.' },
            endDate: { name: 'fecha_final', detail: 'Una fecha que representa la fecha final.' },
            weekend: { name: 'fin_semana', detail: 'es un número o cadena de fin de semana que especifica cuándo ocurren los fines de semana.' },
            holidays: { name: 'días_festivos', detail: 'Un rango opcional de una o más fechas para excluir del calendario laboral, como días festivos estatales y federales y días festivos flotantes.' },
        },
    },
    NOW: {
        description: 'Devuelve el número de serie de la fecha y hora actuales. Si el formato de celda es General antes de especificar la función, Excel cambia el formato de celda para que coincida con el formato de fecha y hora de la configuración regional. Puede cambiar el formato de fecha y hora para la celda con los comandos en el grupo Número de la pestaña Inicio de la cinta.',
        abstract: 'Devuelve el número de serie de la fecha y hora actuales. Si el formato de celda es General antes de especificar la función, Excel cambia el formato de celda para que coincida con el formato de fecha y hora de la configuración regional. Puede cambiar el formato de fecha y hora para la celda con los comandos en el grupo Número de la pestaña Inicio de la cinta.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/now-function',
            },
        ],
        functionParameter: {
        },
    },
    SECOND: {
        description: 'Devuelve los segundos de un valor de hora. El segundo se expresa como número entero comprendido entre 0 (cero) y 59.',
        abstract: 'Devuelve los segundos de un valor de hora. El segundo se expresa como número entero comprendido entre 0 (cero) y 59.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/second-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'número_serie', detail: 'Obligatorio. Es la hora que contiene los segundos que se desea buscar. Las horas pueden escribirse como cadenas de texto entre comillas (por ejemplo, "6:45 p.m."), como números decimales (por ejemplo, 0,78125, que representa las 6:45 p.m.), o bien como resultado de otras fórmulas o funciones, por ejemplo HORANUMERO("6:45 p.m.").' },
        },
    },
    TIME: {
        description: 'Devuelve el número de serie de una hora particular.',
        abstract: 'Devuelve el número de serie de una hora particular',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/time-function',
            },
        ],
        functionParameter: {
            hour: { name: 'hora', detail: 'Un número del 0 (cero) al 32767 que representa la hora. Cualquier valor mayor que 23 se dividirá por 24 y el resto se tratará como el valor de la hora. Por ejemplo, TIME(27,0,0) = TIME(3,0,0) = .125 o 3:00 AM.' },
            minute: { name: 'minuto', detail: 'Un número del 0 al 32767 que representa el minuto. Cualquier valor mayor que 59 se convertirá a horas y minutos. Por ejemplo, TIME(0,750,0) = TIME(12,30,0) = .520833 o 12:30 PM.' },
            second: { name: 'segundo', detail: 'Un número del 0 al 32767 que representa el segundo. Cualquier valor mayor que 59 se convertirá a horas, minutos y segundos. Por ejemplo, TIME(0,0,2000) = TIME(0,33,22) = .023148 o 12:33:20 AM.' },
        },
    },
    TIMEVALUE: {
        description: 'Devuelve el número decimal de la hora representada por una cadena de texto. El número decimal es un valor comprendido entre 0 (cero) y 0,99988426 que representa las horas entre 0:00:00 (12:00:00 a.m.) y 23:59:59 (11:59:59 p.m.).',
        abstract: 'Devuelve el número decimal de la hora representada por una cadena de texto. El número decimal es un valor comprendido entre 0 (cero) y 0,99988426 que representa las horas entre 0:00:00 (12:00:00 a.m.) y 23:59:59 (11:59:59 p.m.).',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/timevalue-function',
            },
        ],
        functionParameter: {
            timeText: { name: 'texto_hora', detail: 'Obligatorio. Es una cadena de texto que representa una hora en uno de los formatos de hora de Microsoft Excel, por ejemplo, las cadenas de texto entre comillas "6:45 p.m." y "18:45" representan la hora.' },
        },
    },
    TO_DATE: {
        description: 'Convierte un número en una fecha.',
        abstract: 'Convierte un número en una fecha.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.google.com/docs/answer/3094239?hl=es',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'TO_DATE(A2)' },
        },
    },
    TODAY: {
        description: 'Devuelve el número de serie de la fecha de hoy',
        abstract: 'Devuelve el número de serie de la fecha de hoy',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/today-function',
            },
        ],
        functionParameter: {
        },
    },
    WEEKDAY: {
        description: 'Convierte un número de serie a un día de la semana',
        abstract: 'Convierte un número de serie a un día de la semana',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/weekday-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'número_serie', detail: 'Un número secuencial que representa la fecha del día que intenta encontrar.' },
            returnType: { name: 'tipo_devuelto', detail: 'Un número que determina el tipo de valor devuelto.' },
        },
    },
    WEEKNUM: {
        description: 'Convierte un número de serie a un número que representa dónde cae la semana numéricamente dentro de un año',
        abstract: 'Convierte un número de serie a un número que representa dónde cae la semana numéricamente dentro de un año',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/weeknum-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'número_serie', detail: 'Una fecha dentro de la semana.' },
            returnType: { name: 'tipo_devuelto', detail: 'Un número que determina en qué día comienza la semana. El predeterminado es 1.' },
        },
    },
    WORKDAY: {
        description: 'Devuelve el número de serie de la fecha antes o después de un número especificado de días laborables',
        abstract: 'Devuelve el número de serie de la fecha antes o después de un número especificado de días laborables',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/workday-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'fecha_inicial', detail: 'Una fecha que representa la fecha inicial.' },
            days: { name: 'días', detail: 'El número de días no fines de semana y no festivos antes o después de fecha_inicial. Un valor positivo para días produce una fecha futura; un valor negativo produce una fecha pasada.' },
            holidays: { name: 'días_festivos', detail: 'Un rango opcional de una o más fechas para excluir del calendario laboral, como días festivos estatales y federales y días festivos flotantes.' },
        },
    },
    WORKDAY_INTL: {
        description: 'Devuelve el número de serie de la fecha antes o después de un número especificado de días laborables usando parámetros para indicar cuáles y cuántos días son días de fin de semana',
        abstract: 'Devuelve el número de serie de la fecha antes o después de un número especificado de días laborables usando parámetros para indicar cuáles y cuántos días son días de fin de semana',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/workday-intl-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'fecha_inicial', detail: 'Una fecha que representa la fecha inicial.' },
            days: { name: 'días', detail: 'El número de días no fines de semana y no festivos antes o después de fecha_inicial. Un valor positivo para días produce una fecha futura; un valor negativo produce una fecha pasada.' },
            weekend: { name: 'fin_semana', detail: 'es un número o cadena de fin de semana que especifica cuándo ocurren los fines de semana.' },
            holidays: { name: 'días_festivos', detail: 'Un rango opcional de una o más fechas para excluir del calendario laboral, como días festivos estatales y federales y días festivos flotantes.' },
        },
    },
    YEAR: {
        description: 'Devuelve el año correspondiente a una fecha. El año se devuelve como un entero en el rango 1900-9999.',
        abstract: 'Convierte un número de serie a un año',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/year-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'número_serie', detail: 'La fecha del año que desea encontrar. Las fechas deben introducirse usando la función DATE, o como resultados de otras fórmulas o funciones. Por ejemplo, use DATE(2008,5,23) para el día 23 de mayo de 2008. Pueden ocurrir problemas si las fechas se introducen como texto.' },
        },
    },
    YEARFRAC: {
        description: 'Devuelve la fracción de año que representa el número de días completos entre fecha_inicial y fecha_final',
        abstract: 'Devuelve la fracción de año que representa el número de días completos entre fecha_inicial y fecha_final',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/es-es/excel/functions/yearfrac-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'fecha_inicial', detail: 'Una fecha que representa la fecha inicial.' },
            endDate: { name: 'fecha_final', detail: 'Una fecha que representa la fecha final.' },
            basis: { name: 'base', detail: 'El tipo de base de recuento de días que se utilizará.' },
        },
    },
};

export default locale;
