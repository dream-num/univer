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
    'sheets-data-validation-ui': {
        title: 'Datenüberprüfung',
        operators: {
            legal: 'ist gültiger Typ',
        },
        validFail: {
            value: 'Bitte einen Wert eingeben',
            common: 'Bitte Wert oder Formel eingeben',
            number: 'Bitte Zahl oder Formel eingeben',
            formula: 'Bitte Formel eingeben',
            integer: 'Bitte Ganzzahl oder Formel eingeben',
            date: 'Bitte Datum oder Formel eingeben',
            list: 'Bitte Optionen eingeben',
            listInvalid: 'Die Listenquelle muss eine durch Trennzeichen getrennte Liste oder ein Bezug auf eine einzelne Zeile oder Spalte sein',
            checkboxEqual: 'Geben Sie unterschiedliche Werte für angekreuzte und nicht angekreuzte Zelleninhalte ein.',
            formulaError: 'Der Referenzbereich enthält unsichtbare Daten, bitte passen Sie den Bereich an',
            listIntersects: 'Der ausgewählte Bereich darf sich nicht mit dem Gültigkeitsbereich der Regeln überschneiden',
            primitive: 'Formeln sind für benutzerdefinierte angekreuzte und nicht angekreuzte Werte nicht zulässig.',
        },
        panel: {
            title: 'Datenüberprüfungsverwaltung',
            addTitle: 'Neue Datenüberprüfung erstellen',
            removeAll: 'Alle entfernen',
            add: 'Regel hinzufügen',
            range: 'Bereiche',
            type: 'Typ',
            options: 'Erweiterte Optionen',
            operator: 'Operator',
            removeRule: 'Entfernen',
            done: 'Fertig',
            formulaPlaceholder: 'Bitte Wert oder Formel eingeben',
            valuePlaceholder: 'Bitte Wert eingeben',
            formulaAnd: 'und',
            invalid: 'Ungültig',
            showWarning: 'Warnung anzeigen',
            rejectInput: 'Eingabe ablehnen',
            messageInfo: 'Hilfemeldung',
            showInfo: 'Hilfetext für ausgewählte Zelle anzeigen',
            rangeError: 'Bereiche sind ungültig',
            allowBlank: 'Leere Werte zulassen',
        },
        any: {
            title: 'Beliebiger Wert',
            error: 'Der Inhalt dieser Zelle verstößt gegen die Überprüfungsregel',
        },
        date: {
            title: 'Datum',
        },
        list: {
            title: 'Dropdown',
            name: 'Wert enthält einen aus dem Bereich',
            error: 'Eingabe muss innerhalb des angegebenen Bereichs liegen',
            emptyError: 'Bitte einen Wert eingeben',
            add: 'Hinzufügen',
            dropdown: 'Auswählen',
            options: 'Optionen',
            customOptions: 'Benutzerdefiniert',
            refOptions: 'Aus einem Bereich',
            formulaError: 'Die Listenquelle muss eine durch Trennzeichen getrennte Liste von Daten oder ein Bezug auf eine einzelne Zeile oder Spalte sein.',
            edit: 'Bearbeiten',
        },
        listMultiple: {
            title: 'Dropdown-Mehrfachauswahl',
            dropdown: 'Mehrfachauswahl',
        },
        textLength: {
            title: 'Textlänge',
        },
        decimal: {
            title: 'Zahl',
        },
        whole: {
            title: 'Ganzzahl',
        },
        checkbox: {
            title: 'Kontrollkästchen',
            error: 'Der Inhalt dieser Zelle verstößt gegen die Überprüfungsregel',
            tips: 'Benutzerdefinierte Werte in Zellen verwenden',
            checked: 'Ausgewählter Wert',
            unchecked: 'Nicht ausgewählter Wert',
        },
        custom: {
            title: 'Benutzerdefinierte Formel',
            error: 'Der Inhalt dieser Zelle verstößt gegen die Überprüfungsregel',
            validFail: 'Bitte eine gültige Formel eingeben',
        },
        alert: {
            title: 'Fehler',
            ok: 'OK',
        },
        error: {
            title: 'Ungültig:',
        },
        renderMode: {
            arrow: 'Pfeil',
            chip: 'Chip',
            text: 'Reiner Text',
            label: 'Anzeigestil',
        },
        showTime: {
            label: 'Zeitauswahl anzeigen',
        },
        permission: {
            dialog: {
                setStyleErr: 'Der Bereich ist geschützt und Sie haben keine Berechtigung, Stile festzulegen. Um Stile festzulegen, wenden Sie sich bitte an den Ersteller.',
            },
        },
    },
};

export default locale;
