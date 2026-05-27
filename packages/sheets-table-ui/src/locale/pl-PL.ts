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
        title: 'Tabela',
        selectRange: 'Zaznacz zakres tabeli',
        rename: 'Zmień nazwę tabeli',
        renamePlaceholder: 'Wprowadź nazwę tabeli',
        updateRange: 'Zaktualizuj zakres tabeli',
        tableRangeWithMergeError: 'Zakres tabeli nie może nakładać się na scalone komórki',
        tableRangeWithOtherTableError: 'Zakres tabeli nie może nakładać się na inne tabele',
        tableRangeSingleRowError: 'Zakres tabeli nie może być pojedynczym wierszem',
        updateError: 'Nie można ustawić zakresu tabeli na obszar, który nie nakłada się na pierwotny zakres i nie znajduje się w tym samym wierszu',
        tableStyle: 'Styl tabeli',
        defaultStyle: 'Styl domyślny',
        customStyle: 'Styl niestandardowy',
        customTooMore: 'Liczba motywów niestandardowych przekracza maksymalny limit. Usuń niektóre niepotrzebne motywy i dodaj je ponownie',
        setTheme: 'Ustaw motyw tabeli',
        removeTable: 'Usuń tabelę',
        cancel: 'Anuluj',
        confirm: 'Potwierdź',
        header: 'Nagłówek',
        footer: 'Stopka',
        firstLine: 'Pierwszy wiersz',
        secondLine: 'Drugi wiersz',
        columnPrefix: 'Kolumna',
        tablePrefix: 'Tabela',
        tableNameError: 'Nazwa tabeli nie może zawierać spacji, nie może zaczynać się od cyfry i nie może być identyczna z istniejącą nazwą tabeli',
        columnMenu: {
            'insert-left': 'Wstaw 1 kolumnę tabeli z lewej',
            'insert-right': 'Wstaw 1 kolumnę tabeli z prawej',
            delete: 'Usuń kolumnę tabeli',
        },

        sort: {
            'sort-asc': 'Rosnąco',
            'sort-desc': 'Malejąco',
        },

        insert: {
            main: 'Wstaw tabelę',
            row: 'Wstaw wiersz tabeli',
            col: 'Wstaw kolumnę tabeli',
        },

        remove: {
            main: 'Usuń tabelę',
            row: 'Usuń wiersz tabeli',
            col: 'Usuń kolumnę tabeli',
        },
        condition: {
            string: 'Tekst',
            number: 'Liczba',
            date: 'Data',

            empty: '(Puste)',
        },
        string: {
            compare: {
                equal: 'Równe',
                notEqual: 'Różne od',
                contains: 'Zawiera',
                notContains: 'Nie zawiera',
                startsWith: 'Zaczyna się od',
                endsWith: 'Kończy się na',
            },
        },
        number: {
            compare: {
                equal: 'Równe',
                notEqual: 'Różne od',
                greaterThan: 'Większe niż',
                greaterThanOrEqual: 'Większe niż lub równe',
                lessThan: 'Mniejsze niż',
                lessThanOrEqual: 'Mniejsze niż lub równe',
                between: 'Między',
                notBetween: 'Nie między',
                above: 'Powyżej',
                below: 'Poniżej',
                topN: 'Top {0}',
            },
        },
        date: {
            compare: {
                equal: 'Równe',
                notEqual: 'Różne od',
                after: 'Po',
                afterOrEqual: 'Po lub równe',
                before: 'Przed',
                beforeOrEqual: 'Przed lub równe',
                between: 'Między',
                notBetween: 'Nie między',
                today: 'Dzisiaj',
                yesterday: 'Wczoraj',
                tomorrow: 'Jutro',
                thisWeek: 'Ten tydzień',
                lastWeek: 'Poprzedni tydzień',
                nextWeek: 'Następny tydzień',
                thisMonth: 'Ten miesiąc',
                lastMonth: 'Poprzedni miesiąc',
                nextMonth: 'Następny miesiąc',
                thisQuarter: 'Ten kwartał',
                lastQuarter: 'Poprzedni kwartał',
                nextQuarter: 'Następny kwartał',
                thisYear: 'Ten rok',
                nextYear: 'Następny rok',
                lastYear: 'Poprzedni rok',
                quarter: 'Według kwartału',
                month: 'Według miesiąca',
                q1: 'Pierwszy kwartał',
                q2: 'Drugi kwartał',
                q3: 'Trzeci kwartał',
                q4: 'Czwarty kwartał',
                m1: 'Styczeń',
                m2: 'Luty',
                m3: 'Marzec',
                m4: 'Kwiecień',
                m5: 'Maj',
                m6: 'Czerwiec',
                m7: 'Lipiec',
                m8: 'Sierpień',
                m9: 'Wrzesień',
                m10: 'Październik',
                m11: 'Listopad',
                m12: 'Grudzień',
            },
        },
        filter: {
            'by-values': 'Według wartości',
            'by-conditions': 'Według warunków',
            'clear-filter': 'Wyczyść filtr',
            cancel: 'Anuluj',
            confirm: 'Potwierdź',
            'search-placeholder': 'Użyj spacji do rozdzielenia słów kluczowych',
            'select-all': 'Zaznacz wszystko',
        },
    },
};

export default locale;
