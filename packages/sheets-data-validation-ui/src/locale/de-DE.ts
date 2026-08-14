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
        ribbon: {
            setCheckbox: 'Kontrollkästchen festlegen',
            clearCheckbox: 'Kontrollkästchen löschen',
            dropdownPresetTitle: 'Vorlage anwenden:',
            editDropdown: 'Optionen bearbeiten',
            clearDropdown: 'Dropdown löschen',
            dateTime: 'Datum und Uhrzeit',
            presets: {
                yes: 'Ja',
                no: 'Nein',
                notStarted: 'Nicht begonnen',
                inProgress: 'In Bearbeitung',
                completed: 'Abgeschlossen',
                option1: 'Option 1',
                option2: 'Option 2',
            },
        },
        operators: {
            legal: 'ist gültiger Typ',
        },
        validFail: {
            formulaError: 'Der Referenzbereich enthält unsichtbare Daten, bitte passen Sie den Bereich an',
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
        date: {
            title: 'Datum',
        },
        list: {
            title: 'Dropdown',
            add: 'Hinzufügen',
            options: 'Optionen',
            customOptions: 'Benutzerdefiniert',
            refOptions: 'Aus einem Bereich',
            edit: 'Bearbeiten',
        },
        checkbox: {
            title: 'Kontrollkästchen',
            tips: 'Benutzerdefinierte Werte in Zellen verwenden',
            checked: 'Ausgewählter Wert',
            unchecked: 'Nicht ausgewählter Wert',
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
