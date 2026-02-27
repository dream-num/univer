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
import array from './function-list/array/sk-SK';
import compatibility from './function-list/compatibility/sk-SK';
import cube from './function-list/cube/sk-SK';
import database from './function-list/database/sk-SK';
import date from './function-list/date/sk-SK';
import engineering from './function-list/engineering/sk-SK';
import financial from './function-list/financial/sk-SK';
import information from './function-list/information/sk-SK';
import logical from './function-list/logical/sk-SK';
import lookup from './function-list/lookup/sk-SK';
import math from './function-list/math/sk-SK';
import statistical from './function-list/statistical/sk-SK';
import text from './function-list/text/sk-SK';
import univer from './function-list/univer/sk-SK';
import web from './function-list/web/sk-SK';

const locale: typeof enUS = {
    shortcut: {
        'sheets-formula-ui': {
            'quick-sum': 'Rýchly súčet',
        },
    },
    formula: {
        insert: {
            tooltip: 'Funkcie',
            sum: 'SUMA',
            average: 'PRIEMER',
            count: 'POČET',
            max: 'MAX',
            min: 'MIN',
            more: 'Viac funkcií...',
        },
        functionList: {
            ...financial,
            ...date,
            ...math,
            ...statistical,
            ...lookup,
            ...database,
            ...text,
            ...logical,
            ...information,
            ...engineering,
            ...cube,
            ...compatibility,
            ...web,
            ...array,
            ...univer,
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
    },
};

export default locale;
