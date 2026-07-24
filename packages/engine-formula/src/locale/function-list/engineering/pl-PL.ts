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
    BESSELI: {
        description: 'Zwraca wartość zmodyfikowanej funkcji Bessela, równoważnej funkcji Bessela dla czysto urojonych argumentów.',
        abstract: 'Zwraca wartość zmodyfikowanej funkcji Bessela, równoważnej funkcji Bessela dla czysto urojonych argumentów.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/besseli-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'Argument wymagany. Wartość, dla której ta funkcja ma zostać obliczona.' },
            n: { name: 'N', detail: 'Argument wymagany. Rząd funkcji Bessela. Jeśli n nie jest całkowite, jego wartość podlega obcięciu do liczby całkowitej.' },
        },
    },
    BESSELJ: {
        description: 'Zwraca wartość funkcji Bessela.',
        abstract: 'Zwraca wartość funkcji Bessela.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/besselj-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'Argument wymagany. Wartość, dla której ta funkcja ma zostać obliczona.' },
            n: { name: 'N', detail: 'Argument wymagany. Rząd funkcji Bessela. Jeśli n nie jest całkowite, jego wartość podlega obcięciu do liczby całkowitej.' },
        },
    },
    BESSELK: {
        description: 'Zwraca wartość zmodyfikowanej funkcji Bessela, równoważną wartości funkcji Bessela dla czysto urojonych argumentów.',
        abstract: 'Zwraca wartość zmodyfikowanej funkcji Bessela, równoważną wartości funkcji Bessela dla czysto urojonych argumentów.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/besselk-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'Argument wymagany. Wartość, dla której ta funkcja ma zostać obliczona.' },
            n: { name: 'N', detail: 'Argument wymagany. Rząd funkcji. Jeśli n nie jest całkowite, jego wartość podlega obcięciu do liczby całkowitej.' },
        },
    },
    BESSELY: {
        description: 'Zwraca wartość funkcji Bessela, znanej także jako funkcja Webera albo funkcja Neumanna.',
        abstract: 'Zwraca wartość funkcji Bessela, znanej także jako funkcja Webera albo funkcja Neumanna.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/bessely-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'Argument wymagany. Wartość, dla której ta funkcja ma zostać obliczona.' },
            n: { name: 'N', detail: 'Argument wymagany. Rząd funkcji. Jeśli n nie jest całkowite, jego wartość podlega obcięciu do liczby całkowitej.' },
        },
    },
    BIN2DEC: {
        description: 'Konwertuje liczby dwójkowe na dziesiętne.',
        abstract: 'Konwertuje liczby dwójkowe na dziesiętne.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/bin2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Liczba dwójkowa, która ma zostać poddana konwersji. Liczba nie może zawierać więcej niż 10 znaków (10 bitów). Najbardziej znaczący bit liczby jest bitem znaku. Pozostałe 9 bitów reprezentuje wielkość. Liczby ujemne przedstawia się w zapisie dopełnienia do dwóch.' },
        },
    },
    BIN2HEX: {
        description: 'Konwertuje liczbę w kodzie dwójkowym na liczbę w kodzie szesnastkowym.',
        abstract: 'Konwertuje liczbę w kodzie dwójkowym na liczbę w kodzie szesnastkowym.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/bin2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Liczba dwójkowa, która ma zostać poddana konwersji. Liczba nie może zawierać więcej niż 10 znaków (10 bitów). Najbardziej znaczący bit liczby jest bitem znaku. Pozostałe 9 bitów reprezentuje wielkość. Liczby ujemne są reprezentowane przy użyciu zapisu z dopełnieniem do dwóch.' },
            places: { name: 'places', detail: 'Opcjonalne. Liczba znaków do użycia. Jeśli argument „miejsca” zostanie pominięty, funkcja DWÓJK.NA.SZESN użyje najmniejszej niezbędnej liczby znaków. Wygodnie jest stosować argument „miejsca” w celu uzupełniania wyliczonej wartości poprzedzającymi 0 (zerami).' },
        },
    },
    BIN2OCT: {
        description: 'Konwertuje liczbę w kodzie dwójkowym na liczbę w kodzie ósemkowym.',
        abstract: 'Konwertuje liczbę w kodzie dwójkowym na liczbę w kodzie ósemkowym.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/bin2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Liczba dwójkowa, która ma zostać poddana konwersji. Liczba nie może zawierać więcej niż 10 znaków (10 bitów). Najbardziej znaczący bit liczby jest bitem znaku. Pozostałe 9 bitów reprezentuje wielkość. Liczby ujemne są reprezentowane przy użyciu zapisu z dopełnieniem do dwóch.' },
            places: { name: 'places', detail: 'Opcjonalne. Liczba znaków do użycia. Jeśli argument „miejsca” zostanie pominięty, funkcja DWÓJK.NA.ÓSM użyje najmniejszej niezbędnej liczby znaków. Wygodnie jest stosować argument „miejsca” w celu uzupełniania wyliczonej wartości poprzedzającymi 0 (zerami).' },
        },
    },
    BITAND: {
        description: 'Zwraca wartość operacji bitowej ORAZ (AND) dla dwóch liczb.',
        abstract: 'Zwraca wartość operacji bitowej ORAZ (AND) dla dwóch liczb.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/bitand-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Wymagane. Musi to być liczba dziesiętna większa niż lub równa 0.' },
            number2: { name: 'number2', detail: 'Wymagane. Musi to być liczba dziesiętna większa niż lub równa 0.' },
        },
    },
    BITLSHIFT: {
        description: 'Zwraca liczbę przesuniętą w lewo o określoną liczbę bitów.',
        abstract: 'Zwraca liczbę przesuniętą w lewo o określoną liczbę bitów.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/bitlshift-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Musi to być liczba całkowita większa niż lub równa 0.' },
            shiftAmount: { name: 'shift_amount', detail: 'Wymagane. Argument wartość_przesunięcia musi być liczbą całkowitą.' },
        },
    },
    BITOR: {
        description: 'Zwraca wartość operacji bitowej LUB (OR) dla dwóch liczb.',
        abstract: 'Zwraca wartość operacji bitowej LUB (OR) dla dwóch liczb.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/bitor-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Wymagane. Musi to być liczba dziesiętna większa niż lub równa 0.' },
            number2: { name: 'number2', detail: 'Wymagane. Musi to być liczba dziesiętna większa niż lub równa 0.' },
        },
    },
    BITRSHIFT: {
        description: 'Zwraca liczbę przesuniętą w prawo o określoną liczbę bitów.',
        abstract: 'Zwraca liczbę przesuniętą w prawo o określoną liczbę bitów.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/bitrshift-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Musi to być liczba całkowita większa niż lub równa 0.' },
            shiftAmount: { name: 'shift_amount', detail: 'Wymagane. Musi to być liczba całkowita.' },
        },
    },
    BITXOR: {
        description: 'Zwraca wartość operacji bitowej alternatywy wykluczającej (XOR) dla dwóch liczb.',
        abstract: 'Zwraca wartość operacji bitowej alternatywy wykluczającej (XOR) dla dwóch liczb.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/bitxor-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Wymagane. Musi być większy lub równy 0.' },
            number2: { name: 'number2', detail: 'Wymagane. Musi być większy lub równy 0.' },
        },
    },
    COMPLEX: {
        description: 'Konwertuje części rzeczywistą i urojoną na liczbę zespoloną o postaci x + yi lub x + yj.',
        abstract: 'Konwertuje części rzeczywistą i urojoną na liczbę zespoloną o postaci x + yi lub x + yj.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/complex-function',
            },
        ],
        functionParameter: {
            realNum: { name: 'real_num', detail: 'Wymagane. Część rzeczywista liczby zespolonej.' },
            iNum: { name: 'i_num', detail: 'Wymagane. Część urojona liczby zespolonej.' },
            suffix: { name: 'suffix', detail: 'Opcjonalne. Sufiks części urojonej liczby zespolonej. Jeśli zostanie pominięty, zakłada się, że sufiksem jest „i”.' },
        },
    },
    CONVERT: {
        description: 'Konwertuje liczbę z jednego systemu miar na inny. Na przykład za pomocą funkcji KONWERTUJ można przeliczyć tabelę odległości w milach na tabelę odległości w kilometrach.',
        abstract: 'Konwertuje liczbę z jednego systemu miar na inny. Na przykład za pomocą funkcji KONWERTUJ można przeliczyć tabelę odległości w milach na tabelę odległości w kilometrach.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/convert-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Wartość w from_unit do przekonwertowania.' },
            fromUnit: { name: 'from_unit', detail: 'Jednostka dla number.' },
            toUnit: { name: 'to_unit', detail: 'Jednostka wyniku.' },
        },
    },
    DEC2BIN: {
        description: 'Konwertuje liczbę dziesiętną na format binarny.',
        abstract: 'Konwertuje liczbę dziesiętną na format binarny.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/dec2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Dziesiętna liczba całkowita, która ma zostać przekonwertowana. Jeśli liczba jest ujemna, argument „miejsca” jest ignorowany, a funkcja DZIES.NA.DWÓJK zwraca 10-znakową (10-bitów) liczbę binarną, w której najbardziej znaczący bit jest bitem znaku. Pozostałe 9 bitów reprezentuje wielkość. Liczby ujemne są reprezentowane przy użyciu zapisu z dopełnieniem do dwóch.' },
            places: { name: 'places', detail: 'Opcjonalne. Liczba znaków do użycia. Jeśli argument „miejsca” zostanie pominięty, funkcja DZIES.NA.DWÓJK użyje najmniejszej niezbędnej liczby znaków. Wygodnie jest stosować argument „miejsca” w celu uzupełniania wyliczonej wartości poprzedzającymi 0 (zerami).' },
        },
    },
    DEC2HEX: {
        description: 'Konwertuje liczbę dziesiętną na format szesnastkowy.',
        abstract: 'Konwertuje liczbę dziesiętną na format szesnastkowy.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/dec2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Dziesiętna liczba całkowita, która ma zostać przekonwertowana. Jeśli liczba jest ujemna, argument „miejsca” jest ignorowany, a funkcja DZIES.NA.SZESN zwraca 10-znakową (40-bitów) liczbę szesnastkową, w której najbardziej znaczący bit jest bitem znaku. Pozostałe 39 bitów reprezentuje wartość. Liczby ujemne są reprezentowane przy użyciu zapisu z dopełnieniem do dwóch.' },
            places: { name: 'places', detail: 'Opcjonalne. Liczba znaków do użycia. Jeśli argument „miejsca” zostanie pominięty, funkcja DZIES.NA.SZESN użyje najmniejszej niezbędnej liczby znaków. Wygodnie jest stosować argument „miejsca” w celu uzupełniania wyliczonej wartości poprzedzającymi 0 (zerami).' },
        },
    },
    DEC2OCT: {
        description: 'Konwertuje liczbę dziesiętną na format ósemkowy.',
        abstract: 'Konwertuje liczbę dziesiętną na format ósemkowy.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/dec2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Dziesiętna liczba całkowita, która ma zostać przekonwertowana. Jeżeli liczba jest ujemna, argument „miejsca” jest ignorowany, a funkcja DZIES.NA.ÓSM zwraca 10-znakową (30-bitów) liczbę ósemkową, w której najbardziej znaczący bit jest bitem znaku. Pozostałe 29 bitów reprezentuje wartość. Liczby ujemne są reprezentowane przy użyciu zapisu z dopełnieniem do dwóch.' },
            places: { name: 'places', detail: 'Argument opcjonalny. Liczba znaków do użycia. Jeśli argument „miejsca” zostanie pominięty, funkcja DZIES.NA.ÓSM użyje najmniejszej niezbędnej liczby znaków. Wygodnie jest stosować argument „miejsca” w celu uzupełniania wyliczonej wartości poprzedzającymi 0 (zerami).' },
        },
    },
    DELTA: {
        description: 'Sprawdza, czy dwie wartości są równe. Zwraca 1, jeżeli liczba1 = liczba2 lub zwraca 0 w przeciwnym przypadku. Funkcji tej należy używać do filtrowania zbioru wartości. Na przykład, sumując kilka funkcji CZY.RÓWNE, można obliczyć liczbę par równych wartości. Ta funkcja jest również zwana funkcją delta Kroneckera.',
        abstract: 'Sprawdza, czy dwie wartości są równe. Zwraca 1, jeżeli liczba1 = liczba2 lub zwraca 0 w przeciwnym przypadku. Funkcji tej należy używać do filtrowania zbioru wartości. Na przykład, sumując kilka funkcji CZY.RÓWNE, można obliczyć liczbę par równych wartości. Ta funkcja jest również zwana funkcją delta Kroneckera.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/delta-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Wymagane. Pierwsza z porównywanych wartości.' },
            number2: { name: 'number2', detail: 'Opcjonalne. Druga z porównywanych wartości. Jeżeli argument liczba2 zostanie pominięty, przyjmuje się, że jest równy zero.' },
        },
    },
    ERF: {
        description: 'Zwraca wartość funkcji błędu scałkowanej w przedziale dolna_granica i górna_granica.',
        abstract: 'Zwraca wartość funkcji błędu scałkowanej w przedziale dolna_granica i górna_granica.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/erf-function',
            },
        ],
        functionParameter: {
            lowerLimit: { name: 'lower_limit', detail: 'Wymagane. Dolna granica całkowania funkcji FUNKCJA.BŁ.' },
            upperLimit: { name: 'upper_limit', detail: 'Opcjonalne. Górna granica całkowania funkcji FUNKCJA.BŁ. Jeśli zostanie pominięta, funkcja FUNKCJA.BŁ będzie całkować pomiędzy wartościami zero a dolna_granica.' },
        },
    },
    ERF_PRECISE: {
        description: 'Zwraca wartość funkcji błędu.',
        abstract: 'Zwraca wartość funkcji błędu.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/erf-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Argument wymagany. Dolna granica na potrzeby całkowania funkcji FUNKCJA.BŁ.DOKŁ.' },
        },
    },
    ERFC: {
        description: 'Zwraca wartość dopełniającej funkcji FUNKCJA.BŁ scałkowanej w przedziale od x do nieskończoności.',
        abstract: 'Zwraca wartość dopełniającej funkcji FUNKCJA.BŁ scałkowanej w przedziale od x do nieskończoności.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/erfc-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Argument wymagany. Dolna granica całkowania funkcji FUNKCJA.BŁ.' },
        },
    },
    ERFC_PRECISE: {
        description: 'Zwraca wartość dopełniającej funkcji FUNKCJA.BŁ scałkowanej w przedziale od x do nieskończoności.',
        abstract: 'Zwraca wartość dopełniającej funkcji FUNKCJA.BŁ scałkowanej w przedziale od x do nieskończoności.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/erfc-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Argument wymagany. Dolna granica na potrzeby całkowania funkcji KOMP.FUNKCJA.BŁ.DOKŁ.' },
        },
    },
    GESTEP: {
        description: 'Zwraca liczbę 1, jeśli argument liczba ≥ argument próg; w przeciwnym razie zwraca liczbę zero (0). Funkcja ta jest przydatna do filtrowania zbioru wartości. Na przykład przez zsumowanie szeregu funkcji SPRAWDŹ.PRÓG można obliczyć liczbę wartości przekraczających próg.',
        abstract: 'Zwraca liczbę 1, jeśli argument liczba ≥ argument próg; w przeciwnym razie zwraca liczbę zero (0). Funkcja ta jest przydatna do filtrowania zbioru wartości. Na przykład przez zsumowanie szeregu funkcji SPRAWDŹ.PRÓG można obliczyć liczbę wartości przekraczających próg.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/gestep-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Wartość, która jest sprawdzana względem progu.' },
            step: { name: 'step', detail: 'Opcjonalne. Wartość progowa. Jeśli zostanie pominięta, funkcja SPRAWDŹ.PRÓG użyje wartości zero.' },
        },
    },
    HEX2BIN: {
        description: 'Konwertuje liczbę szesnastkową na liczbę binarną.',
        abstract: 'Konwertuje liczbę szesnastkową na liczbę binarną.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/hex2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Liczba szesnastkowa, która ma zostać przekonwertowana. Liczba nie może zawierać więcej niż 10 znaków. Najbardziej znaczący bit liczby jest bitem znaku (40 bit od prawej). Pozostałe 39 bitów reprezentuje wielkość. Liczby ujemne są reprezentowane przy użyciu zapisu z dopełnieniem do dwóch.' },
            places: { name: 'places', detail: 'Argument opcjonalny. Liczba znaków do użycia. Jeśli argument „miejsca” zostanie pominięty, funkcja SZESN.NA.DWÓJK użyje najmniejszej niezbędnej liczby znaków. Wygodnie jest stosować argument „miejsca” w celu uzupełniania wyliczonej wartości poprzedzającymi 0 (zerami).' },
        },
    },
    HEX2DEC: {
        description: 'Konwertuje liczbę szesnastkową na liczbę dziesiętną.',
        abstract: 'Konwertuje liczbę szesnastkową na liczbę dziesiętną.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/hex2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Liczba szesnastkowa, która ma zostać przekonwertowana. Liczba nie może zawierać więcej niż 10 znaków (40 bitów). Najbardziej znaczący bit liczby jest bitem znaku. Pozostałe 39 bitów reprezentuje wielkość. Liczby ujemne przedstawia się w zapisie dopełnienia do dwóch.' },
        },
    },
    HEX2OCT: {
        description: 'Konwertuje liczbę szesnastkową na liczbę ósemkową.',
        abstract: 'Konwertuje liczbę szesnastkową na liczbę ósemkową.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/hex2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Liczba szesnastkowa, która ma zostać przekonwertowana. Liczba nie może zawierać więcej niż 10 znaków. Najbardziej znaczący bit liczby jest bitem znaku. Pozostałe 39 bitów reprezentuje wielkość. Liczby ujemne są reprezentowane przy użyciu zapisu z dopełnieniem do dwóch.' },
            places: { name: 'places', detail: 'Argument opcjonalny. Liczba znaków do użycia. Jeśli argument „miejsca” zostanie pominięty, funkcja SZESN.NA.ÓSM użyje najmniejszej niezbędnej liczby znaków. Wygodnie jest stosować argument „miejsca” w celu uzupełniania wyliczonej wartości poprzedzającymi 0 (zerami).' },
        },
    },
    IMABS: {
        description: 'Zwraca wartość bezwzględną (moduł) liczby zespolonej, podając ją w formacie tekstowym x + yi lub x + yj.',
        abstract: 'Zwraca wartość bezwzględną (moduł) liczby zespolonej, podając ją w formacie tekstowym x + yi lub x + yj.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/imabs-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Wymagane. Liczba zespolona, dla której należy znaleźć wartość bezwzględną.' },
        },
    },
    IMAGINARY: {
        description: 'Zwraca współczynnik urojony liczby zespolonej podanej w postaci w postaci tekstowej x + yi lub x + yj.',
        abstract: 'Zwraca współczynnik urojony liczby zespolonej podanej w postaci w postaci tekstowej x + yi lub x + yj.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/imaginary-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Wymagane. Liczba zespolona, dla której należy obliczyć część urojoną.' },
        },
    },
    IMARGUMENT: {
        description: 'Zwraca argument (theta), czyli kąt wyrażony w radianach, w następującym stopniu:',
        abstract: 'Zwraca argument (theta), czyli kąt wyrażony w radianach, w następującym stopniu:',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/imargument-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Wymagane. Liczba zespolona, dla której należy obliczyć argument .' },
        },
    },
    IMCONJUGATE: {
        description: 'Zwraca sprzężenie zespolone liczby zespolonej, podając je w postaci formatu tekstowego x + yi lub x + yj.',
        abstract: 'Zwraca sprzężenie zespolone liczby zespolonej, podając je w postaci formatu tekstowego x + yi lub x + yj.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/imconjugate-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Wymagane. Liczba zespolona, dla której należy obliczyć liczbę sprzężoną.' },
        },
    },
    IMCOS: {
        description: 'Zwraca cosinus liczby zespolonej w postaci tekstowej x + yi lub x + yj.',
        abstract: 'Zwraca cosinus liczby zespolonej w postaci tekstowej x + yi lub x + yj.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/imcos-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Wymagane. Liczba zespolona, dla której należy obliczyć cosinus.' },
        },
    },
    IMCOSH: {
        description: 'Zwraca cosinus hiperboliczny liczby zespolonej w formacie tekstowym x+yi lub x+yj.',
        abstract: 'Zwraca cosinus hiperboliczny liczby zespolonej w formacie tekstowym x+yi lub x+yj.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/imcosh-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Wymagane. Liczba zespolona, dla której należy obliczyć cosinus hiperboliczny.' },
        },
    },
    IMCOT: {
        description: 'Zwraca cotangens liczby zespolonej w formacie tekstowym x+yi lub x+yj.',
        abstract: 'Zwraca cotangens liczby zespolonej w formacie tekstowym x+yi lub x+yj.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/imcot-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Liczba zespolona, której cotangens chcesz obliczyć.' },
        },
    },
    IMCOTH: {
        description: 'Funkcja IMCOTH zwraca hiperboliczny kotangens podanej liczby zespolonej. Na przykład dla liczby zespolonej „x+yi” zwraca „coth(x+yi)”.',
        abstract: 'Funkcja IMCOTH zwraca hiperboliczny kotangens podanej liczby zespolonej. Na przykład dla liczby zespolonej „x+yi” zwraca „coth(x+yi)”.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9366256?hl=pl',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Liczba zespolona, której hiperboliczny cotangens chcesz obliczyć. Może to być wynik funkcji COMPLEX, liczba rzeczywista interpretowana jako liczba zespolona z częścią urojoną równą 0 albo ciąg w formacie „x+yi”, gdzie x i y są liczbami.' },
        },
    },
    IMCSC: {
        description: 'Zwraca cosecans liczby zespolonej w formacie tekstowym x+yi lub x+yj.',
        abstract: 'Zwraca cosecans liczby zespolonej w formacie tekstowym x+yi lub x+yj.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/imcsc-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Wymagane. Liczba zespolona, dla której ma zostać obliczony cosecans.' },
        },
    },
    IMCSCH: {
        description: 'Zwraca cosecans hiperboliczny liczby zespolonej w formacie tekstowym x+yi lub x+yj.',
        abstract: 'Zwraca cosecans hiperboliczny liczby zespolonej w formacie tekstowym x+yi lub x+yj.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/imcsch-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Wymagane. Liczba zespolona, dla której ma zostać obliczony cosecans hiperboliczny.' },
        },
    },
    IMDIV: {
        description: 'Zwraca iloraz dwóch liczb zespolonych w postaci tekstowej x + yi lub x + yj.',
        abstract: 'Zwraca iloraz dwóch liczb zespolonych w postaci tekstowej x + yi lub x + yj.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/imdiv-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: 'Wymagane. Zespolony licznik lub zespolona dzielna.' },
            inumber2: { name: 'inumber2', detail: 'Wymagane. Zespolony mianownik lub dzielnik.' },
        },
    },
    IMEXP: {
        description: 'Zwraca wartość wykładniczą liczby zespolonej w postaci tekstowej x + yi lub x + yj.',
        abstract: 'Zwraca wartość wykładniczą liczby zespolonej w postaci tekstowej x + yi lub x + yj.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/imexp-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Wymagane. Liczba zespolona, dla której należy obliczyć wartość wykładniczą.' },
        },
    },
    IMLN: {
        description: 'Zwraca logarytm naturalny liczby zespolonej w postaci tekstowej x + yi lub x + yj.',
        abstract: 'Zwraca logarytm naturalny liczby zespolonej w postaci tekstowej x + yi lub x + yj.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/imln-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Wymagane. Liczba zespolona, dla której należy obliczyć logarytm naturalny.' },
        },
    },
    IMLOG: {
        description: 'Funkcja IMLOG zwraca logarytm liczby zespolonej dla określonej podstawy.',
        abstract: 'Funkcja IMLOG zwraca logarytm liczby zespolonej dla określonej podstawy.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9366486?hl=pl',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Wartość wejściowa funkcji logarytmicznej. Liczbę można zapisać jako zwykłą liczbę, np. 1, aby była interpretowana jako liczba rzeczywista, albo jako tekst w cudzysłowie, aby określić współczynniki rzeczywisty i urojony.' },
            base: { name: 'base', detail: 'Podstawa używana do obliczania logarytmu. Musi być dodatnią liczbą rzeczywistą.' },
        },
    },
    IMLOG10: {
        description: 'Zwraca wartość logarytmu zwykłego (o podstawie 10) liczby zespolonej, podając wynik w postaci tekstowej x + yi lub x + yj.',
        abstract: 'Zwraca wartość logarytmu zwykłego (o podstawie 10) liczby zespolonej, podając wynik w postaci tekstowej x + yi lub x + yj.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/imlog10-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Wymagane. Liczba zespolona, dla której należy obliczyć logarytm zwykły.' },
        },
    },
    IMLOG2: {
        description: 'Zwraca logarytm o podstawie 2 liczby zespolonej, podając wynik w postaci tekstowej x + yi lub x+yj.',
        abstract: 'Zwraca logarytm o podstawie 2 liczby zespolonej, podając wynik w postaci tekstowej x + yi lub x+yj.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/imlog2-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Wymagane. Liczba zespolona, dla której należy obliczyć logarytm o podstawie 2.' },
        },
    },
    IMPOWER: {
        description: 'Zwraca liczbę zespoloną w postaci tekstowej x + yi lub x + yj podniesioną do potęgi.',
        abstract: 'Zwraca liczbę zespoloną w postaci tekstowej x + yi lub x + yj podniesioną do potęgi.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/impower-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Wymagane. Liczba zespolona, którą należy podnieść do potęgi.' },
            number: { name: 'number', detail: 'Argument wymagany. Potęga, do której należy podnieść liczbę zespoloną.' },
        },
    },
    IMPRODUCT: {
        description: 'Zwraca iloczyn od 1 do 255 liczb zespolonych, podając wynik w postaci tekstowej x + yi lub x + yj.',
        abstract: 'Zwraca iloczyn od 1 do 255 liczb zespolonych, podając wynik w postaci tekstowej x + yi lub x + yj.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/improduct-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: 'Od 1 do 255 liczb zespolonych do pomnożenia.' },
            inumber2: { name: 'inumber2', detail: 'Kolejna liczba zespolona do pomnożenia.' },
        },
    },
    IMREAL: {
        description: 'Zwraca współczynnik rzeczywisty liczby zespolonej w postaci tekstowej x + yi lub x + yj.',
        abstract: 'Zwraca współczynnik rzeczywisty liczby zespolonej w postaci tekstowej x + yi lub x + yj.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/imreal-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Wymagane. Liczba zespolona, dla której należy obliczyć część rzeczywistą.' },
        },
    },
    IMSEC: {
        description: 'Zwraca secans liczby zespolonej w formacie tekstowym x+yi lub x+yj.',
        abstract: 'Zwraca secans liczby zespolonej w formacie tekstowym x+yi lub x+yj.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/imsec-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Wymagane. Liczba zespolona, dla której ma zostać obliczony secans.' },
        },
    },
    IMSECH: {
        description: 'Zwraca secans hiperboliczny liczby zespolonej w formacie tekstowym x+yi lub x+yj.',
        abstract: 'Zwraca secans hiperboliczny liczby zespolonej w formacie tekstowym x+yi lub x+yj.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/imsech-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Wymagane. Liczba zespolona, dla której ma zostać obliczony secans hiperboliczny.' },
        },
    },
    IMSIN: {
        description: 'Zwraca sinus liczby zespolonej w postaci tekstowej x + yi lub x + yj.',
        abstract: 'Zwraca sinus liczby zespolonej w postaci tekstowej x + yi lub x + yj.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/imsin-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Wymagane. Liczba zespolona, dla której należy obliczyć sinus.' },
        },
    },
    IMSINH: {
        description: 'Funkcja SINH.LICZBY.ZESP zwraca sinus hiperboliczny liczby zespolonej w formacie tekstowym x+yi lub x+yj.',
        abstract: 'Funkcja SINH.LICZBY.ZESP zwraca sinus hiperboliczny liczby zespolonej w formacie tekstowym x+yi lub x+yj.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/imsinh-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Wymagane. Liczba zespolona, dla której ma zostać obliczony sinus hiperboliczny.' },
        },
    },
    IMSQRT: {
        description: 'Zwraca pierwiastek kwadratowy z liczby zespolonej, podając go w postaci tekstowej x + yi lub x + yj.',
        abstract: 'Zwraca pierwiastek kwadratowy z liczby zespolonej, podając go w postaci tekstowej x + yi lub x + yj.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/imsqrt-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Wymagane. Liczba zespolona, dla której należy obliczyć pierwiastek kwadratowy.' },
        },
    },
    IMSUB: {
        description: 'Zwraca różnicę dwóch liczb zespolonych w postaci tekstowej x + yi lub x + yj.',
        abstract: 'Zwraca różnicę dwóch liczb zespolonych w postaci tekstowej x + yi lub x + yj.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/imsub-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: 'Wymagane. Liczba zespolona, od której należy odjąć argument liczba_zespolona2.' },
            inumber2: { name: 'inumber2', detail: 'Wymagane. Liczba zespolona, którą należy odjąć od argumentu liczba_zespolona1.' },
        },
    },
    IMSUM: {
        description: 'Zwraca sumę dwóch lub więcej liczb zespolonych w formacie tekstowym x + yi lub x + yj.',
        abstract: 'Zwraca sumę dwóch lub więcej liczb zespolonych w formacie tekstowym x + yi lub x + yj.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/imsum-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'inumber1', detail: 'Od 1 do 255 liczb zespolonych do dodania.' },
            inumber2: { name: 'inumber2', detail: 'Kolejna liczba zespolona do dodania.' },
        },
    },
    IMTAN: {
        description: 'Zwraca tangens liczby zespolonej w formacie tekstowym x+yi lub x+yj.',
        abstract: 'Zwraca tangens liczby zespolonej w formacie tekstowym x+yi lub x+yj.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/imtan-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Wymagane. Liczba zespolona, dla której należy obliczyć tangens.' },
        },
    },
    IMTANH: {
        description: 'Funkcja IMTANH zwraca hiperboliczny tangens podanej liczby zespolonej. Na przykład dla liczby zespolonej „x+yi” zwraca „tanh(x+yi)”.',
        abstract: 'Funkcja IMTANH zwraca hiperboliczny tangens podanej liczby zespolonej. Na przykład dla liczby zespolonej „x+yi” zwraca „tanh(x+yi)”.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9366655?hl=pl',
            },
        ],
        functionParameter: {
            inumber: { name: 'inumber', detail: 'Liczba zespolona, której hiperboliczny tangens chcesz obliczyć. Może to być wynik funkcji COMPLEX, liczba rzeczywista interpretowana jako liczba zespolona z częścią urojoną równą 0 albo ciąg w formacie „x+yi”, gdzie x i y są liczbami.' },
        },
    },
    OCT2BIN: {
        description: 'Konwertuje liczbę w postaci ósemkowej na liczbę w postaci dwójkowej.',
        abstract: 'Konwertuje liczbę w postaci ósemkowej na liczbę w postaci dwójkowej.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/oct2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Liczba ósemkowa, która ma zostać przekonwertowana. Liczba nie może zawierać więcej niż 10 znaków. Najbardziej znaczący bit liczby jest bitem znaku. Pozostałe 29 bitów reprezentuje wielkość. Liczby ujemne są reprezentowane przy użyciu zapisu z dopełnieniem do dwóch.' },
            places: { name: 'places', detail: 'Opcjonalne. Liczba znaków do użycia. Jeśli argument miejsca zostanie pominięty, funkcja ÓSM.NA.DWÓJK użyje najmniejszej niezbędnej liczby znaków. Wygodnie jest stosować argument miejsca w celu uzupełniania wyliczonej wartości zerami (0) wiodącymi.' },
        },
    },
    OCT2DEC: {
        description: 'Konwertuje liczbę w postaci ósemkowej na liczbę w postaci dziesiętnej.',
        abstract: 'Konwertuje liczbę w postaci ósemkowej na liczbę w postaci dziesiętnej.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/oct2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Liczba ósemkowa, która ma zostać przekonwertowana. Liczba nie może zawierać więcej niż 10 znaków (30 bitów). Najbardziej znaczący bit liczby jest bitem znaku. Pozostałe 29 bitów reprezentuje wielkość. Liczby ujemne przedstawia się w zapisie dopełnienia do dwóch.' },
        },
    },
    OCT2HEX: {
        description: 'Konwertuje liczby w postaci ósemkowej na liczby w postaci szesnastkowej.',
        abstract: 'Konwertuje liczby w postaci ósemkowej na liczby w postaci szesnastkowej.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/oct2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Liczba ósemkowa, która ma zostać przekonwertowana. Liczba nie może zawierać więcej niż 10 znaków (30 bitów). Najbardziej znaczący bit liczby jest bitem znaku. Pozostałe 29 bitów reprezentuje wielkość. Liczby ujemne są reprezentowane przy użyciu zapisu z dopełnieniem do dwóch.' },
            places: { name: 'places', detail: 'Opcjonalne. Liczba znaków do użycia. Jeśli argument miejsca zostanie pominięty, funkcja ÓSM.NA.SZESN użyje najmniejszej niezbędnej liczby znaków. Wygodnie jest stosować argument miejsca w celu uzupełniania wyliczonej wartości zerami (0) wiodącymi.' },
        },
    },
};

export default locale;
