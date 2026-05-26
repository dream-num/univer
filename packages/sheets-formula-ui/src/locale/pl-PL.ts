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
    'sheets-formula-ui': {
        shortcut: {
            'quick-sum': 'Szybka suma',
        },

        insert: {
            tooltip: 'Funkcje',
            common: 'Często używane funkcje',
        },
        prompt: {
            helpExample: 'PRZYKŁAD',
            helpAbstract: 'OPIS',
            required: 'Wymagane.',
            optional: 'Opcjonalne.',
        },
        error: {
            title: 'Błąd',
            divByZero: 'Błąd dzielenia przez zero',
            name: 'Błąd nieprawidłowej nazwy',
            value: 'Błąd wartości',
            num: 'Błąd liczby',
            na: 'Wartość niedostępna',
            cycle: 'Błąd odwołania cyklicznego',
            ref: 'Błąd nieprawidłowego odwołania do komórki',
            spill: 'Zakres rozlewania nie jest pusty',
            calc: 'Błąd obliczenia',
            error: 'Błąd',
            connect: 'Pobieranie danych',
            null: 'Błąd pusty',
        },

        functionType: {
            financial: 'Finansowe',
            date: 'Data i czas',
            math: 'Matematyczne i trygonometryczne',
            statistical: 'Statystyczne',
            lookup: 'Wyszukiwanie i odwołania',
            database: 'Bazy danych',
            text: 'Tekstowe',
            logical: 'Logiczne',
            information: 'Informacyjne',
            engineering: 'Inżynierskie',
            cube: 'Wielowymiarowe',
            compatibility: 'Zgodność',
            web: 'Sieć Web',
            array: 'Tablicowe',
            univer: 'Univer',
            user: 'Zdefiniowane przez użytkownika',
            definedname: 'Nazwa zdefiniowana',
        },
        moreFunctions: {
            confirm: 'Potwierdź',
            prev: 'Poprzednie',
            next: 'Następne',
            searchFunctionPlaceholder: 'Wyszukaj funkcję',
            allFunctions: 'Wszystkie funkcje',
            syntax: 'SKŁADNIA',
        },
        operation: {
            copyFormulaOnly: 'Kopiuj tylko formułę',
            pasteFormula: 'Wklej formułę',
        },

        rangeSelector: {
            title: 'Wybierz zakres danych',
            addAnotherRange: 'Dodaj zakres',
            buttonTooltip: 'Wybierz zakres danych',
            placeHolder: 'Wybierz zakres lub wpisz.',
            confirm: 'Potwierdź',
            cancel: 'Anuluj',
        },
    },
};

export default locale;
