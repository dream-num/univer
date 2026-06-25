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
    'sheets-filter-ui': {
        toolbar: {
            'smart-toggle-filter-tooltip': 'Filter ein-/ausschalten',
            'clear-filter-criteria': 'Filterbedingungen löschen',
            're-calc-filter-conditions': 'Filterbedingungen neu berechnen',
        },
        shortcut: {
            'smart-toggle-filter': 'Filter ein-/ausschalten',
        },
        permission: {
            filterErr: 'Sie haben keine Berechtigung, den Filter zu verwenden.',
        },
        panel: {
            'clear-filter': 'Filter löschen',
            cancel: 'Abbrechen',
            confirm: 'Bestätigen',
            'by-values': 'Nach Werten',
            'by-colors': 'Nach Farben',
            'filter-by-cell-fill-color': 'Nach Zellenfüllfarbe filtern',
            'filter-by-cell-text-color': 'Nach Zellentextfarbe filtern',
            'filter-by-color-none': 'Die Spalte enthält nur eine Farbe',
            'by-conditions': 'Nach Bedingungen',
            'filter-only': 'Nur filtern',
            'search-placeholder': 'Verwenden Sie Leerzeichen, um Schlüsselwörter zu trennen',
            'select-all': 'Alle auswählen',
            'input-values-placeholder': 'Werte eingeben',
            and: 'UND',
            or: 'ODER',
            empty: '(leer)',
            '?': 'Verwenden Sie "?" für ein einzelnes Zeichen.',
            '*': 'Verwenden Sie "*" für mehrere Zeichen.',
        },
        conditions: {
            none: 'Keine',
            empty: 'Ist leer',
            'not-empty': 'Ist nicht leer',
            'text-contains': 'Text enthält',
            'does-not-contain': 'Text enthält nicht',
            'starts-with': 'Text beginnt mit',
            'ends-with': 'Text endet mit',
            equals: 'Text ist gleich',
            'greater-than': 'Größer als',
            'greater-than-or-equal': 'Größer als oder gleich',
            'less-than': 'Kleiner als',
            'less-than-or-equal': 'Kleiner als oder gleich',
            equal: 'Gleich',
            'not-equal': 'Ungleich',
            between: 'Zwischen',
            'not-between': 'Nicht zwischen',
            custom: 'Benutzerdefiniert',
        },
        date: {
            1: 'Januar',
            2: 'Februar',
            3: 'März',
            4: 'April',
            5: 'Mai',
            6: 'Juni',
            7: 'Juli',
            8: 'August',
            9: 'September',
            10: 'Oktober',
            11: 'November',
            12: 'Dezember',
        },
        sync: {
            title: 'Filter ist für alle sichtbar',
            statusTips: {
                on: 'Wenn eingeschaltet, sehen alle Bearbeiter die Filterergebnisse',
                off: 'Wenn ausgeschaltet, sehen nur Sie die Filterergebnisse',
            },
            switchTips: {
                on: '"Filter ist für alle sichtbar" ist eingeschaltet, alle Bearbeiter sehen die Filterergebnisse',
                off: '"Filter ist für alle sichtbar" ist ausgeschaltet, nur Sie sehen die Filterergebnisse',
            },
        },
    },
};

export default locale;
