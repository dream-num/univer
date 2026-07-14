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
    'data-validation': {
        operators: {
            between: 'między',
            greaterThan: 'większe niż',
            greaterThanOrEqual: 'większe lub równe',
            lessThan: 'mniejsze niż',
            lessThanOrEqual: 'mniejsze lub równe',
            equal: 'równe',
            notEqual: 'różne od',
            notBetween: 'nie między',
            legal: 'jest prawidłowym typem',
        },
        ruleName: {
            between: 'Jest między {FORMULA1} a {FORMULA2}',
            greaterThan: 'Jest większe niż {FORMULA1}',
            greaterThanOrEqual: 'Jest większe lub równe {FORMULA1}',
            lessThan: 'Jest mniejsze niż {FORMULA1}',
            lessThanOrEqual: 'Jest mniejsze lub równe {FORMULA1}',
            equal: 'Jest równe {FORMULA1}',
            notEqual: 'Jest różne od {FORMULA1}',
            notBetween: 'Nie jest między {FORMULA1} a {FORMULA2}',
            legal: 'Jest prawidłowym {TYPE}',
        },
        errorMsg: {
            between: 'Wartość musi być między {FORMULA1} a {FORMULA2}',
            greaterThan: 'Wartość musi być większa niż {FORMULA1}',
            greaterThanOrEqual: 'Wartość musi być większa lub równa {FORMULA1}',
            lessThan: 'Wartość musi być mniejsza niż {FORMULA1}',
            lessThanOrEqual: 'Wartość musi być mniejsza lub równa {FORMULA1}',
            equal: 'Wartość musi być równa {FORMULA1}',
            notEqual: 'Wartość musi być różna od {FORMULA1}',
            notBetween: 'Wartość nie może być między {FORMULA1} a {FORMULA2}',
            legal: 'Wartość musi być prawidłowym {TYPE}',
        },
        date: {
            operators: {
                between: 'między',
                greaterThan: 'po',
                greaterThanOrEqual: 'w dniu lub po',
                lessThan: 'przed',
                lessThanOrEqual: 'w dniu lub przed',
                equal: 'równe',
                notEqual: 'różne od',
                notBetween: 'nie między',
                legal: 'jest prawidłową datą',
            },
            ruleName: {
                between: 'jest między {FORMULA1} a {FORMULA2}',
                greaterThan: 'jest po {FORMULA1}',
                greaterThanOrEqual: 'jest w dniu {FORMULA1} lub po',
                lessThan: 'jest przed {FORMULA1}',
                lessThanOrEqual: 'jest w dniu {FORMULA1} lub przed',
                equal: 'jest {FORMULA1}',
                notEqual: 'nie jest {FORMULA1}',
                notBetween: 'nie jest między {FORMULA1} a {FORMULA2}',
                legal: 'jest prawidłową datą',
            },
            errorMsg: {
                between: 'Wartość musi być prawidłową datą i między {FORMULA1} a {FORMULA2}',
                greaterThan: 'Wartość musi być prawidłową datą i po {FORMULA1}',
                greaterThanOrEqual: 'Wartość musi być prawidłową datą i w dniu {FORMULA1} lub po',
                lessThan: 'Wartość musi być prawidłową datą i przed {FORMULA1}',
                lessThanOrEqual: 'Wartość musi być prawidłową datą i w dniu {FORMULA1} lub przed',
                equal: 'Wartość musi być prawidłową datą i {FORMULA1}',
                notEqual: 'Wartość musi być prawidłową datą i nie być {FORMULA1}',
                notBetween: 'Wartość musi być prawidłową datą i nie być między {FORMULA1} a {FORMULA2}',
                legal: 'Wartość musi być prawidłową datą',
            },
            title: 'Data',
        },
        textLength: {
            errorMsg: {
                between: 'Długość tekstu musi być między {FORMULA1} a {FORMULA2}',
                greaterThan: 'Długość tekstu musi być większa niż {FORMULA1}',
                greaterThanOrEqual: 'Długość tekstu musi być większa lub równa {FORMULA1}',
                lessThan: 'Długość tekstu musi być mniejsza niż {FORMULA1}',
                lessThanOrEqual: 'Długość tekstu musi być mniejsza lub równa {FORMULA1}',
                equal: 'Długość tekstu musi być równa {FORMULA1}',
                notEqual: 'Długość tekstu musi być różna od {FORMULA1}',
                notBetween: 'Długość tekstu nie może być między {FORMULA1} a {FORMULA2}',
            },
            title: 'Długość tekstu',
        },
        custom: {
            ruleName: 'Formuła niestandardowa to {FORMULA1}',
            title: 'Formuła niestandardowa',
            validFail: 'Wprowadź prawidłową formułę',
            error: 'Zawartość tej komórki narusza regułę sprawdzania poprawności',
        },
        validFail: {
            value: 'Wprowadź wartość',
            common: 'Wprowadź wartość lub formułę',
            number: 'Wprowadź liczbę lub formułę',
            formula: 'Wprowadź formułę',
            integer: 'Wprowadź liczbę całkowitą lub formułę',
            date: 'Wprowadź datę lub formułę',
            list: 'Wprowadź opcje',
            listInvalid: 'Źródło listy musi być rozdzieloną listą lub odwołaniem do pojedynczego wiersza lub kolumny',
            checkboxEqual: 'Wprowadź różne wartości dla zaznaczonej i niezaznaczonej zawartości komórki.',
            formulaError: 'Zakres odwołania zawiera niewidoczne dane, dostosuj zakres',
            listIntersects: 'Wybrany zakres nie może przecinać się z zakresem reguł',
            primitive: 'Formuły nie są dozwolone dla niestandardowych wartości zaznaczonych i niezaznaczonych.',
        },
        any: {
            title: 'Dowolna wartość',
            error: 'Zawartość tej komórki narusza regułę sprawdzania poprawności',
        },
        list: {
            title: 'Lista rozwijana',
            name: 'Wartość zawiera element z zakresu',
            error: 'Wartość musi należeć do określonego zakresu',
            emptyError: 'Wprowadź wartość',
            add: 'Dodaj',
            dropdown: 'Wybierz',
            options: 'Opcje',
            customOptions: 'Niestandardowe',
            refOptions: 'Z zakresu',
            formulaError: 'Źródło listy musi być rozdzieloną listą danych lub odwołaniem do pojedynczego wiersza lub kolumny.',
            edit: 'Edytuj',
        },
        listMultiple: {
            title: 'Lista rozwijana — wielokrotny wybór',
            dropdown: 'Wielokrotny wybór',
        },
        decimal: {
            title: 'Liczba',
        },
        whole: {
            title: 'Liczba całkowita',
        },
        checkbox: {
            title: 'Pole wyboru',
            error: 'Zawartość tej komórki narusza regułę sprawdzania poprawności',
            tips: 'Użyj niestandardowych wartości w komórkach',
            checked: 'Wartość zaznaczona',
            unchecked: 'Wartość niezaznaczona',
        },
    },
};

export default locale;
