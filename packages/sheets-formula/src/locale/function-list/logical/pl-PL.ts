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
    AND: {
        description: 'Funkcja ORAZ zwraca wartość PRAWDA, jeśli wszystkie jej argumenty mają wartość PRAWDA, lub FAŁSZ, jeśli choć jeden z jej argumentów ma wartość FAŁSZ.',
        abstract: 'Funkcja ORAZ zwraca wartość PRAWDA, jeśli wszystkie jej argumenty mają wartość PRAWDA, lub FAŁSZ, jeśli choć jeden z jej argumentów ma wartość FAŁSZ.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/and-function',
            },
        ],
        functionParameter: {
            logical1: { name: 'logical1', detail: 'Pierwszy warunek, który chcesz przetestować i który może przyjąć wartość TRUE lub FALSE.' },
            logical2: { name: 'logical2', detail: 'Dodatkowe warunki, które chcesz przetestować i które mogą przyjąć wartość TRUE lub FALSE, maksymalnie 255 warunków.' },
        },
    },
    BYCOL: {
        description: 'Stosuje funkcję LAMBDA do każdej kolumny i zwraca tablicę wyników. Jeśli na przykład oryginalna tablica składa się z 3 kolumn na 2 wiersze, zwrócona tablica będzie składać się z 3 kolumn na 1 wiersz.',
        abstract: 'Stosuje funkcję LAMBDA do każdej kolumny i zwraca tablicę wyników. Jeśli na przykład oryginalna tablica składa się z 3 kolumn na 2 wiersze, zwrócona tablica będzie składać się z 3 kolumn na 1 wiersz.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/bycol-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Tablica, która ma zostać podzielona według kolumn.' },
            lambda: { name: 'lambda', detail: 'Funkcja LAMBDA przyjmująca kolumnę jako pojedynczy parametr i obliczająca jeden wynik. LAMBDA przyjmuje jeden parametr: kolumnę z array.' },
        },
    },
    BYROW: {
        description: 'Stosuje funkcję LAMBDA do każdego wiersza i zwraca tablicę wyników. Jeśli na przykład oryginalna tablica składa się z 3 kolumn na 2 wiersze, zwrócona tablica to 1 kolumna na 2 wiersze.',
        abstract: 'Stosuje funkcję LAMBDA do każdego wiersza i zwraca tablicę wyników. Jeśli na przykład oryginalna tablica składa się z 3 kolumn na 2 wiersze, zwrócona tablica to 1 kolumna na 2 wiersze.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/byrow-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Tablica, która ma zostać podzielona według wierszy.' },
            lambda: { name: 'lambda', detail: 'Funkcja LAMBDA przyjmująca wiersz jako pojedynczy parametr i obliczająca jeden wynik. LAMBDA przyjmuje jeden parametr: wiersz z array.' },
        },
    },
    FALSE: {
        description: 'Zwraca wartość logiczną FAŁSZ.',
        abstract: 'Zwraca wartość logiczną FAŁSZ.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/false-function',
            },
        ],
        functionParameter: {
        },
    },
    IF: {
        description: 'Na przykład działanie formuły =JEŻELI(C2="Tak";1;2) jest następujące: JEŻELI(C2 = Tak, to zwróć wartość 1, a w przeciwnym razie zwróć wartość 2).',
        abstract: 'Na przykład działanie formuły =JEŻELI(C2="Tak";1;2) jest następujące: JEŻELI(C2 = Tak, to zwróć wartość 1, a w przeciwnym razie zwróć wartość 2).',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/if-function',
            },
        ],
        functionParameter: {
            logicalTest: { name: 'logical_test', detail: 'Warunek, który ma zostać sprawdzony.' },
            valueIfTrue: { name: 'value_if_true', detail: 'Wartość, która ma zostać zwrócona, jeśli wynik logical_test ma wartość PRAWDA.' },
            valueIfFalse: { name: 'value_if_false', detail: 'Wartość, która ma zostać zwrócona, jeśli wynik logical_test ma wartość FAŁSZ.' },
        },
    },
    IFERROR: {
        description: 'Za pomocą funkcji JEŻELI.BŁĄD można obsługiwać błędy w formule. Funkcja JEŻELI.BŁĄD zwraca określoną wartość, jeśli wynikiem formuły jest błąd. W przeciwnym razie zwraca wynik formuły.',
        abstract: 'Za pomocą funkcji JEŻELI.BŁĄD można obsługiwać błędy w formule. Funkcja JEŻELI.BŁĄD zwraca określoną wartość, jeśli wynikiem formuły jest błąd. W przeciwnym razie zwraca wynik formuły.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/iferror-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Wymagane. Argument sprawdzany w poszukiwaniu błędu.' },
            valueIfError: { name: 'value_if_error', detail: 'Wymagane. Wartość, która ma zostać zwrócona, jeśli wynikiem formuły jest błąd. Obliczane są następujące typy błędów: #N/A, #VALUE!, #REF!, #DIV/0!, #NUM!, #NAME?, lub #NULL!.' },
        },
    },
    IFNA: {
        description: 'Funkcja JEŻELI.ND zwraca określoną wartość, jeśli formuła zwraca wartość błędu #N/D! w przeciwnym razie zwraca wynik formuły.',
        abstract: 'Funkcja JEŻELI.ND zwraca określoną wartość, jeśli formuła zwraca wartość błędu #N/D! w przeciwnym razie zwraca wynik formuły.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/ifna-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Argument sprawdzany pod kątem wartości błędu #N/D.' },
            valueIfNa: { name: 'value_if_na', detail: 'Wartość zwracana, jeśli wynikiem formuły jest wartość błędu #N/D.' },
        },
    },
    IFS: {
        description: 'Funkcja WARUNKI sprawdza, czy spełniony jest co najmniej jeden warunek, i zwraca wartość odpowiadającą pierwszemu warunkowi TYPU PRAWDA. Funkcja WARUNKI może zastąpić wiele zagnieżdżonych instrukcji JEŻELI i jest znacznie łatwiejsza do odczytu w przypadku wielu warunków.',
        abstract: 'Funkcja WARUNKI sprawdza, czy spełniony jest co najmniej jeden warunek, i zwraca wartość odpowiadającą pierwszemu warunkowi TYPU PRAWDA. Funkcja WARUNKI może zastąpić wiele zagnieżdżonych instrukcji JEŻELI i jest znacznie łatwiejsza do odczytu w przypadku wielu warunków.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/ifs-function',
            },
        ],
        functionParameter: {
            logicalTest1: { name: 'logical_test1', detail: 'Warunek, który zwraca TRUE lub FALSE.' },
            valueIfTrue1: { name: 'value_if_true1', detail: 'Wynik zwracany, jeśli logical_test1 zwraca TRUE. Może być pusty.' },
            logicalTest2: { name: 'logical_test2', detail: 'Warunek, który zwraca TRUE lub FALSE.' },
            valueIfTrue2: { name: 'value_if_true2', detail: 'Wynik zwracany, jeśli logical_testN zwraca TRUE. Każdy value_if_trueN odpowiada warunkowi logical_testN. Może być pusty.' },
        },
    },
    LAMBDA: {
        description: 'Możesz utworzyć funkcję dla często używanej formuły, wyeliminować konieczność jej kopiowania i wklejania (co zwiększa ryzyko błędu), a także dodawać własne funkcje do biblioteki natywnych funkcji programu Excel. Ponadto funkcja LAMBDA nie wymaga języka VBA, makr ani języka JavaScript, więc mogą również korzystać z niej niebędący programistami.',
        abstract: 'Możesz utworzyć funkcję dla często używanej formuły, wyeliminować konieczność jej kopiowania i wklejania (co zwiększa ryzyko błędu), a także dodawać własne funkcje do biblioteki natywnych funkcji programu Excel. Ponadto funkcja LAMBDA nie wymaga języka VBA, makr ani języka JavaScript, więc mogą również korzystać z niej niebędący programistami.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/lambda-function',
            },
        ],
        functionParameter: {
            parameter: { name: 'parameter', detail: 'Wartość, która ma zostać przekazana do funkcji, na przykład odwołanie do komórki, ciąg lub liczba. Możesz wprowadzić maksymalnie 253 parametry. Ten argument jest opcjonalny.' },
            calculation: { name: 'calculation', detail: 'Formuła, która ma zostać wykonywana i zwrócona jako wynik funkcji. Musi to być ostatni argument i musi zwracać wynik. Jest to argument wymagany.' },
        },
    },
    LET: {
        description: 'Funkcja LET przypisuje nazwy do wyników obliczeń. Dzięki temu w formule przechowywane są pośrednie obliczenia, wartości i nazwy definiujące. Te nazwy mają zastosowanie tylko w zakresie LET funkcji. Podobnie jak zmienne w programowaniu są LET realizowane za pomocą natywnej składni formuły programu Excel.',
        abstract: 'Funkcja LET przypisuje nazwy do wyników obliczeń. Dzięki temu w formule przechowywane są pośrednie obliczenia, wartości i nazwy definiujące. Te nazwy mają zastosowanie tylko w zakresie LET funkcji. Podobnie jak zmienne w programowaniu są LET realizowane za pomocą natywnej składni formuły programu Excel.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/let-function',
            },
        ],
        functionParameter: {
            name1: { name: 'name1', detail: 'Pierwsza nazwa do przypisania. Musi zaczynać się od litery. Nie może być wynikiem formuły ani kolidować ze składnią zakresu.' },
            nameValue1: { name: 'name_value1', detail: 'Wartość przypisana do name1.' },
            calculationOrName2: { name: 'calculation_or_name2', detail: 'Jedno z następujących:\n1. Obliczenie używające wszystkich nazw w funkcji LET. Musi być ostatnim argumentem funkcji LET.\n2. Druga nazwa, do której przypisuje się drugą wartość name_value. Jeśli zostanie podana nazwa, argumenty name_value2 i calculation_or_name3 stają się wymagane.' },
            nameValue2: { name: 'name_value2', detail: 'Wartość przypisana do calculation_or_name2.' },
            calculationOrName3: { name: 'calculation_or_name3', detail: 'Jedno z następujących:\n1. Obliczenie używające wszystkich nazw w funkcji LET. Ostatni argument funkcji LET musi być obliczeniem.\n2. Trzecia nazwa, do której przypisuje się trzecią wartość name_value. Jeśli zostanie podana nazwa, argumenty name_value3 i calculation_or_name4 stają się wymagane.' },
        },
    },
    MAKEARRAY: {
        description: 'Zwraca obliczoną tablicę o określonym rozmiarze wiersza i kolumny, stosując funkcję LAMBDA .',
        abstract: 'Zwraca obliczoną tablicę o określonym rozmiarze wiersza i kolumny, stosując funkcję LAMBDA .',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/makearray-function',
            },
        ],
        functionParameter: {
            number1: { name: 'rows', detail: 'Liczba wierszy w tablicy. Musi być większa od zera.' },
            number2: { name: 'cols', detail: 'Liczba kolumn w tablicy. Musi być większa od zera.' },
            value3: { name: 'lambda', detail: 'Funkcja LAMBDA wywoływana w celu utworzenia tablicy. LAMBDA przyjmuje dwa parametry: row (indeks wiersza tablicy) oraz col (indeks kolumny tablicy).' },
        },
    },
    MAP: {
        description: 'Zwraca tablicę utworzoną przez mapowanie każdej wartości w tablicach na nową wartość przez zastosowanie funkcji LAMBDA w celu utworzenia nowej wartości.',
        abstract: 'Zwraca tablicę utworzoną przez mapowanie każdej wartości w tablicach na nową wartość przez zastosowanie funkcji LAMBDA w celu utworzenia nowej wartości.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/map-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Tablica array1 do mapowania.' },
            array2: { name: 'array2', detail: 'Tablica array2 do mapowania.' },
            lambda: { name: 'lambda', detail: 'Funkcja LAMBDA, która musi być ostatnim argumentem i musi mieć parametr dla każdej przekazanej tablicy.' },
        },
    },
    NOT: {
        description: 'Funkcja NIE odwraca wartość swojego argumentu.',
        abstract: 'Funkcja NIE odwraca wartość swojego argumentu.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/not-function',
            },
        ],
        functionParameter: {
            logical: { name: 'logical', detail: 'Warunek, którego logikę chcesz odwrócić i który może przyjąć wartość TRUE lub FALSE.' },
        },
    },
    OR: {
        description: 'Funkcja LUB zwraca wartość PRAWDA, jeśli dowolny z jej argumentów ma wartość PRAWDA, lub FAŁSZ, jeśli wszystkie z jej argumentów mają wartość FAŁSZ.',
        abstract: 'Funkcja LUB zwraca wartość PRAWDA, jeśli dowolny z jej argumentów ma wartość PRAWDA, lub FAŁSZ, jeśli wszystkie z jej argumentów mają wartość FAŁSZ.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/or-function',
            },
        ],
        functionParameter: {
            logical1: { name: 'logical1', detail: 'Pierwszy warunek, który chcesz przetestować i który może przyjąć wartość TRUE lub FALSE.' },
            logical2: { name: 'logical2', detail: 'Dodatkowe warunki, które chcesz przetestować i które mogą przyjąć wartość TRUE lub FALSE, maksymalnie 255 warunków.' },
        },
    },
    REDUCE: {
        description: 'Zmniejsza tablicę do wartości skumulowanej, stosując funkcję LAMBDA do każdej wartości i zwracając całkowitą wartość w akumulatorze.',
        abstract: 'Zmniejsza tablicę do wartości skumulowanej, stosując funkcję LAMBDA do każdej wartości i zwracając całkowitą wartość w akumulatorze.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/reduce-function',
            },
        ],
        functionParameter: {
            initialValue: { name: 'initial_value', detail: 'Ustawia wartość początkową akumulatora.' },
            array: { name: 'array', detail: 'Tablica, która ma zostać zmniejszona.' },
            lambda: { name: 'lambda', detail: 'Funkcja LAMBDA wywoływana w celu zmniejszenia tablicy. Funkcja LAMBDA przyjmuje trzy parametry: Akumulator Wartość zsumowana i zwrócona jako wynik końcowy. Wartość Bieżąca wartość z tablicy. Ciała Obliczenie zastosowane do każdego elementu w tablicy.' },
        },
    },
    SCAN: {
        description: 'Skanuje tablicę, stosując funkcję LAMBDA do każdej wartości i zwraca tablicę, która ma każdą wartość pośrednią.',
        abstract: 'Skanuje tablicę, stosując funkcję LAMBDA do każdej wartości i zwraca tablicę, która ma każdą wartość pośrednią.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/scan-function',
            },
        ],
        functionParameter: {
            initialValue: { name: 'initial_value', detail: 'Ustawia wartość początkową akumulatora.' },
            array: { name: 'array', detail: 'Tablica do skanowania.' },
            lambda: { name: 'lambda', detail: 'Funkcja LAMBDA wywoływana do skanowania tablicy. LAMBDA przyjmuje trzy parametry: 1. zsumowaną wartość zwracaną jako wynik końcowy, 2. bieżącą wartość z tablicy oraz 3. obliczenie zastosowane do każdego elementu tablicy.' },
        },
    },
    SWITCH: {
        description: 'Funkcja PRZEŁĄCZ ocenia jedną wartość (nazywaną wyrażeniem ), korzystając z listy wartości, i zwraca wynik odpowiadający pierwszej zgodnej wartości. W przypadku braku dopasowania może zostać zwrócona opcjonalna wartość domyślna.',
        abstract: 'Funkcja PRZEŁĄCZ ocenia jedną wartość (nazywaną wyrażeniem ), korzystając z listy wartości, i zwraca wynik odpowiadający pierwszej zgodnej wartości. W przypadku braku dopasowania może zostać zwrócona opcjonalna wartość domyślna.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/switch-function',
            },
        ],
        functionParameter: {
            expression: { name: 'expression', detail: 'Expression to wartość (np. liczba, data lub tekst), która będzie porównywana z value1…value126.' },
            value1: { name: 'value1', detail: 'ValueN to wartość porównywana z expression.' },
            result1: { name: 'result1', detail: 'ResultN to wartość zwracana, gdy odpowiedni argument valueN pasuje do expression. Dla każdego odpowiedniego argumentu valueN należy podać ResultN.' },
            defaultOrValue2: { name: 'default_or_value2', detail: 'Default to wartość zwracana, gdy w wyrażeniach valueN nie zostanie znalezione dopasowanie. Argument Default jest rozpoznawany po braku odpowiadającego mu wyrażenia resultN. Default musi być ostatnim argumentem funkcji.' },
            result2: { name: 'result2', detail: 'ResultN to wartość zwracana, gdy odpowiedni argument valueN pasuje do expression. Dla każdego odpowiedniego argumentu valueN należy podać ResultN.' },
        },
    },
    TRUE: {
        description: 'Zwraca wartość logiczną PRAWDA. Tej funkcji można używać, gdy chcesz zwrócić wartość PRAWDA na podstawie warunku. Na przykład:',
        abstract: 'Zwraca wartość logiczną PRAWDA. Tej funkcji można używać, gdy chcesz zwrócić wartość PRAWDA na podstawie warunku. Na przykład:',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/true-function',
            },
        ],
        functionParameter: {
        },
    },
    XOR: {
        description: 'Funkcja XOR zwraca wartość logiczną wykluczania lub wszystkich argumentów.',
        abstract: 'Funkcja XOR zwraca wartość logiczną wykluczania lub wszystkich argumentów.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/xor-function',
            },
        ],
        functionParameter: {
            logical1: { name: 'logical1', detail: 'Pierwszy warunek, który chcesz przetestować i który może przyjąć wartość TRUE lub FALSE.' },
            logical2: { name: 'logical2', detail: 'Dodatkowe warunki, które chcesz przetestować i które mogą przyjąć wartość TRUE lub FALSE, maksymalnie 255 warunków.' },
        },
    },
};

export default locale;
