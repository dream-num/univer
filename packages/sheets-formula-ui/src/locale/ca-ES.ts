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
import array from './function-list/array/ca-ES';
import compatibility from './function-list/compatibility/ca-ES';
import cube from './function-list/cube/ca-ES';
import database from './function-list/database/ca-ES';
import date from './function-list/date/ca-ES';
import engineering from './function-list/engineering/ca-ES';
import financial from './function-list/financial/ca-ES';
import information from './function-list/information/ca-ES';
import logical from './function-list/logical/ca-ES';
import lookup from './function-list/lookup/ca-ES';
import math from './function-list/math/ca-ES';
import statistical from './function-list/statistical/ca-ES';
import text from './function-list/text/ca-ES';
import univer from './function-list/univer/ca-ES';
import web from './function-list/web/ca-ES';

const locale: typeof enUS = {
    shortcut: {
        'sheets-formula-ui': {
            'quick-sum': 'Suma ràpida',
        },
    },
    formula: {
        insert: {
            tooltip: 'Funcions',
            sum: 'SUMA',
            average: 'MITJANA',
            count: 'COMPTAR',
            max: 'MÀX',
            min: 'MÍN',
            more: 'Més funcions...',
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
            helpExample: 'EXEMPLE',
            helpAbstract: 'SOBRE',
            required: 'Obligatori.',
            optional: 'Opcional.',
        },
        error: {
            title: 'Error',
            divByZero: 'Error de divisió per zero',
            name: 'Error de nom no vàlid',
            value: 'Error en el valor',
            num: 'Error numèric',
            na: 'Error de valor no disponible',
            cycle: 'Error de referència circular',
            ref: 'Error de referència de cel·la no vàlida',
            spill: 'L\'interval de vessament no està buit',
            calc: 'Error de càlcul',
            error: 'Error',
            connect: 'Obtenint dades',
            null: 'Error nul',
        },

        functionType: {
            financial: 'Financera',
            date: 'Data i hora',
            math: 'Matemàtiques i trigonometria',
            statistical: 'Estadística',
            lookup: 'Cerca i referència',
            database: 'Base de dades',
            text: 'Text',
            logical: 'Lògica',
            information: 'Informació',
            engineering: 'Enginyeria',
            cube: 'Cub',
            compatibility: 'Compatibilitat',
            web: 'Web',
            array: 'Matriu',
            univer: 'Univer',
            user: 'Definida per l\'usuari',
            definedname: 'Nom definit',
        },
        moreFunctions: {
            confirm: 'Confirma',
            prev: 'Anterior',
            next: 'Següent',
            searchFunctionPlaceholder: 'Cerca funció',
            allFunctions: 'Totes les funcions',
            syntax: 'SINTAXI',
        },
        operation: {
            pasteFormula: 'Enganxa la fórmula',
        },
    },
};

export default locale;
