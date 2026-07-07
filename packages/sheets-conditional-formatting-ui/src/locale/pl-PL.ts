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
        title: 'Formatowanie warunkowe',
        menu: {
            manageConditionalFormatting: 'Zarządzaj formatowaniem warunkowym',
            createConditionalFormatting: 'Utwórz formatowanie warunkowe',
            clearRangeRules: 'Wyczyść reguły dla zaznaczonego zakresu',
            clearWorkSheetRules: 'Wyczyść reguły dla całego arkusza',

        },
        form: {
            lessThan: 'Wartość musi być mniejsza niż {0}',
            lessThanOrEqual: 'Wartość musi być mniejsza niż lub równa {0}',
            greaterThan: 'Wartość musi być większa niż {0}',
            greaterThanOrEqual: 'Wartość musi być większa niż lub równa {0}',
            rangeSelector: 'Zaznacz zakres lub wprowadź wartość',
        },
        iconSet: {
            direction: 'Kierunek',
            shape: 'Kształt',
            mark: 'Znak',
            rank: 'Ranga',
            rule: 'Reguła',
            icon: 'Ikona',
            type: 'Typ',
            value: 'Wartość',
            reverseIconOrder: 'Odwróć kolejność ikon',
            and: 'I',
            when: 'Gdy',
            onlyShowIcon: 'Pokaż tylko ikonę',
            noCellIcon: 'Brak ikony komórki',
        },
        symbol: {
            greaterThan: '>',
            greaterThanOrEqual: '>=',
            lessThan: '<',
            lessThanOrEqual: '<=',
        },
        panel: {
            createRule: 'Utwórz regułę',
            clear: 'Wyczyść wszystkie reguły',
            range: 'Zakres zastosowania',
            styleType: 'Typ stylu',
            submit: 'Zastosuj',
            cancel: 'Anuluj',
            rankAndAverage: 'Góra/Dół/Średnia',
            styleRule: 'Reguła stylu',
            isNotBottom: 'Góra',
            isBottom: 'Dół',
            greaterThanAverage: 'Większe niż średnia',
            lessThanAverage: 'Mniejsze niż średnia',
            medianValue: 'Mediana',
            fillType: 'Typ wypełnienia',
            pureColor: 'Kolor jednolity',
            gradient: 'Gradient',
            colorSet: 'Zestaw kolorów',
            positive: 'Dodatnie',
            native: 'Ujemne',
            workSheet: 'Cały arkusz',
            selectedRange: 'Zaznaczony zakres',
            managerRuleSelect: 'Zarządzaj regułami: {0}',
            onlyShowDataBar: 'Pokaż tylko paski danych',
        },
        preview: {
            describe: {
                beginsWith: 'Zaczyna się od {0}',
                endsWith: 'Kończy się na {0}',
                containsText: 'Tekst zawiera {0}',
                notContainsText: 'Tekst nie zawiera {0}',
                equal: 'Równe {0}',
                notEqual: 'Różne od {0}',
                containsBlanks: 'Zawiera puste',
                notContainsBlanks: 'Nie zawiera pustych',
                containsErrors: 'Zawiera błędy',
                notContainsErrors: 'Nie zawiera błędów',
                greaterThan: 'Większe niż {0}',
                greaterThanOrEqual: 'Większe niż lub równe {0}',
                lessThan: 'Mniejsze niż {0}',
                lessThanOrEqual: 'Mniejsze niż lub równe {0}',
                notBetween: 'Nie między {0} a {1}',
                between: 'Między {0} a {1}',
                yesterday: 'Wczoraj',
                tomorrow: 'Jutro',
                last7Days: 'Ostatnie 7 dni',
                thisMonth: 'Ten miesiąc',
                lastMonth: 'Poprzedni miesiąc',
                nextMonth: 'Następny miesiąc',
                thisWeek: 'Ten tydzień',
                lastWeek: 'Poprzedni tydzień',
                nextWeek: 'Następny tydzień',
                today: 'Dzisiaj',
                topN: 'Top {0}',
                bottomN: 'Ostatnie {0}',
                topNPercent: 'Top {0}%',
                bottomNPercent: 'Ostatnie {0}%',
            },
        },
        operator: {
            beginsWith: 'Zaczyna się od',
            endsWith: 'Kończy się na',
            containsText: 'Tekst zawiera',
            notContainsText: 'Tekst nie zawiera',
            equal: 'Równe',
            notEqual: 'Różne od',
            containsBlanks: 'Zawiera puste',
            notContainsBlanks: 'Nie zawiera pustych',
            containsErrors: 'Zawiera błędy',
            notContainsErrors: 'Nie zawiera błędów',
            greaterThan: 'Większe niż',
            greaterThanOrEqual: 'Większe niż lub równe',
            lessThan: 'Mniejsze niż',
            lessThanOrEqual: 'Mniejsze niż lub równe',
            notBetween: 'Nie między',
            between: 'Między',
            yesterday: 'Wczoraj',
            tomorrow: 'Jutro',
            last7Days: 'Ostatnie 7 dni',
            thisMonth: 'Ten miesiąc',
            lastMonth: 'Poprzedni miesiąc',
            nextMonth: 'Następny miesiąc',
            thisWeek: 'Ten tydzień',
            lastWeek: 'Poprzedni tydzień',
            nextWeek: 'Następny tydzień',
            today: 'Dzisiaj',
        },
        ruleType: {
            highlightCell: 'Wyróżnij komórkę',
            dataBar: 'Pasek danych',
            colorScale: 'Skala kolorów',
            formula: 'Niestandardowa formuła',
            iconSet: 'Zestaw ikon',
            duplicateValues: 'Zduplikowane wartości',
            uniqueValues: 'Unikalne wartości',
        },
        subRuleType: {
            uniqueValues: 'Unikalne wartości',
            duplicateValues: 'Zduplikowane wartości',
            rank: 'Ranga',
            text: 'Tekst',
            timePeriod: 'Okres',
            number: 'Liczba',
            average: 'Średnia',
        },
        valueType: {
            num: 'Liczba',
            min: 'Minimum',
            max: 'Maksimum',
            percent: 'Procent',
            percentile: 'Percentyl',
            formula: 'Formuła',
            none: 'Brak',
        },
        errorMessage: {
            notBlank: 'Warunek nie może być pusty',
            formulaError: 'Błędna formuła',
            rangeError: 'Nieprawidłowy wybór',
        },
        permission: {
            dialog: {
                setStyleErr: 'Zakres jest chroniony i nie masz uprawnień do ustawiania stylów. Aby ustawić style, skontaktuj się z twórcą.',
            },
        },
    },
};

export default locale;
