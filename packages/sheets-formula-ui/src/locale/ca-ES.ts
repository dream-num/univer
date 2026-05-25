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
            'quick-sum': 'Suma ràpida',
        },

        insert: {
            tooltip: 'Funcions',
            common: 'Funcions habituals',
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
            copyFormulaOnly: 'Copia només la fórmula',
            pasteFormula: 'Enganxa la fórmula',
        },

        rangeSelector: {
            title: 'Selecciona un interval de dades',
            addAnotherRange: 'Afegeix interval',
            buttonTooltip: 'Selecciona interval de dades',
            placeHolder: 'Selecciona un interval o escriu.',
            confirm: 'Confirma',
            cancel: 'Cancel·la',
        },
    },
};

export default locale;
