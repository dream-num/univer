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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/cell-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/error-type-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/info-function',
            },
        ],
        functionParameter: {
            typeText: { name: 'Typ textu', detail: 'Text určujúci typ informácie, ktorá sa má vrátiť.' },
        },
    },
    ISBETWEEN: {
        description: 'Kontroluje, či je zadané číslo medzi dvoma inými číslami, inkluzívne alebo exkluzívne.',
        abstract: 'Kontroluje, či je zadané číslo medzi dvoma inými číslami, inkluzívne alebo exkluzívne.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.google.com/docs/answer/10538337?hl=sk',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/is-functions',
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
                url: 'https://support.google.com/docs/answer/9061381?hl=sk',
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
                url: 'https://support.google.com/docs/answer/3256503?hl=sk',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/is-functions',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'hodnota', detail: 'Hodnota, ktorú chcete otestovať. Argument value môže byť prázdna bunka, chyba, logická hodnota, text, číslo alebo odkaz, prípadne názov odkazujúci na niektorú z týchto hodnôt.' },
        },
    },
    ISEVEN: {
        description: 'Vráti hodnotu TRUE, ak je číslo párne. Vráti hodnotu FALSE, ak je číslo nepárne.',
        abstract: 'Vráti hodnotu TRUE, ak je číslo párne. Vráti hodnotu FALSE, ak je číslo nepárne.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/iseven-function',
            },
        ],
        functionParameter: {
            value: { name: 'hodnota', detail: 'Povinné. Hodnota, ktorá sa má testovať. Ak číslo nie je celým číslom, skráti sa.' },
        },
    },
    ISFORMULA: {
        description: 'Vracia TRUE, ak odkazuje na bunku, ktorá obsahuje vzorec',
        abstract: 'Vracia TRUE, ak odkazuje na bunku, ktorá obsahuje vzorec',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/isformula-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/is-functions',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/is-functions',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/is-functions',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/is-functions',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/isodd-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/isomitted-function',
            },
        ],
        functionParameter: {
            argument: { name: 'Argument', detail: 'Hodnota, pri ktorej sa testuje vynechanie, napríklad parameter funkcie LAMBDA.' },
        },
    },
    ISREF: {
        description: 'Vracia TRUE, ak je hodnota odkaz',
        abstract: 'Vracia TRUE, ak je hodnota odkaz',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.microsoft.com/sk-sk/excel/functions/is-functions',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/is-functions',
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
                url: 'https://support.google.com/docs/answer/3256501?hl=sk',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/n-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/na-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/sheet-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/sheets-function',
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
                url: 'https://support.microsoft.com/sk-sk/excel/functions/type-function',
            },
        ],
        functionParameter: {
            value: { name: 'hodnota', detail: 'Môže to byť ľubovoľná hodnota, napríklad číslo, text, logická hodnota a podobne.' },
        },
    },
};

export default locale;
