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
            'quick-sum': 'Somma rapida',
        },

        insert: {
            tooltip: 'Funzioni',
            common: 'Funzioni comuni',
        },
        prompt: {
            helpExample: 'ESEMPIO',
            helpAbstract: 'DESCRIZIONE',
            required: 'Obbligatorio.',
            optional: 'Facoltativo.',
        },
        error: {
            title: 'Errore',
            divByZero: 'Errore di divisione per zero',
            name: 'Errore di nome non valido',
            value: 'Errore nel valore',
            num: 'Errore numerico',
            na: 'Errore valore non disponibile',
            cycle: 'Errore di riferimento circolare',
            ref: 'Errore di riferimento cella non valido',
            spill: 'L\'intervallo di spill non è vuoto',
            calc: 'Errore di calcolo',
            error: 'Errore',
            connect: 'Recupero dati',
            null: 'Errore nullo',
        },

        functionType: {
            financial: 'Finanziarie',
            date: 'Data e ora',
            math: 'Matematiche e trigonometriche',
            statistical: 'Statistiche',
            lookup: 'Ricerca e riferimento',
            database: 'Database',
            text: 'Testo',
            logical: 'Logiche',
            information: 'Informative',
            engineering: 'Ingegneristiche',
            cube: 'Cubi',
            compatibility: 'Compatibilità',
            web: 'Web',
            array: 'Matrici',
            univer: 'Univer',
            user: 'Definite dall\'utente',
            definedname: 'Nomi definiti',
        },
        moreFunctions: {
            confirm: 'Conferma',
            prev: 'Precedente',
            next: 'Successivo',
            searchFunctionPlaceholder: 'Cerca funzione',
            allFunctions: 'Tutte le funzioni',
            syntax: 'SINTASSI',
        },
        operation: {
            copyFormulaOnly: 'Copia solo formula',
            pasteFormula: 'Incolla formula',
        },

        rangeSelector: {
            title: 'Seleziona un intervallo di dati',
            addAnotherRange: 'Aggiungi intervallo',
            buttonTooltip: 'Seleziona intervallo di dati',
            placeHolder: 'Seleziona intervallo o digita.',
            confirm: 'Conferma',
            cancel: 'Annulla',
        },
    },
};

export default locale;
