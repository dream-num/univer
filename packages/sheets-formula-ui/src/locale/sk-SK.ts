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
    'sheets-formula-ui': {
        shortcut: {
            'quick-sum': 'Rýchly súčet',
        },

        insert: {
            tooltip: 'Funkcie',
            common: 'Bežné funkcie',
        },
        prompt: {
            helpExample: 'PRÍKLAD',
            helpAbstract: 'O FUNKCII',
            required: 'Povinné.',
            optional: 'Voliteľné.',
        },
        error: {
            title: 'Chyba',
            divByZero: 'Chyba delenia nulou',
            name: 'Neplatný názov',
            value: 'Chyba v hodnote',
            num: 'Číselná chyba',
            na: 'Hodnota nie je k dispozícii',
            cycle: 'Chyba kruhovej referencie',
            ref: 'Neplatný odkaz na bunku',
            spill: 'Rozliaty rozsah nie je prázdny',
            calc: 'Chyba výpočtu',
            error: 'Chyba',
            connect: 'Načítavajú sa údaje',
            null: 'Nulová chyba',
        },

        functionType: {
            financial: 'Finančné',
            date: 'Dátum a čas',
            math: 'Matematika a trigonometria',
            statistical: 'Štatistické',
            lookup: 'Vyhľadávanie a odkazy',
            database: 'Databáza',
            text: 'Text',
            logical: 'Logické',
            information: 'Informácie',
            engineering: 'Inžinierske',
            cube: 'Kocka',
            compatibility: 'Kompatibilita',
            web: 'Web',
            array: 'Pole',
            univer: 'Univer',
            user: 'Definované používateľom',
            definedname: 'Definovaný názov',
        },
        moreFunctions: {
            confirm: 'Potvrdiť',
            prev: 'Predchádzajúce',
            next: 'Nasledujúce',
            searchFunctionPlaceholder: 'Hľadať funkciu',
            allFunctions: 'Všetky funkcie',
            syntax: 'SYNTAX',
        },
        operation: {
            copyFormulaOnly: 'Kopírovať iba vzorec',
            pasteFormula: 'Prilepiť vzorec',
        },

        rangeSelector: {
            title: 'Vyberte rozsah údajov',
            addAnotherRange: 'Pridať rozsah',
            buttonTooltip: 'Vybrať rozsah údajov',
            placeHolder: 'Vyberte rozsah alebo zadajte.',
            confirm: 'Potvrdiť',
            cancel: 'Zrušiť',
        },
    },
};

export default locale;
