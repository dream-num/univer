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
    'sheets-conditional-formatting-ui': {
        title: 'Bedingte Formatierung',
        menu: {
            manageConditionalFormatting: 'Bedingte Formatierung verwalten',
            createConditionalFormatting: 'Bedingte Formatierung erstellen',
            clearRangeRules: 'Regeln für ausgewählten Bereich löschen',
            clearWorkSheetRules: 'Regeln für gesamtes Blatt löschen',

        },
        form: {
            lessThan: 'Der Wert muss kleiner als {0} sein',
            lessThanOrEqual: 'Der Wert muss kleiner oder gleich {0} sein',
            greaterThan: 'Der Wert muss größer als {0} sein',
            greaterThanOrEqual: 'Der Wert muss größer oder gleich {0} sein',
            rangeSelector: 'Bereich auswählen oder Wert eingeben',
        },
        iconSet: {
            direction: 'Richtung',
            shape: 'Form',
            mark: 'Zeichen',
            rank: 'Rang',
            rule: 'Regel',
            icon: 'Symbol',
            type: 'Typ',
            value: 'Wert',
            reverseIconOrder: 'Symbolreihenfolge umkehren',
            and: 'Und',
            when: 'Wenn',
            onlyShowIcon: 'Nur Symbol anzeigen',
            noCellIcon: 'Kein Zellsymbol',
        },
        symbol: {
            greaterThan: '>',
            greaterThanOrEqual: '>=',
            lessThan: '<',
            lessThanOrEqual: '<=',
        },
        panel: {
            createRule: 'Regel erstellen',
            clear: 'Alle Regeln löschen',
            range: 'Bereich anwenden',
            styleType: 'Stiltyp',
            submit: 'Anwenden',
            cancel: 'Abbrechen',
            rankAndAverage: 'Oben/Unten/Mittelwert',
            styleRule: 'Stilregel',
            isNotBottom: 'Oben',
            isBottom: 'Unten',
            greaterThanAverage: 'Größer als Mittelwert',
            lessThanAverage: 'Kleiner als Mittelwert',
            medianValue: 'Medianwert',
            fillType: 'Fülltyp',
            pureColor: 'Einfarbig',
            gradient: 'Farbverlauf',
            colorSet: 'Farbsatz',
            positive: 'Positiv',
            native: 'Negativ',
            workSheet: 'Gesamtes Blatt',
            selectedRange: 'Ausgewählter Bereich',
            managerRuleSelect: '{0} Regeln verwalten',
            onlyShowDataBar: 'Nur Datenbalken anzeigen',
        },
        preview: {
            describe: {
                beginsWith: 'Beginnt mit {0}',
                endsWith: 'Endet mit {0}',
                containsText: 'Text enthält {0}',
                notContainsText: 'Text enthält nicht {0}',
                equal: 'Gleich {0}',
                notEqual: 'Ungleich {0}',
                containsBlanks: 'Enthält Leerzellen',
                notContainsBlanks: 'Enthält keine Leerzellen',
                containsErrors: 'Enthält Fehler',
                notContainsErrors: 'Enthält keine Fehler',
                greaterThan: 'Größer als {0}',
                greaterThanOrEqual: 'Größer oder gleich {0}',
                lessThan: 'Kleiner als {0}',
                lessThanOrEqual: 'Kleiner oder gleich {0}',
                notBetween: 'Nicht zwischen {0} und {1}',
                between: 'Zwischen {0} und {1}',
                yesterday: 'Gestern',
                tomorrow: 'Morgen',
                last7Days: 'Letzte 7 Tage',
                thisMonth: 'Dieser Monat',
                lastMonth: 'Letzter Monat',
                nextMonth: 'Nächster Monat',
                thisWeek: 'Diese Woche',
                lastWeek: 'Letzte Woche',
                nextWeek: 'Nächste Woche',
                today: 'Heute',
                topN: 'Oben {0}',
                bottomN: 'Unten {0}',
                topNPercent: 'Oben {0}%',
                bottomNPercent: 'Unten {0}%',
            },
        },
        operator: {
            beginsWith: 'Beginnt mit',
            endsWith: 'Endet mit',
            containsText: 'Text enthält',
            notContainsText: 'Text enthält nicht',
            equal: 'Gleich',
            notEqual: 'Ungleich',
            containsBlanks: 'Enthält Leerzellen',
            notContainsBlanks: 'Enthält keine Leerzellen',
            containsErrors: 'Enthält Fehler',
            notContainsErrors: 'Enthält keine Fehler',
            greaterThan: 'Größer als',
            greaterThanOrEqual: 'Größer oder gleich',
            lessThan: 'Kleiner als',
            lessThanOrEqual: 'Kleiner oder gleich',
            notBetween: 'Nicht zwischen',
            between: 'Zwischen',
            yesterday: 'Gestern',
            tomorrow: 'Morgen',
            last7Days: 'Letzte 7 Tage',
            thisMonth: 'Dieser Monat',
            lastMonth: 'Letzter Monat',
            nextMonth: 'Nächster Monat',
            thisWeek: 'Diese Woche',
            lastWeek: 'Letzte Woche',
            nextWeek: 'Nächste Woche',
            today: 'Heute',
        },
        ruleType: {
            highlightCell: 'Zelle hervorheben',
            dataBar: 'Datenbalken',
            colorScale: 'Farbskala',
            formula: 'Benutzerdefinierte Formel',
            iconSet: 'Symbolsatz',
            duplicateValues: 'Doppelte Werte',
            uniqueValues: 'Einzigartige Werte',
        },
        subRuleType: {
            uniqueValues: 'Einzigartige Werte',
            duplicateValues: 'Doppelte Werte',
            rank: 'Rang',
            text: 'Text',
            timePeriod: 'Zeitraum',
            number: 'Zahl',
            average: 'Mittelwert',
        },
        valueType: {
            num: 'Zahl',
            min: 'Minimum',
            max: 'Maximum',
            percent: 'Prozent',
            percentile: 'Perzentil',
            formula: 'Formel',
            none: 'Keine',
        },
        errorMessage: {
            notBlank: 'Bedingung darf nicht leer sein',
            formulaError: 'Falsche Formel',
            rangeError: 'Ungültige Auswahl',
        },
        permission: {
            dialog: {
                setStyleErr: 'Der Bereich ist geschützt und Sie haben keine Berechtigung, Stile festzulegen. Um Stile festzulegen, wenden Sie sich bitte an den Ersteller.',
            },
        },
    },
};

export default locale;
