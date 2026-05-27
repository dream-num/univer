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
    'sheets-table-ui': {
        title: 'Tabelle',
        selectRange: 'Tabellenbereich auswählen',
        rename: 'Tabelle umbenennen',
        renamePlaceholder: 'Tabellennamen eingeben',
        updateRange: 'Tabellenbereich aktualisieren',
        tableRangeWithMergeError: 'Tabellenbereich darf sich nicht mit verbundenen Zellen überschneiden',
        tableRangeWithOtherTableError: 'Tabellenbereich darf sich nicht mit anderen Tabellen überschneiden',
        tableRangeSingleRowError: 'Tabellenbereich darf nicht nur eine Zeile sein',
        updateError: 'Tabellenbereich kann nicht auf einen Bereich festgelegt werden, der sich nicht mit dem Original überschneidet und nicht in derselben Zeile liegt',
        tableStyle: 'Tabellenstil',
        defaultStyle: 'Standardstil',
        customStyle: 'Benutzerdefinierter Stil',
        customTooMore: 'Die Anzahl der benutzerdefinierten Designs überschreitet das Maximum, bitte löschen Sie einige unnötige Designs und fügen Sie sie erneut hinzu',
        setTheme: 'Tabellenthema festlegen',
        removeTable: 'Tabelle entfernen',
        cancel: 'Abbrechen',
        confirm: 'Bestätigen',
        header: 'Kopfzeile',
        footer: 'Fußzeile',
        firstLine: 'Erste Zeile',
        secondLine: 'Zweite Zeile',
        columnPrefix: 'Spalte',
        tablePrefix: 'Tabelle',
        tableNameError: 'Tabellenname darf keine Leerzeichen enthalten, darf nicht mit einer Zahl beginnen und darf nicht mit einem bestehenden Tabellennamen identisch sein',
        columnMenu: {
            'insert-left': '1 Tabellenspalte links einfügen',
            'insert-right': '1 Tabellenspalte rechts einfügen',
            delete: 'Tabellenspalte löschen',
        },

        sort: {
            'sort-asc': 'Aufsteigend',
            'sort-desc': 'Absteigend',
        },

        insert: {
            main: 'Tabelle einfügen',
            row: 'Tabellenzeile einfügen',
            col: 'Tabellenspalte einfügen',
        },

        remove: {
            main: 'Tabelle entfernen',
            row: 'Tabellenzeile entfernen',
            col: 'Tabellenspalte entfernen',
        },
        condition: {
            string: 'Text',
            number: 'Zahl',
            date: 'Datum',

            empty: '(Leer)',
        },
        string: {
            compare: {
                equal: 'Gleich',
                notEqual: 'Ungleich',
                contains: 'Enthält',
                notContains: 'Enthält nicht',
                startsWith: 'Beginnt mit',
                endsWith: 'Endet mit',
            },
        },
        number: {
            compare: {
                equal: 'Gleich',
                notEqual: 'Ungleich',
                greaterThan: 'Größer als',
                greaterThanOrEqual: 'Größer oder gleich',
                lessThan: 'Kleiner als',
                lessThanOrEqual: 'Kleiner oder gleich',
                between: 'Zwischen',
                notBetween: 'Nicht zwischen',
                above: 'Über',
                below: 'Unter',
                topN: 'Oben {0}',
            },
        },
        date: {
            compare: {
                equal: 'Gleich',
                notEqual: 'Ungleich',
                after: 'Nach',
                afterOrEqual: 'Nach oder gleich',
                before: 'Vor',
                beforeOrEqual: 'Vor oder gleich',
                between: 'Zwischen',
                notBetween: 'Nicht zwischen',
                today: 'Heute',
                yesterday: 'Gestern',
                tomorrow: 'Morgen',
                thisWeek: 'Diese Woche',
                lastWeek: 'Letzte Woche',
                nextWeek: 'Nächste Woche',
                thisMonth: 'Dieser Monat',
                lastMonth: 'Letzter Monat',
                nextMonth: 'Nächster Monat',
                thisQuarter: 'Dieses Quartal',
                lastQuarter: 'Letztes Quartal',
                nextQuarter: 'Nächstes Quartal',
                thisYear: 'Dieses Jahr',
                nextYear: 'Nächstes Jahr',
                lastYear: 'Letztes Jahr',
                quarter: 'Nach Quartal',
                month: 'Nach Monat',
                q1: 'Erstes Quartal',
                q2: 'Zweites Quartal',
                q3: 'Drittes Quartal',
                q4: 'Viertes Quartal',
                m1: 'Januar',
                m2: 'Februar',
                m3: 'März',
                m4: 'April',
                m5: 'Mai',
                m6: 'Juni',
                m7: 'Juli',
                m8: 'August',
                m9: 'September',
                m10: 'Oktober',
                m11: 'November',
                m12: 'Dezember',
            },
        },
        filter: {
            'by-values': 'Nach Werten',
            'by-conditions': 'Nach Bedingungen',
            'clear-filter': 'Filter löschen',
            cancel: 'Abbrechen',
            confirm: 'Bestätigen',
            'search-placeholder': 'Leerzeichen zum Trennen von Schlüsselwörtern verwenden',
            'select-all': 'Alle auswählen',
        },
    },
};

export default locale;
