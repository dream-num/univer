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
        description: 'Vracia sériové číslo konkrétneho dátumu',
        abstract: 'Vracia sériové číslo konkrétneho dátumu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/date-function-e36c0c8c-4104-49da-ab83-82328b832349',
            },
        ],
        functionParameter: {
            year: {
                name: 'rok',
                detail: 'Hodnota argumentu rok môže obsahovať jednu až štyri číslice. Excel interpretuje argument rok podľa dátumového systému vášho počítača. Predvolene Univer používa dátumový systém 1900, takže prvý dátum je 1. január 1900.',
            },
            month: { name: 'mesiac', detail: 'Kladné alebo záporné celé číslo predstavujúce mesiac roka od 1 do 12 (január až december).' },
            day: { name: 'deň', detail: 'Kladné alebo záporné celé číslo predstavujúce deň v mesiaci od 1 do 31.' },
        },
    },
    DATEDIF: {
        description: 'Vypočíta počet dní, mesiacov alebo rokov medzi dvoma dátumami. Táto funkcia je užitočná vo vzorcoch, kde potrebujete vypočítať vek.',
        abstract: 'Vypočíta počet dní, mesiacov alebo rokov medzi dvoma dátumami',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/datedif-function-25dba1a4-2812-480b-84dd-8b32a451b35c',
            },
        ],
        functionParameter: {
            startDate: { name: 'začiatočný_dátum', detail: 'Dátum, ktorý predstavuje prvý, alebo začiatočný dátum obdobia.' },
            endDate: { name: 'koncový_dátum', detail: 'Dátum, ktorý predstavuje posledný, alebo koncový dátum obdobia.' },
            method: { name: 'metóda', detail: 'Typ informácie, ktorú chcete vrátiť.' },
        },
    },
    DATEVALUE: {
        description: 'Konvertuje dátum v textovej forme na sériové číslo.',
        abstract: 'Konvertuje dátum v textovej forme na sériové číslo',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/datevalue-function-df8b07d4-7761-4a93-bc33-b7471bbff252',
            },
        ],
        functionParameter: {
            dateText: {
                name: 'text_dátumu',
                detail: 'Text, ktorý predstavuje dátum vo formáte dátumu Excelu, alebo odkaz na bunku s takýmto textom. Napríklad "1/30/2008" alebo "30-Jan-2008" sú textové reťazce v úvodzovkách, ktoré predstavujú dátumy. Pri použití predvoleného dátumového systému v Microsoft Excel pre Windows musí argument date_text predstavovať dátum medzi 1. januárom 1900 a 31. decembrom 9999. Funkcia DATEVALUE vráti chybu #VALUE!, ak hodnota argumentu date_text je mimo tohto rozsahu. Ak je rok v argumente date_text vynechaný, funkcia DATEVALUE použije aktuálny rok z interných hodín počítača. Informácia o čase v argumente date_text sa ignoruje.',
            },
        },
    },
    DAY: {
        description: 'Vracia deň z dátumu reprezentovaného sériovým číslom. Deň je celé číslo od 1 do 31.',
        abstract: 'Konvertuje sériové číslo na deň v mesiaci',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/day-function-8a7d1cbb-6c7d-4ba1-8aea-25c134d03101',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'sériové_číslo', detail: 'Dátum, pre ktorý chcete nájsť deň. Dátumy zadávajte pomocou funkcie DATE alebo ako výsledky iných vzorcov či funkcií. Napríklad použite DATE(2008,5,23) pre 23. máj 2008.' },
        },
    },
    DAYS: {
        description: 'Vracia počet dní medzi dvoma dátumami',
        abstract: 'Vracia počet dní medzi dvoma dátumami',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/days-function-57740535-d549-4395-8728-0f07bff0b9df',
            },
        ],
        functionParameter: {
            endDate: { name: 'koncový_dátum', detail: 'Start_date a end_date sú dva dátumy, medzi ktorými chcete zistiť počet dní.' },
            startDate: { name: 'začiatočný_dátum', detail: 'Start_date a end_date sú dva dátumy, medzi ktorými chcete zistiť počet dní.' },
        },
    },
    DAYS360: {
        description: 'Vypočíta počet dní medzi dvoma dátumami na základe 360-dňového roka',
        abstract: 'Vypočíta počet dní medzi dvoma dátumami na základe 360-dňového roka',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/days360-function-b9a509fd-49ef-407e-94df-0cbda5718c2a',
            },
        ],
        functionParameter: {
            startDate: { name: 'začiatočný_dátum', detail: 'Start_date a end_date sú dva dátumy, medzi ktorými chcete zistiť počet dní.' },
            endDate: { name: 'koncový_dátum', detail: 'Start_date a end_date sú dva dátumy, medzi ktorými chcete zistiť počet dní.' },
            method: { name: 'metóda', detail: 'Logická hodnota určujúca, či použiť americkú alebo európsku metódu výpočtu.' },
        },
    },
    EDATE: {
        description: 'Vracia sériové číslo dátumu, ktorý je o zadaný počet mesiacov pred alebo po zadanom dátume (start_date). Funkciu EDATE použite na výpočet dátumov splatnosti alebo termínov, ktoré pripadajú na rovnaký deň v mesiaci ako dátum vydania.',
        abstract: 'Vracia sériové číslo dátumu, ktorý je o zadaný počet mesiacov pred alebo po začiatočnom dátume',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/edate-function-3c920eb2-6e66-44e7-a1f5-753ae47ee4f5',
            },
        ],
        functionParameter: {
            startDate: { name: 'začiatočný_dátum', detail: 'Dátum, ktorý predstavuje začiatočný dátum. Dátumy zadávajte pomocou funkcie DATE alebo ako výsledky iných vzorcov či funkcií. Napríklad použite DATE(2008,5,23) pre 23. máj 2008. Problémy môžu nastať, ak sú dátumy zadané ako text.' },
            months: { name: 'mesiace', detail: 'Počet mesiacov pred alebo po start_date. Kladná hodnota vráti budúci dátum, záporná hodnota vráti minulý dátum.' },
        },
    },
    EOMONTH: {
        description: 'Vracia sériové číslo posledného dňa mesiaca pred alebo po zadanom počte mesiacov',
        abstract: 'Vracia sériové číslo posledného dňa mesiaca pred alebo po zadanom počte mesiacov',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/eomonth-function-7314ffa1-2bc9-4005-9d66-f49db127d628',
            },
        ],
        functionParameter: {
            startDate: { name: 'začiatočný_dátum', detail: 'Dátum, ktorý predstavuje začiatočný dátum.' },
            months: { name: 'mesiace', detail: 'Počet mesiacov pred alebo po start_date.' },
        },
    },
    EPOCHTODATE: {
        description: 'Konvertuje Unix epoch timestamp v sekundách, milisekundách alebo mikrosekundách na dátum a čas v koordinovanom univerzálnom čase (UTC).',
        abstract: 'Konvertuje Unix epoch timestamp v sekundách, milisekundách alebo mikrosekundách na dátum a čas v koordinovanom univerzálnom čase (UTC).',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.google.com/docs/answer/13193461?hl=en',
            },
        ],
        functionParameter: {
            timestamp: { name: 'časová_pečiatka', detail: 'Unix epoch časová pečiatka v sekundách, milisekundách alebo mikrosekundách.' },
            unit: {
                name: 'jednotka',
                detail: 'Jednotka času, v ktorej je časová pečiatka vyjadrená. Predvolene 1: \n1 znamená sekundy. \n2 znamená milisekundy.\n3 znamená mikrosekundy.',
            },
        },
    },
    HOUR: {
        description: 'Konvertuje sériové číslo na hodinu',
        abstract: 'Konvertuje sériové číslo na hodinu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/hour-function-a3afa879-86cb-4339-b1b5-2dd2d7310ac7',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'sériové_číslo', detail: 'Dátum, pre ktorý chcete nájsť hodinu. Dátumy zadávajte pomocou funkcie DATE alebo ako výsledky iných vzorcov či funkcií. Napríklad použite DATE(2008,5,23) pre 23. máj 2008.' },
        },
    },
    ISOWEEKNUM: {
        description: 'Vracia číslo ISO týždňa v roku pre daný dátum',
        abstract: 'Vracia číslo ISO týždňa v roku pre daný dátum',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/isoweeknum-function-1c2d0afe-d25b-4ab1-8894-8d0520e90e0e',
            },
        ],
        functionParameter: {
            date: { name: 'dátum', detail: 'Dátum je kód dátumu/času používaný Excelom na výpočty dátumu a času.' },
        },
    },
    MINUTE: {
        description: 'Konvertuje sériové číslo na minútu',
        abstract: 'Konvertuje sériové číslo na minútu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/minute-function-af728df0-05c4-4b07-9eed-a84801a60589',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'sériové_číslo', detail: 'Dátum, pre ktorý chcete nájsť minútu. Dátumy zadávajte pomocou funkcie DATE alebo ako výsledky iných vzorcov či funkcií. Napríklad použite DATE(2008,5,23) pre 23. máj 2008.' },
        },
    },
    MONTH: {
        description: 'Vracia mesiac dátumu reprezentovaného sériovým číslom. Mesiac je celé číslo od 1 (január) do 12 (december).',
        abstract: 'Konvertuje sériové číslo na mesiac',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/month-function-579a2881-199b-48b2-ab90-ddba0eba86e8',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'sériové_číslo', detail: 'Dátum, pre ktorý chcete nájsť mesiac. Dátumy zadávajte pomocou funkcie DATE alebo ako výsledky iných vzorcov či funkcií. Napríklad použite DATE(2008,5,23) pre 23. máj 2008.' },
        },
    },
    NETWORKDAYS: {
        description: 'Vracia počet celých pracovných dní medzi dvoma dátumami',
        abstract: 'Vracia počet celých pracovných dní medzi dvoma dátumami',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/networkdays-function-48e717bf-a7a3-495f-969e-5005e3eb18e7',
            },
        ],
        functionParameter: {
            startDate: { name: 'začiatočný_dátum', detail: 'Dátum, ktorý predstavuje začiatočný dátum.' },
            endDate: { name: 'koncový_dátum', detail: 'Dátum, ktorý predstavuje koncový dátum.' },
            holidays: { name: 'sviatky', detail: 'Voliteľný rozsah jedného alebo viacerých dátumov, ktoré sa majú vylúčiť z pracovného kalendára, napríklad štátne sviatky a pohyblivé sviatky.' },
        },
    },
    NETWORKDAYS_INTL: {
        description: 'Vracia počet celých pracovných dní medzi dvoma dátumami s parametrami, ktoré určujú, ktoré a koľko dní sú víkendové',
        abstract: 'Vracia počet celých pracovných dní medzi dvoma dátumami s parametrami, ktoré určujú, ktoré a koľko dní sú víkendové',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/networkdays-intl-function-a9b26239-4f20-46a1-9ab8-4e925bfd5e28',
            },
        ],
        functionParameter: {
            startDate: { name: 'začiatočný_dátum', detail: 'Dátum, ktorý predstavuje začiatočný dátum.' },
            endDate: { name: 'koncový_dátum', detail: 'Dátum, ktorý predstavuje koncový dátum.' },
            weekend: { name: 'víkend', detail: 'Číslo alebo reťazec určujúci, kedy nastávajú víkendy.' },
            holidays: { name: 'sviatky', detail: 'Voliteľný rozsah jedného alebo viacerých dátumov, ktoré sa majú vylúčiť z pracovného kalendára, napríklad štátne sviatky a pohyblivé sviatky.' },
        },
    },
    NOW: {
        description: 'Vracia sériové číslo aktuálneho dátumu a času.',
        abstract: 'Vracia sériové číslo aktuálneho dátumu a času',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/now-function-3337fd29-145a-4347-b2e6-20c904739c46',
            },
        ],
        functionParameter: {},
    },
    SECOND: {
        description: 'Konvertuje sériové číslo na sekundu',
        abstract: 'Konvertuje sériové číslo na sekundu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/second-function-740d1cfc-553c-4099-b668-80eaa24e8af1',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'sériové_číslo', detail: 'Dátum, pre ktorý chcete nájsť sekundu. Dátumy zadávajte pomocou funkcie DATE alebo ako výsledky iných vzorcov či funkcií. Napríklad použite DATE(2008,5,23) pre 23. máj 2008.' },
        },
    },
    TIME: {
        description: 'Vracia sériové číslo konkrétneho času.',
        abstract: 'Vracia sériové číslo konkrétneho času',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/time-function-9a5aff99-8f7d-4611-845e-747d0b8d5457',
            },
        ],
        functionParameter: {
            hour: {
                name: 'hodina',
                detail: 'Číslo od 0 do 32767 predstavujúce hodinu. Akákoľvek hodnota väčšia ako 23 sa vydelí 24 a zvyšok sa použije ako hodina. Napríklad TIME(27,0,0) = TIME(3,0,0) = .125 alebo 3:00 AM.',
            },
            minute: {
                name: 'minúta',
                detail: 'Číslo od 0 do 32767 predstavujúce minútu. Akákoľvek hodnota väčšia ako 59 sa prepočíta na hodiny a minúty. Napríklad TIME(0,750,0) = TIME(12,30,0) = .520833 alebo 12:30 PM.',
            },
            second: {
                name: 'sekunda',
                detail: 'Číslo od 0 do 32767 predstavujúce sekundu. Akákoľvek hodnota väčšia ako 59 sa prepočíta na hodiny, minúty a sekundy. Napríklad TIME(0,0,2000) = TIME(0,33,22) = .023148 alebo 12:33:20 AM.',
            },
        },
    },
    TIMEVALUE: {
        description: 'Konvertuje čas v textovej forme na sériové číslo.',
        abstract: 'Konvertuje čas v textovej forme na sériové číslo',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/timevalue-function-0b615c12-33d8-4431-bf3d-f3eb6d186645',
            },
        ],
        functionParameter: {
            timeText: { name: 'text_času', detail: 'Textový reťazec, ktorý predstavuje čas v niektorom z formátov času Microsoft Excelu; napríklad "6:45 PM" alebo "18:45" sú textové reťazce v úvodzovkách, ktoré predstavujú čas.' },
        },
    },
    TO_DATE: {
        description: 'Konvertuje zadané číslo na dátum.',
        abstract: 'Konvertuje zadané číslo na dátum.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.google.com/docs/answer/3094239?hl=en&sjid=2155433538747546473-AP',
            },
        ],
        functionParameter: {
            value: { name: 'hodnota', detail: 'Argument alebo odkaz na bunku, ktorý sa má previesť na dátum.' },
        },
    },
    TODAY: {
        description: 'Vracia sériové číslo dnešného dátumu',
        abstract: 'Vracia sériové číslo dnešného dátumu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/today-function-5eb3078d-a82c-4736-8930-2f51a028fdd9',
            },
        ],
        functionParameter: {},
    },
    WEEKDAY: {
        description: 'Konvertuje sériové číslo na deň v týždni',
        abstract: 'Konvertuje sériové číslo na deň v týždni',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/weekday-function-60e44483-2ed1-439f-8bd0-e404c190949a',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'sériové_číslo', detail: 'Postupné číslo, ktoré predstavuje dátum dňa, ktorý chcete nájsť.' },
            returnType: { name: 'typ_návratu', detail: 'Číslo, ktoré určuje typ návratovej hodnoty.' },
        },
    },
    WEEKNUM: {
        description: 'Konvertuje sériové číslo na číslo predstavujúce poradie týždňa v roku',
        abstract: 'Konvertuje sériové číslo na číslo predstavujúce poradie týždňa v roku',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/weeknum-function-e5c43a03-b4ab-426c-b411-b18c13c75340',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'sériové_číslo', detail: 'Dátum v rámci týždňa.' },
            returnType: { name: 'typ_návratu', detail: 'Číslo, ktoré určuje, ktorý deň je začiatkom týždňa. Predvolene 1.' },
        },
    },
    WORKDAY: {
        description: 'Vracia sériové číslo dátumu pred alebo po zadanom počte pracovných dní',
        abstract: 'Vracia sériové číslo dátumu pred alebo po zadanom počte pracovných dní',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/workday-function-f764a5b7-05fc-4494-9486-60d494efbf33',
            },
        ],
        functionParameter: {
            startDate: { name: 'začiatočný_dátum', detail: 'Dátum, ktorý predstavuje začiatočný dátum.' },
            days: { name: 'dni', detail: 'Počet dní, ktoré nie sú víkend ani sviatok, pred alebo po start_date. Kladná hodnota vráti budúci dátum; záporná hodnota vráti minulý dátum.' },
            holidays: { name: 'sviatky', detail: 'Voliteľný rozsah jedného alebo viacerých dátumov, ktoré sa majú vylúčiť z pracovného kalendára, napríklad štátne sviatky a pohyblivé sviatky.' },
        },
    },
    WORKDAY_INTL: {
        description: 'Vracia sériové číslo dátumu pred alebo po zadanom počte pracovných dní s parametrami, ktoré určujú, ktoré a koľko dní sú víkendové',
        abstract: 'Vracia sériové číslo dátumu pred alebo po zadanom počte pracovných dní s parametrami, ktoré určujú, ktoré a koľko dní sú víkendové',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/workday-intl-function-a378391c-9ba7-4678-8a39-39611a9bf81d',
            },
        ],
        functionParameter: {
            startDate: { name: 'začiatočný_dátum', detail: 'Dátum, ktorý predstavuje začiatočný dátum.' },
            days: { name: 'dni', detail: 'Počet dní, ktoré nie sú víkend ani sviatok, pred alebo po start_date. Kladná hodnota vráti budúci dátum; záporná hodnota vráti minulý dátum.' },
            weekend: { name: 'víkend', detail: 'Číslo alebo reťazec určujúci, kedy nastávajú víkendy.' },
            holidays: { name: 'sviatky', detail: 'Voliteľný rozsah jedného alebo viacerých dátumov, ktoré sa majú vylúčiť z pracovného kalendára, napríklad štátne sviatky a pohyblivé sviatky.' },
        },
    },
    YEAR: {
        description: 'Vracia rok zodpovedajúci dátumu. Rok je vrátený ako celé číslo v rozsahu 1900-9999.',
        abstract: 'Konvertuje sériové číslo na rok',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/year-function-c64f017a-1354-490d-981f-578e8ec8d3b9',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'sériové_číslo', detail: 'Dátum roka, ktorý chcete zistiť. Dátumy zadávajte pomocou funkcie DATE alebo ako výsledky iných vzorcov či funkcií. Napríklad použite DATE(2008,5,23) pre 23. máj 2008. Problémy môžu nastať, ak sú dátumy zadané ako text.' },
        },
    },
    YEARFRAC: {
        description: 'Vracia zlomok roka predstavujúci počet celých dní medzi start_date a end_date',
        abstract: 'Vracia zlomok roka predstavujúci počet celých dní medzi start_date a end_date',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/yearfrac-function-3844141e-c76d-4143-82b6-208454ddc6a8',
            },
        ],
        functionParameter: {
            startDate: { name: 'začiatočný_dátum', detail: 'Dátum, ktorý predstavuje začiatočný dátum.' },
            endDate: { name: 'koncový_dátum', detail: 'Dátum, ktorý predstavuje koncový dátum.' },
            basis: { name: 'základ', detail: 'Typ základu počtu dní, ktorý sa má použiť.' },
        },
    },
};

export default locale;
