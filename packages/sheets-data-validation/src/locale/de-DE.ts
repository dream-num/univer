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
    'sheets-data-validation': {
        operators: {
            between: 'zwischen',
            greaterThan: 'größer als',
            greaterThanOrEqual: 'größer als oder gleich',
            lessThan: 'kleiner als',
            lessThanOrEqual: 'kleiner als oder gleich',
            equal: 'gleich',
            notEqual: 'ungleich',
            notBetween: 'nicht zwischen',
            legal: 'ist gültiger Typ',
        },
        ruleName: {
            between: 'Ist zwischen {FORMULA1} und {FORMULA2}',
            greaterThan: 'Ist größer als {FORMULA1}',
            greaterThanOrEqual: 'Ist größer als oder gleich {FORMULA1}',
            lessThan: 'Ist kleiner als {FORMULA1}',
            lessThanOrEqual: 'Ist kleiner als oder gleich {FORMULA1}',
            equal: 'Ist gleich {FORMULA1}',
            notEqual: 'Ist ungleich {FORMULA1}',
            notBetween: 'Ist nicht zwischen {FORMULA1} und {FORMULA2}',
            legal: 'Ist ein gültiger {TYPE}',
        },
        errorMsg: {
            between: 'Wert muss zwischen {FORMULA1} und {FORMULA2} liegen',
            greaterThan: 'Wert muss größer als {FORMULA1} sein',
            greaterThanOrEqual: 'Wert muss größer als oder gleich {FORMULA1} sein',
            lessThan: 'Wert muss kleiner als {FORMULA1} sein',
            lessThanOrEqual: 'Wert muss kleiner als oder gleich {FORMULA1} sein',
            equal: 'Wert muss gleich {FORMULA1} sein',
            notEqual: 'Wert muss ungleich {FORMULA1} sein',
            notBetween: 'Wert muss nicht zwischen {FORMULA1} und {FORMULA2} liegen',
            legal: 'Wert muss ein gültiger {TYPE} sein',
        },
        date: {
            operators: {
                between: 'zwischen',
                greaterThan: 'nach',
                greaterThanOrEqual: 'am oder nach',
                lessThan: 'vor',
                lessThanOrEqual: 'am oder vor',
                equal: 'gleich',
                notEqual: 'ungleich',
                notBetween: 'nicht zwischen',
                legal: 'ist ein gültiges Datum',
            },
            ruleName: {
                between: 'ist zwischen {FORMULA1} und {FORMULA2}',
                greaterThan: 'ist nach {FORMULA1}',
                greaterThanOrEqual: 'ist am oder nach {FORMULA1}',
                lessThan: 'ist vor {FORMULA1}',
                lessThanOrEqual: 'ist am oder vor {FORMULA1}',
                equal: 'ist {FORMULA1}',
                notEqual: 'ist nicht {FORMULA1}',
                notBetween: 'ist nicht zwischen {FORMULA1} und {FORMULA2}',
                legal: 'ist ein gültiges Datum',
            },
            errorMsg: {
                between: 'Wert muss ein gültiges Datum sein und zwischen {FORMULA1} und {FORMULA2} liegen',
                greaterThan: 'Wert muss ein gültiges Datum sein und nach {FORMULA1} liegen',
                greaterThanOrEqual: 'Wert muss ein gültiges Datum sein und am oder nach {FORMULA1} liegen',
                lessThan: 'Wert muss ein gültiges Datum sein und vor {FORMULA1} liegen',
                lessThanOrEqual: 'Wert muss ein gültiges Datum sein und am oder vor {FORMULA1} liegen',
                equal: 'Wert muss ein gültiges Datum sein und {FORMULA1} entsprechen',
                notEqual: 'Wert muss ein gültiges Datum sein und nicht {FORMULA1} entsprechen',
                notBetween: 'Wert muss ein gültiges Datum sein und nicht zwischen {FORMULA1} und {FORMULA2} liegen',
                legal: 'Wert muss ein gültiges Datum sein',
            },
            title: 'Datum',
        },
        textLength: {
            errorMsg: {
                between: 'Textlänge muss zwischen {FORMULA1} und {FORMULA2} liegen',
                greaterThan: 'Textlänge muss größer als {FORMULA1} sein',
                greaterThanOrEqual: 'Textlänge muss größer als oder gleich {FORMULA1} sein',
                lessThan: 'Textlänge muss kleiner als {FORMULA1} sein',
                lessThanOrEqual: 'Textlänge muss kleiner als oder gleich {FORMULA1} sein',
                equal: 'Textlänge muss {FORMULA1} sein',
                notEqual: 'Textlänge muss ungleich {FORMULA1} sein',
                notBetween: 'Textlänge muss nicht zwischen {FORMULA1} und {FORMULA2} liegen',
            },
            title: 'Textlänge',
        },
        custom: {
            ruleName: 'Benutzerdefinierte Formel ist {FORMULA1}',
            title: 'Benutzerdefinierte Formel',
            validFail: 'Bitte geben Sie eine gültige Formel ein',
            error: 'Der Inhalt dieser Zelle verstößt gegen die Überprüfungsregel',
        },
        validFail: {
            value: 'Bitte geben Sie einen Wert ein',
            common: 'Bitte geben Sie einen Wert oder eine Formel ein',
            number: 'Bitte geben Sie eine Zahl oder eine Formel ein',
            formula: 'Bitte geben Sie eine Formel ein',
            integer: 'Bitte geben Sie eine ganze Zahl oder eine Formel ein',
            date: 'Bitte geben Sie ein Datum oder eine Formel ein',
            list: 'Bitte geben Sie Optionen ein',
            listInvalid: 'Die Listenquelle muss eine durch Trennzeichen getrennte Liste oder ein Bezug auf eine einzelne Zeile oder Spalte sein',
            checkboxEqual: 'Geben Sie unterschiedliche Werte für angekreuzte und nicht angekreuzte Zelleninhalte ein.',
            formulaError: 'Der Bezugsbereich enthält unsichtbare Daten, bitte passen Sie den Bereich an',
            listIntersects: 'Der ausgewählte Bereich darf sich nicht mit dem Geltungsbereich der Regeln überschneiden',
            primitive: 'Formeln sind für benutzerdefinierte angekreuzte und nicht angekreuzte Werte nicht zulässig.',
        },
        any: {
            title: 'Beliebiger Wert',
            error: 'Der Inhalt dieser Zelle verstößt gegen die Überprüfungsregel',
        },
        list: {
            title: 'Dropdown',
            name: 'Wert enthält einen aus dem Bereich',
            error: 'Eingabe muss im angegebenen Bereich liegen',
            emptyError: 'Bitte geben Sie einen Wert ein',
            add: 'Hinzufügen',
            dropdown: 'Auswählen',
            options: 'Optionen',
            customOptions: 'Benutzerdefiniert',
            refOptions: 'Aus einem Bereich',
            formulaError: 'Die Listenquelle muss eine durch Trennzeichen getrennte Datenliste oder ein Bezug auf eine einzelne Zeile oder Spalte sein.',
            edit: 'Bearbeiten',
        },
        listMultiple: {
            title: 'Dropdown-Mehrfachauswahl',
            dropdown: 'Mehrfachauswahl',
        },
        decimal: {
            title: 'Zahl',
        },
        whole: {
            title: 'Ganze Zahl',
        },
        checkbox: {
            title: 'Kontrollkästchen',
            error: 'Der Inhalt dieser Zelle verstößt gegen die Überprüfungsregel',
            tips: 'Benutzerdefinierte Werte in Zellen verwenden',
            checked: 'Ausgewählter Wert',
            unchecked: 'Nicht ausgewählter Wert',
        },
    },
};

export default locale;
