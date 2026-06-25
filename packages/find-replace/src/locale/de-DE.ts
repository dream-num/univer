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
    'find-replace': {
        toolbar: 'Suchen & Ersetzen',
        shortcut: {
            'open-find-dialog': 'Suchdialog öffnen',
            'open-replace-dialog': 'Ersetzungsdialog öffnen',
            'close-dialog': 'Suchen & Ersetzen-Dialog schließen',
            'go-to-next-match': 'Zum nächsten Treffer springen',
            'go-to-previous-match': 'Zum vorherigen Treffer springen',
            'focus-selection': 'Auswahl fokussieren',
            panel: 'Suchen & Ersetzen',
        },
        dialog: {
            title: 'Suchen',
            find: 'Suchen',
            replace: 'Ersetzen',
            'replace-all': 'Alle ersetzen',
            'case-sensitive': 'Groß-/Kleinschreibung beachten',
            'find-placeholder': 'In diesem Blatt suchen',
            'advanced-finding': 'Erweitertes Suchen & Ersetzen',
            'replace-placeholder': 'Ersetzungstext eingeben',
            'match-the-whole-cell': 'Ganze Zelle vergleichen',
            'find-direction': {
                title: 'Suchrichtung',
                row: 'Nach Zeile suchen',
                column: 'Nach Spalte suchen',
            },
            'find-scope': {
                title: 'Suchbereich',
                'current-sheet': 'Aktuelles Blatt',
                workbook: 'Arbeitsmappe',
            },
            'find-by': {
                title: 'Suchen nach',
                value: 'Nach Wert suchen',
                formula: 'Formel suchen',
            },
            'no-match': 'Suche abgeschlossen, aber kein Treffer gefunden.',
            'no-result': 'Kein Ergebnis',
        },
        replace: {
            'all-success': 'Alle {0} Treffer ersetzt',
            'partial-success': '{0} Treffer ersetzt, {1} konnten nicht ersetzt werden',
            'all-failure': 'Ersetzen fehlgeschlagen',
            confirm: {
                title: 'Sollen alle Treffer ersetzt werden?',
            },
        },
        button: {
            confirm: 'OK',
            cancel: 'Abbrechen',
        },
    },
};

export default locale;
