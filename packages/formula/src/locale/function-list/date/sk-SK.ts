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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/date-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/datedif-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'začiatočný_dátum', detail: 'Dátum, ktorý predstavuje prvý alebo počiatočný dátum daného obdobia. Dátumy možno zadať ako textové reťazce v úvodzovkách (napríklad "30.1.2001"), ako poradové čísla (napríklad 36921, čo predstavuje 30. január 2001, ak používate kalendárny systém 1900) alebo ako výsledok iných vzorcov alebo funkcií (napríklad DATEVALUE("30.1.2001")).' },
            endDate: { name: 'koncový_dátum', detail: 'Dátum, ktorý predstavuje koncový dátum príslušného obdobia.' },
            unit: { name: 'jednotka', detail: 'Typ informácie, ktorá sa má vrátiť, kde: Jednotka****Vráti" Y "Počet celých rokov v príslušnom období." M "Počet celých mesiacov v príslušnom období." D "Počet dní v príslušnom období." MD: " Rozdiel medzi dňami v start_date a end_date. Mesiace a roky dátumov sa ignorujú. Dôležité: Z dôvodu známych obmedzení argumentu "MD" neodporúčame jeho použitie. Pozrite si nižšie časť o známych problémoch." YM "Rozdiel medzi mesiacmi v start_date a end_date. Dni a roky dátumov sa ignorujú" YD "Rozdiel medzi dňami start_date a end_date. Roky dátumov sa ignorujú.' },
        },
    },
    DATEVALUE: {
        description: 'Konvertuje dátum v textovej forme na sériové číslo.',
        abstract: 'Konvertuje dátum v textovej forme na sériové číslo',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/datevalue-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/day-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'sériové_číslo', detail: 'Dátum, pre ktorý chcete nájsť deň. Dátumy zadávajte pomocou funkcie DATE alebo ako výsledky iných vzorcov či funkcií. Napríklad použite DATE(2008,5,23) pre 23. máj 2008.' },
        },
    },
    DAYS: {
        description: 'Vráti počet dní medzi dvomi dátumami.',
        abstract: 'Vráti počet dní medzi dvomi dátumami.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/days-function',
            },
        ],
        functionParameter: {
            endDate: { name: 'koncový_dátum', detail: 'Povinné. Počiatočný_dátum a koncový_dátum sú dva dátumy, medzi ktorými chcete spočítať počet dní.' },
            startDate: { name: 'začiatočný_dátum', detail: 'Povinné. Počiatočný_dátum a koncový_dátum sú dva dátumy, medzi ktorými chcete spočítať počet dní.' },
        },
    },
    DAYS360: {
        description: 'Vypočíta počet dní medzi dvoma dátumami na základe 360-dňového roka',
        abstract: 'Vypočíta počet dní medzi dvoma dátumami na základe 360-dňového roka',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/days360-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/edate-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/eomonth-function',
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
                url: 'https://support.google.com/docs/answer/13193461?hl=sk',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/hour-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/isoweeknum-function',
            },
        ],
        functionParameter: {
            date: { name: 'dátum', detail: 'Dátum je kód dátumu/času používaný Excelom na výpočty dátumu a času.' },
        },
    },
    MINUTE: {
        description: 'Vráti minúty časovej hodnoty. Minúta je daná ako celé číslo z intervalu od 0 do 59.',
        abstract: 'Vráti minúty časovej hodnoty. Minúta je daná ako celé číslo z intervalu od 0 do 59.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/minute-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'sériové_číslo', detail: 'Povinné. Časový údaj obsahujúci minútu, ktorú chcete nájsť. Čas možno zadať ako textový reťazec v úvodzovkách (napríklad "18:45"), ako desatinné číslo (napríklad 0,78125, čo zodpovedá času 18:45) alebo ako výsledok iných vzorcov alebo funkcií (napríklad TIMEVALUE("18:45")).' },
        },
    },
    MONTH: {
        description: 'Vráti mesiac dátumu, ktorý je vyjadrený poradovým číslom. Mesiac je daný ako celé číslo z intervalu od 1 (január) do 12 (december).',
        abstract: 'Vráti mesiac dátumu, ktorý je vyjadrený poradovým číslom. Mesiac je daný ako celé číslo z intervalu od 1 (január) do 12 (december).',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/month-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'sériové_číslo', detail: 'Povinné. Dátum v mesiaci, ktorý sa pokúšate nájsť. Dátumy by sa mali zadávať pomocou funkcie DATE alebo ako výsledok iných vzorcov alebo funkcií. Pre 23. Ak zadáte dátum ako text, môžu sa vyskytnúť problémy.' },
        },
    },
    NETWORKDAYS: {
        description: 'Vracia počet celých pracovných dní medzi dvoma dátumami',
        abstract: 'Vracia počet celých pracovných dní medzi dvoma dátumami',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/networkdays-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'začiatočný_dátum', detail: 'Dátum, ktorý predstavuje začiatočný dátum.' },
            endDate: { name: 'koncový_dátum', detail: 'Dátum, ktorý predstavuje koncový dátum.' },
            holidays: { name: 'sviatky', detail: 'Voliteľný rozsah jedného alebo viacerých dátumov, ktoré sa majú vylúčiť z pracovného kalendára, napríklad štátne sviatky a pohyblivé sviatky.' },
        },
    },
    NETWORKDAYS_INTL: {
        description: 'Vráti počet celých pracovných dní medzi dvoma dátumami s použitím parametrov určujúcich, ktoré dni sú víkendové a koľko ich je. Víkendové dni a dni určené ako sviatky sa nepovažujú za pracovné dni.',
        abstract: 'Vráti počet celých pracovných dní medzi dvoma dátumami s použitím parametrov určujúcich, ktoré dni sú víkendové a koľko ich je. Víkendové dni a dni určené ako sviatky sa nepovažujú za pracovné dni.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/networkdays-intl-function',
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
        description: 'Vráti poradové číslo aktuálneho dátumu a času. Ak bola bunka pred zadaním funkcie nastavená na formát Všeobecné , program Excel zmení formát bunky na ten formát dátumu a času, ktorý je v počítači zadaný v rámci miestnych nastavení pre dátum a čas. Formát dátumu a času pre bunku môžete zmeniť pomocou príkazov v skupine Číslo na karte Domov na páse s nástrojmi.',
        abstract: 'Vráti poradové číslo aktuálneho dátumu a času. Ak bola bunka pred zadaním funkcie nastavená na formát Všeobecné , program Excel zmení formát bunky na ten formát dátumu a času, ktorý je v počítači zadaný v rámci miestnych nastavení pre dátum a čas. Formát dátumu a času pre bunku môžete zmeniť pomocou príkazov v skupine Číslo na karte Domov na páse s nástrojmi.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/now-function',
            },
        ],
        functionParameter: {
        },
    },
    SECOND: {
        description: 'Vracia sekundy časovej hodnoty. Sekunda je daná ako celé číslo z intervalu od 0 (nuly) do 59.',
        abstract: 'Vracia sekundy časovej hodnoty. Sekunda je daná ako celé číslo z intervalu od 0 (nuly) do 59.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/second-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'sériové_číslo', detail: 'Povinné. Časový údaj obsahujúci sekundu, ktorú chcete vyhľadať. Čas možno zadať ako textový reťazec v úvodzovkách (napríklad "18:45"), ako desatinné číslo (napríklad 0,78125, čo predstavuje čas 18:45) alebo ako výsledok iných vzorcov alebo funkcií (napríklad TIMEVALUE("18:45")).' },
        },
    },
    TIME: {
        description: 'Vracia sériové číslo konkrétneho času.',
        abstract: 'Vracia sériové číslo konkrétneho času',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/time-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/timevalue-function',
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
                url: 'https://support.google.com/docs/answer/3094239?hl=sk',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/today-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/weekday-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/weeknum-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/workday-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/workday-intl-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/year-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/yearfrac-function',
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
