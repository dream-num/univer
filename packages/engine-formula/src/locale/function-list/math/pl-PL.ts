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
    ABS: {
        description: 'Zwraca wartość bezwzględną liczby. Wartość bezwzględna liczby to liczba bez znaku.',
        abstract: 'Zwraca wartość bezwzględną liczby.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/abs-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Liczba rzeczywista, której wartość bezwzględną chcesz otrzymać.' },
        },
    },
    ACOS: {
        description: 'Zwraca arcus cosinus lub odwrotny cosinus liczby. Arcus cosinus jest wartością kąta, którego cosinus to liczba . Wyznaczona wartość w radianach należy do przedziału od 0 (zero) do pi.',
        abstract: 'Zwraca arcus cosinus lub odwrotny cosinus liczby. Arcus cosinus jest wartością kąta, którego cosinus to liczba . Wyznaczona wartość w radianach należy do przedziału od 0 (zero) do pi.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/acos-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Cosinus poszukiwanego kąta. Musi należeć do przedziału od -1 do 1.' },
        },
    },
    ACOSH: {
        description: 'Zwraca arcus cosinus hiperboliczny liczby. Liczba musi być większa niż lub równa 1. Arcus cosinus hiperboliczny jest wartością, której cosinus hiperboliczny to liczba , dlatego ACOSH(COSH(liczba)) równa się liczba .',
        abstract: 'Zwraca arcus cosinus hiperboliczny liczby. Liczba musi być większa niż lub równa 1. Arcus cosinus hiperboliczny jest wartością, której cosinus hiperboliczny to liczba , dlatego ACOSH(COSH(liczba)) równa się liczba .',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/acosh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Dowolna liczba rzeczywista większa niż lub równa 1.' },
        },
    },
    ACOT: {
        description: 'Zwraca wartość główną funkcji arcus cotangens lub odwrotności funkcji cotangens określonej liczby.',
        abstract: 'Zwraca wartość główną funkcji arcus cotangens lub odwrotności funkcji cotangens określonej liczby.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/acot-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Liczba to cotangens kąta, który należy wyznaczyć. Musi to być liczba rzeczywista.' },
        },
    },
    ACOTH: {
        description: 'Zwraca odwrotny kotangens hiperboliczny liczby.',
        abstract: 'Zwraca odwrotny kotangens hiperboliczny liczby.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/acoth-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Wartość bezwzględna argumentu Number musi być większa niż 1.' },
        },
    },
    AGGREGATE: {
        description: 'Zwraca wartość zagregowaną z listy lub bazy danych. Funkcja AGREGUJ może stosować różne funkcje agregujące do listy lub bazy danych, oferując przy tym opcję ignorowania ukrytych wierszy i wartości błędów.',
        abstract: 'Zwraca wartość zagregowaną z listy lub bazy danych. Funkcja AGREGUJ może stosować różne funkcje agregujące do listy lub bazy danych, oferując przy tym opcję ignorowania ukrytych wierszy i wartości błędów.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/aggregate-function',
            },
        ],
        functionParameter: {
            functionNum: { name: 'function_num', detail: 'Wymagane. Liczba od 1 do 19, określająca funkcję, która ma zostać użyta.' },
            options: { name: 'options', detail: 'Wymagane. Wartość liczbowa określająca, które wartości z zakresu obliczeń funkcji mają być ignorowane. Uwaga Funkcja nie ignoruje ukrytych wierszy, zagnieżdżonych sum częściowych ani zagnieżdżonych funkcji agregujących, jeśli argument tablica zawiera obliczenie, na przykład: =AGREGUJ(14;3;A1:A100*(A1:A100>0);1)' },
            ref1: { name: 'ref1', detail: 'Wymagane. Jest to pierwszy argument liczbowy dla funkcji przyjmujących kilka argumentów liczbowych, z których ma być agregowana wartość.' },
            ref2: { name: 'ref2', detail: 'Opcjonalne. Są to argumenty liczbowe od 2 do 253, dla których ma być agregowana wartość. W przypadku funkcji pobierających tablicę argument odw1 jest tablicą, formułą tablicową lub odwołaniem do zakresu komórek, dla których ma zostać zagregowana wartość. Odw2 jest drugim argumentem, wymaganym w niektórych funkcjach. Argumentu odw2 wymagają następujące funkcje:' },
        },
    },
    ARABIC: {
        description: 'Konwertuje liczbę rzymską na liczbę arabską.',
        abstract: 'Konwertuje liczbę rzymską na liczbę arabską.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/arabic-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Argument wymagany. Ciąg ujęty w cudzysłów, ciąg pusty ("") lub odwołanie do komórki zawierającej tekst.' },
        },
    },
    ASIN: {
        description: 'Zwraca arcus sinus lub odwrotny sinus liczby. Arcus sinus jest wartością kąta, którego sinus to liczba . Zwracany kąt w radianach należy do przedziału od -pi/2 do pi/2.',
        abstract: 'Zwraca arcus sinus lub odwrotny sinus liczby. Arcus sinus jest wartością kąta, którego sinus to liczba . Zwracany kąt w radianach należy do przedziału od -pi/2 do pi/2.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/asin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Sinus żądanego kąta i musi wynosić od -1 do 1.' },
        },
    },
    ASINH: {
        description: 'Zwraca arcus sinus hiperboliczny liczby. Arcus sinus hiperboliczny jest wartością, której sinus hiperboliczny to liczba , dlatego ASINH(SINH(liczba)) równa się liczba .',
        abstract: 'Zwraca arcus sinus hiperboliczny liczby. Arcus sinus hiperboliczny jest wartością, której sinus hiperboliczny to liczba , dlatego ASINH(SINH(liczba)) równa się liczba .',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/asinh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Dowolna liczba rzeczywista.' },
        },
    },
    ATAN: {
        description: 'Zwraca arcus tangens lub odwrotny tangens liczby. Arcus tangens jest kątem, którego tangens to liczba . Zwracany kąt w radianach należy do przedziału od -pi/2 do pi/2.',
        abstract: 'Zwraca arcus tangens lub odwrotny tangens liczby. Arcus tangens jest kątem, którego tangens to liczba . Zwracany kąt w radianach należy do przedziału od -pi/2 do pi/2.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/atan-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Tangens kąta, który należy wyznaczyć.' },
        },
    },
    ATAN2: {
        description: 'Zwraca arcus tangens lub odwrotny tangens określonych współrzędnych x i y. Arcus tangens jest wartością kąta pomiędzy osią x a linią prostą poprowadzoną przez początek układu współrzędnych i punkt o współrzędnych (x_liczba;y_liczba). Kąt w radianach zawiera się w przedziale od -pi do pi, z wyłączeniem wartości -pi.',
        abstract: 'Zwraca arcus tangens lub odwrotny tangens określonych współrzędnych x i y. Arcus tangens jest wartością kąta pomiędzy osią x a linią prostą poprowadzoną przez początek układu współrzędnych i punkt o współrzędnych (x_liczba;y_liczba). Kąt w radianach zawiera się w przedziale od -pi do pi, z wyłączeniem wartości -pi.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/atan2-function',
            },
        ],
        functionParameter: {
            xNum: { name: 'x_num', detail: 'Wymagane. Współrzędna x punktu.' },
            yNum: { name: 'y_num', detail: 'Wymagane. Współrzędna y punktu.' },
        },
    },
    ATANH: {
        description: 'Zwraca arcus tangens hiperboliczny liczby. Liczba musi być w przedziale -1 i 1 (z wyłączeniem wartości -1 i 1). Arcus tangens hiperboliczny jest wartością, której tangens hiperboliczny to liczba , dlatego ATANH(TANH(liczba)) równa się liczba .',
        abstract: 'Zwraca arcus tangens hiperboliczny liczby. Liczba musi być w przedziale -1 i 1 (z wyłączeniem wartości -1 i 1). Arcus tangens hiperboliczny jest wartością, której tangens hiperboliczny to liczba , dlatego ATANH(TANH(liczba)) równa się liczba .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/atanh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Dowolna liczba rzeczywista z przedziału od 1 do -1.' },
        },
    },
    BASE: {
        description: 'Konwertuje liczbę na formę tekstową o określonej podstawie.',
        abstract: 'Konwertuje liczbę na formę tekstową o określonej podstawie.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/base-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Liczba, która ma zostać przekonwertowana. Musi to być liczba całkowita większa niż lub równa 0 i mniejsza niż 2^53.' },
            radix: { name: 'radix', detail: 'Wymagane. Podstawa, na którą liczba ma zostać przekonwertowana. Musi to być liczba całkowita większa niż lub równa 2 i mniejsza niż lub równa 36.' },
            minLength: { name: 'min_length', detail: 'Opcjonalne. Minimalna długość zwracanego ciągu. Musi to być liczba całkowita większa niż lub równa 0.' },
        },
    },
    CEILING: {
        description: 'Zwraca wartość liczby, zaokrąglając ją w górę, dalej od zera, do najbliższej wielokrotności istotności. Na przykład jeśli chce się uniknąć używania ułamków bilonu w cenach, a produkt wyceniony jest na 4,42 zł, należy użyć formuły =ZAOKR.W.GÓRĘ(4,42;0,05) aby zaokrąglić cenę do najbliższej drobnej monety.',
        abstract: 'Zwraca wartość liczby, zaokrąglając ją w górę, dalej od zera, do najbliższej wielokrotności istotności. Na przykład jeśli chce się uniknąć używania ułamków bilonu w cenach, a produkt wyceniony jest na 4,42 zł, należy użyć formuły =ZAOKR.W.GÓRĘ(4,42;0,05) aby zaokrąglić cenę do najbliższej drobnej monety.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/ceiling-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Wartość do zaokrąglenia.' },
            significance: { name: 'significance', detail: 'Wymagane. Wielokrotność, do której ma zostać wykonane zaokrąglenie.' },
        },
    },
    CEILING_MATH: {
        description: 'ZAOKR.W.W. Funkcja MATEMATYCZNE zaokrągla liczbę w górę do najbliższej liczby całkowitej lub opcjonalnie do najbliższej wielokrotności po istotności.',
        abstract: 'ZAOKR.W.W. Funkcja MATEMATYCZNE zaokrągla liczbę w górę do najbliższej liczby całkowitej lub opcjonalnie do najbliższej wielokrotności po istotności.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/ceiling-math-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Wymagane. (musi być w przedziale od -2,229E-308.do 9,99E+307).' },
            significance: { name: 'significance', detail: 'Opcjonalne. Jest to liczba cyfr znaczących po przecinku dziesiętnym, do którego ma zostać zaokrąglona liczba .' },
            mode: { name: 'mode', detail: 'Opcjonalne. Ta opcja określa, czy liczby ujemne są zaokrąglane w kierunku zera, czy od zera.' },
        },
    },
    CEILING_PRECISE: {
        description: 'Zaokrągla liczbę w górę do najbliższej wartości całkowitej lub wielokrotności podanej istotności. Zaokrąglenie następuje w górę niezależnie od znaku liczby. Jeśli liczba lub istotność wynosi zero, jest zwracana wartość zero.',
        abstract: 'Zaokrągla liczbę w górę do najbliższej wartości całkowitej lub wielokrotności podanej istotności. Zaokrąglenie następuje w górę niezależnie od znaku liczby. Jeśli liczba lub istotność wynosi zero, jest zwracana wartość zero.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/ceiling-precise-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Wartość do zaokrąglenia.' },
            significance: { name: 'significance', detail: 'Opcjonalne. Wielokrotność, do której zaokrąglana jest liczba. Jeśli istotność zostanie pominięta, zostanie użyta wartość domyślna równa 1.' },
        },
    },
    COMBIN: {
        description: 'Zwraca liczbę kombinacji dla danej liczby elementów. Funkcja KOMBINACJE służy do określania całkowitej możliwej liczby grup dla danej liczby elementów.',
        abstract: 'Zwraca liczbę kombinacji dla danej liczby elementów. Funkcja KOMBINACJE służy do określania całkowitej możliwej liczby grup dla danej liczby elementów.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/combin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Liczba elementów.' },
            numberChosen: { name: 'number_chosen', detail: 'Wymagane. Liczba elementów w każdej z kombinacji.' },
        },
    },
    COMBINA: {
        description: 'Zwraca liczbę kombinacji (wraz z powtórzeniami) dla danej liczby elementów.',
        abstract: 'Zwraca liczbę kombinacji (wraz z powtórzeniami) dla danej liczby elementów.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/combina-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Musi to być liczba większa niż lub równa 0 i większa niż lub równa wartości argumentu liczba_wybrana. Liczby niecałkowite są obcinane do liczb całkowitych.' },
            numberChosen: { name: 'number_chosen', detail: 'Wymagane. Musi być większy lub równy 0. Liczby niecałkowite są obcinane do liczb całkowitych.' },
        },
    },
    COS: {
        description: 'Zwraca cosinus danego kąta.',
        abstract: 'Zwraca cosinus danego kąta.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/cos-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Kąt w radianach, dla którego należy obliczyć cosinus.' },
        },
    },
    COSH: {
        description: 'Zwraca cosinus hiperboliczny liczby.',
        abstract: 'Zwraca cosinus hiperboliczny liczby.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/cosh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Dowolna liczba rzeczywista, której cosinus hiperboliczny ma zostać obliczony.' },
        },
    },
    COT: {
        description: 'Zwraca cotangens kąta określonego w radianach.',
        abstract: 'Zwraca cotangens kąta określonego w radianach.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/cot-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Kąt w radianach, dla którego należy obliczyć cotangens.' },
        },
    },
    COTH: {
        description: 'Zwraca cotangens hiperboliczny kąta hiperbolicznego.',
        abstract: 'Zwraca cotangens hiperboliczny kąta hiperbolicznego.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/coth-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany.' },
        },
    },
    CSC: {
        description: 'Zwraca cosecans kąta określonego w radianach.',
        abstract: 'Zwraca cosecans kąta określonego w radianach.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/csc-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany.' },
        },
    },
    CSCH: {
        description: 'Zwraca cosecans hiperboliczny kąta określonego w radianach.',
        abstract: 'Zwraca cosecans hiperboliczny kąta określonego w radianach.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/csch-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany.' },
        },
    },
    DECIMAL: {
        description: 'Konwertuje postać tekstową liczby o określonej podstawie na liczbę dziesiętną.',
        abstract: 'Konwertuje postać tekstową liczby o określonej podstawie na liczbę dziesiętną.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/decimal-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Argument wymagany.' },
            radix: { name: 'radix', detail: 'Wymagane. Argument podstawa musi być liczbą całkowitą.' },
        },
    },
    DEGREES: {
        description: 'Konwertuje radiany na stopnie.',
        abstract: 'Konwertuje radiany na stopnie.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/degrees-function',
            },
        ],
        functionParameter: {
            angle: { name: 'angle', detail: 'Wymagane. Kąt określony w radianach, który ma zostać przekonwertowany.' },
        },
    },
    EVEN: {
        description: 'Zwraca wartość liczby zaokrąglonej do najbliższej parzystej liczby całkowitej. Funkcji tej można używać do przetwarzania obiektów występujących parami. Na przykład opakowanie pozwala na umieszczenie jednego lub dwóch rodzajów przedmiotów. Opakowanie jest wypełnione, gdy liczba przedmiotów, zaokrąglona do najbliższej liczby parzystej, zgadza się z jego pojemnością.',
        abstract: 'Zwraca wartość liczby zaokrąglonej do najbliższej parzystej liczby całkowitej. Funkcji tej można używać do przetwarzania obiektów występujących parami. Na przykład opakowanie pozwala na umieszczenie jednego lub dwóch rodzajów przedmiotów. Opakowanie jest wypełnione, gdy liczba przedmiotów, zaokrąglona do najbliższej liczby parzystej, zgadza się z jego pojemnością.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/even-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Wartość do zaokrąglenia.' },
        },
    },
    EXP: {
        description: 'Zwraca wartość liczby e podniesioną do potęgi liczba. Stała e jest równa 2,71828182845904, podstawie logarytmu naturalnego.',
        abstract: 'Zwraca wartość liczby e podniesioną do potęgi liczba. Stała e jest równa 2,71828182845904, podstawie logarytmu naturalnego.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/exp-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Wykładnik potęgi o podstawie e.' },
        },
    },
    FACT: {
        description: 'Zwraca wartość silni liczby. Silnia liczby jest równa wyrażeniu 1*2*3*...* liczba.',
        abstract: 'Zwraca wartość silni liczby. Silnia liczby jest równa wyrażeniu 1*2*3*...* liczba.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/fact-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Nieujemna liczba, której silnia ma zostać obliczona. Jeśli argument „liczba” nie jest liczbą całkowitą, jego wartość zostanie obcięta do liczby całkowitej.' },
        },
    },
    FACTDOUBLE: {
        description: 'Zwraca dwukrotną wartość silni liczby.',
        abstract: 'Zwraca dwukrotną wartość silni liczby.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/factdouble-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Liczba, której dwukrotna wartość silni ma zostać obliczona. Jeśli argument „liczba” nie jest liczbą całkowitą, jego wartość zostanie obcięta do liczby całkowitej.' },
        },
    },
    FLOOR: {
        description: 'Funkcja ZAOKR.W.DÓŁ w programie Excel zaokrągla określoną liczbę w dół do najbliższej określonej wielokrotności podanej istotności. Liczby ujemne są zaokrąglane w dół (dalej ujemne) do najbliższej pełnej wielokrotności poniżej zera.',
        abstract: 'Funkcja ZAOKR.W.DÓŁ w programie Excel zaokrągla określoną liczbę w dół do najbliższej określonej wielokrotności podanej istotności. Liczby ujemne są zaokrąglane w dół (dalej ujemne) do najbliższej pełnej wielokrotności poniżej zera.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/floor-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Wartość liczbowa do zaokrąglenia.' },
            significance: { name: 'significance', detail: 'Wymagane. Wielokrotność, do której ma zostać wykonane zaokrąglenie.' },
        },
    },
    FLOOR_MATH: {
        description: 'Zaokrągla liczbę w dół do najbliższej liczby całkowitej lub najbliższej wielokrotności istotności.',
        abstract: 'Zaokrągla liczbę w dół do najbliższej liczby całkowitej lub najbliższej wielokrotności istotności.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/floor-math-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Liczba do zaokrąglenia w dół.' },
            significance: { name: 'significance', detail: 'Opcjonalne. Wielokrotność, do której ma zostać wykonane zaokrąglenie.' },
            mode: { name: 'mode', detail: 'Opcjonalne. Kierunek zaokrąglania liczb ujemnych (do zera lub od zera).' },
        },
    },
    FLOOR_PRECISE: {
        description: 'Zaokrągla liczbę w dół do najbliższej wartości całkowitej lub wielokrotności podanej istotności. Zaokrąglenie następuje w dół niezależnie od znaku liczby. Jeśli liczba lub istotność wynosi zero, jest zwracana wartość zero.',
        abstract: 'Zaokrągla liczbę w dół do najbliższej wartości całkowitej lub wielokrotności podanej istotności. Zaokrąglenie następuje w dół niezależnie od znaku liczby. Jeśli liczba lub istotność wynosi zero, jest zwracana wartość zero.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/floor-precise-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Wartość do zaokrąglenia.' },
            significance: { name: 'significance', detail: 'Opcjonalne. Wielokrotność, do której zaokrąglana jest liczba. Jeśli istotność zostanie pominięta, zostanie użyta wartość domyślna równa 1.' },
        },
    },
    GCD: {
        description: 'Zwraca wartość największego wspólnego dzielnika dwu lub więcej liczb całkowitych. Największy wspólny dzielnik jest największą liczbą całkowitą, dzielącą bez reszty zarówno argument liczba1, jak i argument liczba2.',
        abstract: 'Zwraca wartość największego wspólnego dzielnika dwu lub więcej liczb całkowitych. Największy wspólny dzielnik jest największą liczbą całkowitą, dzielącą bez reszty zarówno argument liczba1, jak i argument liczba2.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/gcd-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Argument liczba1 jest wymagany, pozostałe są opcjonalne. Ciąg od 1 do 255 wartości. Jeśli którakolwiek z wartości nie jest liczbą całkowitą, zostanie obcięta do liczby całkowitej.' },
            number2: { name: 'number2', detail: 'Argument liczba1 jest wymagany, pozostałe są opcjonalne. Ciąg od 1 do 255 wartości. Jeśli którakolwiek z wartości nie jest liczbą całkowitą, zostanie obcięta do liczby całkowitej.' },
        },
    },
    INT: {
        description: 'Zaokrągla liczbę w dół do najbliższej liczby całkowitej.',
        abstract: 'Zaokrągla liczbę w dół do najbliższej liczby całkowitej.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/int-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Liczba rzeczywista, którą należy zaokrąglić w dół do liczby całkowitej.' },
        },
    },
    ISO_CEILING: {
        description: 'Zaokrągla liczbę w górę do najbliższej wartości całkowitej lub wielokrotności podanej istotności. Zaokrąglenie następuje w górę niezależnie od znaku liczby. Jeśli liczba lub istotność wynosi zero, jest zwracana wartość zero.',
        abstract: 'Zaokrągla liczbę w górę do najbliższej wartości całkowitej lub wielokrotności podanej istotności. Zaokrąglenie następuje w górę niezależnie od znaku liczby. Jeśli liczba lub istotność wynosi zero, jest zwracana wartość zero.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/iso-ceiling-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Wartość do zaokrąglenia.' },
            significance: { name: 'significance', detail: 'Opcjonalne. Wielokrotność, do której zaokrąglana jest liczba. Jeśli istotność zostanie pominięta, zostanie użyta wartość domyślna równa 1.' },
        },
    },
    LCM: {
        description: 'Zwraca wartość najmniejszej wspólnej wielokrotności liczb całkowitych. Najmniejszą wspólną wielokrotnością jest najmniejsza dodatnia liczba całkowita będąca wielokrotnością wszystkich całkowitych argumentów liczba1, liczba2 i tak dalej. Funkcję NAJMN.WSP.WIEL należy stosować przy dodawaniu ułamków o różnych mianownikach.',
        abstract: 'Zwraca wartość najmniejszej wspólnej wielokrotności liczb całkowitych. Najmniejszą wspólną wielokrotnością jest najmniejsza dodatnia liczba całkowita będąca wielokrotnością wszystkich całkowitych argumentów liczba1, liczba2 i tak dalej. Funkcję NAJMN.WSP.WIEL należy stosować przy dodawaniu ułamków o różnych mianownikach.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/lcm-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Argument liczba1 jest wymagany, pozostałe są opcjonalne. Od 1 do 255 wartości, dla których należy wyznaczyć najmniejszą wspólną wielokrotność. Jeśli wartość nie jest liczbą całkowitą, zostanie obcięta.' },
            number2: { name: 'number2', detail: 'Argument liczba1 jest wymagany, pozostałe są opcjonalne. Od 1 do 255 wartości, dla których należy wyznaczyć najmniejszą wspólną wielokrotność. Jeśli wartość nie jest liczbą całkowitą, zostanie obcięta.' },
        },
    },
    LN: {
        description: 'Zwraca wartość logarytmu naturalnego danej liczby. Podstawą logarytmów naturalnych jest stała e (2,71828182845904).',
        abstract: 'Zwraca wartość logarytmu naturalnego danej liczby. Podstawą logarytmów naturalnych jest stała e (2,71828182845904).',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/ln-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Liczba rzeczywista dodatnia, której logarytm naturalny należy obliczyć.' },
        },
    },
    LOG: {
        description: 'Zwraca logarytm liczby przy zadanej podstawie.',
        abstract: 'Zwraca logarytm liczby przy zadanej podstawie.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/log-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Liczba rzeczywista dodatnia, której logarytm należy obliczyć.' },
            base: { name: 'base', detail: 'Opcjonalne. Postawa logarytmu. Jeśli argument „podstawa” jest pominięty, przyjmowana jest wartość 10.' },
        },
    },
    LOG10: {
        description: 'Zwraca logarytm zadanej liczby przy podstawie 10.',
        abstract: 'Zwraca logarytm zadanej liczby przy podstawie 10.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/log10-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Liczba rzeczywista dodatnia, dla której należy wyznaczyć logarytm przy podstawie 10.' },
        },
    },
    MDETERM: {
        description: 'Zwraca wartość wyznacznika macierzy tablicy.',
        abstract: 'Zwraca wartość wyznacznika macierzy tablicy.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/mdeterm-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Wymagane. Tablica liczb zawierająca jednakową liczbę wierszy i kolumn.' },
        },
    },
    MINVERSE: {
        description: 'Funkcja MACIERZ.ODW zwraca macierz odwrotną dla macierzy przechowywanej w tablicy.',
        abstract: 'Funkcja MACIERZ.ODW zwraca macierz odwrotną dla macierzy przechowywanej w tablicy.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/minverse-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Wymagane. Tablica liczb zawierająca jednakową liczbę wierszy i kolumn.' },
        },
    },
    MMULT: {
        description: 'Funkcja MACIERZ.ILOCZYN zwraca iloczyn macierzy dwóch tablic. Wynik jest tablicą o takiej samej liczbie wierszy jak tablica1 i takiej samej liczbie kolumn jak tablica2.',
        abstract: 'Funkcja MACIERZ.ILOCZYN zwraca iloczyn macierzy dwóch tablic. Wynik jest tablicą o takiej samej liczbie wierszy jak tablica1 i takiej samej liczbie kolumn jak tablica2.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/mmult-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Tablice, które chcesz pomnożyć.' },
            array2: { name: 'array2', detail: 'Tablice, które chcesz pomnożyć.' },
        },
    },
    MOD: {
        description: 'Zwraca wartość reszty po podzieleniu liczby przez dzielnik. Wynik ma taki sam znak jak dzielnik.',
        abstract: 'Zwraca wartość reszty po podzieleniu liczby przez dzielnik. Wynik ma taki sam znak jak dzielnik.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/mod-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Liczba, dla której należy wyznaczyć resztę.' },
            divisor: { name: 'divisor', detail: 'Wymagane. Liczba, przez którą należy podzielić liczbę.' },
        },
    },
    MROUND: {
        description: 'Funkcja ZAOKR.DO.WIELOKR zwraca liczbę zaokrągloną do odpowiedniej wielokrotności.',
        abstract: 'Funkcja ZAOKR.DO.WIELOKR zwraca liczbę zaokrągloną do odpowiedniej wielokrotności.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/mround-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Wartość do zaokrąglenia.' },
            multiple: { name: 'multiple', detail: 'Wymagane. Wielokrotność, do której należy zaokrąglić liczbę.' },
        },
    },
    MULTINOMIAL: {
        description: 'Zwraca wartość stosunku silni sumy wartości do iloczynu silni.',
        abstract: 'Zwraca wartość stosunku silni sumy wartości do iloczynu silni.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/multinomial-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Argument liczba1 jest wymagany, pozostałe są opcjonalne. Od 1 do 255 wartości, dla których należy obliczyć wielomian.' },
            number2: { name: 'number2', detail: 'Argument liczba1 jest wymagany, pozostałe są opcjonalne. Od 1 do 255 wartości, dla których należy obliczyć wielomian.' },
        },
    },
    MUNIT: {
        description: 'Funkcja MACIERZ.JEDNOSTKOWA zwraca macierz jednostkową dla określonego wymiaru.',
        abstract: 'Funkcja MACIERZ.JEDNOSTKOWA zwraca macierz jednostkową dla określonego wymiaru.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/munit-function',
            },
        ],
        functionParameter: {
            dimension: { name: 'dimension', detail: 'Liczba całkowita określająca wymiar macierzy jednostkowej, która ma zostać zwrócona. Funkcja zwraca tablicę. Wymiar musi być większy od zera.' },
        },
    },
    ODD: {
        description: 'Zwraca wartość liczby zaokrągloną w górę do najbliższej nieparzystej liczby całkowitej.',
        abstract: 'Zwraca wartość liczby zaokrągloną w górę do najbliższej nieparzystej liczby całkowitej.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/odd-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Wymagane. Wartość do zaokrąglenia.' },
        },
    },
    PI: {
        description: 'Zwraca liczbę 3,14159265358979, stałą matematyczną pi, z dokładnością do 15 cyfr.',
        abstract: 'Zwraca liczbę 3,14159265358979, stałą matematyczną pi, z dokładnością do 15 cyfr.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/pi-function',
            },
        ],
        functionParameter: {
        },
    },
    POWER: {
        description: 'Zwraca wartość liczby podniesionej do potęgi.',
        abstract: 'Zwraca wartość liczby podniesionej do potęgi.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/power-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Podstawa potęgi. Może to być dowolna liczba rzeczywista.' },
            power: { name: 'power', detail: 'Wymagane. Wykładnik potęgi, do której jest podnoszona podstawa.' },
        },
    },
    PRODUCT: {
        description: 'Funkcja ILOCZYN mnoży wszystkie liczby podane jako argumenty i zwraca iloczyn. Jeśli na przykład komórki A1 i A2 zawierają liczby, możesz użyć formuły =ILOCZYN(A1; A2), aby pomnożyć te dwie liczby razem. Tę samą operację można również wykonać za pomocą operatora matematycznego mnożenia ( * ), na przykład =A1 * A2 .',
        abstract: 'Funkcja ILOCZYN mnoży wszystkie liczby podane jako argumenty i zwraca iloczyn. Jeśli na przykład komórki A1 i A2 zawierają liczby, możesz użyć formuły =ILOCZYN(A1; A2), aby pomnożyć te dwie liczby razem. Tę samą operację można również wykonać za pomocą operatora matematycznego mnożenia ( * ), na przykład =A1 * A2 .',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/product-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Wymagane. Pierwsza liczba lub zakres, który chcesz pomnożyć.' },
            number2: { name: 'number2', detail: 'Opcjonalne. Można podać do 255 argumentów.' },
        },
    },
    QUOTIENT: {
        description: 'Zwraca całkowitą część z dzielenia. Należy z niej korzystać, aby odrzucić resztę z dzielenia.',
        abstract: 'Zwraca całkowitą część z dzielenia. Należy z niej korzystać, aby odrzucić resztę z dzielenia.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/quotient-function',
            },
        ],
        functionParameter: {
            numerator: { name: 'numerator', detail: 'Wymagane. Dzielna.' },
            denominator: { name: 'denominator', detail: 'Wymagane. Dzielnik.' },
        },
    },
    RADIANS: {
        description: 'Konwertuje stopnie na radiany.',
        abstract: 'Konwertuje stopnie na radiany.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/radians-function',
            },
        ],
        functionParameter: {
            angle: { name: 'angle', detail: 'Wymagane. Kąt, który ma zostać przekonwertowany, określony w stopniach.' },
        },
    },
    RAND: {
        description: 'Funkcja LOS zwraca losową liczbę rzeczywistą o równomiernym rozkładzie, która jest większa niż lub równa 0 i mniejsza od 1. Nowa losowa liczba rzeczywista jest zwracana po każdym obliczeniu arkusza.',
        abstract: 'Funkcja LOS zwraca losową liczbę rzeczywistą o równomiernym rozkładzie, która jest większa niż lub równa 0 i mniejsza od 1. Nowa losowa liczba rzeczywista jest zwracana po każdym obliczeniu arkusza.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/rand-function',
            },
        ],
        functionParameter: {
        },
    },
    RANDARRAY: {
        description: 'W poniższym przykładzie utworzono tablicę o wysokości 5 wierszy i szerokości 3 kolumn. Pierwszy zwraca losowy zestaw wartości od 0 do 1, czyli domyślne wartości funkcji LOSOWA.TABLICA. Następny zwraca serię losowych wartości dziesiętnych między 1 a 100. Trzeci przykład zwraca serię losowych liczb całkowitych między 1 a 100.',
        abstract: 'W poniższym przykładzie utworzono tablicę o wysokości 5 wierszy i szerokości 3 kolumn. Pierwszy zwraca losowy zestaw wartości od 0 do 1, czyli domyślne wartości funkcji LOSOWA.TABLICA. Następny zwraca serię losowych wartości dziesiętnych między 1 a 100. Trzeci przykład zwraca serię losowych liczb całkowitych między 1 a 100.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/randarray-function',
            },
        ],
        functionParameter: {
            rows: { name: 'rows', detail: 'Liczba wierszy do zwrócenia' },
            columns: { name: 'columns', detail: 'Liczba kolumn do zwrócenia' },
            min: { name: 'min', detail: 'Wartość minimalna oczekiwanej liczby' },
            max: { name: 'max', detail: 'Wartość maksymalna oczekiwanej liczby' },
            wholeNumber: { name: 'whole_number', detail: 'Zwraca liczbę całkowitą lub wartość dziesiętną PRAWDA dla liczby całkowitej. FAŁSZ dla liczby dziesiętnej' },
        },
    },
    RANDBETWEEN: {
        description: 'Zwraca losową liczbę całkowitą z wybranego zakresu liczb. Przy każdym obliczaniu arkusza jest zwracana nowa losowa liczba całkowita.',
        abstract: 'Zwraca losową liczbę całkowitą z wybranego zakresu liczb. Przy każdym obliczaniu arkusza jest zwracana nowa losowa liczba całkowita.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/randbetween-function',
            },
        ],
        functionParameter: {
            bottom: { name: 'bottom', detail: 'Wymagane. Najmniejsza liczba całkowita, jaką może zwrócić funkcja LOS.ZAKR.' },
            top: { name: 'top', detail: 'Wymagane. Największa liczba całkowita, jaką może zwrócić funkcja LOS.ZAKR.' },
        },
    },
    ROMAN: {
        description: 'Konwertuje cyfry arabskie na rzymskie, jako tekst.',
        abstract: 'Konwertuje cyfry arabskie na rzymskie, jako tekst.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/roman-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Liczba zapisana w systemie cyfr arabskich, która ma zostać przekonwertowana.' },
            form: { name: 'form', detail: 'Opcjonalne. Liczba określająca rodzaj cyfr rzymskich, które zostaną użyte. Istnieją różne typy cyfr rzymskich, od klasycznych do uproszczonych, które stają się bardziej zwarte wraz ze wzrostem wartości formy. Zobacz przykłady form następujących po ciągu RZYMSKIE(499;0) poniżej.' },
        },
    },
    ROUND: {
        description: 'Funkcja ZAOKR zaokrągla liczbę do określonej liczby cyfr. Aby na przykład zaokrąglić liczbę 23,7825 znajdującą się w komórce A1 do dwóch miejsc dziesiętnych, można użyć następującej formuły:',
        abstract: 'Funkcja ZAOKR zaokrągla liczbę do określonej liczby cyfr. Aby na przykład zaokrąglić liczbę 23,7825 znajdującą się w komórce A1 do dwóch miejsc dziesiętnych, można użyć następującej formuły:',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/round-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Wymagane. Liczba, która ma zostać zaokrąglona.' },
            numDigits: { name: 'num_digits', detail: 'Wymagane. Liczba cyfr, do której liczba ma zostać zaokrąglony argument number.' },
        },
    },
    ROUNDBANK: {
        description: 'Zaokrągla liczbę metodą zaokrąglania bankierskiego.',
        abstract: 'Zaokrągla liczbę metodą zaokrąglania bankierskiego.',
        links: [
            {
                title: 'Instruction',
                url: '',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Liczba, którą chcesz zaokrąglić metodą zaokrąglania bankierskiego.' },
            numDigits: { name: 'num_digits', detail: 'Liczba cyfr, do których chcesz zaokrąglić metodą zaokrąglania bankierskiego.' },
        },
    },
    ROUNDDOWN: {
        description: 'Zaokrągla liczbę w dół w kierunku zera.',
        abstract: 'Zaokrągla liczbę w dół w kierunku zera.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/rounddown-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Dowolna liczba rzeczywista, która ma zostać zaokrąglona w dół.' },
            numDigits: { name: 'num_digits', detail: 'Wymagane. Liczba cyfr, do których liczba ma zostać zaokrąglona.' },
        },
    },
    ROUNDUP: {
        description: 'Zaokrągla liczbę w górę, dalej od zera.',
        abstract: 'Zaokrągla liczbę w górę, dalej od zera.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/roundup-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Dowolna liczba rzeczywista, która ma zostać zaokrąglona w górę.' },
            numDigits: { name: 'num_digits', detail: 'Wymagane. Liczba cyfr, do których liczba ma zostać zaokrąglona.' },
        },
    },
    SEC: {
        description: 'Zwraca sekans kąta.',
        abstract: 'Zwraca sekans kąta.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/sec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Kąt w radianach, którego sekans chcesz obliczyć.' },
        },
    },
    SECH: {
        description: 'Zwraca sekans hiperboliczny kąta.',
        abstract: 'Zwraca sekans hiperboliczny kąta.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/sech-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Kąt w radianach, którego sekans hiperboliczny chcesz obliczyć.' },
        },
    },
    SERIESSUM: {
        description: 'Wiele funkcji można aproksymować przy pomocy rozwinięć w szeregi potęgowe.',
        abstract: 'Wiele funkcji można aproksymować przy pomocy rozwinięć w szeregi potęgowe.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/seriessum-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Argument wymagany. Wartość początkowa dla szeregów potęgowych.' },
            n: { name: 'n', detail: 'Argument wymagany. Początkowa potęga, do której zostanie podniesiona wartość x.' },
            m: { name: 'm', detail: 'Argument wymagany. Krok, o który wzrasta n w każdym kolejnym składniku szeregu.' },
            coefficients: { name: 'coefficients', detail: 'Wymagane. Zbiory współczynników, przez które jest mnożona każda kolejna potęga x. Liczba wartości we współczynnikach określa liczbę składników w szeregach potęgowych. Jeśli na przykład we współczynnikach występują trzy wartości, to w szeregach potęgowych będą trzy składniki.' },
        },
    },
    SEQUENCE: {
        description: 'W poniższym przykładzie stworzyliśmy tablicę mającą 4 wiersze i 5 kolumn, stosując funkcję =SEKWENCJA(4,5) .',
        abstract: 'W poniższym przykładzie stworzyliśmy tablicę mającą 4 wiersze i 5 kolumn, stosując funkcję =SEKWENCJA(4,5) .',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/sequence-function',
            },
        ],
        functionParameter: {
            rows: { name: 'rows', detail: 'Liczba wierszy do zwrócenia' },
            columns: { name: 'columns', detail: 'Liczba kolumn do zwrócenia' },
            start: { name: 'start', detail: 'Pierwsza liczba w sekwencji' },
            step: { name: 'step', detail: 'Wartość rosnąca wraz z każdą kolejną wartością w tablicy' },
        },
    },
    SIGN: {
        description: 'Określa znak liczby. Funkcja zwraca wartość 1, jeśli liczba jest dodatnia, oraz wartość 0, jeśli liczba jest ujemna.',
        abstract: 'Określa znak liczby. Funkcja zwraca wartość 1, jeśli liczba jest dodatnia, oraz wartość 0, jeśli liczba jest ujemna.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/sign-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Dowolna liczba rzeczywista.' },
        },
    },
    SIN: {
        description: 'Zwraca sinus podanego kąta.',
        abstract: 'Zwraca sinus podanego kąta.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/sin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Kąt w radianach, dla którego ma zostać obliczony sinus.' },
        },
    },
    SINH: {
        description: 'Zwraca sinus hiperboliczny liczby.',
        abstract: 'Zwraca sinus hiperboliczny liczby.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/sinh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Dowolna liczba rzeczywista.' },
        },
    },
    SQRT: {
        description: 'Zwraca dodatni pierwiastek kwadratowy liczby.',
        abstract: 'Zwraca dodatni pierwiastek kwadratowy liczby.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/sqrt-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Liczba, dla której zostanie obliczony pierwiastek kwadratowy.' },
        },
    },
    SQRTPI: {
        description: 'Zwraca pierwiastek kwadratowy z (liczba * pi).',
        abstract: 'Zwraca pierwiastek kwadratowy z (liczba * pi).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/sqrtpi-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Liczba, przez którą jest mnożona liczba pi.' },
        },
    },
    SUBTOTAL: {
        description: 'Zwraca sumę częściową na liście lub w bazie danych. Na ogół listę z sumami częściowymi można łatwiej utworzyć, używając polecenia Suma częściowa dostępnego w grupie Konspekt na karcie Dane w aplikacji komputerowej programu Excel. Po utworzeniu listy z sumami częściowymi można ją modyfikować, edytując funkcję SUMY.CZĘŚCIOWE.',
        abstract: 'Zwraca sumę częściową na liście lub w bazie danych. Na ogół listę z sumami częściowymi można łatwiej utworzyć, używając polecenia Suma częściowa dostępnego w grupie Konspekt na karcie Dane w aplikacji komputerowej programu Excel. Po utworzeniu listy z sumami częściowymi można ją modyfikować, edytując funkcję SUMY.CZĘŚCIOWE.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/subtotal-function',
            },
        ],
        functionParameter: {
            functionNum: { name: 'function_num', detail: 'Wymagane. Liczba 1–11 lub 101–111 określająca funkcję dla sumy częściowej. Od 1 do 11 zawiera ukryte ręcznie wiersze, natomiast wiersze 101-111 nie są z nich wykluczone; odfiltrowane komórki są zawsze wykluczone.' },
            ref1: { name: 'ref1', detail: 'Wymagane. Pierwszy nazwany zakres lub odwołanie, dla którego ma zostać obliczona suma częściowa.' },
            ref2: { name: 'ref2', detail: 'Opcjonalne. Od 2 do 254 nazwanych zakresów lub odwołań, dla których ma zostać obliczona suma częściowa.' },
        },
    },
    SUM: {
        description: 'Funkcja SUMA dodaje wartości. Możesz dodawać pojedyncze wartości, odwołania do komórek lub zakresów lub połączenie tych wszystkich trzech typów wyrażeń.',
        abstract: 'Funkcja SUMA dodaje wartości. Możesz dodawać pojedyncze wartości, odwołania do komórek lub zakresów lub połączenie tych wszystkich trzech typów wyrażeń.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/sum-function',
            },
        ],
        functionParameter: {
            number1: { name: 'Number 1', detail: 'Pierwsza liczba, którą chcesz dodać. Liczba może być taka jak 4, odwołanie do komórki, na przykład B6, lub zakres komórek, taki jak B2:B8.' },
            number2: { name: 'Number 2', detail: 'Druga liczba, którą chcesz dodać. W ten sposób możesz określić do 255 liczb.' },
        },
    },
    SUMIF: {
        description: 'Funkcja SUMA.JEŻELI służy do sumowania wartości z zakresu spełniającego określone kryteria. Załóżmy na przykład, że mają zostać zsumowane liczby z danej kolumny, które są większe od 5. Możesz użyć następującej formuły: =SUMA.JEŻELI(B2:B25;">5")',
        abstract: 'Funkcja SUMA.JEŻELI służy do sumowania wartości z zakresu spełniającego określone kryteria. Załóżmy na przykład, że mają zostać zsumowane liczby z danej kolumny, które są większe od 5. Możesz użyć następującej formuły: =SUMA.JEŻELI(B2:B25;">5")',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/sumif-function',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'Wymagane. Jest to zakres komórek, do których zostaną zastosowane kryteria. Komórki w każdym zakresie muszą być liczbami lub nazwami, tablicami albo odwołaniami zawierającymi liczby. Wartości puste i wartości tekstowe są ignorowane. Wybrany zakres może zawierać daty w standardowym formacie programu Excel (przykłady poniżej).' },
            criteria: { name: 'criteria', detail: 'Wymagane. Są to kryteria w postaci liczby, wyrażenia, odwołania do komórki, tekstu lub funkcji określającej, które komórki będą dodawane. Można dołączyć symbole wieloznaczne — znak zapytania (?), aby dopasować dowolny pojedynczy znak, gwiazdkę (*), aby dopasować ją do dowolnej sekwencji znaków. Jeśli chcesz znaleźć rzeczywisty znak zapytania lub gwiazdkę, wpisz tyldę ( ~ ) poprzedzającą znak. Kryteria można wyrazić na przykład jako 32, ">32", B5, "3?", "jabłko*", "*~?" lub DZIŚ(). Ważne Wszelkie kryteria tekstowe oraz zawierające symbole matematyczne lub logiczne należy ująć w podwójny cudzysłów ( " ). Kryteria liczbowe nie wymagają cudzysłowów.' },
            sumRange: { name: 'sum_range', detail: 'Opcjonalne. Rzeczywiste komórki do dodania, jeśli chcesz dodać komórki inne niż te określone w arguencie zakres . Jeśli argument sum_range zostanie pominięty, program Excel doda komórki określone w arguencie zakres (te same komórki, do których zastosowano kryteria). Sum_range powinny mieć taki sam rozmiar i kształt jak zakres . Jeśli tak nie jest, może to oznaczać spadek wydajności, a formuła zsumuje zakres komórek, który zaczyna się od pierwszej komórki w sum_range ale ma takie same wymiary jak zakres . Na przykład: zakres suma_zakres Rzeczywiste sumowane komórki A1:A5 B1:B5 B1:B5 A1:A5 B1:K5 B1:B5' },
        },
    },
    SUMIFS: {
        description: 'Funkcja SUMA.WARUNKÓW, jedna z funkcji matematycznych i trygonometrycznych , dodaje wszystkie argumenty, które spełniają wiele kryteriów. Funkcji SUMA.WARUNKÓW można użyć na przykład do zsumowania sprzedawców w kraju, których (1) adres zamieszkania obejmuje ten sam kod pocztowy oraz (2) których zyski przekraczają określoną wartość w dolarach.',
        abstract: 'Funkcja SUMA.WARUNKÓW, jedna z funkcji matematycznych i trygonometrycznych , dodaje wszystkie argumenty, które spełniają wiele kryteriów. Funkcji SUMA.WARUNKÓW można użyć na przykład do zsumowania sprzedawców w kraju, których (1) adres zamieszkania obejmuje ten sam kod pocztowy oraz (2) których zyski przekraczają określoną wartość w dolarach.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/sumifs-function',
            },
        ],
        functionParameter: {
            sumRange: { name: 'sum_range', detail: 'Zakres komórek do zsumowania.' },
            criteriaRange1: { name: 'criteria_range1', detail: 'Zakres, który jest sprawdzany przy użyciu argumentu kryteria1 . Criteria_range1 i kryteria1 tworzą parę wyszukiwania, w której zakres jest wyszukiwany w poszukiwaniu określonych kryteriów. Po znalezieniu elementów w zakresie zostaną dodane odpowiadające im wartości w Sum_range .' },
            criteria1: { name: 'criteria1', detail: 'Kryteria określające, które komórki w Criteria_range1 zostaną dodane. Kryteria można wprowadzić na przykład jako 32 , ">32" , B4 , "jabłka" lub "32".' },
            criteriaRange2: { name: 'criteriaRange2', detail: 'Dodatkowe zakresy i skojarzone z nimi kryteria. Maksymalnie można wprowadzić 127 par zakres/kryteria.' },
            criteria2: { name: 'criteria2', detail: 'Dodatkowe zakresy i skojarzone z nimi kryteria. Maksymalnie można wprowadzić 127 par zakres/kryteria.' },
        },
    },
    SUMPRODUCT: {
        description: 'Funkcja SUMA.ILOCZYNÓW odpowiada wszystkim wystąpieniom elementu Y/Rozmiar M i sumuje je, dlatego w tym przykładzie 21 plus 41 równa się 62.',
        abstract: 'Funkcja SUMA.ILOCZYNÓW odpowiada wszystkim wystąpieniom elementu Y/Rozmiar M i sumuje je, dlatego w tym przykładzie 21 plus 41 równa się 62.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/sumproduct-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array', detail: 'Pierwszy argument tablicy, której elementy zostaną pomnożone, a następnie zsumowane.' },
            array2: { name: 'array', detail: 'Od 2 do 255 tablic, których elementy zostaną pomnożone, a następnie zsumowane.' },
        },
    },
    SUMSQ: {
        description: 'Zwraca sumę kwadratów argumentów.',
        abstract: 'Zwraca sumę kwadratów argumentów.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/sumsq-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Argument liczba1 jest wymagany. Kolejne liczby są opcjonalne. Może istnieć nawet 255 argumentów, dla których należy obliczyć sumę kwadratów.' },
            number2: { name: 'number2', detail: 'Argument liczba1 jest wymagany. Kolejne liczby są opcjonalne. Może istnieć nawet 255 argumentów, dla których należy obliczyć sumę kwadratów.' },
        },
    },
    SUMX2MY2: {
        description: 'Ta funkcja programu Excel zwraca sumę różnic kwadratów odpowiadających sobie wartości w dwóch tablicach.',
        abstract: 'Ta funkcja programu Excel zwraca sumę różnic kwadratów odpowiadających sobie wartości w dwóch tablicach.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/sumx2my2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'array_x', detail: 'Wymagane. Pierwsza tablica lub pierwszy zakres wartości.' },
            arrayY: { name: 'array_y', detail: 'Wymagane. Druga tablica lub drugi zakres wartości.' },
        },
    },
    SUMX2PY2: {
        description: 'Zwraca sumę sum kwadratów odpowiadających sobie wartości w dwóch tablicach. Suma sum kwadratów jest często wykorzystywana jako składnik w wielu obliczeniach statystycznych.',
        abstract: 'Zwraca sumę sum kwadratów odpowiadających sobie wartości w dwóch tablicach. Suma sum kwadratów jest często wykorzystywana jako składnik w wielu obliczeniach statystycznych.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/sumx2py2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'array_x', detail: 'Wymagane. Pierwsza tablica lub pierwszy zakres wartości.' },
            arrayY: { name: 'array_y', detail: 'Wymagane. Druga tablica lub drugi zakres wartości.' },
        },
    },
    SUMXMY2: {
        description: 'Funkcja SUMXMY2 zwraca sumę kwadratów różnic odpowiadających sobie wartości w dwóch tablicach.',
        abstract: 'Funkcja SUMXMY2 zwraca sumę kwadratów różnic odpowiadających sobie wartości w dwóch tablicach.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/sumxmy2-function',
            },
        ],
        functionParameter: {
            arrayX: { name: 'array_x', detail: 'Pierwsza tablica lub pierwszy zakres wartości. Argument wymagany.' },
            arrayY: { name: 'array_y', detail: 'Druga tablica lub drugi zakres wartości. Argument wymagany.' },
        },
    },
    TAN: {
        description: 'Zwraca tangens podanego kąta.',
        abstract: 'Zwraca tangens podanego kąta.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/tan-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Kąt w radianach, dla którego należy obliczyć tangens.' },
        },
    },
    TANH: {
        description: 'Zwraca tangens hiperboliczny liczby.',
        abstract: 'Zwraca tangens hiperboliczny liczby.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/tanh-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Dowolna liczba rzeczywista.' },
        },
    },
    TRUNC: {
        description: 'Funkcje TRUNC obcinają liczbę do liczby całkowitej, usuwając część ułamkową liczby.',
        abstract: 'Funkcje TRUNC obcinają liczbę do liczby całkowitej, usuwając część ułamkową liczby.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/trunc-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Liczba, którą należy obciąć.' },
            numDigits: { name: 'num_digits', detail: 'Opcjonalne. Liczba określająca dokładność obcinania. Argument liczba_cyfr przyjmuje domyślnie wartość 0 (zero).' },
        },
    },
};

export default locale;
