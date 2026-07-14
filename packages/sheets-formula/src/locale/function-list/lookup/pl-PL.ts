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
    ADDRESS: {
        description: 'Za pomocą funkcji ADRES można uzyskać adres komórki w arkuszu, podając określony numer wiersza i kolumny. Na przykład funkcja ADRES(2;3) zwraca wartość $C$2 . W innym przykładzie funkcja ADRES(77;300) zwraca wartość $KN 77 zł . Za pomocą innych funkcji, takich jak WIERSZ i NR.KOLUMNY , można uzyskać argumenty numeru wiersza i numeru kolumny dla funkcji ADRES .',
        abstract: 'Za pomocą funkcji ADRES można uzyskać adres komórki w arkuszu, podając określony numer wiersza i kolumny. Na przykład funkcja ADRES(2;3) zwraca wartość $C$2 . W innym przykładzie funkcja ADRES(77;300) zwraca wartość $KN 77 zł . Za pomocą innych funkcji, takich jak WIERSZ i NR.KOLUMNY , można uzyskać argumenty numeru wiersza i numeru kolumny dla funkcji ADRES .',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/address-function',
            },
        ],
        functionParameter: {
            row_num: { name: 'row number', detail: 'Wymagane. Wartość liczbowa określająca numer wiersza, który ma zostać użyty w odwołaniu do komórki.' },
            column_num: { name: 'column number', detail: 'Wymagane. Wartość liczbowa określająca numer kolumny, który ma zostać użyty w odwołaniu do komórki.' },
            abs_num: { name: 'type of reference', detail: 'Opcjonalne. Wartość liczbowa określająca, jakiego typu odwołanie będzie zwracane przez funkcję.' },
            a1: { name: 'style of reference', detail: 'Opcjonalne. Wartość logiczna określająca styl odwołania A1 lub W1K1. W stylu A1 kolumny są oznaczone alfabetycznie, a wiersze — numerycznie. W stylu odwołania W1K1 zarówno kolumny, jak i wiersze są oznaczone numerami. Jeśli argument A1 ma wartość PRAWDA lub jest pominięty, funkcja ADRES zwraca odwołanie w stylu A1. jeśli FAŁSZ, funkcja ADRES zwraca odwołanie w stylu W1K1. Uwaga Aby zmienić styl odwołań używany w programie Excel, kliknij kartę Plik , polecenie Opcje , a następnie kliknij kategorię Formuły . W obszarze Praca z formułami zaznacz lub wyczyść pole wyboru Styl odwołania W1K1 .' },
            sheet_text: { name: 'worksheet name', detail: 'Opcjonalne. Wartość tekstowa określająca nazwę arkusza, który ma być używany jako odwołanie zewnętrzne. Na przykład formuła =ADRES(1;1,,,"Arkusz2") zwraca wartość Arkusz2!$A$1 . Jeśli argument sheet_text zostanie pominięty, nie zostanie użyta nazwa arkusza, a adres zwrócony przez funkcję odwołuje się do komórki w bieżącym arkuszu.' },
        },
    },
    AREAS: {
        description: 'Zwraca liczbę obszarów w odwołaniu. Obszar jest to zakres przylegających do siebie komórek lub pojedyncza komórka.',
        abstract: 'Zwraca liczbę obszarów w odwołaniu. Obszar jest to zakres przylegających do siebie komórek lub pojedyncza komórka.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/areas-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Wymagane. Odwołanie do komórki lub zakresu komórek i może odwoływać się do wielu obszarów. Jeśli chcesz określić kilka odwołań jako jeden argument, musisz dołączyć dodatkowe zestawy nawiasów, aby program Microsoft Excel nie interpretował przecinka jako separatora pola. Zobacz poniższy przykład.' },
        },
    },
    CHOOSE: {
        description: 'Funkcja używa argumentu nr_arg, aby zwrócić wartość z listy argumentów wartości. Funkcja WYBIERZ służy do wybierania jednej z maksymalnie 254 wartości na podstawie numeru argumentu. Jeśli na przykład argumenty od wartość1 do wartość7 to dni tygodnia, funkcja WYBIERZ zwróci jeden z dni, gdy jako argument nr_arg zostanie użyta liczba z przedziału między 1 a 7.',
        abstract: 'Funkcja używa argumentu nr_arg, aby zwrócić wartość z listy argumentów wartości. Funkcja WYBIERZ służy do wybierania jednej z maksymalnie 254 wartości na podstawie numeru argumentu. Jeśli na przykład argumenty od wartość1 do wartość7 to dni tygodnia, funkcja WYBIERZ zwróci jeden z dni, gdy jako argument nr_arg zostanie użyta liczba z przedziału między 1 a 7.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/choose-function',
            },
        ],
        functionParameter: {
            indexNum: { name: 'index_num', detail: 'Określa, który argument wartości zostanie wybrany. index_num musi być liczbą od 1 do 254 albo formułą lub odwołaniem do komórki zawierającej taką liczbę.\nJeśli index_num wynosi 1, CHOOSE zwraca value1; jeśli 2, zwraca value2 itd.\nJeśli index_num jest mniejsze niż 1 lub większe niż numer ostatniej wartości na liście, CHOOSE zwraca błąd #VALUE!.\nJeśli index_num jest ułamkiem, przed użyciem zostaje obcięty do najniższej liczby całkowitej.' },
            value1: { name: 'value1', detail: 'CHOOSE wybiera wartość lub działanie do wykonania na podstawie index_num. Argumentami mogą być liczby, odwołania do komórek, nazwy zdefiniowane, formuły, funkcje lub tekst.' },
            value2: { name: 'value2', detail: 'Od 1 do 254 argumentów wartości.' },
        },
    },
    CHOOSECOLS: {
        description: 'Zwraca określone kolumny z tablicy.',
        abstract: 'Zwraca określone kolumny z tablicy.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/choosecols-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Tablica zawierająca kolumny, które mają zostać zwrócone w nowej tablicy. Argument wymagany.' },
            colNum1: { name: 'col_num1', detail: 'Pierwsza kolumna do zwrócenia. Argument wymagany.' },
            colNum2: { name: 'col_num2', detail: 'Dodatkowe kolumny do zwrócenia. Argument opcjonalny.' },
        },
    },
    CHOOSEROWS: {
        description: 'Zwraca określone wiersze z tablicy.',
        abstract: 'Zwraca określone wiersze z tablicy.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/chooserows-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Tablica zawierająca kolumny, które mają zostać zwrócone w nowej tablicy. Argument wymagany.' },
            rowNum1: { name: 'row_num1', detail: 'Numer pierwszego wiersza, który ma zostać zwrócony. Argument wymagany.' },
            rowNum2: { name: 'row_num2', detail: 'Dodatkowe numery wierszy do zwrócenia. Argument opcjonalny.' },
        },
    },
    COLUMN: {
        description: 'Funkcja NR.KOLUMNY zwraca numer kolumny danego odwołania do komórki. Na przykład formuła =KOLUMNA(D10) zwraca wartość 4, ponieważ kolumna D jest czwartą kolumną.',
        abstract: 'Funkcja NR.KOLUMNY zwraca numer kolumny danego odwołania do komórki. Na przykład formuła =KOLUMNA(D10) zwraca wartość 4, ponieważ kolumna D jest czwartą kolumną.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/column-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Komórka lub zakres komórek, dla których chcesz zwrócić numer kolumny.' },
        },
    },
    COLUMNS: {
        description: 'Zwraca liczbę kolumn w tablicy lub odwołaniu.',
        abstract: 'Zwraca liczbę kolumn w tablicy lub odwołaniu.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/columns-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Wymagane. Tablica lub formuła tablicowa albo odwołanie do zakresu komórek, dla którego ma zostać wybrana liczba kolumn.' },
        },
    },
    DROP: {
        description: 'Wyklucza określoną liczbę wierszy lub kolumn z początku lub końca tablicy. Ta funkcja może być przydatna do usuwania nagłówków i stopek w raporcie programu Excel w celu zwrócenia tylko danych.',
        abstract: 'Wyklucza określoną liczbę wierszy lub kolumn z początku lub końca tablicy. Ta funkcja może być przydatna do usuwania nagłówków i stopek w raporcie programu Excel w celu zwrócenia tylko danych.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/drop-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Tablica, z której mają być upuszczanie wierszy lub kolumn.' },
            rows: { name: 'rows', detail: 'Liczba wierszy do upuszczenia. Wartość ujemna powoduje przeniesienie z końca tablicy.' },
            columns: { name: 'columns', detail: 'Liczba kolumn do wykluczenia. Wartość ujemna powoduje przeniesienie z końca tablicy.' },
        },
    },
    EXPAND: {
        description: 'Rozwija lub uzupełnia tablicę do określonych wymiarów wierszy i kolumn.',
        abstract: 'Rozwija lub uzupełnia tablicę do określonych wymiarów wierszy i kolumn.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/expand-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Tablica do rozwinięcia.' },
            rows: { name: 'rows', detail: 'Liczba wierszy w rozwiniętej tablicy. Jeśli go brakuje, wiersze nie zostaną rozwinięte.' },
            columns: { name: 'columns', detail: 'Liczba kolumn w rozwiniętej tablicy. Jeśli go brakuje, kolumny nie zostaną rozwinięte.' },
            padWith: { name: 'pad_with', detail: 'Wartość, za pomocą której ma zostać dopełnienie. Wartość domyślna to #N/D.' },
        },
    },
    FILTER: {
        description: 'W poniższym przykładzie użyto formuły =FILTRUJ(A5:D20;C5:C20=H2;"""), aby zwrócić wszystkie rekordy dla firmy Apple, zaznaczone w komórce H2, a jeśli nie ma jabłek, zwróć pusty ciąg ("").',
        abstract: 'W poniższym przykładzie użyto formuły =FILTRUJ(A5:D20;C5:C20=H2;"""), aby zwrócić wszystkie rekordy dla firmy Apple, zaznaczone w komórce H2, a jeśli nie ma jabłek, zwróć pusty ciąg ("").',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/filter-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Tablica lub zakres do sortowania' },
            include: { name: 'include', detail: 'Tablicę logiczną, której wysokość lub szerokość jest taka sama jak tablicy' },
            ifEmpty: { name: 'if_empty', detail: 'Wartość zwracana, jeśli wszystkie wartości w załączonej tablicy są puste (filtr nic nie zwróci)' },
        },
    },
    FORMULATEXT: {
        description: 'Zwraca formułę w postaci ciągu.',
        abstract: 'Zwraca formułę w postaci ciągu.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/formulatext-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Wymagane. Odwołanie do komórki lub zakresu komórek.' },
        },
    },
    GETPIVOTDATA: {
        description: 'Zwraca widoczne dane przechowywane w tabeli przestawnej.',
        abstract: 'Zwraca widoczne dane przechowywane w tabeli przestawnej.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/getpivotdata-function',
            },
        ],
        functionParameter: {
            dataField: { name: 'dataField', detail: 'Nazwa pola tabeli przestawnej zawierającego dane, które chcesz pobrać. Nazwa musi być ujęta w cudzysłów. Przykład: =WEŹDANETABELI("Sprzedaż";A3). W tym miejscu "Sprzedaż" jest polem Wartości, które chcemy pobrać. Ponieważ nie określono żadnego innego pola, funkcja WEŹDANETABELI zwraca całkowitą kwotę sprzedaży.' },
            pivotTable: { name: 'pivotTable', detail: 'Odwołanie do dowolnej komórki, zakresu komórek lub nazwanego zakresu komórek w tabeli przestawnej. Te informacje służą do określenia, która tabela przestawna zawiera dane do pobrania. Przykład: =WEŹDANETABELI("Sprzedaż";A3). W tym miejscu komórka A3 jest odwołaniem wewnątrz tabeli przestawnej i informuje formułę, której tabeli przestawnej użyć.' },
            field1: { name: 'field1', detail: 'Od 1 do 126 par nazw pól i nazw elementów, które opisują dane do pobrania. Pary mogą mieć dowolną kolejność. Nazwy pól oraz nazwy elementów innych niż daty i liczby muszą być ujęte w cudzysłów. Przykład: =WEŹDANETABELI("Sprzedaż";A3;"Miesiąc";"Mar"). W tym miejscu pole to "Miesiąc", a elementem jest "Mar". Aby określić wiele elementów dla pola, ujmij je w nawiasy klamrowe (na przykład: {"Mar", "Kwi"}). W przypadku tabel przestawnych OLAP elementy mogą zawierać nazwę źródłową wymiaru, a także nazwę źródłową elementu. Para pola i elementu w przypadku tabeli przestawnej OLAP może wyglądać następująco: "[Produkt]";"[Produkt].[Wszystkie Produkty].[Artykuły spożywcze].[Pieczywo]"' },
            item1: { name: 'item1', detail: 'Od 1 do 126 par nazw pól i nazw elementów, które opisują dane do pobrania. Pary mogą mieć dowolną kolejność. Nazwy pól oraz nazwy elementów innych niż daty i liczby muszą być ujęte w cudzysłów. Przykład: =WEŹDANETABELI("Sprzedaż";A3;"Miesiąc";"Mar"). W tym miejscu pole to "Miesiąc", a elementem jest "Mar". Aby określić wiele elementów dla pola, ujmij je w nawiasy klamrowe (na przykład: {"Mar", "Kwi"}). W przypadku tabel przestawnych OLAP elementy mogą zawierać nazwę źródłową wymiaru, a także nazwę źródłową elementu. Para pola i elementu w przypadku tabeli przestawnej OLAP może wyglądać następująco: "[Produkt]";"[Produkt].[Wszystkie Produkty].[Artykuły spożywcze].[Pieczywo]"' },
        },
    },
    HLOOKUP: {
        description: 'Wyszukuje wartość w górnym wierszu tabeli lub tablicy wartości, a następnie zwraca wartość w tej samej kolumnie z wiersza określonego w tabeli lub w tablicy. Funkcji WYSZUKAJ.POZIOMO należy używać wtedy, gdy porównywane wartości są umieszczone w górnym wierszu tabeli danych i kiedy należy przeszukać określoną liczbę wierszy w dół. Funkcji WYSZUKAJ.PIONOWO należy używać wtedy, gdy porównywane wartości są umieszczone w kolumnie znajdującej się z lewej strony danych, które należy znaleźć.',
        abstract: 'Wyszukuje wartość w górnym wierszu tabeli lub tablicy wartości, a następnie zwraca wartość w tej samej kolumnie z wiersza określonego w tabeli lub w tablicy. Funkcji WYSZUKAJ.POZIOMO należy używać wtedy, gdy porównywane wartości są umieszczone w górnym wierszu tabeli danych i kiedy należy przeszukać określoną liczbę wierszy w dół. Funkcji WYSZUKAJ.PIONOWO należy używać wtedy, gdy porównywane wartości są umieszczone w kolumnie znajdującej się z lewej strony danych, które należy znaleźć.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/hlookup-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'Wymagane. Wartość, którą należy znaleźć w pierwszym wierszu tabeli. Szukana_wartość może być wartością, odwołaniem lub ciągiem tekstowym.' },
            tableArray: { name: 'table_array', detail: 'Wymagane. Tabela zawierająca informacje, w której są poszukiwane dane. Należy używać odwołania do zakresu lub nazwy zakresu. Wartości w pierwszym wierszu tablicy określonej przez argument tabela_tablica mogą być tekstem, liczbami lub wartościami logicznymi. Jeśli argument przeszukiwany_zakres ma wartość PRAWDA, wartości w pierwszym wierszu tablicy określonej przez argument tabela_tablica muszą być umieszczone w kolejności rosnącej: ...-2, -1, 0, 1, 2,... , A-Z, FAŁSZ, PRAWDA; w przeciwnym przypadku funkcja WYSZUKAJ.POZIOMO może nie podać poprawnej wartości. Jeśli argument przeszukiwany_zakres ma wartość FAŁSZ, nie ma potrzeby sortowania argumentu tabela_tablica. Teksty pisane dużymi i małymi literami są równoważne. Wartości są sortowane w kolejności rosnącej, od lewej do prawej. Aby uzyskać więcej informacji, zobacz Sortowanie danych w zakresie lub tabeli .' },
            rowIndexNum: { name: 'row_index_num', detail: 'Wymagane. Numer wiersza w table_array, z którego zostanie zwrócona zgodna wartość. Row_index_num 1 zwraca wartość pierwszego wiersza w table_array, row_index_num 2 zwraca drugą wartość wiersza w table_array itd. Jeśli row_index_num jest mniejsza niż 1, funkcja WYSZUKAJ.POZIOMO zwraca #VALUE! wartość błędu; jeśli row_index_num jest większa niż liczba wierszy na table_array, funkcja WYSZUKAJ.POZIOMO zwraca #REF! wartość błędu #ADR!.' },
            rangeLookup: { name: 'range_lookup', detail: 'Opcjonalne. Wartość logiczna określająca, czy funkcja WYSZUKAJ.POZIOMO ma znaleźć dokładne czy przybliżone dopasowanie. Jeśli tą wartością jest PRAWDA bądź argument został pominięty, zwracane jest przybliżone dopasowanie. Innymi słowy, jeśli nie zostanie znalezione dokładne dopasowanie, zwracana jest następna największa wartość, która jest mniejsza niż argument szukana_wartość. Jeśli tą wartością jest FAŁSZ, funkcja WYSZUKAJ.POZIOMO wyszuka dokładne dopasowanie. Jeśli nie zostanie znalezione, zwracana jest wartość błędu #N/D!.' },
        },
    },
    HSTACK: {
        description: 'Dołącza tablice w poziomie i w sekwencji, aby zwrócić większą tablicę.',
        abstract: 'Dołącza tablice w poziomie i w sekwencji, aby zwrócić większą tablicę.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/hstack-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array', detail: 'Tablice do dołączenia.' },
            array2: { name: 'array', detail: 'Tablice do dołączenia.' },
        },
    },
    HYPERLINK: {
        description: 'Tworzy hiperłącze w komórce.',
        abstract: 'Tworzy hiperłącze w komórce.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3093313?hl=pl',
            },
        ],
        functionParameter: {
            url: { name: 'url', detail: 'Pełny adres URL miejsca docelowego łącza w cudzysłowie albo odwołanie do komórki zawierającej taki adres URL. Dozwolone są tylko określone typy łączy: http://, https://, mailto:, aim:, ftp://, gopher://, telnet:// i news://. Jeśli podano inny protokół, link_label będzie wyświetlany w komórce bez hiperłącza. Jeśli nie podano protokołu, zakłada się http:// i dodaje go przed url.' },
            linkLabel: { name: 'link_label', detail: '[ OPCJONALNE — domyślnie url ] — Tekst wyświetlany w komórce jako łącze, ujęty w cudzysłów, albo odwołanie do komórki zawierającej taki tekst. Jeśli link_label odwołuje się do pustej komórki, url zostanie wyświetlony jako łącze, jeśli jest prawidłowy, w przeciwnym razie jako zwykły tekst. Jeśli link_label jest pustym ciągiem (""), komórka będzie wyglądała na pustą, ale łącze nadal będzie dostępne.' },
        },
    },
    IMAGE: {
        description: 'Funkcja OBRAZ wstawia obrazy do komórek z lokalizacji źródłowej wraz z tekstem alternatywnym. Następnie możesz przenosić i zmieniać rozmiar komórek, sortować i filtrować oraz pracować z obrazami w tabeli programu Excel. Ta funkcja służy do wizualnego ulepszania list danych, takich jak spisy, gry, pracownicy i pojęcia matematyczne.',
        abstract: 'Funkcja OBRAZ wstawia obrazy do komórek z lokalizacji źródłowej wraz z tekstem alternatywnym. Następnie możesz przenosić i zmieniać rozmiar komórek, sortować i filtrować oraz pracować z obrazami w tabeli programu Excel. Ta funkcja służy do wizualnego ulepszania list danych, takich jak spisy, gry, pracownicy i pojęcia matematyczne.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/image-function',
            },
        ],
        functionParameter: {
            source: { name: 'source', detail: 'Ścieżka URL pliku obrazu używająca protokołu „https”.' },
            altText: { name: 'alt_text', detail: 'Tekst alternatywny opisujący obraz na potrzeby dostępności.' },
            sizing: { name: 'sizing', detail: 'Określa wymiary obrazu.' },
            height: { name: 'height', detail: 'Niestandardowa wysokość obrazu w pikselach.' },
            width: { name: 'width', detail: 'Niestandardowa szerokość obrazu w pikselach.' },
        },
    },
    INDEX: {
        description: 'Zwraca wartość elementu w tabeli lub tablicy, wybranego przez indeksy numerów kolumn i wierszy.',
        abstract: 'Zwraca wartość elementu w tabeli lub tablicy, wybranego przez indeksy numerów kolumn i wierszy.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/index-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Odwołanie do co najmniej jednego zakresu komórek.' },
            rowNum: { name: 'row_num', detail: 'Numer wiersza w reference, z którego ma zostać zwrócone odwołanie.' },
            columnNum: { name: 'column_num', detail: 'Numer kolumny w reference, z której ma zostać zwrócone odwołanie.' },
            areaNum: { name: 'area_num', detail: 'Wybiera zakres w reference, z którego ma zostać zwrócone przecięcie row_num i column_num.' },
        },
    },
    INDIRECT: {
        description: 'Zwraca odwołanie wyznaczone przez ciąg tekstowy. Odwołania są obliczane natychmiast, aby wyświetlić ich zawartość. Należy skorzystać z funkcji ADR.POŚR, aby zmienić odwołanie do komórki w formule bez zmieniania samej formuły.',
        abstract: 'Zwraca odwołanie wyznaczone przez ciąg tekstowy. Odwołania są obliczane natychmiast, aby wyświetlić ich zawartość. Należy skorzystać z funkcji ADR.POŚR, aby zmienić odwołanie do komórki w formule bez zmieniania samej formuły.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/indirect-function',
            },
        ],
        functionParameter: {
            refText: { name: 'ref_text', detail: 'Wymagane. Odwołanie do komórki zawierającej odwołanie w stylu A1, odwołanie w stylu R1C1, nazwę zdefiniowaną jako odwołanie lub odwołanie do komórki jako ciąg tekstowy. Jeśli argument adres_tekst nie jest prawidłowym odwołaniem do komórki, funkcja ADR.POŚR zwraca błąd #ADR! wartość błędu #ADR!. Jeśli ref_text odwołuje się do innego skoroszytu (odwołanie zewnętrzne), drugi skoroszyt musi być otwarty. Jeśli skoroszyt źródłowy nie jest otwarty, funkcja ADR.POŚR zwraca błąd #ADR! wartość błędu #ADR!. Uwaga Odwołania zewnętrzne nie są obsługiwane w aplikacji internetowej Excel. Jeśli argument adres_tekst odwołuje się do zakresu komórek poza limitem 1 048 576 wierszy lub limitem 16 384 kolumn (XFD), funkcja ADR.POŚR zwraca błąd #ADR! #ZABLOKOWANE!.' },
            a1: { name: 'a1', detail: 'Opcjonalne. Wartość logiczna określająca, jaki typ odwołania znajduje się w komórce adres_tekst. Jeśli wartością argumentu a1 jest PRAWDA lub jest on pominięty, argument adres_tekst jest interpretowany jako odwołanie typu A1. Jeśli wartością argumentu a1 jest FAŁSZ, argument adres_tekst jest interpretowany jako odwołanie typu W1K1.' },
        },
    },
    LOOKUP: {
        description: 'W formie wektorowej funkcja WYSZUKAJ wyszukuje wartości w zakresie jednowierszowym lub jednokolumnowym (określanym jako wektor) i zwraca wartości z tej samej pozycji w drugim zakresie jednowierszowym lub jednokolumnowym.',
        abstract: 'W formie wektorowej funkcja WYSZUKAJ wyszukuje wartości w zakresie jednowierszowym lub jednokolumnowym (określanym jako wektor) i zwraca wartości z tej samej pozycji w drugim zakresie jednowierszowym lub jednokolumnowym.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/lookup-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'Wartość wyszukiwana przez LOOKUP w pierwszym wektorze. lookup_value może być liczbą, tekstem, wartością logiczną, nazwą lub odwołaniem wskazującym wartość.' },
            lookupVectorOrArray: { name: 'lookup_vectorOrArray', detail: 'Zakres zawierający tylko jeden wiersz albo jedną kolumnę.' },
            resultVector: { name: 'result_vector', detail: 'Zakres zawierający tylko jeden wiersz albo jedną kolumnę. result_vector musi mieć taki sam rozmiar jak lookup_vector.' },
        },
    },
    MATCH: {
        description: 'Funkcja PODAJ.POZYCJĘ wyszukuje określony element w zakresie komórek, a następnie zwraca względną pozycję tego elementu w zakresie. Jeśli na przykład zakres A1:A3 zawiera wartości 5, 25 i 38, formuła =PODAJ.POZYCJĘ(25;A1:A3;0) zwraca liczbę 2, ponieważ 25 jest drugim elementem w zakresie.',
        abstract: 'Funkcja PODAJ.POZYCJĘ wyszukuje określony element w zakresie komórek, a następnie zwraca względną pozycję tego elementu w zakresie. Jeśli na przykład zakres A1:A3 zawiera wartości 5, 25 i 38, formuła =PODAJ.POZYCJĘ(25;A1:A3;0) zwraca liczbę 2, ponieważ 25 jest drugim elementem w zakresie.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/match-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'Funkcja PODAJ.POZYCJĘ znajduje największą wartość, która jest mniejsza niż lub równa lookup_value . Wartości argumentu lookup_array muszą być umieszczone w kolejności rosnącej, na przykład: ...-2, -1, 0, 1, 2, ..., A-Z, FAŁSZ, PRAWDA.' },
            lookupArray: { name: 'lookup_array', detail: 'Funkcja PODAJ.POZYCJĘ znajduje pierwszą wartość, która jest dokładnie równa lookup_value . Wartości argumentu lookup_array mogą być w dowolnej kolejności.' },
            matchType: { name: 'match_type', detail: 'Funkcja PODAJ.POZYCJĘ znajduje najmniejszą wartość, która jest większa niż lub równa lookup_value . Wartości argumentu lookup_array muszą być umieszczone w kolejności malejącej, na przykład: PRAWDA, FAŁSZ, Z-A, ... 2, 1, 0, -1, -2, ...i tak dalej.' },
        },
    },
    OFFSET: {
        description: 'Zwraca odwołanie do zakresu, który jest podaną liczbą wierszy lub kolumn począwszy od komórki lub zakresu komórek. Zwrócone odwołanie może być pojedynczą komórką lub zakresem komórek. Można określić liczbę zwracanych wierszy i kolumn.',
        abstract: 'Zwraca odwołanie do zakresu, który jest podaną liczbą wierszy lub kolumn począwszy od komórki lub zakresu komórek. Zwrócone odwołanie może być pojedynczą komórką lub zakresem komórek. Można określić liczbę zwracanych wierszy i kolumn.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/offset-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Wymagane. Odwołanie, od którego wyznacza się przesunięcie. Odwołanie musi określać komórkę lub zakres sąsiadujących komórek. W przeciwnym wypadku funkcja PRZESUNIĘCIE zwróci wartość błędu #ARG!.' },
            rows: { name: 'rows', detail: 'Wymagane. Liczba wierszy w górę lub w dół, o które należy przesunąć lewą górną komórkę. Podanie wartości 5 jako argumentu wiersze oznacza, że lewa górna komórka odwołania jest pięć wierszy poniżej odwołania określonego przez argument odwołanie. Argument wiersze może być dodatni (co oznacza przesunięcie w dół) lub ujemny (co oznacza przesunięcie w górę).' },
            cols: { name: 'columns', detail: 'Wymagane. Liczba kolumn w lewo lub w prawo, o które należy przesunąć lewą górną komórkę wynikową. Podanie wartości 5 jako argumentu kolumny oznacza, że lewa górna komórka odwołania jest pięć kolumn na prawo od odwołania określonego przez argument odwołanie. Argument kolumny może być dodatni (co oznacza przesunięcie w prawo) lub ujemny (co oznacza przesunięcie w lewo).' },
            height: { name: 'height', detail: 'Opcjonalne. Wysokość, jako liczba wierszy, którą ma mieć zwracane odwołanie. Wysokość musi być liczbą dodatnią.' },
            width: { name: 'width', detail: 'Opcjonalne. Szerokość, jako liczba kolumn, którą ma mieć zwracane odwołanie. Szerokość musi być liczbą dodatnią.' },
        },
    },
    ROW: {
        description: 'Zwraca numer wiersza odwołania.',
        abstract: 'Zwraca numer wiersza odwołania.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/row-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Opcjonalne. Komórka lub zakres komórek, dla których ma zostać określony numer wiersza. Jeśli argument odwołanie zostanie pominięty, przyjmuje się, że jest to odwołanie do komórki, w której pojawia się funkcja WIERSZ. Jeśli argument odwołanie jest zakresem komórek i jeśli argument WIERSZ jest wprowadzany jako tablica pionowa, funkcja WIERSZ zwraca numery wierszy odwołania jako tablicę pionową. Odwołanie nie może odnosić się do wielu obszarów.' },
        },
    },
    ROWS: {
        description: 'Zwraca liczbę wierszy w odwołaniu lub tablicy.',
        abstract: 'Zwraca liczbę wierszy w odwołaniu lub tablicy.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/rows-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Wymagane. Tablica, formuła tablicowa lub odwołanie do zakresu komórek, dla którego ma zostać wybrana liczba wierszy.' },
        },
    },
    RTD: {
        description: 'Pobiera dane czasu rzeczywistego z programu obsługującego automatyzację COM.',
        abstract: 'Pobiera dane czasu rzeczywistego z programu obsługującego automatyzację COM.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/rtd-function',
            },
        ],
        functionParameter: {
            progId: { name: 'progId', detail: 'Wymagane. Nazwa identyfikatora ProgID zarejestrowanego dodatku automatyzacji COM zainstalowanego na komputerze lokalnym. Nazwa musi być ujęta w cudzysłów.' },
            server: { name: 'server', detail: 'Wymagane. Nazwa serwera, na którym dodatek ma zostać uruchomiony. Jeśli nie ma serwera, a program jest uruchamiany lokalnie, należy pozostawić ten argument pusty. W przeciwnym razie należy ująć nazwę serwera w cudzysłów (""). Gdy funkcja DANE.CZASU.RZECZ jest używana w języku Visual Basic for Applications (VBA), dla serwera jest wymagany podwójny cudzysłów lub właściwość VBA NullString , nawet jeśli serwer jest uruchamiany lokalnie.' },
            topic1: { name: 'topic1', detail: 'Temat1 jest wymagany, pozostałe tematy są opcjonalne. Od 1 do 253 parametrów, które wspólnie reprezentują unikatowy zestaw danych czasu rzeczywistego.' },
            topic2: { name: 'topic2', detail: 'Temat1 jest wymagany, pozostałe tematy są opcjonalne. Od 1 do 253 parametrów, które wspólnie reprezentują unikatowy zestaw danych czasu rzeczywistego.' },
        },
    },
    SORT: {
        description: 'W tym przykładzie sortujemy pojedynczo wg pól Region, Przedstawiciel handlowy i Produkt za pomocą funkcji =SORTUJ(A2:A17), kopiując przez komórki F2, H2 oraz J2.',
        abstract: 'W tym przykładzie sortujemy pojedynczo wg pól Region, Przedstawiciel handlowy i Produkt za pomocą funkcji =SORTUJ(A2:A17), kopiując przez komórki F2, H2 oraz J2.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/sort-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Zakres lub tablica do posortowania' },
            sortIndex: { name: 'sort_index', detail: 'Liczba wskazująca wiersz lub kolumnę według których mają zostać posortowane dane' },
            sortOrder: { name: 'sort_order', detail: 'Liczba wskazująca żądaną kolejność sortowania; 1 dla kolejności rosnącej (domyślnie), -1 dla kolejności malejącej' },
            byCol: { name: 'by_col', detail: 'Wartość logiczna wskazująca żądaną kolejność sortowania; FAŁSZ, aby sortować wg wierszy (domyślnie); PRAWDA, aby sortować wg kolumn' },
        },
    },
    SORTBY: {
        description: 'W tym przykładzie sortujemy listę nazwisk osób według ich wieku, w kolejności rosnącej.',
        abstract: 'W tym przykładzie sortujemy listę nazwisk osób według ich wieku, w kolejności rosnącej.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/sortby-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Tablica lub zakres do sortowania' },
            byArray1: { name: 'by_array1', detail: 'Tablica lub zakres do sortowania według' },
            sortOrder1: { name: 'sort_order1', detail: 'Kolejność sortowania. 1 dla rosnącej, -1 dla malejącej. Wartość domyślna to rosnąco.' },
            byArray2: { name: 'by_array2', detail: 'Tablica lub zakres do sortowania według' },
            sortOrder2: { name: 'sort_order2', detail: 'Kolejność sortowania. 1 dla rosnącej, -1 dla malejącej. Wartość domyślna to rosnąco.' },
        },
    },
    TAKE: {
        description: 'Zwraca określoną liczbę ciągłych wierszy lub kolumn od początku lub końca tablicy.',
        abstract: 'Zwraca określoną liczbę ciągłych wierszy lub kolumn od początku lub końca tablicy.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/take-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Tablica, z której mają zostać pobrane wiersze lub kolumny.' },
            rows: { name: 'rows', detail: 'Liczba wierszy do wykonania. Wartość ujemna pobiera z końca tablicy.' },
            columns: { name: 'columns', detail: 'Liczba kolumn do podjęcia. Wartość ujemna pobiera z końca tablicy.' },
        },
    },
    TOCOL: {
        description: 'Zwraca tablicę w jednej kolumnie.',
        abstract: 'Zwraca tablicę w jednej kolumnie.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/tocol-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Tablica lub odwołanie, które ma zostać zwrócone jako kolumna.' },
            ignore: { name: 'ignore', detail: 'Określa, czy ignorować określone typy wartości. Domyślnie żadne wartości nie są ignorowane:\n0 Zachowaj wszystkie wartości (domyślnie)\n1 Ignoruj puste komórki\n2 Ignoruj błędy\n3 Ignoruj puste komórki i błędy' },
            scanByColumn: { name: 'scan_by_column', detail: 'Skanuje tablicę według kolumn. Domyślnie tablica jest skanowana według wierszy. Skanowanie określa, czy wartości są uporządkowane według wierszy, czy kolumn.' },
        },
    },
    TOROW: {
        description: 'Zwraca tablicę w jednym wierszu.',
        abstract: 'Zwraca tablicę w jednym wierszu.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/torow-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Tablica lub odwołanie, które ma zostać zwrócone jako wiersz.' },
            ignore: { name: 'ignore', detail: 'Określa, czy ignorować określone typy wartości. Domyślnie żadne wartości nie są ignorowane:\n0 Zachowaj wszystkie wartości (domyślnie)\n1 Ignoruj puste komórki\n2 Ignoruj błędy\n3 Ignoruj puste komórki i błędy' },
            scanByColumn: { name: 'scan_by_column', detail: 'Skanuje tablicę według kolumn. Domyślnie tablica jest skanowana według wierszy. Skanowanie określa, czy wartości są uporządkowane według wierszy, czy kolumn.' },
        },
    },
    TRANSPOSE: {
        description: 'Czasem konieczne jest przemieszczenie lub obrócenie komórek. Możesz to zrobić, korzystając z funkcji kopiowania i wklejania oraz opcji Transpozycja . Efektem będzie jednak zduplikowanie danych. Jeśli nie chcesz duplikować danych, możesz zamiast tego wpisać formułę z funkcją TRANSPONUJ. Na przykład na poniższym obrazie formuła =TRANSPONUJ(A1:B4) pobiera komórki od A1 do B4 i rozmieszcza je w poziomie.',
        abstract: 'Czasem konieczne jest przemieszczenie lub obrócenie komórek. Możesz to zrobić, korzystając z funkcji kopiowania i wklejania oraz opcji Transpozycja . Efektem będzie jednak zduplikowanie danych. Jeśli nie chcesz duplikować danych, możesz zamiast tego wpisać formułę z funkcją TRANSPONUJ. Na przykład na poniższym obrazie formuła =TRANSPONUJ(A1:B4) pobiera komórki od A1 do B4 i rozmieszcza je w poziomie.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/transpose-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Zakres komórek lub tablica w arkuszu.' },
        },
    },
    UNIQUE: {
        description: 'Zwraca unikatowe nazwy z listy nazw',
        abstract: 'Zwraca unikatowe nazwy z listy nazw',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/unique-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Zakres tablicy, z którego powinny zostać zwrócone unikalne rzędy lub kolumny' },
            byCol: { name: 'by_col', detail: 'Argument by_col jest wartością logiczną wskazującą sposób porównywania. PRAWDA porówna kolumny ze sobą i zwróci unikatowe kolumny FAŁSZ (lub pominięte) porówna wiersze ze sobą i zwróci unikatowe wiersze' },
            exactlyOnce: { name: 'exactly_once', detail: 'Argument exactly_once jest wartością logiczną, która zwraca wiersze lub kolumny występujące dokładnie raz w zakresie lub tablicy. Jest to koncepcja bazy danych dotycząca unikatowości. PRAWDA zwróci wszystkie odrębne wiersze lub kolumny, które występują dokładnie raz z zakresie lub tablicy FAŁSZ (lub pominięte) zwróci wszystkie odrębne wiersze lub kolumny z zakresie lub tablicy' },
        },
    },
    VLOOKUP: {
        description: 'Użyj funkcji WYSZUKAJ.PIONOWO do wyszukiwania wartości w tabeli.',
        abstract: 'Użyj funkcji WYSZUKAJ.PIONOWO do wyszukiwania wartości w tabeli.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/vlookup-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'Wartość, której chcesz szukać. Musi znajdować się w pierwszej kolumnie zakresu komórek określonego w argumencie table_array.' },
            tableArray: { name: 'table_array', detail: 'Zakres komórek, w którym VLOOKUP szuka lookup_value i wartości zwracanej. Możesz użyć nazwanego zakresu lub tabeli oraz nazw zamiast odwołań do komórek.' },
            colIndexNum: { name: 'col_index_num', detail: 'Numer kolumny zawierającej wartość zwracaną, zaczynając od 1 dla skrajnie lewej kolumny table_array.' },
            rangeLookup: { name: 'range_lookup', detail: 'Wartość logiczna określająca, czy VLOOKUP ma znaleźć przybliżone czy dokładne dopasowanie: przybliżone — 1/TRUE, dokładne — 0/FALSE.' },
        },
    },
    VSTACK: {
        description: 'Dołącza tablice w poziomie i w sekwencji, aby zwrócić większą tablicę.',
        abstract: 'Dołącza tablice w poziomie i w sekwencji, aby zwrócić większą tablicę.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/vstack-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array', detail: 'Tablice do dołączenia.' },
            array2: { name: 'array', detail: 'Tablice do dołączenia.' },
        },
    },
    WRAPCOLS: {
        description: 'Zawija podany wiersz lub kolumnę wartości według kolumn po określonej liczbie elementów, aby utworzyć nową tablicę.',
        abstract: 'Zawija podany wiersz lub kolumnę wartości według kolumn po określonej liczbie elementów, aby utworzyć nową tablicę.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/wrapcols-function',
            },
        ],
        functionParameter: {
            vector: { name: 'vector', detail: 'Wektor lub odwołanie do zawijania.' },
            wrapCount: { name: 'wrap_count', detail: 'Maksymalna liczba wartości dla każdej kolumny.' },
            padWith: { name: 'pad_with', detail: 'Wartość, za pomocą której ma zostać dopełnienie. Wartość domyślna to #N/D.' },
        },
    },
    WRAPROWS: {
        description: 'Zawija podany wiersz lub kolumnę wartości według wierszy po określonej liczbie elementów, aby utworzyć nową tablicę.',
        abstract: 'Zawija podany wiersz lub kolumnę wartości według wierszy po określonej liczbie elementów, aby utworzyć nową tablicę.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/wraprows-function',
            },
        ],
        functionParameter: {
            vector: { name: 'vector', detail: 'Wektor lub odwołanie do zawijania.' },
            wrapCount: { name: 'wrap_count', detail: 'Maksymalna liczba wartości dla każdego wiersza.' },
            padWith: { name: 'pad_with', detail: 'Wartość, za pomocą której ma zostać dopełnienie. Wartość domyślna to #N/D.' },
        },
    },
    XLOOKUP: {
        description: 'Użyj funkcji X.WYSZUKAJ w celu znajdowania danych w tabeli lub zakresie według wierszy. Na przykład wyszukaj cenę części samochodowej według numeru części lub znajdź nazwisko pracownika na podstawie jego identyfikatora pracownika. Dzięki funkcji X.WYSZUKAJ możesz szukać wyszukiwanego terminu w jednej kolumnie i zwracać wynik z tego samego wiersza w innej kolumnie, niezależnie od tego, po której stronie znajduje się kolumna zwrotna.',
        abstract: 'Użyj funkcji X.WYSZUKAJ w celu znajdowania danych w tabeli lub zakresie według wierszy. Na przykład wyszukaj cenę części samochodowej według numeru części lub znajdź nazwisko pracownika na podstawie jego identyfikatora pracownika. Dzięki funkcji X.WYSZUKAJ możesz szukać wyszukiwanego terminu w jednej kolumnie i zwracać wynik z tego samego wiersza w innej kolumnie, niezależnie od tego, po której stronie znajduje się kolumna zwrotna.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/xlookup-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'Wartość do wyszukania *W przypadku pominięcia funkcja X.WYSZUKAJ zwraca puste komórki, które znajduje w lookup_array .' },
            lookupArray: { name: 'lookup_array', detail: 'Tablica lub zakres do przeszukania' },
            returnArray: { name: 'return_array', detail: 'Tablica lub zakres do zwrócenia' },
            ifNotFound: { name: 'if_not_found', detail: 'Jeśli prawidłowe dopasowanie nie zostanie znalezione, zwrócony zostanie podany tekst [jeżeli_nie_znaleziono]. Jeśli nie znaleziono prawidłowego dopasowania i brakuje [jeżeli_nie_znaleziono], zwracany jest błąd #N/D .' },
            matchMode: { name: 'match_mode', detail: 'Określ typ dopasowania: 0 — Dokładne dopasowanie. Jeśli nie znaleziono żadnego elementu, zwróć błąd #N/D. To jest domyślne ustawienie. -1 — Dokładne dopasowanie. Jeśli nie znaleziono żadnego elementu, zwróć następny mniejszy element. 1 — Dokładne dopasowanie. Jeśli nie znaleziono żadnego elementu, zwróć następny większy element. 2— dopasowanie z symbolem wieloznacznym, gdzie znaki *, ? i ~ mają specjalne znaczenie .' },
            searchMode: { name: 'search_mode', detail: 'Określ tryb wyszukiwania, którego chcesz użyć: 1 — Wyszukiwanie rozpoczyna się od pierwszego elementu. To jest domyślne ustawienie. -1 — Wyszukiwanie odwrotne rozpoczyna się od ostatniego elementu. 2 — Wyszukiwanie binarne polegające na sortowaniu tablicy szukana_tablica w kolejności rosnącej . Jeśli sortowanie nie zostanie wykonane, zostaną zwrócone nieprawidłowe wyniki. -2 — wyszukiwanie binarne polegające na sortowaniu elementu szukana_tablica w kolejności malejącej . Jeśli sortowanie nie zostanie wykonane, zostaną zwrócone nieprawidłowe wyniki.' },
        },
    },
    XMATCH: {
        description: 'Załóżmy, że mamy listę produktów w komórkach od C3 do C7 i chcemy ustalić, gdzie na liście znajduje się produkt z komórki E3. W tym miejscu użyjemy funkcji XMATCH do określenia pozycji elementu na liście.',
        abstract: 'Załóżmy, że mamy listę produktów w komórkach od C3 do C7 i chcemy ustalić, gdzie na liście znajduje się produkt z komórki E3. W tym miejscu użyjemy funkcji XMATCH do określenia pozycji elementu na liście.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/xmatch-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'Szukana wartość' },
            lookupArray: { name: 'lookup_array', detail: 'Tablica lub zakres do przeszukania' },
            matchMode: { name: 'match_mode', detail: 'Określ typ dopasowania: 0 — dokładne dopasowanie (domyślne) -1 — dokładne dopasowanie lub następny najmniejszy element 1 — dokładne dopasowanie lub następny największy element 2— dopasowanie z symbolem wieloznacznym, gdzie znaki *, ? i ~ mają specjalne znaczenie .' },
            searchMode: { name: 'search_mode', detail: 'Określ typ wyszukiwania: 1 — wyszukiwanie od pierwszego do ostatniego (domyślne) -1 — wyszukiwanie od ostatniego do pierwszego (wyszukiwanie odwrócone) 2 — Wyszukiwanie binarne polegające na sortowaniu tablicy szukana_tablica w kolejności rosnącej . Jeśli sortowanie nie zostanie wykonane, zostaną zwrócone nieprawidłowe wyniki. -2 — wyszukiwanie binarne polegające na sortowaniu elementu szukana_tablica w kolejności malejącej . Jeśli sortowanie nie zostanie wykonane, zostaną zwrócone nieprawidłowe wyniki.' },
        },
    },
};

export default locale;
