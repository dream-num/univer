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
    AND: {
        description: 'Vracia TRUE, ak sú všetky jeho argumenty TRUE',
        abstract: 'Vracia TRUE, ak sú všetky jeho argumenty TRUE',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/and-function',
            },
        ],
        functionParameter: {
            logical1: { name: 'logická_hodnota1', detail: 'Prvá podmienka, ktorú chcete otestovať; môže sa vyhodnotiť na TRUE alebo FALSE.' },
            logical2: {
                name: 'logická_hodnota2',
                detail: 'Ďalšie podmienky, ktoré chcete otestovať; môžu sa vyhodnotiť na TRUE alebo FALSE, maximálne 255 podmienok.',
            },
        },
    },
    BYCOL: {
        description: 'Použije LAMBDA na každý stĺpec a vráti pole výsledkov',
        abstract: 'Použije LAMBDA na každý stĺpec a vráti pole výsledkov',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/bycol-function',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Pole, ktoré sa má spracovať po stĺpcoch.' },
            lambda: {
                name: 'lambda',
                detail: 'LAMBDA, ktorá berie stĺpec ako jeden parameter a vypočíta jeden výsledok. LAMBDA má jeden parameter: stĺpec z poľa.',
            },
        },
    },
    BYROW: {
        description: 'Použije LAMBDA na každý riadok a vráti pole výsledkov',
        abstract: 'Použije LAMBDA na každý riadok a vráti pole výsledkov',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/byrow-function',
            },
        ],
        functionParameter: {
            array: { name: 'pole', detail: 'Pole, ktoré sa má spracovať po riadkoch.' },
            lambda: {
                name: 'lambda',
                detail: 'LAMBDA, ktorá berie riadok ako jeden parameter a vypočíta jeden výsledok. LAMBDA má jeden parameter: riadok z poľa.',
            },
        },
    },
    FALSE: {
        description: 'Vracia logickú hodnotu FALSE.',
        abstract: 'Vracia logickú hodnotu FALSE.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/false-function',
            },
        ],
        functionParameter: {},
    },
    IF: {
        description: 'Určuje logický test, ktorý sa má vykonať',
        abstract: 'Určuje logický test, ktorý sa má vykonať',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/if-function',
            },
        ],
        functionParameter: {
            logicalTest: { name: 'logický_test', detail: 'Podmienka, ktorú chcete otestovať.' },
            valueIfTrue: {
                name: 'hodnota_ak_true',
                detail: 'Hodnota, ktorú chcete vrátiť, ak je výsledok logical_test TRUE.',
            },
            valueIfFalse: {
                name: 'hodnota_ak_false',
                detail: 'Hodnota, ktorú chcete vrátiť, ak je výsledok logical_test FALSE.',
            },
        },
    },
    IFERROR: {
        description: 'Vracia zadanú hodnotu, ak sa vzorec vyhodnotí na chybu; inak vráti výsledok vzorca',
        abstract: 'Vracia zadanú hodnotu, ak sa vzorec vyhodnotí na chybu; inak vráti výsledok vzorca',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/iferror-function',
            },
        ],
        functionParameter: {
            value: { name: 'hodnota', detail: 'Argument, ktorý sa kontroluje na chybu.' },
            valueIfError: {
                name: 'hodnota_ak_chyba',
                detail: 'Hodnota, ktorá sa vráti, ak sa vzorec vyhodnotí na chybu. Vyhodnocujú sa chyby: #N/A, #VALUE!, #REF!, #DIV/0!, #NUM!, #NAME? alebo #NULL!.',
            },
        },
    },
    IFNA: {
        description: 'Vracia zadanú hodnotu, ak sa výraz vyhodnotí na #N/A; inak vráti výsledok výrazu',
        abstract: 'Vracia zadanú hodnotu, ak sa výraz vyhodnotí na #N/A; inak vráti výsledok výrazu',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/ifna-function',
            },
        ],
        functionParameter: {
            value: { name: 'hodnota', detail: 'Argument, ktorý sa kontroluje na chybu #N/A.' },
            valueIfNa: { name: 'hodnota_ak_na', detail: 'Hodnota, ktorá sa vráti, ak sa vzorec vyhodnotí na chybu #N/A.' },
        },
    },
    IFS: {
        description: 'Skontroluje, či je splnená jedna alebo viac podmienok, a vráti hodnotu zodpovedajúcu prvej TRUE podmienke.',
        abstract: 'Skontroluje, či je splnená jedna alebo viac podmienok, a vráti hodnotu zodpovedajúcu prvej TRUE podmienke.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/ifs-function',
            },
        ],
        functionParameter: {
            logicalTest1: { name: 'logický_test1', detail: 'Podmienka, ktorá sa vyhodnotí na TRUE alebo FALSE.' },
            valueIfTrue1: { name: 'hodnota_ak_true1', detail: 'Výsledok, ktorý sa vráti, ak logical_test1 je TRUE. Môže byť prázdny.' },
            logicalTest2: { name: 'logický_test2', detail: 'Podmienka, ktorá sa vyhodnotí na TRUE alebo FALSE.' },
            valueIfTrue2: {
                name: 'hodnota_ak_true2',
                detail: 'Výsledok, ktorý sa vráti, ak logical_testN je TRUE. Každá hodnota value_if_trueN zodpovedá podmienke logical_testN. Môže byť prázdny.',
            },
        },
    },
    LAMBDA: {
        description: 'Použite funkciu LAMBDA na vytvorenie vlastných, opakovane použiteľných funkcií a volajte ich priateľským názvom. Nová funkcia je dostupná v celom zošite a používa sa ako natívne funkcie Excelu.',
        abstract: 'Vytvára vlastné, opakovane použiteľné funkcie a volá ich priateľským názvom',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/lambda-function',
            },
        ],
        functionParameter: {
            parameter: {
                name: 'parameter',
                detail: 'Hodnota, ktorú chcete odovzdať funkcii, napríklad odkaz na bunku, reťazec alebo číslo. Môžete zadať až 253 parametrov. Tento argument je voliteľný.',
            },
            calculation: {
                name: 'výpočet',
                detail: 'Vzorec, ktorý chcete vykonať a vrátiť ako výsledok funkcie. Musí byť posledným argumentom a musí vrátiť výsledok. Tento argument je povinný.',
            },
        },
    },
    LET: {
        description: 'Priraďuje názvy výsledkom výpočtov',
        abstract: 'Priraďuje názvy výsledkom výpočtov',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/let-function',
            },
        ],
        functionParameter: {
            name1: {
                name: 'názov1',
                detail: 'Prvý názov na priradenie. Musí začínať písmenom. Nesmie byť výstupom vzorca ani byť v konflikte so syntaxou rozsahu.',
            },
            nameValue1: { name: 'hodnota_názvu1', detail: 'Hodnota, ktorá sa priradí k názvu1.' },
            calculationOrName2: {
                name: 'výpočet_alebo_názov2',
                detail: 'Jedno z nasledujúcich:\n1.Výpočet, ktorý používa všetky názvy v rámci LET. Tento musí byť posledným argumentom v LET.\n2.Druhý názov na priradenie k druhej hodnote. Ak je zadaný názov, hodnota_názvu2 a výpočet_alebo_názov3 sú povinné.',
            },
            nameValue2: { name: 'hodnota_názvu2', detail: 'Hodnota, ktorá sa priradí k výpočet_alebo_názov2.' },
            calculationOrName3: {
                name: 'výpočet_alebo_názov3',
                detail: 'Jedno z nasledujúcich:\n1.Výpočet, ktorý používa všetky názvy v rámci LET. Posledný argument LET musí byť výpočet.\n2.Tretí názov na priradenie k tretej hodnote. Ak je zadaný názov, hodnota_názvu3 a výpočet_alebo_názov4 sú povinné.',
            },
        },
    },
    MAKEARRAY: {
        description: 'Vracia vypočítané pole so zadanou veľkosťou riadkov a stĺpcov použitím LAMBDA',
        abstract: 'Vracia vypočítané pole so zadanou veľkosťou riadkov a stĺpcov použitím LAMBDA',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/makearray-function',
            },
        ],
        functionParameter: {
            number1: { name: 'riadky', detail: 'Počet riadkov v poli. Musí byť väčší ako nula.' },
            number2: { name: 'stĺpce', detail: 'Počet stĺpcov v poli. Musí byť väčší ako nula.' },
            value3: {
                name: 'lambda',
                detail: 'LAMBDA, ktorá sa volá na vytvorenie poľa. LAMBDA berie dva parametre: row (index riadka poľa), col (index stĺpca poľa).',
            },
        },
    },
    MAP: {
        description: 'Vracia pole vytvorené mapovaním každej hodnoty v poli/poliach na novú hodnotu použitím LAMBDA.',
        abstract: 'Vracia pole vytvorené mapovaním každej hodnoty v poli/poliach na novú hodnotu použitím LAMBDA.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/map-function',
            },
        ],
        functionParameter: {
            array1: { name: 'pole1', detail: 'Pole1, ktoré sa má mapovať.' },
            array2: { name: 'pole2', detail: 'Pole2, ktoré sa má mapovať.' },
            lambda: { name: 'lambda', detail: 'LAMBDA, ktorá musí byť posledným argumentom a musí mať parameter pre každé odovzdané pole.' },
        },
    },
    NOT: {
        description: 'Obráti logiku svojho argumentu.',
        abstract: 'Obráti logiku svojho argumentu.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/not-function',
            },
        ],
        functionParameter: {
            logical: { name: 'logická_hodnota', detail: 'Podmienka, ktorej logiku chcete obrátiť; môže sa vyhodnotiť na TRUE alebo FALSE.' },
        },
    },
    OR: {
        description: 'Vracia TRUE, ak sa aspoň jeden argument vyhodnotí na TRUE, a FALSE, ak sa všetky argumenty vyhodnotia na FALSE.',
        abstract: 'Vracia TRUE, ak je aspoň jeden argument TRUE',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/or-function',
            },
        ],
        functionParameter: {
            logical1: { name: 'logická_hodnota1', detail: 'Prvá podmienka, ktorú chcete otestovať; môže sa vyhodnotiť na TRUE alebo FALSE.' },
            logical2: {
                name: 'logická_hodnota2',
                detail: 'Ďalšie podmienky, ktoré chcete otestovať; môžu sa vyhodnotiť na TRUE alebo FALSE, maximálne 255 podmienok.',
            },
        },
    },
    REDUCE: {
        description: 'Redukuje pole na akumulovanú hodnotu použitím LAMBDA na každú hodnotu a vráti celkovú hodnotu v akumulátore.',
        abstract: 'Redukuje pole na akumulovanú hodnotu použitím LAMBDA na každú hodnotu a vráti celkovú hodnotu v akumulátore.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/reduce-function',
            },
        ],
        functionParameter: {
            initialValue: { name: 'počiatočná_hodnota', detail: 'Nastaví počiatočnú hodnotu akumulátora.' },
            array: { name: 'pole', detail: 'Pole, ktoré sa má redukovať.' },
            lambda: {
                name: 'lambda',
                detail: 'LAMBDA, ktorá sa volá na redukciu poľa. LAMBDA berie tri parametre: 1.Hodnota sčítaná a vrátená ako finálny výsledok. 2.Aktuálna hodnota z poľa. 3.Výpočet použitý na každý prvok poľa.',
            },
        },
    },
    SCAN: {
        description: 'Prechádza pole použitím LAMBDA na každú hodnotu a vráti pole, ktoré obsahuje všetky medzivýsledky.',
        abstract: 'Prechádza pole použitím LAMBDA na každú hodnotu a vráti pole, ktoré obsahuje všetky medzivýsledky.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/scan-function',
            },
        ],
        functionParameter: {
            initialValue: { name: 'počiatočná_hodnota', detail: 'Nastaví počiatočnú hodnotu akumulátora.' },
            array: { name: 'pole', detail: 'Pole, ktoré sa má prechádzať.' },
            lambda: {
                name: 'lambda',
                detail: 'LAMBDA, ktorá sa volá na prechádzanie poľa. LAMBDA berie tri parametre: 1.Hodnota sčítaná a vrátená ako finálny výsledok. 2.Aktuálna hodnota z poľa. 3.Výpočet použitý na každý prvok poľa.',
            },
        },
    },
    SWITCH: {
        description: 'Vyhodnotí výraz voči zoznamu hodnôt a vráti výsledok zodpovedajúci prvej zhodnej hodnote. Ak zhoda neexistuje, môže sa vrátiť voliteľná predvolená hodnota.',
        abstract: 'Vyhodnotí výraz voči zoznamu hodnôt a vráti výsledok zodpovedajúci prvej zhodnej hodnote.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/switch-function',
            },
        ],
        functionParameter: {
            expression: { name: 'výraz', detail: 'Výraz je hodnota (napríklad číslo, dátum alebo text), ktorá sa porovnáva s value1…value126.' },
            value1: { name: 'hodnota1', detail: 'HodnotaN je hodnota, ktorá sa porovnáva s výrazom.' },
            result1: {
                name: 'výsledok1',
                detail: 'VýsledokN je hodnota, ktorá sa vráti, keď zodpovedajúci argument hodnotaN zodpovedá výrazu. VýsledokN musí byť zadaný pre každú zodpovedajúcu hodnotuN.',
            },
            defaultOrValue2: {
                name: 'predvolené_alebo_hodnota2',
                detail: 'Predvolené je hodnota, ktorá sa vráti, ak sa nenájde zhoda v hodnotách hodnotaN. Argument Predvolené je rozpoznaný tým, že nemá zodpovedajúci výsledokN (pozri príklady). Predvolené musí byť posledným argumentom funkcie.',
            },
            result2: {
                name: 'výsledok2',
                detail: 'VýsledokN je hodnota, ktorá sa vráti, keď zodpovedajúci argument hodnotaN zodpovedá výrazu. VýsledokN musí byť zadaný pre každú zodpovedajúcu hodnotuN.',
            },
        },
    },
    TRUE: {
        description: 'Vracia logickú hodnotu TRUE.',
        abstract: 'Vracia logickú hodnotu TRUE.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/true-function',
            },
        ],
        functionParameter: {},
    },
    XOR: {
        description: 'Vracia TRUE, ak sa nepárny počet argumentov vyhodnotí na TRUE, a FALSE, ak sa párny počet argumentov vyhodnotí na TRUE.',
        abstract: 'Vracia TRUE, ak je nepárny počet argumentov TRUE',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/xor-function',
            },
        ],
        functionParameter: {
            logical1: { name: 'logická_hodnota1', detail: 'Prvá podmienka, ktorú chcete otestovať; môže sa vyhodnotiť na TRUE alebo FALSE.' },
            logical2: {
                name: 'logická_hodnota2',
                detail: 'Ďalšie podmienky, ktoré chcete otestovať; môžu sa vyhodnotiť na TRUE alebo FALSE, maximálne 255 podmienok.',
            },
        },
    },
};

export default locale;
