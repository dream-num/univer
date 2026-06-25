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
        toolbar: 'Znajdź i zamień',
        shortcut: {
            'open-find-dialog': 'Otwórz okno Znajdź',
            'open-replace-dialog': 'Otwórz okno Zamień',
            'close-dialog': 'Zamknij okno Znajdź i zamień',
            'go-to-next-match': 'Przejdź do następnego dopasowania',
            'go-to-previous-match': 'Przejdź do poprzedniego dopasowania',
            'focus-selection': 'Skup na zaznaczeniu',
            panel: 'Znajdź i zamień',
        },
        dialog: {
            title: 'Znajdź',
            find: 'Znajdź',
            replace: 'Zamień',
            'replace-all': 'Zamień wszystko',
            'case-sensitive': 'Rozróżniaj wielkość liter',
            'find-placeholder': 'Znajdź w tym arkuszu',
            'advanced-finding': 'Zaawansowane wyszukiwanie i zastępowanie',
            'replace-placeholder': 'Wprowadź ciąg zastępujący',
            'match-the-whole-cell': 'Dopasuj całą komórkę',
            'find-direction': {
                title: 'Kierunek wyszukiwania',
                row: 'Szukaj według wierszy',
                column: 'Szukaj według kolumn',
            },
            'find-scope': {
                title: 'Zakres wyszukiwania',
                'current-sheet': 'Bieżący arkusz',
                workbook: 'Skoroszyt',
            },
            'find-by': {
                title: 'Szukaj według',
                value: 'Szukaj według wartości',
                formula: 'Szukaj formuły',
            },
            'no-match': 'Wyszukiwanie zakończone, ale nie znaleziono dopasowania.',
            'no-result': 'Brak wyników',
        },
        replace: {
            'all-success': 'Zastąpiono wszystkie dopasowania: {0}',
            'partial-success': 'Zastąpiono dopasowania: {0}, nie udało się zastąpić: {1}',
            'all-failure': 'Zastępowanie nie powiodło się',
            confirm: {
                title: 'Czy na pewno chcesz zastąpić wszystkie dopasowania?',
            },
        },
        button: {
            confirm: 'OK',
            cancel: 'Anuluj',
        },
    },
};

export default locale;
