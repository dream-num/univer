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
                url: 'https://support.microsoft.com/en-us/office/date-function-e36c0c8c-4104-49da-ab83-82328b832349',
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
                url: 'https://support.microsoft.com/en-us/office/datedif-function-25dba1a4-2812-480b-84dd-8b32a451b35c',
            },
        ],
        functionParameter: {
            startDate: { name: 'fecha_inicial', detail: 'Una fecha que representa la primera fecha, o fecha de inicio de un período determinado.' },
            endDate: { name: 'fecha_final', detail: 'Una fecha que representa la última fecha, o fecha de finalización del período.' },
            method: { name: 'método', detail: 'El tipo de información que desea que se devuelva.' },
        },
    },
    DATEVALUE: {
        description: 'Convierte una fecha en forma de texto a un número de serie.',
        abstract: 'Convierte una fecha en forma de texto a un número de serie',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/datevalue-function-df8b07d4-7761-4a93-bc33-b7471bbff252',
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
                url: 'https://support.microsoft.com/en-us/office/day-function-8a7d1cbb-6c7d-4ba1-8aea-25c134d03101',
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
                url: 'https://support.microsoft.com/en-us/office/days-function-57740535-d549-4395-8728-0f07bff0b9df',
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
                url: 'https://support.microsoft.com/en-us/office/days360-function-b9a509fd-49ef-407e-94df-0cbda5718c2a',
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
                url: 'https://support.microsoft.com/en-us/office/edate-function-3c920eb2-6e66-44e7-a1f5-753ae47ee4f5',
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
                url: 'https://support.microsoft.com/en-us/office/eomonth-function-7314ffa1-2bc9-4005-9d66-f49db127d628',
            },
        ],
        functionParameter: {
            startDate: { name: 'fecha_inicial', detail: 'Una fecha que representa la fecha inicial.' },
            months: { name: 'meses', detail: 'El número de meses antes o después de fecha_inicial.' },
        },
    },
    EPOCHTODATE: {
        description: 'Convierte una marca de tiempo de época Unix en segundos, milisegundos o microsegundos a una fecha y hora en Tiempo Universal Coordinado (UTC).',
        abstract: 'Convierte una marca de tiempo de época Unix en segundos, milisegundos o microsegundos a una fecha y hora en Tiempo Universal Coordinado (UTC).',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.google.com/docs/answer/13193461?hl=zh-Hans&sjid=2155433538747546473-AP',
            },
        ],
        functionParameter: {
            timestamp: { name: 'marca_tiempo', detail: 'Una marca de tiempo de época Unix, en segundos, milisegundos o microsegundos.' },
            unit: { name: 'unidad', detail: 'La unidad de tiempo en la que se expresa la marca de tiempo. 1 por defecto: \\n1 indica que la unidad de tiempo son segundos. \\n2 indica que la unidad de tiempo son milisegundos.\\n3 indica que la unidad de tiempo son microsegundos.' },
        },
    },
    HOUR: {
        description: 'Convierte un número de serie a una hora',
        abstract: 'Convierte un número de serie a una hora',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/hour-function-a3afa879-86cb-4339-b1b5-2dd2d7310ac7',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'número_serie', detail: 'La fecha del día que intenta encontrar. Las fechas deben introducirse usando la función DATE, o como resultados de otras fórmulas o funciones. Por ejemplo, use DATE(2008,5,23) para el día 23 de mayo de 2008.' },
        },
    },
    ISOWEEKNUM: {
        description: 'Devuelve el número de la semana ISO del año para una fecha determinada',
        abstract: 'Devuelve el número de la semana ISO del año para una fecha determinada',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/isoweeknum-function-1c2d0afe-d25b-4ab1-8894-8d0520e90e0e',
            },
        ],
        functionParameter: {
            date: { name: 'fecha', detail: 'Fecha es el código de fecha y hora utilizado por Excel para el cálculo de fecha y hora.' },
        },
    },
    MINUTE: {
        description: 'Convierte un número de serie a un minuto',
        abstract: 'Convierte un número de serie a un minuto',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/minute-function-af728df0-05c4-4b07-9eed-a84801a60589',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'número_serie', detail: 'La fecha del día que intenta encontrar. Las fechas deben introducirse usando la función DATE, o como resultados de otras fórmulas o funciones. Por ejemplo, use DATE(2008,5,23) para el día 23 de mayo de 2008.' },
        },
    },
    MONTH: {
        description: 'Devuelve el mes de una fecha representada por un número de serie. El mes se proporciona como un entero, que va del 1 (enero) al 12 (diciembre).',
        abstract: 'Convierte un número de serie a un mes',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/month-function-579a2881-199b-48b2-ab90-ddba0eba86e8',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'número_serie', detail: 'La fecha del mes que intenta encontrar. Las fechas deben introducirse usando la función DATE, o como resultados de otras fórmulas o funciones. Por ejemplo, use DATE(2008,5,23) para el día 23 de mayo de 2008.' },
        },
    },
    NETWORKDAYS: {
        description: 'Devuelve el número de días laborables completos entre dos fechas',
        abstract: 'Devuelve el número de días laborables completos entre dos fechas',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/networkdays-function-48e717bf-a7a3-495f-969e-5005e3eb18e7',
            },
        ],
        functionParameter: {
            startDate: { name: 'fecha_inicial', detail: 'Una fecha que representa la fecha inicial.' },
            endDate: { name: 'fecha_final', detail: 'Una fecha que representa la fecha final.' },
            holidays: { name: 'días_festivos', detail: 'Un rango opcional de una o más fechas para excluir del calendario laboral, como días festivos estatales y federales y días festivos flotantes.' },
        },
    },
    NETWORKDAYS_INTL: {
        description: 'Devuelve el número de días laborables completos entre dos fechas usando parámetros para indicar cuáles y cuántos días son días de fin de semana',
        abstract: 'Devuelve el número de días laborables completos entre dos fechas usando parámetros para indicar cuáles y cuántos días son días de fin de semana',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/networkdays-intl-function-a9b26239-4f20-46a1-9ab8-4e925bfd5e28',
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
        description: 'Devuelve el número de serie de la fecha y hora actuales.',
        abstract: 'Devuelve el número de serie de la fecha y hora actuales',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/now-function-3337fd29-145a-4347-b2e6-20c904739c46',
            },
        ],
        functionParameter: {
        },
    },
    SECOND: {
        description: 'Convierte un número de serie a un segundo',
        abstract: 'Convierte un número de serie a un segundo',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/second-function-740d1cfc-553c-4099-b668-80eaa24e8af1',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'número_serie', detail: 'La fecha del día que intenta encontrar. Las fechas deben introducirse usando la función DATE, o como resultados de otras fórmulas o funciones. Por ejemplo, use DATE(2008,5,23) para el día 23 de mayo de 2008.' },
        },
    },
    TIME: {
        description: 'Devuelve el número de serie de una hora particular.',
        abstract: 'Devuelve el número de serie de una hora particular',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/time-function-9a5aff99-8f7d-4611-845e-747d0b8d5457',
            },
        ],
        functionParameter: {
            hour: { name: 'hora', detail: 'Un número del 0 (cero) al 32767 que representa la hora. Cualquier valor mayor que 23 se dividirá por 24 y el resto se tratará como el valor de la hora. Por ejemplo, TIME(27,0,0) = TIME(3,0,0) = .125 o 3:00 AM.' },
            minute: { name: 'minuto', detail: 'Un número del 0 al 32767 que representa el minuto. Cualquier valor mayor que 59 se convertirá a horas y minutos. Por ejemplo, TIME(0,750,0) = TIME(12,30,0) = .520833 o 12:30 PM.' },
            second: { name: 'segundo', detail: 'Un número del 0 al 32767 que representa el segundo. Cualquier valor mayor que 59 se convertirá a horas, minutos y segundos. Por ejemplo, TIME(0,0,2000) = TIME(0,33,22) = .023148 o 12:33:20 AM.' },
        },
    },
    TIMEVALUE: {
        description: 'Convierte una hora en forma de texto a un número de serie.',
        abstract: 'Convierte una hora en forma de texto a un número de serie',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/timevalue-function-0b615c12-33d8-4431-bf3d-f3eb6d186645',
            },
        ],
        functionParameter: {
            timeText: { name: 'texto_hora', detail: 'Una cadena de texto que representa una hora en cualquiera de los formatos de hora de Microsoft Excel; por ejemplo, "6:45 PM" y "18:45" cadenas de texto entre comillas que representan hora.' },
        },
    },
    TO_DATE: {
        description: 'Convierte un número proporcionado a una fecha.',
        abstract: 'Convierte un número proporcionado a una fecha.',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.google.com/docs/answer/3094239?hl=en&sjid=2155433538747546473-AP',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'El argumento o referencia a una celda que se convertirá a una fecha.' },
        },
    },
    TODAY: {
        description: 'Devuelve el número de serie de la fecha de hoy',
        abstract: 'Devuelve el número de serie de la fecha de hoy',
        links: [
            {
                title: 'Instrucciones',
                url: 'https://support.microsoft.com/en-us/office/today-function-5eb3078d-a82c-4736-8930-2f51a028fdd9',
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
                url: 'https://support.microsoft.com/en-us/office/weekday-function-60e44483-2ed1-439f-8bd0-e404c190949a',
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
                url: 'https://support.microsoft.com/en-us/office/weeknum-function-e5c43a03-b4ab-426c-b411-b18c13c75340',
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
                url: 'https://support.microsoft.com/en-us/office/workday-function-f764a5b7-05fc-4494-9486-60d494efbf33',
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
                url: 'https://support.microsoft.com/en-us/office/workday-intl-function-a378391c-9ba7-4678-8a39-39611a9bf81d',
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
                url: 'https://support.microsoft.com/en-us/office/year-function-c64f017a-1354-490d-981f-578e8ec8d3b9',
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
                url: 'https://support.microsoft.com/en-us/office/yearfrac-function-3844141e-c76d-4143-82b6-208454ddc6a8',
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
