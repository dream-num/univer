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
    CELL: {
        description: 'Vracia informácie o formátovaní, umiestnení alebo obsahu bunky',
        abstract: 'Vracia informácie o formátovaní, umiestnení alebo obsahu bunky',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/cell-function-51bd39a5-f338-4dbe-a33f-955d67c2b2cf',
            },
        ],
        functionParameter: {
            infoType: { name: 'typ_informácie', detail: 'Textová hodnota, ktorá určuje, aký typ informácie o bunke chcete vrátiť.' },
            reference: { name: 'odkaz', detail: 'Bunka, o ktorej chcete informácie.' },
        },
    },
    ERROR_TYPE: {
        description: 'Vracia číslo zodpovedajúce typu chyby',
        abstract: 'Vracia číslo zodpovedajúce typu chyby',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/error-type-function-10958677-7c8d-44f7-ae77-b9a9ee6eefaa',
            },
        ],
        functionParameter: {
            errorVal: { name: 'hodnota_chyby', detail: 'Hodnota chyby, ktorej identifikačné číslo chcete zistiť.' },
        },
    },
    INFO: {
        description: 'Vracia informácie o aktuálnom prevádzkovom prostredí',
        abstract: 'Vracia informácie o aktuálnom prevádzkovom prostredí',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/info-function-725f259a-0e4b-49b3-8b52-58815c69acae',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'prvý' },
            number2: { name: 'number2', detail: 'druhý' },
        },
    },
    ISBETWEEN: {
        description: 'Kontroluje, či je zadané číslo medzi dvoma inými číslami, inkluzívne alebo exkluzívne.',
        abstract: 'Kontroluje, či je zadané číslo medzi dvoma inými číslami, inkluzívne alebo exkluzívne.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.google.com/docs/answer/10538337?hl=en&sjid=7730820672019533290-AP',
            },
        ],
        functionParameter: {
            valueToCompare: { name: 'porovnávaná_hodnota', detail: 'Hodnota, ktorá sa má testovať, či je medzi `lower_value` a `upper_value`.' },
            lowerValue: { name: 'dolná_hodnota', detail: 'Dolná hranica rozsahu hodnôt, do ktorého môže `value_to_compare` spadať.' },
            upperValue: { name: 'horná_hodnota', detail: 'Horná hranica rozsahu hodnôt, do ktorého môže `value_to_compare` spadať.' },
            lowerValueIsInclusive: { name: 'dolná_hranica_inkluzívna', detail: 'Či rozsah hodnôt zahŕňa `lower_value`. Predvolene TRUE.' },
            upperValueIsInclusive: { name: 'horná_hranica_inkluzívna', detail: 'Či rozsah hodnôt zahŕňa `upper_value`. Predvolene TRUE.' },
        },
    },
    ISBLANK: {
        description: 'Vracia TRUE, ak je hodnota prázdna',
        abstract: 'Vracia TRUE, ak je hodnota prázdna',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'hodnota', detail: 'Hodnota, ktorú chcete otestovať. Argument value môže byť prázdna bunka, chyba, logická hodnota, text, číslo alebo odkaz, prípadne názov odkazujúci na niektorú z týchto hodnôt.' },
        },
    },
    ISDATE: {
        description: 'Vracia, či je hodnota dátum.',
        abstract: 'Vracia, či je hodnota dátum.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.google.com/docs/answer/9061381?hl=en&sjid=2155433538747546473-AP',
            },
        ],
        functionParameter: {
            value: { name: 'hodnota', detail: 'Hodnota, ktorá sa má overiť ako dátum.' },
        },
    },
    ISEMAIL: {
        description: 'Kontroluje, či je hodnota platná e-mailová adresa',
        abstract: 'Kontroluje, či je hodnota platná e-mailová adresa',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.google.com/docs/answer/3256503?hl=en&sjid=2155433538747546473-AP',
            },
        ],
        functionParameter: {
            value: { name: 'hodnota', detail: 'Hodnota, ktorá sa má overiť ako e-mailová adresa.' },
        },
    },
    ISERR: {
        description: 'Vracia TRUE, ak je hodnota ľubovoľná chyba okrem #N/A',
        abstract: 'Vracia TRUE, ak je hodnota ľubovoľná chyba okrem #N/A',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'hodnota', detail: 'Hodnota, ktorú chcete otestovať. Argument value môže byť prázdna bunka, chyba, logická hodnota, text, číslo alebo odkaz, prípadne názov odkazujúci na niektorú z týchto hodnôt.' },
        },
    },
    ISERROR: {
        description: 'Vracia TRUE, ak je hodnota ľubovoľná chyba',
        abstract: 'Vracia TRUE, ak je hodnota ľubovoľná chyba',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'hodnota', detail: 'Hodnota, ktorú chcete otestovať. Argument value môže byť prázdna bunka, chyba, logická hodnota, text, číslo alebo odkaz, prípadne názov odkazujúci na niektorú z týchto hodnôt.' },
        },
    },
    ISEVEN: {
        description: 'Vracia TRUE, ak je číslo párne',
        abstract: 'Vracia TRUE, ak je číslo párne',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/iseven-function-aa15929a-d77b-4fbb-92f4-2f479af55356',
            },
        ],
        functionParameter: {
            value: { name: 'hodnota', detail: 'Hodnota, ktorú chcete otestovať. Ak číslo nie je celé, skráti sa.' },
        },
    },
    ISFORMULA: {
        description: 'Vracia TRUE, ak odkazuje na bunku, ktorá obsahuje vzorec',
        abstract: 'Vracia TRUE, ak odkazuje na bunku, ktorá obsahuje vzorec',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/isformula-function-e4d1355f-7121-4ef2-801e-3839bfd6b1e5',
            },
        ],
        functionParameter: {
            reference: { name: 'odkaz', detail: 'Odkaz na bunku, ktorú chcete otestovať.' },
        },
    },
    ISLOGICAL: {
        description: 'Vracia TRUE, ak je hodnota logická',
        abstract: 'Vracia TRUE, ak je hodnota logická',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'hodnota', detail: 'Hodnota, ktorú chcete otestovať. Argument value môže byť prázdna bunka, chyba, logická hodnota, text, číslo alebo odkaz, prípadne názov odkazujúci na niektorú z týchto hodnôt.' },
        },
    },
    ISNA: {
        description: 'Vracia TRUE, ak je hodnota chybová hodnota #N/A',
        abstract: 'Vracia TRUE, ak je hodnota chybová hodnota #N/A',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'hodnota', detail: 'Hodnota, ktorú chcete otestovať. Argument value môže byť prázdna bunka, chyba, logická hodnota, text, číslo alebo odkaz, prípadne názov odkazujúci na niektorú z týchto hodnôt.' },
        },
    },
    ISNONTEXT: {
        description: 'Vracia TRUE, ak hodnota nie je text',
        abstract: 'Vracia TRUE, ak hodnota nie je text',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'hodnota', detail: 'Hodnota, ktorú chcete otestovať. Argument value môže byť prázdna bunka, chyba, logická hodnota, text, číslo alebo odkaz, prípadne názov odkazujúci na niektorú z týchto hodnôt.' },
        },
    },
    ISNUMBER: {
        description: 'Vracia TRUE, ak je hodnota číslo',
        abstract: 'Vracia TRUE, ak je hodnota číslo',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'hodnota', detail: 'Hodnota, ktorú chcete otestovať. Argument value môže byť prázdna bunka, chyba, logická hodnota, text, číslo alebo odkaz, prípadne názov odkazujúci na niektorú z týchto hodnôt.' },
        },
    },
    ISODD: {
        description: 'Vracia TRUE, ak je číslo nepárne',
        abstract: 'Vracia TRUE, ak je číslo nepárne',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/isodd-function-1208a56d-4f10-4f44-a5fc-648cafd6c07a',
            },
        ],
        functionParameter: {
            value: { name: 'hodnota', detail: 'Hodnota, ktorú chcete otestovať. Ak číslo nie je celé, skráti sa.' },
        },
    },
    ISOMITTED: {
        description: 'Kontroluje, či v LAMBDA chýba hodnota a vráti TRUE alebo FALSE',
        abstract: 'Kontroluje, či v LAMBDA chýba hodnota a vráti TRUE alebo FALSE',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/isomitted-function-831d6fbc-0f07-40c4-9c5b-9c73fd1d60c1',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'prvý' },
            number2: { name: 'number2', detail: 'druhý' },
        },
    },
    ISREF: {
        description: 'Vracia TRUE, ak je hodnota odkaz',
        abstract: 'Vracia TRUE, ak je hodnota odkaz',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'hodnota', detail: 'Hodnota, ktorú chcete otestovať. Argument value môže byť prázdna bunka, chyba, logická hodnota, text, číslo alebo odkaz, prípadne názov odkazujúci na niektorú z týchto hodnôt.' },
        },
    },
    ISTEXT: {
        description: 'Vracia TRUE, ak je hodnota text',
        abstract: 'Vracia TRUE, ak je hodnota text',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/is-functions-0f2d7971-6019-40a0-a171-f2d869135665',
            },
        ],
        functionParameter: {
            value: { name: 'hodnota', detail: 'Hodnota, ktorú chcete otestovať. Argument value môže byť prázdna bunka, chyba, logická hodnota, text, číslo alebo odkaz, prípadne názov odkazujúci na niektorú z týchto hodnôt.' },
        },
    },
    ISURL: {
        description: 'Kontroluje, či je hodnota platná adresa URL.',
        abstract: 'Kontroluje, či je hodnota platná adresa URL.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.google.com/docs/answer/3256501?hl=en&sjid=7312884847858065932-AP',
            },
        ],
        functionParameter: {
            value: { name: 'hodnota', detail: 'Hodnota, ktorá sa má overiť ako URL.' },
        },
    },
    N: {
        description: 'Vracia hodnotu prevedenú na číslo',
        abstract: 'Vracia hodnotu prevedenú na číslo',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/n-function-a624cad1-3635-4208-b54a-29733d1278c9',
            },
        ],
        functionParameter: {
            value: { name: 'hodnota', detail: 'Hodnota, ktorú chcete previesť.' },
        },
    },
    NA: {
        description: 'Vracia chybovú hodnotu #N/A',
        abstract: 'Vracia chybovú hodnotu #N/A',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/na-function-5469c2d1-a90c-4fb5-9bbc-64bd9bb6b47c',
            },
        ],
        functionParameter: {},
    },
    SHEET: {
        description: 'Vracia číslo hárka odkazovaného hárka',
        abstract: 'Vracia číslo hárka odkazovaného hárka',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/sheet-function-44718b6f-8b87-47a1-a9d6-b701c06cff24',
            },
        ],
        functionParameter: {
            value: { name: 'hodnota', detail: 'Hodnota je názov hárka alebo odkaz, pre ktorý chcete číslo hárka. Ak je value vynechané, SHEET vráti číslo hárka, ktorý obsahuje funkciu.' },
        },
    },
    SHEETS: {
        description: 'Vracia počet hárkov v zošite',
        abstract: 'Vracia počet hárkov v zošite',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/sheets-function-770515eb-e1e8-45ce-8066-b557e5e4b80b',
            },
        ],
        functionParameter: {},
    },
    TYPE: {
        description: 'Vracia číslo označujúce dátový typ hodnoty',
        abstract: 'Vracia číslo označujúce dátový typ hodnoty',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/en-us/office/type-function-45b4e688-4bc3-48b3-a105-ffa892995899',
            },
        ],
        functionParameter: {
            value: { name: 'hodnota', detail: 'Môže to byť ľubovoľná hodnota, napríklad číslo, text, logická hodnota a podobne.' },
        },
    },
};

export default locale;
