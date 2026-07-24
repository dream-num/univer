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
    DATE: {
        description: 'Funkcja DATA zwraca kolejną liczbę porządkową reprezentującą konkretną datę.',
        abstract: 'Funkcja DATA zwraca kolejną liczbę porządkową reprezentującą konkretną datę.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/date-function',
            },
        ],
        functionParameter: {
            year: { name: 'year', detail: 'Wartość argumentu year może zawierać od jednej do czterech cyfr. Excel interpretuje year zgodnie z systemem dat używanym przez komputer. Domyślnie Univer używa systemu dat 1900, w którym pierwszą datą jest 1 stycznia 1900 r.' },
            month: { name: 'month', detail: 'Dodatnia lub ujemna liczba całkowita oznaczająca miesiąc roku od 1 do 12 (od stycznia do grudnia).' },
            day: { name: 'day', detail: 'Dodatnia lub ujemna liczba całkowita oznaczająca dzień miesiąca od 1 do 31.' },
        },
    },
    DATEDIF: {
        description: 'Oblicza liczbę dni, miesięcy lub lat między dwiema datami.',
        abstract: 'Oblicza liczbę dni, miesięcy lub lat między dwiema datami.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/datedif-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Data reprezentująca pierwszą lub początkową datę danego okresu. Daty mogą być wprowadzane jako ciąg tekstowy w cudzysłowie (na przykład "2001-1-30"), jako numery kolejne (na przykład wartość 36921 reprezentuje datę 30 stycznia 2001, jeśli używasz systemu daty 1900) lub jako wynik innych formuł bądź funkcji (na przykład DATA.WARTOŚĆ("2001-1-30")).' },
            endDate: { name: 'end_date', detail: '— data reprezentująca ostatnią lub końcową datę okresu.' },
            unit: { name: 'Jednostka', detail: 'Typ informacji, które mają zostać zwrócone, gdzie: Jednostka****Zwraca " Y "Liczba pełnych lat w okresie". M "Liczba pełnych miesięcy w okresie". D "Liczba dni w okresie". MD "Różnica między dniami w start_date a end_date. Miesiące i lata dat są ignorowane. Ważne: Nie zalecamy używania argumentu "MD", ponieważ istnieją znane ograniczenia. Zobacz sekcję znanych problemów poniżej". YM "Różnica między miesiącami w start_date a end_date. Dni i lata dat są ignorowane" YD "Różnica między dniami start_date a end_date. Lata dat są ignorowane.' },
        },
    },
    DATEVALUE: {
        description: 'Funkcja DATA.WARTOŚĆ konwertuje datę zapisaną jako tekst na liczbę kolejną rozpoznawaną przez program Excel jako data. Na przykład formuła =DATA.WARTOŚĆ("1 sty 2008") zwraca wartość 39448, czyli liczbę kolejną oznaczającą datę 1 stycznia 2008 r. Jednak wyniki funkcji DATA.WARTOŚĆ w konkretnym systemie mogą być inne niż w tym przykładzie ze względu na ustawienie daty używane w systemie komputera.',
        abstract: 'Funkcja DATA.WARTOŚĆ konwertuje datę zapisaną jako tekst na liczbę kolejną rozpoznawaną przez program Excel jako data. Na przykład formuła =DATA.WARTOŚĆ("1 sty 2008") zwraca wartość 39448, czyli liczbę kolejną oznaczającą datę 1 stycznia 2008 r. Jednak wyniki funkcji DATA.WARTOŚĆ w konkretnym systemie mogą być inne niż w tym przykładzie ze względu na ustawienie daty używane w systemie komputera.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/datevalue-function',
            },
        ],
        functionParameter: {
            dateText: { name: 'date_text', detail: 'Wymagane. Tekst reprezentujący datę w formacie daty programu Excel lub odwołanie do komórki zawierającej tekst określający datę w formacie daty programu Excel. Na przykład "2008-01-30" i "30 sty 2008" są ciągami tekstowymi w cudzysłowach reprezentującymi daty. W domyślnym systemie daty w programie Microsoft Excel dla systemu Windows argument date_text musi odzwierciedlać datę między 1 stycznia 1900 a 31 grudnia 9999. Funkcja DATA.WARTOŚĆ zwraca #VALUE! jeśli wartość argumentu date_text jest spoza tego zakresu. Jeśli część roku argumentu date_text zostanie pominięta, funkcja DATA.WARTOŚĆ użyje bieżącego roku z wbudowanego zegara komputera. Informacje o godzinie w argurze date_text są ignorowane.' },
        },
    },
    DAY: {
        description: 'Zwraca dzień daty reprezentowanej przez argument liczba_kolejna. Dzień jest wyświetlany jako liczba całkowita z zakresu od 1 do 31.',
        abstract: 'Zwraca dzień daty reprezentowanej przez argument liczba_kolejna. Dzień jest wyświetlany jako liczba całkowita z zakresu od 1 do 31.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/day-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Wymagane. Data poszukiwanego dnia. Daty powinny być wprowadzane przy użyciu funkcji DATA lub jako wynik innych formuł lub funkcji. Na przykład w przypadku daty 23 maja 2008 należy użyć funkcji DATA(2008;5;23). Jeśli daty są wprowadzane jako tekst , mogą wystąpić problemy.' },
        },
    },
    DAYS: {
        description: 'Zwraca liczbę dni między dwiema datami.',
        abstract: 'Zwraca liczbę dni między dwiema datami.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/days-function',
            },
        ],
        functionParameter: {
            endDate: { name: 'end_date', detail: 'Wymagane. Data_początkowa i data_końcowa to dwie daty, między którymi ma zostać ustalona liczba dni.' },
            startDate: { name: 'start_date', detail: 'Wymagane. Data_początkowa i data_końcowa to dwie daty, między którymi ma zostać ustalona liczba dni.' },
        },
    },
    DAYS360: {
        description: 'Funkcja DNI.360 zwraca liczbę dni między dwiema datami na podstawie roku 360-dniowego (dwanaście 30-dniowych miesięcy), który jest używany w pewnych obliczeniach księgowych. Ta funkcja ułatwia obliczanie płatności, jeśli system księgowania jest oparty na dwunastu 30-dniowych miesiącach.',
        abstract: 'Funkcja DNI.360 zwraca liczbę dni między dwiema datami na podstawie roku 360-dniowego (dwanaście 30-dniowych miesięcy), który jest używany w pewnych obliczeniach księgowych. Ta funkcja ułatwia obliczanie płatności, jeśli system księgowania jest oparty na dwunastu 30-dniowych miesiącach.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/days360-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'start_date i end_date to dwie daty, między którymi chcesz poznać liczbę dni.' },
            endDate: { name: 'end_date', detail: 'start_date i end_date to dwie daty, między którymi chcesz poznać liczbę dni.' },
            method: { name: 'method', detail: 'Wartość logiczna określająca, czy w obliczeniu ma zostać użyta metoda amerykańska czy europejska.' },
        },
    },
    EDATE: {
        description: 'Zwraca liczbę kolejną, odpowiadającą dacie przypadającej określoną liczbę miesięcy przed lub po wskazanej dacie (data_początkowa). Funkcja NR.SER.DATY umożliwia obliczanie dat spłaty lub dat należnej płatności, przypadających na ten sam dzień miesiąca, co data emisji.',
        abstract: 'Zwraca liczbę kolejną, odpowiadającą dacie przypadającej określoną liczbę miesięcy przed lub po wskazanej dacie (data_początkowa). Funkcja NR.SER.DATY umożliwia obliczanie dat spłaty lub dat należnej płatności, przypadających na ten sam dzień miesiąca, co data emisji.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/edate-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Wymagane. Data reprezentująca datę początkową. Daty powinny być wprowadzane przy użyciu funkcji DATA albo stanowić wyniki innych formuł lub funkcji. Na przykład w przypadku daty 23 maja 2008 należy użyć funkcji DATA(2008;5;23). Jeśli daty są wprowadzane jako tekst , mogą wystąpić problemy.' },
            months: { name: 'months', detail: 'Wymagane. Liczba miesięcy przed datą określoną argumentem data_początkowa lub po tej dacie. Dodatnia wartość argumentu „miesiące” oznacza datę przyszłą, ujemna oznacza datę przeszłą.' },
        },
    },
    EOMONTH: {
        description: 'Zwraca liczbę kolejną daty ostatniego dnia miesiąca, następującego określoną liczbę miesięcy przed lub po dacie określonej argumentem data_początkowa. Funkcja NR.SER.OST.DN.MIES umożliwia obliczanie dat spłaty lub dat należnej płatności, wypadających ostatniego dnia miesiąca.',
        abstract: 'Zwraca liczbę kolejną daty ostatniego dnia miesiąca, następującego określoną liczbę miesięcy przed lub po dacie określonej argumentem data_początkowa. Funkcja NR.SER.OST.DN.MIES umożliwia obliczanie dat spłaty lub dat należnej płatności, wypadających ostatniego dnia miesiąca.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/eomonth-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Wymagane. Data reprezentująca datę początkową. Daty powinny być wprowadzane przy użyciu funkcji DATA albo stanowić wyniki innych formuł lub funkcji. Na przykład w przypadku daty 23 maja 2008 należy użyć funkcji DATA(2008;5;23). Jeśli daty są wprowadzane jako tekst , mogą wystąpić problemy.' },
            months: { name: 'months', detail: 'Wymagane. Liczba miesięcy przed datą określoną argumentem data_początkowa lub po tej dacie. Dodatnia wartość argumentu „miesiące” oznacza datę przyszłą, ujemna oznacza datę przeszłą. Uwaga Jeśli argument miesiące nie jest liczbą całkowitą, jego wartość zostanie obcięta do liczby całkowitej.' },
        },
    },
    EPOCHTODATE: {
        description: 'Konwertuje znacznik czasu epoki Unix w sekundach, milisekundach lub mikrosekundach na datę i godzinę w uniwersalnym czasie koordynowanym (UTC).',
        abstract: 'Konwertuje znacznik czasu epoki Unix w sekundach, milisekundach lub mikrosekundach na datę i godzinę w uniwersalnym czasie koordynowanym (UTC).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/13193461?hl=pl',
            },
        ],
        functionParameter: {
            timestamp: { name: 'timestamp', detail: 'Znacznik czasu epoki Unix w sekundach, milisekundach lub mikrosekundach.' },
            unit: { name: 'unit', detail: '[OPCJONALNE — domyślnie 1]: Jednostka czasu, w której wyrażono znacznik czasu.' },
        },
    },
    HOUR: {
        description: 'Zwraca godzinę wartości czasu. Godzina jest podawana jako liczba całkowita z zakresu od 0 (północ) do 23 (11:00 wieczór).',
        abstract: 'Zwraca godzinę wartości czasu. Godzina jest podawana jako liczba całkowita z zakresu od 0 (północ) do 23 (11:00 wieczór).',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/hour-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Wymagane. Czas zawierający godzinę, którą należy znaleźć. Czas może być wprowadzany jako ciąg tekstowy w cudzysłowie (na przykład "18:45"), jako liczba w systemie dziesiętnym (na przykład jako wartość 0,78125 reprezentująca godzinę 18:45) lub jako wynik innych formuł lub funkcji (na przykład CZAS.WARTOŚĆ("6:45 PM")).' },
        },
    },
    ISOWEEKNUM: {
        description: 'Zwraca numer tygodnia ISO w roku dla określonej daty.',
        abstract: 'Zwraca numer tygodnia ISO w roku dla określonej daty.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/isoweeknum-function',
            },
        ],
        functionParameter: {
            date: { name: 'date', detail: 'Wymagane. Data to kod daty i godziny używany przez program Excel do obliczania daty i godziny.' },
        },
    },
    MINUTE: {
        description: 'Zwraca minuty jako wartość czasu. Minuta jest podawana jako liczba całkowita z zakresu od 0 do 59.',
        abstract: 'Zwraca minuty jako wartość czasu. Minuta jest podawana jako liczba całkowita z zakresu od 0 do 59.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/minute-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Wymagane. Czas zawierający minutę, którą należy znaleźć. Czas można wprowadzić jako ciąg tekstowy w cudzysłowie, na przykład "6:45 PM", jako liczbę w systemie dziesiętnym, na przykład jako wartość 0,78125 reprezentującą czas 6:45 PM, lub jako wynik innych formuł lub funkcji, na przykład CZAS.WARTOŚĆ("6:45 PM").' },
        },
    },
    MONTH: {
        description: 'Zwraca miesiąc daty reprezentowanej przez kolejną liczbę. Miesiąc jest podawany w postaci liczby całkowitej z zakresu od 1 (styczeń) to 12 (grudzień).',
        abstract: 'Zwraca miesiąc daty reprezentowanej przez kolejną liczbę. Miesiąc jest podawany w postaci liczby całkowitej z zakresu od 1 (styczeń) to 12 (grudzień).',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/month-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Wymagane. Data poszukiwanego miesiąca. Daty powinny być wprowadzane przy użyciu funkcji DATA lub jako wynik innych formuł bądź funkcji. Na przykład w przypadku daty 23 maja 2008 należy użyć funkcji DATA(2008;5;23). Jeśli daty są wprowadzane jako tekst , mogą wystąpić problemy.' },
        },
    },
    NETWORKDAYS: {
        description: 'Zwraca liczbę pełnych dni roboczych pomiędzy data_początkowa i data_końcowa. Dni robocze nie zawierają dni końca tygodnia (weekendów) oraz dat oznaczonych jako święta. Funkcję DNI.ROBOCZE należy stosować do obliczania zarobków pracowników, wynikających z łącznej liczby dni przepracowanych w określonym czasie.',
        abstract: 'Zwraca liczbę pełnych dni roboczych pomiędzy data_początkowa i data_końcowa. Dni robocze nie zawierają dni końca tygodnia (weekendów) oraz dat oznaczonych jako święta. Funkcję DNI.ROBOCZE należy stosować do obliczania zarobków pracowników, wynikających z łącznej liczby dni przepracowanych w określonym czasie.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/networkdays-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Wymagane. Data reprezentująca datę początkową.' },
            endDate: { name: 'end_date', detail: 'Wymagane. Data reprezentująca datę końcową.' },
            holidays: { name: 'holidays', detail: 'Opcjonalne. Opcjonalny zakres jednej lub kilku dat, takich jak święta państwowe i kościelne oraz święta ruchome, które są wykluczane z kalendarza dni roboczych. Lista może być zarówno zakresem komórek, które zawierają daty, jak i stałą tablicową zawierającą liczby kolejne reprezentujące daty.' },
        },
    },
    NETWORKDAYS_INTL: {
        description: 'Zwraca liczbę dni roboczych między dwiema datami zgodnie z parametrami określającymi dni stanowiące dni weekendowe oraz liczbę dni weekendowych. Dni weekendowe i dni określone jako święta nie są uznawane za dni robocze.',
        abstract: 'Zwraca liczbę dni roboczych między dwiema datami zgodnie z parametrami określającymi dni stanowiące dni weekendowe oraz liczbę dni weekendowych. Dni weekendowe i dni określone jako święta nie są uznawane za dni robocze.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/networkdays-intl-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Data reprezentująca datę początkową.' },
            endDate: { name: 'end_date', detail: 'Data reprezentująca datę końcową.' },
            weekend: { name: 'weekend', detail: 'Numer weekendu lub ciąg tekstowy określający, kiedy przypadają weekendy.' },
            holidays: { name: 'holidays', detail: 'Opcjonalny zakres jednej lub kilku dat wykluczanych z kalendarza pracy, takich jak święta państwowe, federalne i ruchome.' },
        },
    },
    NOW: {
        description: 'Zwraca liczbę kolejną bieżącej daty i godziny. Jeśli przed wprowadzeniem formuły był używany format komórek Ogólne , program Excel zmieni format komórek na format daty i godziny określony w ustawieniach regionalnych. Format daty i godziny dla komórki można zmienić za pomocą poleceń z grupy Liczba karty Narzędzia główne na Wstążce.',
        abstract: 'Zwraca liczbę kolejną bieżącej daty i godziny. Jeśli przed wprowadzeniem formuły był używany format komórek Ogólne , program Excel zmieni format komórek na format daty i godziny określony w ustawieniach regionalnych. Format daty i godziny dla komórki można zmienić za pomocą poleceń z grupy Liczba karty Narzędzia główne na Wstążce.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/now-function',
            },
        ],
        functionParameter: {
        },
    },
    SECOND: {
        description: 'Zwraca sekundy wartości czasu. Sekunda jest podawana jako liczba całkowita z zakresu od 0 do 59.',
        abstract: 'Zwraca sekundy wartości czasu. Sekunda jest podawana jako liczba całkowita z zakresu od 0 do 59.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/second-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Wymagane. Czas zawierający szukane sekundy. Czas może być wprowadzany jako ciąg tekstowy w cudzysłowie (na przykład "18:45"), jako liczba dziesiętna (na przykład 0,78125, co reprezentuje czas 18:45) lub jako wynik innych formuł lub funkcji (na przykład CZAS.WARTOŚĆ("18:45")).' },
        },
    },
    TIME: {
        description: 'Zwraca określony czas jako liczbę dziesiętną. Jeśli komórka miała format Ogólny przed wprowadzeniem funkcji, to wynik zostanie sformatowany jako data.',
        abstract: 'Zwraca określony czas jako liczbę dziesiętną. Jeśli komórka miała format Ogólny przed wprowadzeniem funkcji, to wynik zostanie sformatowany jako data.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/time-function',
            },
        ],
        functionParameter: {
            hour: { name: 'hour', detail: 'Wymagane. Liczba z zakresu od 0 (zero) do 32767 reprezentująca godzinę. Każda wartość większa niż 23 zostanie podzielona przez 24, a reszta będzie traktowana jako wartość godziny. Na przykład funkcja CZAS(27;0;0) = CZAS(3;0;0) = 0,125 czyli 3:00.' },
            minute: { name: 'minute', detail: 'Wymagane. Liczba z zakresu od 0 do 32767 reprezentująca minuty. Każda wartość większa niż 59 zostanie przekonwertowana na godziny i minuty. Na przykład funkcja CZAS(0;750;0) = CZAS(12;30;0) = 0,520833 czyli 12:30.' },
            second: { name: 'second', detail: 'Wymagane. Liczba z zakresu od 0 do 32767 reprezentująca sekundy. Każda wartość większa niż 59 zostanie przekonwertowana na godziny, minuty i sekundy. Na przykład funkcja CZAS(0;0;2000) = CZAS(0;33;22) = 0,023148 czyli 0:33:20' },
        },
    },
    TIMEVALUE: {
        description: 'Zwraca liczbę dziesiętną czasu reprezentowanego przez ciąg tekstowy. Liczba dziesiętna to wartość z zakresu od 0 do 0,99988426, reprezentująca czas od 0:00:00 (12:00:00 AM) do 23:59:59 (11:59:59 PM).',
        abstract: 'Zwraca liczbę dziesiętną czasu reprezentowanego przez ciąg tekstowy. Liczba dziesiętna to wartość z zakresu od 0 do 0,99988426, reprezentująca czas od 0:00:00 (12:00:00 AM) do 23:59:59 (11:59:59 PM).',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/timevalue-function',
            },
        ],
        functionParameter: {
            timeText: { name: 'time_text', detail: 'Wymagane. Ciąg tekstowy, który reprezentuje czas w jednym z formatów używanych przez program Microsoft Excel, na przykład ciągi tekstowe "6:45 PM" i "18:45", umieszczone między znakami cudzysłowu, reprezentują czas.' },
        },
    },
    TO_DATE: {
        description: 'Konwertuje podaną liczbę na datę.',
        abstract: 'Konwertuje podaną liczbę na datę.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3094239?hl=pl',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Argument lub odwołanie do komórki, które ma zostać przekonwertowane na datę. Jeśli value jest liczbą lub odwołaniem do komórki zawierającej wartość liczbową, TO_DATE zwraca value jako datę, interpretując ją jako liczbę dni od 30 grudnia 1899 r. Wartości ujemne oznaczają dni przed tą datą, a wartości ułamkowe — porę dnia po północy. Jeśli value nie jest liczbą ani odwołaniem do komórki z wartością liczbową, TO_DATE zwraca value bez zmian.' },
        },
    },
    TODAY: {
        description: 'Funkcja DZIŚ zwraca liczbę kolejną bieżącej daty. Liczba kolejna to kod daty-czasu używany przez program Microsoft Excel do obliczeń daty i czasu. Jeśli komórka miała format Ogólny przed wprowadzeniem tej funkcji, wynik jest formatowany jako Data . Jeśli ma być wyświetlana liczba kolejna, należy zmienić format komórki na Ogólny lub Liczba .',
        abstract: 'Funkcja DZIŚ zwraca liczbę kolejną bieżącej daty. Liczba kolejna to kod daty-czasu używany przez program Microsoft Excel do obliczeń daty i czasu. Jeśli komórka miała format Ogólny przed wprowadzeniem tej funkcji, wynik jest formatowany jako Data . Jeśli ma być wyświetlana liczba kolejna, należy zmienić format komórki na Ogólny lub Liczba .',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/today-function',
            },
        ],
        functionParameter: {
        },
    },
    WEEKDAY: {
        description: 'Zwraca dzień tygodnia odpowiadający dacie. Dzień jest wyrażony jako liczba całkowita z przedziału od 1 (niedziela) do 7 (sobota).',
        abstract: 'Zwraca dzień tygodnia odpowiadający dacie. Dzień jest wyrażony jako liczba całkowita z przedziału od 1 (niedziela) do 7 (sobota).',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/weekday-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Wymagane. Liczba kolejna reprezentująca datę poszukiwanego dnia. Daty powinny być wprowadzane przy użyciu funkcji DATA albo stanowić wyniki innych formuł lub funkcji. Na przykład w przypadku daty 23 maja 2008 należy użyć funkcji DATA(2008;5;23). Jeśli daty są wprowadzane jako tekst, mogą wystąpić problemy.' },
            returnType: { name: 'return_type', detail: 'Opcjonalne. Liczba, która określa typ zwracanej wartości.' },
        },
    },
    WEEKNUM: {
        description: 'Zwraca numer tygodnia określonej daty. Na przykład tydzień zawierający 1 stycznia jest pierwszym tygodniem roku i otrzymuje numer 1.',
        abstract: 'Zwraca numer tygodnia określonej daty. Na przykład tydzień zawierający 1 stycznia jest pierwszym tygodniem roku i otrzymuje numer 1.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/weeknum-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Wymagane. Data określająca dzień tygodnia. Daty powinny być wprowadzane przy użyciu funkcji DATA albo stanowić wyniki innych formuł lub funkcji. Na przykład w przypadku daty 23 maja 2008 należy użyć funkcji DATA(2008;5;23). Jeśli daty są wprowadzane jako tekst, mogą wystąpić problemy.' },
            returnType: { name: 'return_type', detail: 'Opcjonalne. Liczba wyznaczająca dzień, od którego zaczyna się tydzień. Wartością domyślną jest 1.' },
        },
    },
    WORKDAY: {
        description: 'Zwraca liczbę reprezentującą datę, którą wyznacza się poprzez odliczenie od pewnej daty początkowej określonej liczby dni roboczych w przód lub w tył. Dni robocze to wszystkie dni oprócz sobót, niedziel i świąt. Funkcja DZIEŃ.ROBOCZY jest przydatna, jeśli obliczając daty faktur, oczekiwanych dostaw i liczby przepracowanych dni, należy wykluczyć dni weekendowe i święta.',
        abstract: 'Zwraca liczbę reprezentującą datę, którą wyznacza się poprzez odliczenie od pewnej daty początkowej określonej liczby dni roboczych w przód lub w tył. Dni robocze to wszystkie dni oprócz sobót, niedziel i świąt. Funkcja DZIEŃ.ROBOCZY jest przydatna, jeśli obliczając daty faktur, oczekiwanych dostaw i liczby przepracowanych dni, należy wykluczyć dni weekendowe i święta.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/workday-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Wymagane. Data reprezentująca datę początkową.' },
            days: { name: 'days', detail: 'Wymagane. Liczba dni niebędących sobotą, niedzielą ani świętem poprzedzających datę początkową lub następujących po niej. Wartość dodatnia oznacza datę przyszłą, a wartość ujemna — przeszłą.' },
            holidays: { name: 'holidays', detail: 'Opcjonalne. Opcjonalna lista dat, które mają być wykluczone z kalendarza roboczego, na przykład świąt państwowych lub dni urlopowych. Lista może być określana albo przez zakres komórek zawierających daty, albo przez stałą tablicową zawierającą liczby kolejne reprezentujące daty.' },
        },
    },
    WORKDAY_INTL: {
        description: 'Ta funkcja zwraca liczbę kolejną daty przed określoną liczbą dni roboczych lub po tej liczbie z niestandardowymi parametrami weekendowymi. Opcjonalne parametry weekendowe mogą wskazywać dni weekendowe oraz liczbę dni weekendowych. Należy pamiętać, że dni weekendowe i dni określone jako święta nie są traktowane jako dni robocze.',
        abstract: 'Ta funkcja zwraca liczbę kolejną daty przed określoną liczbą dni roboczych lub po tej liczbie z niestandardowymi parametrami weekendowymi. Opcjonalne parametry weekendowe mogą wskazywać dni weekendowe oraz liczbę dni weekendowych. Należy pamiętać, że dni weekendowe i dni określone jako święta nie są traktowane jako dni robocze.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/workday-intl-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Wymagane. Data początkowa zaokrąglona do liczby całkowitej.' },
            days: { name: 'days', detail: 'Wymagane. Liczba dni roboczych przed datą data_początkowa lub po niej. Wartość dodatnia daje datę przyszłą; wartość ujemna oznacza datę przeszłą; wartość zerowa daje już określoną start_date. Przesunięcie dnia jest obcinane do liczby całkowitej.' },
            weekend: { name: 'weekend', detail: 'Opcjonalne. Jeśli jest używana, oznacza to dni tygodnia będące dniami weekendowymi, które nie są traktowane jako dni robocze. Argument "weekend" jest liczbą lub ciągiem określającym, kiedy przypadają weekendy. Wartości liczbowe w weekendy oznaczają dni weekendowe, jak pokazano poniżej.' },
            holidays: { name: 'holidays', detail: 'Jest to argument opcjonalny na końcu składni. Określa opcjonalny zestaw dat, które mają zostać wykluczone z kalendarza dnia roboczego. Święta powinny być zakresem komórek zawierającym daty lub stałą tablicową wartości kolejnych reprezentujących te daty. Kolejność dat lub wartości kolejnych świąt może być dowolna.' },
        },
    },
    YEAR: {
        description: 'Zwraca rok odpowiadający dacie. Rok ten jest zwracany jako liczba całkowita z przedziału od 1900 do 9999.',
        abstract: 'Zwraca rok odpowiadający dacie. Rok ten jest zwracany jako liczba całkowita z przedziału od 1900 do 9999.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/year-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Wymagane. Data poszukiwanego roku. Daty powinny być wprowadzane przy użyciu funkcji DATA albo stanowić wyniki innych formuł lub funkcji. Na przykład w przypadku daty 23 maja 2025 należy użyć funkcji DATA(2025;5;23). Jeśli daty są wprowadzane jako tekst, mogą wystąpić problemy.' },
        },
    },
    YEARFRAC: {
        description: 'CZĘŚĆ.ROKU oblicza część roku przedstawioną jako liczba całych dni między dwoma datami (reprezentowanymi przez argumenty data_początkowa i data_końcowa ). Na przykład funkcji CZĘŚĆ.ROKU możesz użyć do identyfikacji proporcji zysków całorocznych lub obligacji do przypisania wybranym terminom.',
        abstract: 'CZĘŚĆ.ROKU oblicza część roku przedstawioną jako liczba całych dni między dwoma datami (reprezentowanymi przez argumenty data_początkowa i data_końcowa ). Na przykład funkcji CZĘŚĆ.ROKU możesz użyć do identyfikacji proporcji zysków całorocznych lub obligacji do przypisania wybranym terminom.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/yearfrac-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Data reprezentująca datę początkową.' },
            endDate: { name: 'end_date', detail: 'Data reprezentująca datę końcową.' },
            basis: { name: 'basis', detail: 'Typ podstawy naliczania dni, który ma zostać użyty.' },
        },
    },
};

export default locale;
