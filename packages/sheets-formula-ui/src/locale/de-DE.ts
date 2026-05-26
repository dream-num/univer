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
            'quick-sum': 'Schnelle Summe',
        },

        insert: {
            tooltip: 'Funktionen',
            common: 'Häufige Funktionen',
        },
        prompt: {
            helpExample: 'BEISPIEL',
            helpAbstract: 'INFO',
            required: 'Erforderlich.',
            optional: 'Optional.',
        },
        error: {
            title: 'Fehler',
            divByZero: 'Divisionsfehler',
            name: 'Ungültiger Name',
            value: 'Wertfehler',
            num: 'Zahlenfehler',
            na: 'Wert nicht verfügbar',
            cycle: 'Zirkelbezug',
            ref: 'Ungültiger Zellbezug',
            spill: 'Bereich ist nicht leer',
            calc: 'Berechnungsfehler',
            error: 'Fehler',
            connect: 'Daten werden abgerufen',
            null: 'Null-Fehler',
        },

        functionType: {
            financial: 'Finanzmathematik',
            date: 'Datum und Uhrzeit',
            math: 'Mathematik und Trigonometrie',
            statistical: 'Statistik',
            lookup: 'Suchen und Verweisen',
            database: 'Datenbank',
            text: 'Text',
            logical: 'Logik',
            information: 'Information',
            engineering: 'Technik',
            cube: 'Cube',
            compatibility: 'Kompatibilität',
            web: 'Web',
            array: 'Array',
            univer: 'Univer',
            user: 'Benutzerdefiniert',
            definedname: 'Definierter Name',
        },
        moreFunctions: {
            confirm: 'Bestätigen',
            prev: 'Zurück',
            next: 'Weiter',
            searchFunctionPlaceholder: 'Funktion suchen',
            allFunctions: 'Alle Funktionen',
            syntax: 'SYNTAX',
        },
        operation: {
            copyFormulaOnly: 'Nur Formel kopieren',
            pasteFormula: 'Formel einfügen',
        },

        rangeSelector: {
            title: 'Datenbereich auswählen',
            addAnotherRange: 'Bereich hinzufügen',
            buttonTooltip: 'Datenbereich auswählen',
            placeHolder: 'Bereich auswählen oder eingeben.',
            confirm: 'Bestätigen',
            cancel: 'Abbrechen',
        },
    },
};

export default locale;
