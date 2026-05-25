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
        description: 'Retorna el número de sèrie d\'una data particular',
        abstract: 'Retorna el número de sèrie d\'una data particular',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/date-function-e36c0c8c-4104-49da-ab83-82328b832349',
            },
        ],
        functionParameter: {
            year: { name: 'any', detail: 'El valor de l\'argument any pot incloure d\'un a quatre dígits. Excel interpreta l\'argument any segons el sistema de dates que utilitzi el vostre equip. Per defecte, Univer utilitza el sistema de dates de 1900, el que significa que la primera data és l\'1 de gener de 1900.' },
            month: { name: 'mes', detail: 'Un enter positiu o negatiu que representa el mes de l\'any de l\'1 al 12 (gener a desembre).' },
            day: { name: 'dia', detail: 'Un enter positiu o negatiu que representa el dia del mes de l\'1 al 31.' },
        },
    },
    DATEDIF: {
        description: 'Calcula el nombre de dies, mesos o anys entre dues dates. Aquesta funció és útil en fórmules on necessiteu calcular una edat.',
        abstract: 'Calcula el nombre de dies, mesos o anys entre dues dates. Aquesta funció és útil en fórmules on necessiteu calcular una edat.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/datedif-function-25dba1a4-2812-480b-84dd-8b32a451b35c',
            },
        ],
        functionParameter: {
            startDate: { name: 'data_inicial', detail: 'Una data que representa la primera data, o data d\'inici d\'un període determinat.' },
            endDate: { name: 'data_final', detail: 'Una data que representa l\'última data, o data de finalització del període.' },
            method: { name: 'mètode', detail: 'El tipus d\'informació que voleu que es retorni.' },
        },
    },
    DATEVALUE: {
        description: 'Converteix una data en forma de text a un número de sèrie.',
        abstract: 'Converteix una data en forma de text a un número de sèrie',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/datevalue-function-df8b07d4-7761-4a93-bc33-b7471bbff252',
            },
        ],
        functionParameter: {
            dateText: { name: 'text_data', detail: 'Text que representa una data en un format de data d\'Excel, o una referència a una cel·la que conté text que representa una data en un format de data d\'Excel. Per exemple, "30/1/2008" o "30-Gen-2008" són cadenes de text entre cometes que representen dates.\\nUtilitzant el sistema de dates predeterminat a Microsoft Excel per a Windows, l\'argument text_data ha de representar una data entre l\'1 de gener de 1900 i el 31 de desembre de 9999. La funció DATEVALUE retorna el valor d\'error #VALUE! si el valor de l\'argument text_data està fora d\'aquest rang.\\nSi s\'omet la part de l\'any de l\'argument text_data, la funció DATEVALUE utilitza l\'any actual del rellotge integrat del vostre equip. La informació d\'hora en l\'argument text_data s\'ignora.' },
        },
    },
    DAY: {
        description: 'Retorna el dia d\'una data, representat per un número de sèrie. El dia es proporciona com un enter que va de l\'1 al 31.',
        abstract: 'Converteix un número de sèrie a un dia del mes',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/day-function-8a7d1cbb-6c7d-4ba1-8aea-25c134d03101',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'número_sèrie', detail: 'La data del dia que intenteu trobar. Les dates han d\'introduir-se utilitzant la funció DATE, o com a resultats d\'altres fórmules o funcions. Per exemple, utilitzeu DATE(2008,5,23) per al dia 23 de maig de 2008.' },
        },
    },
    DAYS: {
        description: 'Retorna el nombre de dies entre dues dates',
        abstract: 'Retorna el nombre de dies entre dues dates',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/days-function-57740535-d549-4395-8728-0f07bff0b9df',
            },
        ],
        functionParameter: {
            endDate: { name: 'data_final', detail: 'Data_inicial i Data_final són les dues dates entre les quals voleu conèixer el nombre de dies.' },
            startDate: { name: 'data_inicial', detail: 'Data_inicial i Data_final són les dues dates entre les quals voleu conèixer el nombre de dies.' },
        },
    },
    DAYS360: {
        description: 'Calcula el nombre de dies entre dues dates basant-se en un any de 360 dies',
        abstract: 'Calcula el nombre de dies entre dues dates basant-se en un any de 360 dies',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/days360-function-b9a509fd-49ef-407e-94df-0cbda5718c2a',
            },
        ],
        functionParameter: {
            startDate: { name: 'data_inicial', detail: 'Data_inicial i Data_final són les dues dates entre les quals voleu conèixer el nombre de dies.' },
            endDate: { name: 'data_final', detail: 'Data_inicial i Data_final són les dues dates entre les quals voleu conèixer el nombre de dies.' },
            method: { name: 'mètode', detail: 'Un valor lògic que especifica si s\'utilitza el mètode americà o europeu en el càlcul.' },
        },
    },
    EDATE: {
        description: 'Retorna el número de sèrie que representa la data que està el nombre indicat de mesos abans o després d\'una data especificada (la data_inicial). Utilitzeu EDATE per calcular dates de venciment o dates de venciment que cauen el mateix dia del mes que la data d\'emissió.',
        abstract: 'Retorna el número de sèrie de la data que està el nombre indicat de mesos abans o després de la data inicial',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/edate-function-3c920eb2-6e66-44e7-a1f5-753ae47ee4f5',
            },
        ],
        functionParameter: {
            startDate: { name: 'data_inicial', detail: 'Una data que representa la data inicial. Les dates han d\'introduir-se utilitzant la funció DATE, o com a resultats d\'altres fórmules o funcions. Per exemple, utilitzeu DATE(2008,5,23) per al dia 23 de maig de 2008. Poden ocórrer problemes si les dates s\'introdueixen com a text.' },
            months: { name: 'mesos', detail: 'El nombre de mesos abans o després de data_inicial. Un valor positiu per a mesos produeix una data futura; un valor negatiu produeix una data passada.' },
        },
    },
    EOMONTH: {
        description: 'Retorna el número de sèrie de l\'últim dia del mes abans o després d\'un nombre especificat de mesos',
        abstract: 'Retorna el número de sèrie de l\'últim dia del mes abans o després d\'un nombre especificat de mesos',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/eomonth-function-7314ffa1-2bc9-4005-9d66-f49db127d628',
            },
        ],
        functionParameter: {
            startDate: { name: 'data_inicial', detail: 'Una data que representa la data inicial.' },
            months: { name: 'mesos', detail: 'El nombre de mesos abans o després de data_inicial.' },
        },
    },
    EPOCHTODATE: {
        description: 'Converteix una marca de temps d\'època Unix en segons, mil·lisegons o microsegons a una data i hora en Temps Universal Coordinat (UTC).',
        abstract: 'Converteix una marca de temps d\'època Unix en segons, mil·lisegons o microsegons a una data i hora en Temps Universal Coordinat (UTC).',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.google.com/docs/answer/13193461?hl=zh-Hans&sjid=2155433538747546473-AP',
            },
        ],
        functionParameter: {
            timestamp: { name: 'marca_temps', detail: 'Una marca de temps d\'època Unix, en segons, mil·lisegons o microsegons.' },
            unit: { name: 'unitat', detail: 'La unitat de temps en què s\'expressa la marca de temps. 1 per defecte: \\n1 indica que la unitat de temps són segons. \\n2 indica que la unitat de temps són mil·lisegons.\\n3 indica que la unitat de temps són microsegons.' },
        },
    },
    HOUR: {
        description: 'Converteix un número de sèrie a una hora',
        abstract: 'Converteix un número de sèrie a una hora',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/hour-function-a3afa879-86cb-4339-b1b5-2dd2d7310ac7',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'número_sèrie', detail: 'La data del dia que intenteu trobar. Les dates han d\'introduir-se utilitzant la funció DATE, o com a resultats d\'altres fórmules o funcions. Per exemple, utilitzeu DATE(2008,5,23) per al dia 23 de maig de 2008.' },
        },
    },
    ISOWEEKNUM: {
        description: 'Retorna el número de la setmana ISO de l\'any per a una data determinada',
        abstract: 'Retorna el número de la setmana ISO de l\'any per a una data determinada',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/isoweeknum-function-1c2d0afe-d25b-4ab1-8894-8d0520e90e0e',
            },
        ],
        functionParameter: {
            date: { name: 'data', detail: 'Data és el codi de data i hora utilitzat per Excel per al càlcul de data i hora.' },
        },
    },
    MINUTE: {
        description: 'Converteix un número de sèrie a un minut',
        abstract: 'Converteix un número de sèrie a un minut',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/minute-function-af728df0-05c4-4b07-9eed-a84801a60589',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'número_sèrie', detail: 'La data del dia que intenteu trobar. Les dates han d\'introduir-se utilitzant la funció DATE, o com a resultats d\'altres fórmules o funcions. Per exemple, utilitzeu DATE(2008,5,23) per al dia 23 de maig de 2008.' },
        },
    },
    MONTH: {
        description: 'Retorna el mes d\'una data representada per un número de sèrie. El mes es proporciona com un enter, que va de l\'1 (gener) al 12 (desembre).',
        abstract: 'Converteix un número de sèrie a un mes',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/month-function-579a2881-199b-48b2-ab90-ddba0eba86e8',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'número_sèrie', detail: 'La data del mes que intenteu trobar. Les dates han d\'introduir-se utilitzant la funció DATE, o com a resultats d\'altres fórmules o funcions. Per exemple, utilitzeu DATE(2008,5,23) per al dia 23 de maig de 2008.' },
        },
    },
    NETWORKDAYS: {
        description: 'Retorna el nombre de dies laborables complets entre dues dates',
        abstract: 'Retorna el nombre de dies laborables complets entre dues dates',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/networkdays-function-48e717bf-a7a3-495f-969e-5005e3eb18e7',
            },
        ],
        functionParameter: {
            startDate: { name: 'data_inicial', detail: 'Una data que representa la data inicial.' },
            endDate: { name: 'data_final', detail: 'Una data que representa la data final.' },
            holidays: { name: 'dies_festius', detail: 'Un rang opcional d\'una o més dates per excloure del calendari laboral, com dies festius estatals i federals i dies festius flotants.' },
        },
    },
    NETWORKDAYS_INTL: {
        description: 'Retorna el nombre de dies laborables complets entre dues dates utilitzant paràmetres per indicar quins i quants dies són dies de cap de setmana',
        abstract: 'Retorna el nombre de dies laborables complets entre dues dates utilitzant paràmetres per indicar quins i quants dies són dies de cap de setmana',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/networkdays-intl-function-a9b26239-4f20-46a1-9ab8-4e925bfd5e28',
            },
        ],
        functionParameter: {
            startDate: { name: 'data_inicial', detail: 'Una data que representa la data inicial.' },
            endDate: { name: 'data_final', detail: 'Una data que representa la data final.' },
            weekend: { name: 'cap_setmana', detail: 'és un número o cadena de cap de setmana que especifica quan ocorren els caps de setmana.' },
            holidays: { name: 'dies_festius', detail: 'Un rang opcional d\'una o més dates per excloure del calendari laboral, com dies festius estatals i federals i dies festius flotants.' },
        },
    },
    NOW: {
        description: 'Retorna el número de sèrie de la data i hora actuals.',
        abstract: 'Retorna el número de sèrie de la data i hora actuals',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/now-function-3337fd29-145a-4347-b2e6-20c904739c46',
            },
        ],
        functionParameter: {
        },
    },
    SECOND: {
        description: 'Converteix un número de sèrie a un segon',
        abstract: 'Converteix un número de sèrie a un segon',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/second-function-740d1cfc-553c-4099-b668-80eaa24e8af1',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'número_sèrie', detail: 'La data del dia que intenteu trobar. Les dates han d\'introduir-se utilitzant la funció DATE, o com a resultats d\'altres fórmules o funcions. Per exemple, utilitzeu DATE(2008,5,23) per al dia 23 de maig de 2008.' },
        },
    },
    TIME: {
        description: 'Retorna el número de sèrie d\'una hora particular.',
        abstract: 'Retorna el número de sèrie d\'una hora particular',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/time-function-9a5aff99-8f7d-4611-845e-747d0b8d5457',
            },
        ],
        functionParameter: {
            hour: { name: 'hora', detail: 'Un número del 0 (zero) al 32767 que representa l\'hora. Qualsevol valor superior a 23 es dividirà per 24 i la resta es tractarà com el valor de l\'hora. Per exemple, TIME(27,0,0) = TIME(3,0,0) = .125 o 3:00 AM.' },
            minute: { name: 'minut', detail: 'Un número del 0 al 32767 que representa el minut. Qualsevol valor superior a 59 es convertirà a hores i minuts. Per exemple, TIME(0,750,0) = TIME(12,30,0) = .520833 o 12:30 PM.' },
            second: { name: 'segon', detail: 'Un número del 0 al 32767 que representa el segon. Qualsevol valor superior a 59 es convertirà a hores, minuts i segons. Per exemple, TIME(0,0,2000) = TIME(0,33,22) = .023148 o 12:33:20 AM.' },
        },
    },
    TIMEVALUE: {
        description: 'Converteix una hora en forma de text a un número de sèrie.',
        abstract: 'Converteix una hora en forma de text a un número de sèrie',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/timevalue-function-0b615c12-33d8-4431-bf3d-f3eb6d186645',
            },
        ],
        functionParameter: {
            timeText: { name: 'text_hora', detail: 'Una cadena de text que representa una hora en qualsevol dels formats d\'hora de Microsoft Excel; per exemple, "6:45 PM" i "18:45" cadenes de text entre cometes que representen hora.' },
        },
    },
    TO_DATE: {
        description: 'Converteix un número proporcionat a una data.',
        abstract: 'Converteix un número proporcionat a una data.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.google.com/docs/answer/3094239?hl=en&sjid=2155433538747546473-AP',
            },
        ],
        functionParameter: {
            value: { name: 'valor', detail: 'L\'argument o referència a una cel·la que es convertirà a una data.' },
        },
    },
    TODAY: {
        description: 'Retorna el número de sèrie de la data d\'avui',
        abstract: 'Retorna el número de sèrie de la data d\'avui',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/today-function-5eb3078d-a82c-4736-8930-2f51a028fdd9',
            },
        ],
        functionParameter: {
        },
    },
    WEEKDAY: {
        description: 'Converteix un número de sèrie a un dia de la setmana',
        abstract: 'Converteix un número de sèrie a un dia de la setmana',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/weekday-function-60e44483-2ed1-439f-8bd0-e404c190949a',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'número_sèrie', detail: 'Un número seqüencial que representa la data del dia que intenteu trobar.' },
            returnType: { name: 'tipus_retornat', detail: 'Un número que determina el tipus de valor retornat.' },
        },
    },
    WEEKNUM: {
        description: 'Converteix un número de sèrie a un número que representa on cau la setmana numèricament dins d\'un any',
        abstract: 'Converteix un número de sèrie a un número que representa on cau la setmana numèricament dins d\'un any',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/weeknum-function-e5c43a03-b4ab-426c-b411-b18c13c75340',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'número_sèrie', detail: 'Una data dins de la setmana.' },
            returnType: { name: 'tipus_retornat', detail: 'Un número que determina en quin dia comença la setmana. El predeterminat és 1.' },
        },
    },
    WORKDAY: {
        description: 'Retorna el número de sèrie de la data abans o després d\'un nombre especificat de dies laborables',
        abstract: 'Retorna el número de sèrie de la data abans o després d\'un nombre especificat de dies laborables',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/workday-function-f764a5b7-05fc-4494-9486-60d494efbf33',
            },
        ],
        functionParameter: {
            startDate: { name: 'data_inicial', detail: 'Una data que representa la data inicial.' },
            days: { name: 'dies', detail: 'El nombre de dies no caps de setmana i no festius abans o després de data_inicial. Un valor positiu per a dies produeix una data futura; un valor negatiu produeix una data passada.' },
            holidays: { name: 'dies_festius', detail: 'Un rang opcional d\'una o més dates per excloure del calendari laboral, com dies festius estatals i federals i dies festius flotants.' },
        },
    },
    WORKDAY_INTL: {
        description: 'Retorna el número de sèrie de la data abans o després d\'un nombre especificat de dies laborables utilitzant paràmetres per indicar quins i quants dies són dies de cap de setmana',
        abstract: 'Retorna el número de sèrie de la data abans o després d\'un nombre especificat de dies laborables utilitzant paràmetres per indicar quins i quants dies són dies de cap de setmana',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/workday-intl-function-a378391c-9ba7-4678-8a39-39611a9bf81d',
            },
        ],
        functionParameter: {
            startDate: { name: 'data_inicial', detail: 'Una data que representa la data inicial.' },
            days: { name: 'dies', detail: 'El nombre de dies no caps de setmana i no festius abans o després de data_inicial. Un valor positiu per a dies produeix una data futura; un valor negatiu produeix una data passada.' },
            weekend: { name: 'cap_setmana', detail: 'és un número o cadena de cap de setmana que especifica quan ocorren els caps de setmana.' },
            holidays: { name: 'dies_festius', detail: 'Un rang opcional d\'una o més dates per excloure del calendari laboral, com dies festius estatals i federals i dies festius flotants.' },
        },
    },
    YEAR: {
        description: 'Retorna l\'any corresponent a una data. L\'any es retorna com un enter en el rang 1900-9999.',
        abstract: 'Converteix un número de sèrie a un any',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/year-function-c64f017a-1354-490d-981f-578e8ec8d3b9',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'número_sèrie', detail: 'La data de l\'any que voleu trobar. Les dates han d\'introduir-se utilitzant la funció DATE, o com a resultats d\'altres fórmules o funcions. Per exemple, utilitzeu DATE(2008,5,23) per al dia 23 de maig de 2008. Poden ocórrer problemes si les dates s\'introdueixen com a text.' },
        },
    },
    YEARFRAC: {
        description: 'Retorna la fracció d\'any que representa el nombre de dies complets entre data_inicial i data_final',
        abstract: 'Retorna la fracció d\'any que representa el nombre de dies complets entre data_inicial i data_final',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/yearfrac-function-3844141e-c76d-4143-82b6-208454ddc6a8',
            },
        ],
        functionParameter: {
            startDate: { name: 'data_inicial', detail: 'Una data que representa la data inicial.' },
            endDate: { name: 'data_final', detail: 'Una data que representa la data final.' },
            basis: { name: 'base', detail: 'El tipus de base de recompte de dies que s\'utilitzarà.' },
        },
    },
};

export default locale;
