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
        title: 'Sprawdzanie poprawności danych',
        operators: {
            legal: 'jest prawidłowym typem',
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
            formulaError: 'Zakres odwołania zawiera niewidoczne dane. Dostosuj zakres.',
            listIntersects: 'Zaznaczony zakres nie może nakładać się na zakres reguł',
            primitive: 'Formuły nie są dozwolone dla niestandardowych wartości zaznaczonych i niezaznaczonych.',
        },
        panel: {
            title: 'Zarządzanie sprawdzaniem poprawności danych',
            addTitle: 'Utwórz nowe sprawdzanie poprawności danych',
            removeAll: 'Usuń wszystko',
            add: 'Dodaj regułę',
            range: 'Zakresy',
            type: 'Typ',
            options: 'Opcje zaawansowane',
            operator: 'Operator',
            removeRule: 'Usuń',
            done: 'Gotowe',
            formulaPlaceholder: 'Wprowadź wartość lub formułę',
            valuePlaceholder: 'Wprowadź wartość',
            formulaAnd: 'i',
            invalid: 'Nieprawidłowy',
            showWarning: 'Pokaż ostrzeżenie',
            rejectInput: 'Odrzuć wprowadzenie',
            messageInfo: 'Wiadomość pomocnicza',
            showInfo: 'Pokaż tekst pomocy dla zaznaczonej komórki',
            rangeError: 'Zakresy są nieprawidłowe',
            allowBlank: 'Zezwalaj na puste wartości',
        },
        any: {
            title: 'Dowolna wartość',
            error: 'Zawartość tej komórki narusza regułę sprawdzania poprawności',
        },
        date: {
            title: 'Data',
        },
        list: {
            title: 'Lista rozwijana',
            name: 'Wartość zawiera element z zakresu',
            error: 'Wprowadzona wartość musi należeć do określonego zakresu',
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
            title: 'Lista rozwijana – wielokrotny wybór',
            dropdown: 'Wybór wielokrotny',
        },
        textLength: {
            title: 'Długość tekstu',
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
        custom: {
            title: 'Niestandardowa formuła',
            error: 'Zawartość tej komórki narusza regułę sprawdzania poprawności',
            validFail: 'Wprowadź prawidłową formułę',
        },
        alert: {
            title: 'Błąd',
            ok: 'OK',
        },
        error: {
            title: 'Nieprawidłowe:',
        },
        renderMode: {
            arrow: 'Strzałka',
            chip: 'Znacznik',
            text: 'Zwykły tekst',
            label: 'Styl wyświetlania',
        },
        showTime: {
            label: 'Pokaż selektor czasu',
        },
        permission: {
            dialog: {
                setStyleErr: 'Zakres jest chroniony i nie masz uprawnień do ustawiania stylów. Aby ustawić style, skontaktuj się z twórcą.',
            },
        },
    },
};

export default locale;
