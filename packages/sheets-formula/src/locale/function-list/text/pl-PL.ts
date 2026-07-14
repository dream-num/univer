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
    ASC: {
        description: 'W językach korzystających z dwubajtowego zestawu znaków (DBCS) funkcja zmienia znaki o pełnej szerokości (dwubajtowe) na znaki o połówkowej szerokości (jednobajtowe).',
        abstract: 'W językach korzystających z dwubajtowego zestawu znaków (DBCS) funkcja zmienia znaki o pełnej szerokości (dwubajtowe) na znaki o połówkowej szerokości (jednobajtowe).',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/asc-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Argument wymagany. Tekst lub odwołanie do komórki zawierającej tekst, który ma zostać zmieniony. Jeśli tekst nie zawiera żadnych znaków o pełnej szerokości, nie zostanie zmieniony.' },
        },
    },
    ARRAYTOTEXT: {
        description: 'Funkcja TABLICA.NA.TEKST pozwala wyświetlić tablicę wartości tekstowych z dowolnego określonego zakresu. Przekazuje wartości tekstowe bez zmian i konwertuje pozostałe wartości na tekst.',
        abstract: 'Funkcja TABLICA.NA.TEKST pozwala wyświetlić tablicę wartości tekstowych z dowolnego określonego zakresu. Przekazuje wartości tekstowe bez zmian i konwertuje pozostałe wartości na tekst.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/arraytotext-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Tablica do wyświetlenia jako tekst. Argument wymagany.' },
            format: { name: 'format', detail: 'Format zwracanych danych. Argument opcjonalny. Może to być jedna z dwóch wartości: 0 Domyślne. Zwięzły format, który jest łatwy do odczytania. Zwracany tekst będzie taki sam jak tekst odwzorowany w komórce, w której zastosowano ogólne formatowanie. 1 Format ścisły, który zawiera znaki ucieczki i ograniczniki wierszy. Generuje ciąg, który może zostać przeanalizowany po wprowadzeniu na pasku formuły. Zwracane ciągi umieszcza w cudzysłowie, z wyjątkiem wartości logicznych, liczb i błędów.' },
        },
    },
    BAHTTEXT: {
        description: 'Konwertuje liczbę na tekst w języku tajskim i dodaje sufiks waluty bat.',
        abstract: 'Konwertuje liczbę na tekst w języku tajskim i dodaje sufiks waluty bat.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/bahttext-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Liczba konwertowana na tekst, odwołanie do komórki zawierającej liczbę lub formuła dająca w wyniku liczbę.' },
        },
    },
    CHAR: {
        description: 'Zwraca znak określony za pomocą liczby. Funkcja ZNAK służy do translacji liczb strony kodowej, które można uzyskać wśród znaków z plików na innych typach komputerów.',
        abstract: 'Zwraca znak określony za pomocą liczby. Funkcja ZNAK służy do translacji liczb strony kodowej, które można uzyskać wśród znaków z plików na innych typach komputerów.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/char-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Liczba od 1 do 255 określająca żądany znak. Znak pochodzi z zestawu znaków używanego na danym komputerze. Uwaga Program Excel dla sieci Web obsługuje tylko ZNAKI(9), ZNAK(10), ZNAK(13) i ZNAK(32) i nowsze.' },
        },
    },
    CLEAN: {
        description: 'Usuwa z tekstu wszystkie znaki, które nie mogą zostać wydrukowane. Funkcji OCZYŚĆ należy używać do tekstów importowanych z innych aplikacji, zawierających znaki, których być może nie da się wydrukować w danym systemie operacyjnym. Na przykład funkcji OCZYŚĆ można użyć do usunięcia niektórych kodów komputerowych niskiego poziomu, których nie da się wydrukować, a nierzadko kończą one i rozpoczynają pliki danych.',
        abstract: 'Usuwa z tekstu wszystkie znaki, które nie mogą zostać wydrukowane. Funkcji OCZYŚĆ należy używać do tekstów importowanych z innych aplikacji, zawierających znaki, których być może nie da się wydrukować w danym systemie operacyjnym. Na przykład funkcji OCZYŚĆ można użyć do usunięcia niektórych kodów komputerowych niskiego poziomu, których nie da się wydrukować, a nierzadko kończą one i rozpoczynają pliki danych.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/clean-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Argument wymagany. Dowolne informacje arkusza, z których mają zostać usunięte znaki niedrukowane.' },
        },
    },
    CODE: {
        description: 'Zwraca wartość kodu liczbowego pierwszego znaku w ciągu tekstowym. Zwracany jest kod stosowny do zestawu znaków używanego na komputerze.',
        abstract: 'Zwraca wartość kodu liczbowego pierwszego znaku w ciągu tekstowym. Zwracany jest kod stosowny do zestawu znaków używanego na komputerze.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/code-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Argument wymagany. Tekst, dla którego ma zostać zwrócony kod pierwszego znaku.' },
        },
    },
    CONCAT: {
        description: 'Funkcja ZŁĄCZ.TEKST łączy tekst z wielu zakresów i(lub ciągów), ale nie udostępnia argumentów ignorowania ani ogranicznika.',
        abstract: 'Funkcja ZŁĄCZ.TEKST łączy tekst z wielu zakresów i(lub ciągów), ale nie udostępnia argumentów ignorowania ani ogranicznika.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/concat-function',
            },
        ],
        functionParameter: {
            text1: { name: 'text1', detail: 'Element tekstowy do połączenia. Ciąg lub tablica ciągów, na przykład zakres komórek.' },
            text2: { name: 'text2', detail: 'Dodatkowe elementy tekstowe do połączenia. Elementy tekstowe można podać w maksymalnie 253 argumentach tekstowych. Każdy z nich może być ciągiem lub tablicą ciągów, na przykład zakresem komórek.' },
        },
    },
    CONCATENATE: {
        description: 'Funkcja ZŁĄCZ.TEKSTY , jedna z dostępnych funkcji tekstowych , umożliwia połączenie dwóch lub więcej ciągów tekstowych w jeden ciąg.',
        abstract: 'Funkcja ZŁĄCZ.TEKSTY , jedna z dostępnych funkcji tekstowych , umożliwia połączenie dwóch lub więcej ciągów tekstowych w jeden ciąg.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/concatenate-function',
            },
        ],
        functionParameter: {
            text1: { name: 'text1', detail: 'Pierwszy element do połączenia. Może to być wartość tekstowa, liczba lub odwołanie do komórki.' },
            text2: { name: 'text2', detail: 'Dodatkowe elementy tekstowe do połączenia. Można podać maksymalnie 255 elementów, o łącznej długości do 8192 znaków.' },
        },
    },
    DBCS: {
        description: 'Funkcja opisana w tym temacie Pomocy konwertuje litery o szerokości połówkowej (jednobajtowe) w ciągu znakowym na znaki o pełnej szerokości (dwubajtowe). Nazwa funkcji (i konwertowane znaki) są zależne od ustawień języka.',
        abstract: 'Funkcja opisana w tym temacie Pomocy konwertuje litery o szerokości połówkowej (jednobajtowe) w ciągu znakowym na znaki o pełnej szerokości (dwubajtowe). Nazwa funkcji (i konwertowane znaki) są zależne od ustawień języka.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/dbcs-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Argument wymagany. Tekst lub odwołanie do komórki zawierającej tekst, który należy zmienić. Jeśli tekst nie zawiera angielskich liter lub katakany połówkowej szerokości, nie zostanie zmieniony.' },
        },
    },
    DOLLAR: {
        description: 'Funkcja KWOTA , jedna z funkcji TEKST , konwertuje liczbę na tekst przy użyciu formatu walutowego, a liczba miejsc dziesiętnych jest zaokrąglana do określonej liczby miejsc. Funkcja KWOTA używa wartości $#,#0,00_); Format liczb (###0,00 zł), chociaż zastosowany symbol waluty zależy od ustawień języka lokalnego.',
        abstract: 'Funkcja KWOTA , jedna z funkcji TEKST , konwertuje liczbę na tekst przy użyciu formatu walutowego, a liczba miejsc dziesiętnych jest zaokrąglana do określonej liczby miejsc. Funkcja KWOTA używa wartości $#,#0,00_); Format liczb (###0,00 zł), chociaż zastosowany symbol waluty zależy od ustawień języka lokalnego.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/dollar-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Liczba lub odwołanie do komórki zawierającej liczbę albo formułę dającą w wyniku liczbę.' },
            decimals: { name: 'decimals', detail: 'Opcjonalne. Liczba cyfr po prawej stronie separatora dziesiętnego. Jeśli jest to wartość ujemna, liczba jest zaokrąglana w lewo od separatora dziesiętnego. Jeśli argument miejsca_dziesiętne nie zostanie określony, domyślnie przyjmowana jest wartość 2.' },
        },
    },
    EXACT: {
        description: 'Porównuje dwa teksty i zwraca wartość PRAWDA, jeśli są dokładnie takie same; w przeciwnym przypadku zwraca wartość FAŁSZ. Funkcja PORÓWNAJ uwzględnia wielkość liter, ale ignoruje różnice w formatowaniu. Funkcja PORÓWNAJ umożliwia sprawdzanie tekstu wprowadzanego do dokumentu.',
        abstract: 'Porównuje dwa teksty i zwraca wartość PRAWDA, jeśli są dokładnie takie same; w przeciwnym przypadku zwraca wartość FAŁSZ. Funkcja PORÓWNAJ uwzględnia wielkość liter, ale ignoruje różnice w formatowaniu. Funkcja PORÓWNAJ umożliwia sprawdzanie tekstu wprowadzanego do dokumentu.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/exact-function',
            },
        ],
        functionParameter: {
            text1: { name: 'text1', detail: 'Wymagane. Pierwszy ciąg tekstowy.' },
            text2: { name: 'text2', detail: 'Wymagane. Drugi ciąg tekstowy.' },
        },
    },
    FIND: {
        description: 'Znajduje jedną wartość tekstową w innej (z rozróżnianiem wielkości liter).',
        abstract: 'Znajduje jedną wartość tekstową w innej (z rozróżnianiem wielkości liter).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/this-article-has-been-retired',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: 'Tekst, który chcesz znaleźć.' },
            withinText: { name: 'within_text', detail: 'Tekst zawierający tekst, który chcesz znaleźć.' },
            startNum: { name: 'start_num', detail: 'Określa znak, od którego ma się rozpocząć wyszukiwanie. Jeśli pominiesz argument start_num, przyjmowana jest wartość 1.' },
        },
    },
    FINDB: {
        description: 'Znajduje jedną wartość tekstową w innej (z rozróżnianiem wielkości liter).',
        abstract: 'Znajduje jedną wartość tekstową w innej (z rozróżnianiem wielkości liter).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/this-article-has-been-retired',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: 'Tekst, który chcesz znaleźć.' },
            withinText: { name: 'within_text', detail: 'Tekst zawierający tekst, który chcesz znaleźć.' },
            startNum: { name: 'start_num', detail: 'Określa znak, od którego ma się rozpocząć wyszukiwanie. Jeśli pominiesz argument start_num, przyjmowana jest wartość 1.' },
        },
    },
    FIXED: {
        description: 'Zaokrągla liczbę do podanej liczby miejsc dziesiętnych, formatuje liczbę do postaci dziesiętnej z użyciem przecinka i spacji, oraz zwraca wynik w postaci tekstowej.',
        abstract: 'Zaokrągla liczbę do podanej liczby miejsc dziesiętnych, formatuje liczbę do postaci dziesiętnej z użyciem przecinka i spacji, oraz zwraca wynik w postaci tekstowej.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/fixed-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Liczba, która ma zostać zaokrąglona i przekonwertowana na tekst.' },
            decimals: { name: 'decimals', detail: 'Opcjonalne. Liczba cyfr po prawej stronie separatora dziesiętnego.' },
            noCommas: { name: 'no_commas', detail: 'Opcjonalne. Wartość logiczna, która, jeśli ma wartość PRAWDA, zapobiega umieszczaniu przez funkcję ZAOKR.DO.TEKST separatorów tysięcy w zwróconym tekście.' },
        },
    },
    LEFT: {
        description: 'Zwraca skrajnie lewe znaki wartości tekstowej.',
        abstract: 'Zwraca skrajnie lewe znaki wartości tekstowej.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/left-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Ciąg tekstowy zawierający znaki, które chcesz wyodrębnić.' },
            numChars: { name: 'num_chars', detail: 'Określa liczbę znaków, które funkcja LEFT ma wyodrębnić.' },
        },
    },
    LEFTB: {
        description: 'Zwraca skrajnie lewe znaki wartości tekstowej.',
        abstract: 'Zwraca skrajnie lewe znaki wartości tekstowej.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/left-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Ciąg tekstowy zawierający znaki, które chcesz wyodrębnić.' },
            numBytes: { name: 'num_bytes', detail: 'Określa liczbę bajtów, które funkcja LEFTB ma wyodrębnić.' },
        },
    },
    LEN: {
        description: 'Zwraca liczbę znaków w ciągu tekstowym.',
        abstract: 'Zwraca liczbę znaków w ciągu tekstowym.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/len-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Tekst, którego długość chcesz znaleźć. Spacje są liczone jako znaki.' },
        },
    },
    LENB: {
        description: 'Zwraca liczbę bajtów użytych do reprezentowania znaków w ciągu tekstowym.',
        abstract: 'Zwraca liczbę bajtów użytych do reprezentowania znaków w ciągu tekstowym.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/len-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Tekst, którego długość chcesz znaleźć. Spacje są liczone jako znaki.' },
        },
    },
    LOWER: {
        description: 'Konwertuje wszystkie duże litery w ciągu tekstowym na małe.',
        abstract: 'Konwertuje wszystkie duże litery w ciągu tekstowym na małe.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/lower-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Argument wymagany. Tekst, który należy przekonwertować na małe litery. Funkcja LITERY.MAŁE nie zmienia tych znaków w tekście, które nie są literami.' },
        },
    },
    MID: {
        description: 'Zwraca określoną liczbę znaków z ciągu tekstowego, zaczynając od wskazanej pozycji.',
        abstract: 'Zwraca określoną liczbę znaków z ciągu tekstowego, zaczynając od wskazanej pozycji.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/mid-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Ciąg tekstowy zawierający znaki, które chcesz wyodrębnić.' },
            startNum: { name: 'start_num', detail: 'Pozycja pierwszego znaku, który chcesz wyodrębnić z tekstu.' },
            numChars: { name: 'num_chars', detail: 'Określa liczbę znaków, które funkcja MID ma wyodrębnić.' },
        },
    },
    MIDB: {
        description: 'Zwraca określoną liczbę znaków z ciągu tekstowego, zaczynając od wskazanej pozycji.',
        abstract: 'Zwraca określoną liczbę znaków z ciągu tekstowego, zaczynając od wskazanej pozycji.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/mid-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Ciąg tekstowy zawierający znaki, które chcesz wyodrębnić.' },
            startNum: { name: 'start_num', detail: 'Pozycja pierwszego znaku, który chcesz wyodrębnić z tekstu.' },
            numBytes: { name: 'num_bytes', detail: 'Określa liczbę bajtów, które funkcja MIDB ma wyodrębnić.' },
        },
    },
    NUMBERSTRING: {
        description: 'Konwertuje liczby na chińskie ciągi tekstowe.',
        abstract: 'Konwertuje liczby na chińskie ciągi tekstowe.',
        links: [
            {
                title: 'Instruction',
                url: 'https://www.wps.cn/learning/course/detail/id/340.html?chan=pc_kdocs_function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Wartość konwertowana na chiński ciąg tekstowy.' },
            type: { name: 'type', detail: 'Typ zwracanego wyniku. \n1. Chińskie małe litery \n2. Chińskie wielkie litery \n3. Odczytywanie i zapisywanie chińskich znaków' },
        },
    },
    NUMBERVALUE: {
        description: 'Konwertuje tekst na liczbę w sposób niezależny od ustawień regionalnych.',
        abstract: 'Konwertuje tekst na liczbę w sposób niezależny od ustawień regionalnych.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/numbervalue-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Argument wymagany. Tekst, który ma zostać przekonwertowany na liczbę.' },
            decimalSeparator: { name: 'decimal_separator', detail: 'Opcjonalne. Znak używany do oddzielenia części całkowitej i ułamkowej wyniku.' },
            groupSeparator: { name: 'group_separator', detail: 'Opcjonalne. Znak używany do oddzielenia grup liczb, na przykład tysięcy od setek oraz milionów od tysięcy.' },
        },
    },
    PHONETIC: {
        description: 'Wybiera znaki fonetyczne (furigana) z ciągu tekstowego.',
        abstract: 'Wybiera znaki fonetyczne (furigana) z ciągu tekstowego.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/phonetic-function',
            },
        ],
        functionParameter: {
            reference: { name: 'Odwołanie', detail: 'Wymagane. Ciąg tekstowy lub odwołanie do pojedynczej komórki albo do zakresu komórek, które zawierają ciąg tekstowy furigana.' },
        },
    },
    PROPER: {
        description: 'Zmienia w wielką literę pierwszą małą literę tekstu i wszystkie inne litery w tekście następujące po znaku innym niż litera. Wszystkie inne litery są konwertowane na małe litery.',
        abstract: 'Zmienia w wielką literę pierwszą małą literę tekstu i wszystkie inne litery w tekście następujące po znaku innym niż litera. Wszystkie inne litery są konwertowane na małe litery.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/proper-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Argument wymagany. Tekst ujęty w cudzysłów, formuła, której wynikiem jest tekst, lub odwołanie do komórki zawierającej tekst do częściowego przekształcenia w tekst pisany wielkimi literami.' },
        },
    },
    REGEXEXTRACT: {
        description: 'Wyodrębnia pierwszy pasujący podciąg zgodnie z wyrażeniem regularnym.',
        abstract: 'Wyodrębnia pierwszy pasujący podciąg zgodnie z wyrażeniem regularnym.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3098244?hl=pl',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Tekst wejściowy.' },
            regularExpression: { name: 'regular_expression', detail: 'Zwracana jest pierwsza część tekstu pasująca do tego wyrażenia.' },
        },
    },
    REGEXMATCH: {
        description: 'Sprawdza, czy fragment tekstu pasuje do wyrażenia regularnego.',
        abstract: 'Sprawdza, czy fragment tekstu pasuje do wyrażenia regularnego.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3098292?hl=pl',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Tekst, który ma zostać sprawdzony względem wyrażenia regularnego.' },
            regularExpression: { name: 'regular_expression', detail: 'Wyrażenie regularne używane do sprawdzenia tekstu.' },
        },
    },
    REGEXREPLACE: {
        description: 'Zastępuje część ciągu tekstowego innym ciągiem tekstowym przy użyciu wyrażeń regularnych.',
        abstract: 'Zastępuje część ciągu tekstowego innym ciągiem tekstowym przy użyciu wyrażeń regularnych.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3098245?hl=pl',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Tekst, którego część zostanie zastąpiona.' },
            regularExpression: { name: 'regular_expression', detail: 'Wyrażenie regularne. Wszystkie pasujące wystąpienia w tekście zostaną zastąpione.' },
            replacement: { name: 'replacement', detail: 'Tekst, który zostanie wstawiony do tekstu oryginalnego.' },
        },
    },
    REPLACE: {
        description: 'Zastępuje znaki w tekście.',
        abstract: 'Zastępuje znaki w tekście.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/replace-function',
            },
        ],
        functionParameter: {
            oldText: { name: 'old_text', detail: 'Tekst, w którym chcesz zastąpić znaki.' },
            startNum: { name: 'start_num', detail: 'Pozycja znaku w old_text, który chcesz zastąpić tekstem new_text.' },
            numChars: { name: 'num_chars', detail: 'Liczba znaków w old_text, które funkcja REPLACE ma zastąpić tekstem new_text.' },
            newText: { name: 'new_text', detail: 'Tekst, który zastąpi znaki w old_text.' },
        },
    },
    REPLACEB: {
        description: 'Zastępuje znaki w tekście.',
        abstract: 'Zastępuje znaki w tekście.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/replace-function',
            },
        ],
        functionParameter: {
            oldText: { name: 'old_text', detail: 'Tekst, w którym chcesz zastąpić znaki.' },
            startNum: { name: 'start_num', detail: 'Pozycja znaku w old_text, który chcesz zastąpić tekstem new_text.' },
            numBytes: { name: 'num_bytes', detail: 'Liczba bajtów w old_text, które funkcja REPLACEB ma zastąpić tekstem new_text.' },
            newText: { name: 'new_text', detail: 'Tekst, który zastąpi znaki w old_text.' },
        },
    },
    REPT: {
        description: 'Wykonuje określoną liczbę powtórzeń tekstu. Użyj funkcji POWT, aby wypełnić komórkę konkretną liczbą ciągów tekstowych.',
        abstract: 'Wykonuje określoną liczbę powtórzeń tekstu. Użyj funkcji POWT, aby wypełnić komórkę konkretną liczbą ciągów tekstowych.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/rept-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Argument wymagany. Tekst, który ma być powtarzany.' },
            numberTimes: { name: 'number_times', detail: 'Wymagane. Liczba dodatnia określająca liczbę powtórzeń tekstu.' },
        },
    },
    RIGHT: {
        description: 'Zwraca skrajnie prawe znaki wartości tekstowej.',
        abstract: 'Zwraca skrajnie prawe znaki wartości tekstowej.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/right-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Ciąg tekstowy zawierający znaki, które chcesz wyodrębnić.' },
            numChars: { name: 'num_chars', detail: 'Określa liczbę znaków, które funkcja RIGHT ma wyodrębnić.' },
        },
    },
    RIGHTB: {
        description: 'Zwraca skrajnie prawe znaki wartości tekstowej.',
        abstract: 'Zwraca skrajnie prawe znaki wartości tekstowej.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/right-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Ciąg tekstowy zawierający znaki, które chcesz wyodrębnić.' },
            numBytes: { name: 'num_bytes', detail: 'Określa liczbę bajtów, które funkcja RIGHTB ma wyodrębnić.' },
        },
    },
    SEARCH: {
        description: 'Znajduje jedną wartość tekstową w innej (bez rozróżniania wielkości liter).',
        abstract: 'Znajduje jedną wartość tekstową w innej (bez rozróżniania wielkości liter).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/search-function',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: 'Tekst, który chcesz znaleźć.' },
            withinText: { name: 'within_text', detail: 'Tekst zawierający tekst, który chcesz znaleźć.' },
            startNum: { name: 'start_num', detail: 'Określa znak, od którego ma się rozpocząć wyszukiwanie. Jeśli pominiesz argument start_num, przyjmowana jest wartość 1.' },
        },
    },
    SEARCHB: {
        description: 'Znajduje jedną wartość tekstową w innej (bez rozróżniania wielkości liter).',
        abstract: 'Znajduje jedną wartość tekstową w innej (bez rozróżniania wielkości liter).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/search-function',
            },
        ],
        functionParameter: {
            findText: { name: 'find_text', detail: 'Tekst, który chcesz znaleźć.' },
            withinText: { name: 'within_text', detail: 'Tekst zawierający tekst, który chcesz znaleźć.' },
            startNum: { name: 'start_num', detail: 'Określa znak, od którego ma się rozpocząć wyszukiwanie. Jeśli pominiesz argument start_num, przyjmowana jest wartość 1.' },
        },
    },
    SUBSTITUTE: {
        description: 'Podstawia w ciągu tekstowym w miejsce argumentu stary_tekst argument nowy_tekst. Funkcji PODSTAW należy używać wtedy, gdy trzeba zamienić określony tekst pojawiający się w ciągu tekstowym na inny tekst; funkcji ZASTĄP należy natomiast używać wtedy, gdy trzeba zamienić dowolny tekst pojawiający się w określonym miejscu ciągu tekstowego.',
        abstract: 'Podstawia w ciągu tekstowym w miejsce argumentu stary_tekst argument nowy_tekst. Funkcji PODSTAW należy używać wtedy, gdy trzeba zamienić określony tekst pojawiający się w ciągu tekstowym na inny tekst; funkcji ZASTĄP należy natomiast używać wtedy, gdy trzeba zamienić dowolny tekst pojawiający się w określonym miejscu ciągu tekstowego.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/substitute-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Argument wymagany. Tekst lub odwołanie do komórki zawierającej tekst, w którym zostaną zastąpione znaki.' },
            oldText: { name: 'old_text', detail: 'Wymagane. Tekst, który zostanie zastąpiony.' },
            newText: { name: 'new_text', detail: 'Wymagane. Tekst, którym zostanie zastąpiony tekst określony przez argument stary_tekst.' },
            instanceNum: { name: 'instance_num', detail: 'Opcjonalne. Określa, które wystąpienie argumentu stary_tekst zostanie zastąpione przez argument nowy_tekst. Jeśli argument wystąpienie_liczba jest podany, to tylko to konkretne wystąpienie argumentu stary_tekst zostanie zastąpione. W innym przypadku każde pojawienie się w tekście argumentu stary_tekst jest zamieniane na argument nowy_tekst.' },
        },
    },
    T: {
        description: 'Zwraca tekst, do którego odnosi się wartość.',
        abstract: 'Zwraca tekst, do którego odnosi się wartość.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/t-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Wymagane. Wartość, którą należy przetestować.' },
        },
    },
    TEXT: {
        description: 'Funkcja TEKST umożliwia zmianę sposobu wyświetlania liczby przez zastosowanie do niej formatowania za pomocą kodów formatów . Jest to przydatne w sytuacjach, w których chcesz wyświetlić liczby w bardziej czytelnym formacie lub połączyć liczby z tekstem lub symbolami.',
        abstract: 'Funkcja TEKST umożliwia zmianę sposobu wyświetlania liczby przez zastosowanie do niej formatowania za pomocą kodów formatów . Jest to przydatne w sytuacjach, w których chcesz wyświetlić liczby w bardziej czytelnym formacie lub połączyć liczby z tekstem lub symbolami.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/text-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Wartość liczbowa, którą chcesz przekonwertować na tekst.' },
            formatText: { name: 'format_text', detail: 'Ciąg tekstowy określający formatowanie, które ma zostać zastosowane do podanej wartości.' },
        },
    },
    TEXTAFTER: {
        description: 'Zwraca tekst występujący po danym znaku lub ciągu. Jest to przeciwieństwo funkcji TEKST.PRZED.',
        abstract: 'Zwraca tekst występujący po danym znaku lub ciągu. Jest to przeciwieństwo funkcji TEKST.PRZED.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/textafter-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Tekst, w którym odbywa się wyszukiwanie. Znaki wieloznaczne nie są dozwolone.' },
            delimiter: { name: 'delimiter', detail: 'Tekst oznaczający punkt, po którym chcesz wyodrębnić tekst.' },
            instanceNum: { name: 'instance_num', detail: 'Wystąpienie ogranicznika, po którym chcesz wyodrębnić tekst.' },
            matchMode: { name: 'match_mode', detail: 'Określa, czy przy wyszukiwaniu tekstu jest rozróżniana wielkość liter. Domyślnie jest rozróżniana.' },
            matchEnd: { name: 'match_end', detail: 'Traktuje koniec tekstu jako ogranicznik. Domyślnie tekst musi być dokładnie dopasowany.' },
            ifNotFound: { name: 'if_not_found', detail: 'Wartość zwracana, jeśli nie znaleziono dopasowania. Domyślnie zwracany jest błąd #N/A.' },
        },
    },
    TEXTBEFORE: {
        description: 'Zwraca tekst występujący przed danym znakiem lub ciągiem. Jest to przeciwieństwo funkcji TEKST.PO .',
        abstract: 'Zwraca tekst występujący przed danym znakiem lub ciągiem. Jest to przeciwieństwo funkcji TEKST.PO .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/textbefore-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Tekst, w którym odbywa się wyszukiwanie. Znaki wieloznaczne nie są dozwolone.' },
            delimiter: { name: 'delimiter', detail: 'Tekst oznaczający punkt, przed którym chcesz wyodrębnić tekst.' },
            instanceNum: { name: 'instance_num', detail: 'Wystąpienie ogranicznika, przed którym chcesz wyodrębnić tekst.' },
            matchMode: { name: 'match_mode', detail: 'Określa, czy przy wyszukiwaniu tekstu jest rozróżniana wielkość liter. Domyślnie jest rozróżniana.' },
            matchEnd: { name: 'match_end', detail: 'Traktuje koniec tekstu jako ogranicznik. Domyślnie tekst musi być dokładnie dopasowany.' },
            ifNotFound: { name: 'if_not_found', detail: 'Wartość zwracana, jeśli nie znaleziono dopasowania. Domyślnie zwracany jest błąd #N/A.' },
        },
    },
    TEXTJOIN: {
        description: 'Funkcja POŁĄCZ.TEKSTY łączy tekst z wielu zakresów i (lub) ciągów oraz uwzględnia określany ogranicznik między poszczególnymi wartościami tekstowymi do połączenia. Jeśli ogranicznik jest pustym ciągiem tekstowym, funkcja sklei zakresy.',
        abstract: 'Funkcja POŁĄCZ.TEKSTY łączy tekst z wielu zakresów i (lub) ciągów oraz uwzględnia określany ogranicznik między poszczególnymi wartościami tekstowymi do połączenia. Jeśli ogranicznik jest pustym ciągiem tekstowym, funkcja sklei zakresy.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/textjoin-function',
            },
        ],
        functionParameter: {
            delimiter: { name: 'delimiter', detail: 'Ciąg tekstowy, pusty lub zawierający co najmniej jeden znak w cudzysłowach podwójnych, albo odwołanie do prawidłowego ciągu tekstowego. W razie podania liczby będzie ona traktowana jak tekst.' },
            ignoreEmpty: { name: 'ignore_empty', detail: 'Jeśli ten argument ma wartość PRAWDA, komórki puste są ignorowane.' },
            text1: { name: 'text1', detail: 'Element tekstowy do połączenia. Ciąg tekstowy lub tablica ciągów, na przykład zakres komórek.' },
            text2: { name: 'text2', detail: 'Dodatkowe elementy tekstowe do połączenia. Elementy tekstowe można podać w maksymalnie 252 argumentach tekstowych, z argumentem tekst1 włącznie. Każdy z nich może być ciągiem tekstowym lub tablicą ciągów, na przykład zakresem komórek.' },
        },
    },
    TEXTSPLIT: {
        description: 'Funkcja PODZIEL.TEKST działa tak samo jak Kreator Tekst na kolumny , ale w formie formuły. Umożliwia dzielenie między kolumny lub w dół według wierszy. Jest to przeciwieństwo funkcji TEXTJOIN .',
        abstract: 'Funkcja PODZIEL.TEKST działa tak samo jak Kreator Tekst na kolumny , ale w formie formuły. Umożliwia dzielenie między kolumny lub w dół według wierszy. Jest to przeciwieństwo funkcji TEXTJOIN .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/textsplit-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Tekst, który chcesz podzielić. Argument wymagany.' },
            colDelimiter: { name: 'col_delimiter', detail: 'Tekst oznaczający punkt rozlania tekstu między kolumny.' },
            rowDelimiter: { name: 'row_delimiter', detail: 'Tekst oznaczający punkt rozlania tekstu w dół wierszy. Argument opcjonalny.' },
            ignoreEmpty: { name: 'ignore_empty', detail: 'Określ wartość PRAWDA, aby zignorować następujące po sobie ograniczniki. Wartość domyślna to PRAWDA, co powoduje utworzenie pustej komórki. Argument opcjonalny.' },
            matchMode: { name: 'match_mode', detail: 'Określ 1, aby dopasować bez uwzględniania wielkości liter. Wartość domyślna to 0, co powoduje dopasowanie z uwzględnieniem wielkości liter. Argument opcjonalny.' },
            padWith: { name: 'pad_with', detail: 'Wartość, której wyniki mają zostać wypełnione. Wartość domyślna to #N/D.' },
        },
    },
    TRIM: {
        description: 'Usuwa wszystkie spacje z tekstu, oprócz pojedynczych spacji występujących między słowami. Funkcję USUŃ.ZBĘDNE.ODSTĘPY należy stosować w przypadku tekstu uzyskanego z innej aplikacji, w którym mogą występować nieregularne spacje.',
        abstract: 'Usuwa wszystkie spacje z tekstu, oprócz pojedynczych spacji występujących między słowami. Funkcję USUŃ.ZBĘDNE.ODSTĘPY należy stosować w przypadku tekstu uzyskanego z innej aplikacji, w którym mogą występować nieregularne spacje.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/trim-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Tekst, z którego chcesz usunąć spacje. Tekst musi być zawarty w cudzysłowie.' },
        },
    },
    UNICHAR: {
        description: 'Zwraca znak Unicode, do którego odwołuje się określona wartość liczbowa.',
        abstract: 'Zwraca znak Unicode, do którego odwołuje się określona wartość liczbowa.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/unichar-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Numer znaku Unicode odpowiadający określonemu znakowi.' },
        },
    },
    UNICODE: {
        description: 'Zwraca numer (kod znaku) odpowiadający pierwszemu znakowi tekstu.',
        abstract: 'Zwraca numer (kod znaku) odpowiadający pierwszemu znakowi tekstu.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/unicode-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Argument wymagany. Tekst jest znakiem, dla którego ma zostać zwrócona wartość Unicode.' },
        },
    },
    UPPER: {
        description: 'Konwertuje małe litery na wielkie litery.',
        abstract: 'Konwertuje małe litery na wielkie litery.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/upper-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Argument wymagany. Tekst, który należy przekonwertować na wielkie litery. Tekst może być odwołaniem lub ciągiem tekstowym.' },
        },
    },
    VALUE: {
        description: 'Konwertuje ciąg tekstowy reprezentujący liczbę na liczbę.',
        abstract: 'Konwertuje ciąg tekstowy reprezentujący liczbę na liczbę.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/value-function',
            },
        ],
        functionParameter: {
            text: { name: 'text', detail: 'Argument wymagany. Tekst zamknięty znakami cudzysłowu lub odwołanie do komórki zawierającej tekst, który należy przekonwertować.' },
        },
    },
    VALUETOTEXT: {
        description: 'Funkcja WARTOŚĆ.NA.TEKST zwraca tekst z dowolnej określonej wartości. Przekazuje wartości tekstowe bez zmian i konwertuje pozostałe wartości na tekst.',
        abstract: 'Funkcja WARTOŚĆ.NA.TEKST zwraca tekst z dowolnej określonej wartości. Przekazuje wartości tekstowe bez zmian i konwertuje pozostałe wartości na tekst.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/valuetotext-function',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Wartość do wyświetlenia jako tekst. Argument wymagany.' },
            format: { name: 'format', detail: 'Format zwracanych danych. Argument opcjonalny. Może to być jedna z dwóch wartości: 0 Domyślne. Zwięzły format, który jest łatwy do odczytania. Zwracany tekst będzie taki sam jak tekst odwzorowany w komórce, w której zastosowano ogólne formatowanie. 1 Format ścisły, który zawiera znaki ucieczki i ograniczniki wierszy. Generuje ciąg, który może zostać przeanalizowany po wprowadzeniu na pasku formuły. Zwracane ciągi umieszcza w cudzysłowie, z wyjątkiem wartości logicznych, liczb i błędów.' },
        },
    },
    CALL: {
        description: 'Wywołuje procedurę w bibliotece linków dynamicznych lub w zasobie kodów. Istnieją dwie formy składni tej funkcji. Używaj składni 1 tylko w przypadku wcześniej zarejestrowanego zasobu kodów, w którym są używane argumenty z funkcji REJESTRUJ. Aby jednocześnie zarejestrować i zadzwonić do zasobu kodów, użyj składni 2a lub 2b.',
        abstract: 'Wywołuje procedurę w bibliotece linków dynamicznych lub w zasobie kodów. Istnieją dwie formy składni tej funkcji. Używaj składni 1 tylko w przypadku wcześniej zarejestrowanego zasobu kodów, w którym są używane argumenty z funkcji REJESTRUJ. Aby jednocześnie zarejestrować i zadzwonić do zasobu kodów, użyj składni 2a lub 2b.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/call-function',
            },
        ],
        functionParameter: {
            moduleText: { name: 'Module_text', detail: 'Wymagane. Tekst umieszczony w cudzysłowie, określający nazwę biblioteki dołączanej dynamicznie (DLL) zawierającej procedurę w programie Microsoft Excel dla Windows.' },
            procedure: { name: 'Procedura', detail: 'Wymagane. Tekst określający nazwę funkcji w bibliotece DLL w programie Microsoft Excel dla Windows. Można także używać wartości porządkowej funkcji otrzymanej z instrukcji EXPORTS w pliku definicji modułów (DEF). Wartość porządkowa nie może występować w postaci tekstu.' },
            typeText: { name: 'Typ_tekst', detail: 'Wymagane. Tekst określający typ danych zwróconej wartości oraz typy danych wszystkich argumentów do biblioteki DLL lub zasobu kodów. Pierwsza litera argumentu typ_tekst określa zwróconą wartość. Kody używane dla argumentu typ_tekst opisano szczegółowo w temacie Korzystanie z funkcji WYWOŁAJ i REJESTRUJ . Argument ten można pominąć w przypadku autonomicznych bibliotek DLL oraz zasobów kodów (XLL).' },
            argument1: { name: 'Argument1,...', detail: 'Opcjonalne. Argumenty przekazywane do procedury.' },
        },
    },
    EUROCONVERT: {
        description: 'Konwertuje liczbę na euro, daną wartość w euro na wartość w walucie kraju członkowskiego euro lub wartość w walucie jednego kraju członkowskiego na wartość w walucie innego kraju członkowskiego za pomocą euro jako waluty pośredniej (triangulacja). Waluty dostępne dla konwersji to waluty krajów należących do Unii Europejskiej, które przyjęły euro. Funkcja stosuje podczas konwersji kursy walut ustanowione przez Unię Europejską.',
        abstract: 'Konwertuje liczbę na euro, daną wartość w euro na wartość w walucie kraju członkowskiego euro lub wartość w walucie jednego kraju członkowskiego na wartość w walucie innego kraju członkowskiego za pomocą euro jako waluty pośredniej (triangulacja). Waluty dostępne dla konwersji to waluty krajów należących do Unii Europejskiej, które przyjęły euro. Funkcja stosuje podczas konwersji kursy walut ustanowione przez Unię Europejską.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/euroconvert-function',
            },
        ],
        functionParameter: {
            number: { name: 'Liczba', detail: 'Argument wymagany. Wartość walutowa, która ma zostać przekonwertowana, lub odwołanie do komórki zawierającej taką wartość.' },
            source: { name: 'Źródła', detail: 'Wymagane. Trzyliterowy ciąg lub odwołanie do komórki zawierającej ten ciąg, odpowiadające kodowi ISO waluty źródłowej. W funkcji EUROCONVERT dostępne są następujące kody walut:' },
            target: { name: 'Docelowego', detail: 'Wymagane. Trzyliterowy ciąg lub odwołanie do komórki odpowiadające kodowi ISO waluty, na którą ma zostać przekonwertowana liczba. Zobacz poprzednią tabelę źródłową kodów ISO.' },
            fullPrecision: { name: 'Full_precision', detail: 'Wymagane. Wartość logiczna (PRAWDA lub FAŁSZ) albo wyrażenie zwracające wartość PRAWDA lub FAŁSZ określające sposób wyświetlania wyniku.' },
            triangulationPrecision: { name: 'Triangulation_precision', detail: 'Wymagane. Liczba całkowita równa 3 lub większa niż 3, która określa liczbę cyfr znaczących używanych dla pośredniej wartości euro podczas konwersji między dwiema walutami krajów członkowskich euro. Jeśli ten argument zostanie pominięty, program Excel nie zaokrągli pośredniej wartości euro. Jeśli argument zostanie podany podczas konwersji z waluty kraju członkowskiego na euro, program Excel obliczy pośrednią wartość euro, która może być następnie przekonwertowana na walutę innego kraju członkowskiego euro.' },
        },
    },
    REGISTER_ID: {
        description: 'Zwraca identyfikator rejestru określonej biblioteki dołączanej dynamicznie (DLL) lub wcześniej zarejestrowanego zasobu kodów. Jeśli biblioteka DLL lub zasób kodów nie zostały zarejestrowane, funkcja rejestruje bibliotekę DLL lub zasób kodów, a następnie zwraca identyfikator rejestru.',
        abstract: 'Zwraca identyfikator rejestru określonej biblioteki dołączanej dynamicznie (DLL) lub wcześniej zarejestrowanego zasobu kodów. Jeśli biblioteka DLL lub zasób kodów nie zostały zarejestrowane, funkcja rejestruje bibliotekę DLL lub zasób kodów, a następnie zwraca identyfikator rejestru.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/register-id-function',
            },
        ],
        functionParameter: {
            moduleText: { name: 'Module_text', detail: 'Wymagane. Tekst określający nazwę biblioteki DLL zawierającej funkcje w programie Microsoft Excel dla Windows.' },
            procedure: { name: 'Procedura', detail: 'Wymagane. Tekst określający nazwę funkcji w bibliotece DLL w programie Microsoft Excel dla Windows. Można także używać wartości porządkowej funkcji uzyskanej za pomocą instrukcji EXPORTS w pliku definicji modułów (DEF). Wartość porządkowa lub identyfikator zasobu nie mogą występować w postaci tekstu.' },
            typeText: { name: 'Typ_tekst', detail: 'Opcjonalne. Tekst określający typ danych wartości zwróconej oraz typy danych wszystkich argumentów biblioteki DLL. Pierwsza litera argumentu typ_tekst określa wartość zwróconą. Jeśli funkcja lub zasób kodów są już zarejestrowane, ten argument można pominąć.' },
        },
    },
};

export default locale;
