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
    CELL: {
        description: 'Funkcja KOMÓRKA zwraca informacje o formatowaniu, położeniu lub zawartości komórki. Na przykład aby przed wykonaniem obliczeń na komórce sprawdzić, czy zawiera ona wartość liczbową, a nie tekst, można użyć następującej formuły:',
        abstract: 'Funkcja KOMÓRKA zwraca informacje o formatowaniu, położeniu lub zawartości komórki. Na przykład aby przed wykonaniem obliczeń na komórce sprawdzić, czy zawiera ona wartość liczbową, a nie tekst, można użyć następującej formuły:',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/cell-function',
            },
        ],
        functionParameter: {
            infoType: { name: 'info_type', detail: 'Jest to wartość tekstowa, określająca żądany typ informacji o komórce. Na poniższej liście przedstawiono możliwe wartości argumentu typ_info i odpowiadające im wyniki.' },
            reference: { name: 'reference', detail: 'Jest to komórka, o której chcesz uzyskać informacje. W przypadku pominięcia tego argumentu zostaną zwrócone informacje określone w info_type argumencie dla komórki wybranej w momencie obliczania. Jeśli argument odwołania jest zakresem komórek, funkcja KOMÓRKA zwraca informacje o aktywnej komórce w zaznaczonym zakresie. Ważne: Chociaż z technicznego punktu widzenia odwoływanie się do niego jest opcjonalne, zalecane jest uwzględnianie go w formule, chyba że rozumiesz wpływ jego braku na wynik formuły i chcesz, aby ten efekt został zastosowany. Pominięcie argumentu odwołania nie daje rzetelnych informacji o konkretnej komórce z następujących powodów: W automatycznym trybie obliczania, jeśli komórka jest modyfikowana przez użytkownika, obliczenie może zostać wyzwolone przed lub po zaznaczeniu, w zależności od platformy używanej do obsługi programu Excel. Na przykład obecnie program Excel dla systemu Windows wyzwala obliczanie przed zmianą wyboru, ale program Excel dla sieci Web wyzwala je później. W Co-Authoring z innym użytkownikiem, który dokonuje edycji, ta funkcja zgłosi Twoją aktywną komórkę, a nie komórki edytującej. Każde ponowne obliczenie, na przykład naciśnięcie klawisza F9, spowoduje, że funkcja zwróci nowy wynik, nawet jeśli nie nastąpiła żadna edycja komórki.' },
        },
    },
    ERROR_TYPE: {
        description: 'Zwraca liczbę odpowiadającą jednej z wartości błędów w programie Microsoft Excel lub zwraca wartość błędu #N/D!, jeśli nie ma błędów. Funkcja NR.BŁĘDU może być stosowana z funkcją JEŻELI do testowania w poszukiwaniu wartości błędu; zwraca ona ciąg tekstowy, taki jak komunikat, zamiast wartości błędu.',
        abstract: 'Zwraca liczbę odpowiadającą jednej z wartości błędów w programie Microsoft Excel lub zwraca wartość błędu #N/D!, jeśli nie ma błędów. Funkcja NR.BŁĘDU może być stosowana z funkcją JEŻELI do testowania w poszukiwaniu wartości błędu; zwraca ona ciąg tekstowy, taki jak komunikat, zamiast wartości błędu.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/error-type-function',
            },
        ],
        functionParameter: {
            errorVal: { name: 'error_val', detail: 'Wymagane. Wartość błędu, której numer identyfikacyjny ma zostać odnaleziony. Chociaż argument wartość_błędu może być rzeczywistą wartością błędu, zwykle jest to odwołanie do komórki zawierającej formułę, która ma zostać przetestowana.' },
        },
    },
    INFO: {
        description: 'Zwraca informacje o bieżącym środowisku operacyjnym.',
        abstract: 'Zwraca informacje o bieżącym środowisku operacyjnym.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/info-function',
            },
        ],
        functionParameter: {
            typeText: { name: 'Typ_tekst', detail: 'Wymagane. Tekst określający typ zwracanych informacji.' },
        },
    },
    ISBETWEEN: {
        description: 'Sprawdza, czy podana liczba znajduje się między dwiema innymi liczbami, z uwzględnieniem lub bez uwzględniania wartości granicznych.',
        abstract: 'Sprawdza, czy podana liczba znajduje się między dwiema innymi liczbami, z uwzględnieniem lub bez uwzględniania wartości granicznych.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/10538337?hl=pl',
            },
        ],
        functionParameter: {
            valueToCompare: { name: 'value_to_compare', detail: 'Wartość, która ma zostać sprawdzona pod kątem znajdowania się między `lower_value` i `upper_value`.' },
            lowerValue: { name: 'lower_value', detail: 'Dolna granica zakresu wartości, w którym może znajdować się `value_to_compare`.' },
            upperValue: { name: 'upper_value', detail: 'Górna granica zakresu wartości, w którym może znajdować się `value_to_compare`.' },
            lowerValueIsInclusive: { name: 'lower_value_is_inclusive', detail: 'Czy zakres wartości obejmuje `lower_value`. Domyślnie TRUE.' },
            upperValueIsInclusive: { name: 'upper_value_is_inclusive', detail: 'Czy zakres wartości obejmuje `upper_value`. Domyślnie TRUE.' },
        },
    },
    ISBLANK: {
        description: 'Każda z tych funkcji, określanych zbiorczo mianem funkcji CZY , sprawdza typ wartości i zwraca wartość PRAWDA lub FAŁSZ w zależności od wyniku. Na przykład funkcja CZY.PUSTA zwraca wartość logiczną PRAWDA, jeśli wartość jest odwołaniem do pustej komórki; w innym przypadku zwraca wartość logiczną FAŁSZ.',
        abstract: 'Każda z tych funkcji, określanych zbiorczo mianem funkcji CZY , sprawdza typ wartości i zwraca wartość PRAWDA lub FAŁSZ w zależności od wyniku. Na przykład funkcja CZY.PUSTA zwraca wartość logiczną PRAWDA, jeśli wartość jest odwołaniem do pustej komórki; w innym przypadku zwraca wartość logiczną FAŁSZ.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Wymagane. Jest to sprawdzana wartość. Wartość może być pusta (pusta komórka), może być wskazaniem błędu, wartością logiczną, tekstem, liczbą, odwołaniem lub nazwą odwołującą się do którejkolwiek z tych wartości.' },
        },
    },
    ISDATE: {
        description: 'Funkcja ISDATE zwraca informację, czy wartość jest datą.',
        abstract: 'Funkcja ISDATE zwraca informację, czy wartość jest datą.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9061381?hl=pl',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Wartość, która ma zostać zweryfikowana jako data.' },
        },
    },
    ISEMAIL: {
        description: 'Funkcja ISEMAIL sprawdza, czy wartość jest prawidłowym adresem e-mail. Weryfikuje zgodność z powszechnie przyjętym formatem adresu e-mail, ale nie jego istnienie.',
        abstract: 'Funkcja ISEMAIL sprawdza, czy wartość jest prawidłowym adresem e-mail. Weryfikuje zgodność z powszechnie przyjętym formatem adresu e-mail, ale nie jego istnienie.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3256503?hl=pl',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Wartość, która ma zostać zweryfikowana jako adres e-mail.' },
        },
    },
    ISERR: {
        description: 'Każda z tych funkcji, określanych zbiorczo mianem funkcji CZY , sprawdza typ wartości i zwraca wartość PRAWDA lub FAŁSZ w zależności od wyniku. Na przykład funkcja CZY.PUSTA zwraca wartość logiczną PRAWDA, jeśli wartość jest odwołaniem do pustej komórki; w innym przypadku zwraca wartość logiczną FAŁSZ.',
        abstract: 'Każda z tych funkcji, określanych zbiorczo mianem funkcji CZY , sprawdza typ wartości i zwraca wartość PRAWDA lub FAŁSZ w zależności od wyniku. Na przykład funkcja CZY.PUSTA zwraca wartość logiczną PRAWDA, jeśli wartość jest odwołaniem do pustej komórki; w innym przypadku zwraca wartość logiczną FAŁSZ.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Wymagane. Jest to sprawdzana wartość. Wartość może być pusta (pusta komórka), może być wskazaniem błędu, wartością logiczną, tekstem, liczbą, odwołaniem lub nazwą odwołującą się do którejkolwiek z tych wartości.' },
        },
    },
    ISERROR: {
        description: 'Każda z tych funkcji, określanych zbiorczo mianem funkcji CZY , sprawdza typ wartości i zwraca wartość PRAWDA lub FAŁSZ w zależności od wyniku. Na przykład funkcja CZY.PUSTA zwraca wartość logiczną PRAWDA, jeśli wartość jest odwołaniem do pustej komórki; w innym przypadku zwraca wartość logiczną FAŁSZ.',
        abstract: 'Każda z tych funkcji, określanych zbiorczo mianem funkcji CZY , sprawdza typ wartości i zwraca wartość PRAWDA lub FAŁSZ w zależności od wyniku. Na przykład funkcja CZY.PUSTA zwraca wartość logiczną PRAWDA, jeśli wartość jest odwołaniem do pustej komórki; w innym przypadku zwraca wartość logiczną FAŁSZ.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Wymagane. Jest to sprawdzana wartość. Wartość może być pusta (pusta komórka), może być wskazaniem błędu, wartością logiczną, tekstem, liczbą, odwołaniem lub nazwą odwołującą się do którejkolwiek z tych wartości.' },
        },
    },
    ISEVEN: {
        description: 'Zwraca wartość PRAWDA, jeśli liczba jest parzysta, lub FAŁSZ, jeśli liczba jest nieparzysta.',
        abstract: 'Zwraca wartość PRAWDA, jeśli liczba jest parzysta, lub FAŁSZ, jeśli liczba jest nieparzysta.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/iseven-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Argument wymagany. Testowana wartość. Jeśli argument liczba nie jest liczbą całkowitą, jego wartość zostanie obcięta.' },
        },
    },
    ISFORMULA: {
        description: 'Sprawdza, czy istnieje odwołanie do komórki zawierającej formułę, i zwraca wartość PRAWDA lub FAŁSZ.',
        abstract: 'Sprawdza, czy istnieje odwołanie do komórki zawierającej formułę, i zwraca wartość PRAWDA lub FAŁSZ.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/isformula-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Wymagane. Argument odwołanie jest odwołaniem do komórki, która ma zostać sprawdzona. Argument odwołanie może być odwołaniem do komórki, formułą lub nazwą odwołującą się do komórki.' },
        },
    },
    ISLOGICAL: {
        description: 'Każda z tych funkcji, określanych zbiorczo mianem funkcji CZY , sprawdza typ wartości i zwraca wartość PRAWDA lub FAŁSZ w zależności od wyniku. Na przykład funkcja CZY.PUSTA zwraca wartość logiczną PRAWDA, jeśli wartość jest odwołaniem do pustej komórki; w innym przypadku zwraca wartość logiczną FAŁSZ.',
        abstract: 'Każda z tych funkcji, określanych zbiorczo mianem funkcji CZY , sprawdza typ wartości i zwraca wartość PRAWDA lub FAŁSZ w zależności od wyniku. Na przykład funkcja CZY.PUSTA zwraca wartość logiczną PRAWDA, jeśli wartość jest odwołaniem do pustej komórki; w innym przypadku zwraca wartość logiczną FAŁSZ.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Wymagane. Jest to sprawdzana wartość. Wartość może być pusta (pusta komórka), może być wskazaniem błędu, wartością logiczną, tekstem, liczbą, odwołaniem lub nazwą odwołującą się do którejkolwiek z tych wartości.' },
        },
    },
    ISNA: {
        description: 'Każda z tych funkcji, określanych zbiorczo mianem funkcji CZY , sprawdza typ wartości i zwraca wartość PRAWDA lub FAŁSZ w zależności od wyniku. Na przykład funkcja CZY.PUSTA zwraca wartość logiczną PRAWDA, jeśli wartość jest odwołaniem do pustej komórki; w innym przypadku zwraca wartość logiczną FAŁSZ.',
        abstract: 'Każda z tych funkcji, określanych zbiorczo mianem funkcji CZY , sprawdza typ wartości i zwraca wartość PRAWDA lub FAŁSZ w zależności od wyniku. Na przykład funkcja CZY.PUSTA zwraca wartość logiczną PRAWDA, jeśli wartość jest odwołaniem do pustej komórki; w innym przypadku zwraca wartość logiczną FAŁSZ.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Wymagane. Jest to sprawdzana wartość. Wartość może być pusta (pusta komórka), może być wskazaniem błędu, wartością logiczną, tekstem, liczbą, odwołaniem lub nazwą odwołującą się do którejkolwiek z tych wartości.' },
        },
    },
    ISNONTEXT: {
        description: 'Każda z tych funkcji, określanych zbiorczo mianem funkcji CZY , sprawdza typ wartości i zwraca wartość PRAWDA lub FAŁSZ w zależności od wyniku. Na przykład funkcja CZY.PUSTA zwraca wartość logiczną PRAWDA, jeśli wartość jest odwołaniem do pustej komórki; w innym przypadku zwraca wartość logiczną FAŁSZ.',
        abstract: 'Każda z tych funkcji, określanych zbiorczo mianem funkcji CZY , sprawdza typ wartości i zwraca wartość PRAWDA lub FAŁSZ w zależności od wyniku. Na przykład funkcja CZY.PUSTA zwraca wartość logiczną PRAWDA, jeśli wartość jest odwołaniem do pustej komórki; w innym przypadku zwraca wartość logiczną FAŁSZ.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Wymagane. Jest to sprawdzana wartość. Wartość może być pusta (pusta komórka), może być wskazaniem błędu, wartością logiczną, tekstem, liczbą, odwołaniem lub nazwą odwołującą się do którejkolwiek z tych wartości.' },
        },
    },
    ISNUMBER: {
        description: 'Każda z tych funkcji, określanych zbiorczo mianem funkcji CZY , sprawdza typ wartości i zwraca wartość PRAWDA lub FAŁSZ w zależności od wyniku. Na przykład funkcja CZY.PUSTA zwraca wartość logiczną PRAWDA, jeśli wartość jest odwołaniem do pustej komórki; w innym przypadku zwraca wartość logiczną FAŁSZ.',
        abstract: 'Każda z tych funkcji, określanych zbiorczo mianem funkcji CZY , sprawdza typ wartości i zwraca wartość PRAWDA lub FAŁSZ w zależności od wyniku. Na przykład funkcja CZY.PUSTA zwraca wartość logiczną PRAWDA, jeśli wartość jest odwołaniem do pustej komórki; w innym przypadku zwraca wartość logiczną FAŁSZ.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Wymagane. Jest to sprawdzana wartość. Wartość może być pusta (pusta komórka), może być wskazaniem błędu, wartością logiczną, tekstem, liczbą, odwołaniem lub nazwą odwołującą się do którejkolwiek z tych wartości.' },
        },
    },
    ISODD: {
        description: 'Zwraca wartość PRAWDA, jeśli liczba jest nieparzysta, lub FAŁSZ, jeśli liczba jest parzysta.',
        abstract: 'Zwraca wartość PRAWDA, jeśli liczba jest nieparzysta, lub FAŁSZ, jeśli liczba jest parzysta.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/isodd-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Argument wymagany. Testowana wartość. Jeśli argument liczba nie jest liczbą całkowitą, jego wartość zostanie obcięta.' },
        },
    },
    ISOMITTED: {
        description: 'Sprawdza, czy brakuje wartości w funkcji LAMBDA , i zwraca wartość PRAWDA lub FAŁSZ.',
        abstract: 'Sprawdza, czy brakuje wartości w funkcji LAMBDA , i zwraca wartość PRAWDA lub FAŁSZ.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/isomitted-function',
            },
        ],
        functionParameter: {
            argument: { name: 'Argument', detail: 'Wartość, którą chcesz przetestować, na przykład parametr LAMBDA.' },
        },
    },
    ISREF: {
        description: 'Każda z tych funkcji, określanych zbiorczo mianem funkcji CZY , sprawdza typ wartości i zwraca wartość PRAWDA lub FAŁSZ w zależności od wyniku. Na przykład funkcja CZY.PUSTA zwraca wartość logiczną PRAWDA, jeśli wartość jest odwołaniem do pustej komórki; w innym przypadku zwraca wartość logiczną FAŁSZ.',
        abstract: 'Każda z tych funkcji, określanych zbiorczo mianem funkcji CZY , sprawdza typ wartości i zwraca wartość PRAWDA lub FAŁSZ w zależności od wyniku. Na przykład funkcja CZY.PUSTA zwraca wartość logiczną PRAWDA, jeśli wartość jest odwołaniem do pustej komórki; w innym przypadku zwraca wartość logiczną FAŁSZ.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Wymagane. Jest to sprawdzana wartość. Wartość może być pusta (pusta komórka), może być wskazaniem błędu, wartością logiczną, tekstem, liczbą, odwołaniem lub nazwą odwołującą się do którejkolwiek z tych wartości.' },
        },
    },
    ISTEXT: {
        description: 'Każda z tych funkcji, określanych zbiorczo mianem funkcji CZY , sprawdza typ wartości i zwraca wartość PRAWDA lub FAŁSZ w zależności od wyniku. Na przykład funkcja CZY.PUSTA zwraca wartość logiczną PRAWDA, jeśli wartość jest odwołaniem do pustej komórki; w innym przypadku zwraca wartość logiczną FAŁSZ.',
        abstract: 'Każda z tych funkcji, określanych zbiorczo mianem funkcji CZY , sprawdza typ wartości i zwraca wartość PRAWDA lub FAŁSZ w zależności od wyniku. Na przykład funkcja CZY.PUSTA zwraca wartość logiczną PRAWDA, jeśli wartość jest odwołaniem do pustej komórki; w innym przypadku zwraca wartość logiczną FAŁSZ.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/is-functions',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Wymagane. Jest to sprawdzana wartość. Wartość może być pusta (pusta komórka), może być wskazaniem błędu, wartością logiczną, tekstem, liczbą, odwołaniem lub nazwą odwołującą się do którejkolwiek z tych wartości.' },
        },
    },
    ISURL: {
        description: 'Sprawdza, czy wartość jest prawidłowym adresem URL.',
        abstract: 'Sprawdza, czy wartość jest prawidłowym adresem URL.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3256501?hl=pl',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Wartość, która ma zostać zweryfikowana jako adres URL.' },
        },
    },
    N: {
        description: 'Zwraca wartość skonwertowaną na liczbę.',
        abstract: 'Zwraca wartość skonwertowaną na liczbę.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/n-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Wymagane. Wartość, którą należy przekonwertować. Funkcja N konwertuje wartości podane w poniższej tabeli.' },
        },
    },
    NA: {
        description: 'Zwraca wartość błędu #N/A. #N/D jest wartością błędu, która oznacza "nie jest dostępna żadna wartość". Użyj funkcji BRAK, aby oznaczyć puste komórki. Wprowadzając #N/A w komórkach, w których brakuje informacji, można uniknąć problemu przypadkowego uwzględniania pustych komórek w obliczeniach. (Jeśli formuła odwołuje się do komórki zawierającej #N/A, formuła zwraca wartość błędu #N/A).',
        abstract: 'Zwraca wartość błędu #N/A. #N/D jest wartością błędu, która oznacza "nie jest dostępna żadna wartość". Użyj funkcji BRAK, aby oznaczyć puste komórki. Wprowadzając #N/A w komórkach, w których brakuje informacji, można uniknąć problemu przypadkowego uwzględniania pustych komórek w obliczeniach. (Jeśli formuła odwołuje się do komórki zawierającej #N/A, formuła zwraca wartość błędu #N/A).',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/na-function',
            },
        ],
        functionParameter: {
        },
    },
    SHEET: {
        description: 'Funkcja ARKUSZ zwraca numer arkusza określonego arkusza lub innego odwołania.',
        abstract: 'Funkcja ARKUSZ zwraca numer arkusza określonego arkusza lub innego odwołania.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/sheet-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Argument opcjonalny. Służy do określania nazwy arkusza lub odwołania, dla którego chcesz uzyskać numer arkusza. W przeciwnym razie funkcja zwróci numer arkusza zawierającego funkcję ARKUSZ.' },
        },
    },
    SHEETS: {
        description: 'Zwraca liczbę arkuszy w odwołaniu.',
        abstract: 'Zwraca liczbę arkuszy w odwołaniu.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/sheets-function',
            },
        ],
        functionParameter: {
        },
    },
    TYPE: {
        description: 'Zwraca typ wartości. Z funkcji TYP należy korzystać wtedy, gdy zachowanie innej funkcji zależy od typu wartości znajdującej się w określonej komórce.',
        abstract: 'Zwraca typ wartości. Z funkcji TYP należy korzystać wtedy, gdy zachowanie innej funkcji zależy od typu wartości znajdującej się w określonej komórce.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/type-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Wymagane. Dowolna wartość używana przez program Microsoft Excel, taka jak liczba, wartość logiczna itp.' },
        },
    },
};

export default locale;
