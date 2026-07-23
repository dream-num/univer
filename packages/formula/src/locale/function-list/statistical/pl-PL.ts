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
    AVEDEV: {
        description: 'Zwraca wartość średnią odchyleń bezwzględnych punktów danych od ich wartości średniej. Funkcja ODCH.ŚREDNIE jest miarą zmienności zbioru danych.',
        abstract: 'Zwraca wartość średnią odchyleń bezwzględnych punktów danych od ich wartości średniej. Funkcja ODCH.ŚREDNIE jest miarą zmienności zbioru danych.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/avedev-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Argument liczba1 jest wymagany, pozostałe są opcjonalne. Od 1 do 255 argumentów, dla których należy wyznaczyć średnią odchyleń bezwzględnych. Zamiast argumentów rozdzielonych średnikami można zastosować pojedynczą tablicę lub odwołanie do tablicy.' },
            number2: { name: 'number2', detail: 'Argument liczba1 jest wymagany, pozostałe są opcjonalne. Od 1 do 255 argumentów, dla których należy wyznaczyć średnią odchyleń bezwzględnych. Zamiast argumentów rozdzielonych średnikami można zastosować pojedynczą tablicę lub odwołanie do tablicy.' },
        },
    },
    AVERAGE: {
        description: 'Zwraca średnią (średnią arytmetyczną) argumentów. Jeśli na przykład zakres A1:A20 zawiera liczby, formuła =ŚREDNIA(A1:A20) zwraca średnią tych liczb.',
        abstract: 'Zwraca średnią (średnią arytmetyczną) argumentów. Jeśli na przykład zakres A1:A20 zawiera liczby, formuła =ŚREDNIA(A1:A20) zwraca średnią tych liczb.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/average-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Wymagane. Pierwsza liczba, odwołanie do komórki lub zakres, dla którego należy obliczyć średnią.' },
            number2: { name: 'number2', detail: 'Opcjonalne. Dodatkowe liczby, odwołania do komórek lub zakresy (maksymalnie 255), dla których ma zostać wyznaczona średnia.' },
        },
    },
    AVERAGE_WEIGHTED: {
        description: 'Funkcja AVERAGE.WEIGHTED oblicza średnią ważoną zestawu wartości na podstawie tych wartości i odpowiadających im wag.',
        abstract: 'Funkcja AVERAGE.WEIGHTED oblicza średnią ważoną zestawu wartości na podstawie tych wartości i odpowiadających im wag.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9084098?hl=pl',
            },
        ],
        functionParameter: {
            values: { name: 'wartości', detail: 'Wartości, dla których ma zostać obliczona średnia. Może to być zakres komórek lub same wartości.' },
            weights: { name: 'wagi', detail: 'Lista odpowiadających im wag. Wagi mogą być równe zero, ale nie mogą być ujemne; co najmniej jedna musi być dodatnia. Zakres wag musi mieć tyle samo wierszy i kolumn co zakres wartości.' },
            additionalValues: { name: 'dodatkowe_wartości', detail: 'Opcjonalne dodatkowe wartości uwzględniane w średniej.' },
            additionalWeights: { name: 'dodatkowe_wagi', detail: 'Opcjonalne dodatkowe wagi. Po każdej dodatkowej_wartości musi wystąpić dokładnie jedna dodatkowa_waga.' },
        },
    },
    AVERAGEA: {
        description: 'Oblicza wartość średnią (średnią arytmetyczną) argumentów z listy.',
        abstract: 'Oblicza wartość średnią (średnią arytmetyczną) argumentów z listy.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/averagea-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Argument wartość1 jest wymagany, pozostałe są opcjonalne. Od 1 do 255 komórek, zakresów komórek lub wartości, dla których należy wyznaczyć średnią.' },
            value2: { name: 'value2', detail: 'Argument wartość1 jest wymagany, pozostałe są opcjonalne. Od 1 do 255 komórek, zakresów komórek lub wartości, dla których należy wyznaczyć średnią.' },
        },
    },
    AVERAGEIF: {
        description: 'Zwraca średnią (średnią arytmetyczną) wszystkich komórek z zakresu, które spełniają podane kryteria.',
        abstract: 'Zwraca średnią (średnią arytmetyczną) wszystkich komórek z zakresu, które spełniają podane kryteria.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/averageif-function',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'Wymagane. Jedna lub więcej komórek, które mają zostać uśrednione, włączając w to liczby lub nazwy, a także tablice lub odwołania zawierające liczby.' },
            criteria: { name: 'criteria', detail: 'Wymagane. Kryteria w postaci liczby, wyrażenia, odwołania do komórki lub tekstu, określające komórki, dla których zostanie obliczona średnia. Kryteria można wyrazić na przykład jako 32, "32", ">32", "jabłka" lub B4.' },
            averageRange: { name: 'average_range', detail: 'Opcjonalne. Rzeczywisty zestaw komórek, dla których zostanie obliczona średnia. W przypadku pominięcia tego argumentu zostanie użyty parametr zakres.' },
        },
    },
    AVERAGEIFS: {
        description: 'Zwraca średnią (średnią arytmetyczną) wszystkich komórek, które spełniają jedno lub więcej kryteriów.',
        abstract: 'Zwraca średnią (średnią arytmetyczną) wszystkich komórek, które spełniają jedno lub więcej kryteriów.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/averageifs-function',
            },
        ],
        functionParameter: {
            averageRange: { name: 'average_range', detail: 'Wymagane. Jedna lub więcej komórek, które mają zostać uśrednione, włączając w to liczby lub nazwy, a także tablice lub odwołania zawierające liczby.' },
            criteriaRange1: { name: 'criteria_range1', detail: 'Argument kryteria_zakres1 jest wymagany, kolejne argumenty kryteria_zakres są opcjonalne. Są to zakresy (od 1 do 127), w których zostaną sprawdzone skojarzone kryteria.' },
            criteria1: { name: 'criteria1', detail: 'Argument kryteria1 jest wymagany, pozostałe są opcjonalne. Są to kryteria (od 1 do 127) w postaci liczby, wyrażenia, odwołania do komórki lub tekstu określające komórki, które mają zostać uśrednione. Kryteria można wyrazić na przykład jako 32, "32", ">32", "jabłka" lub B4.' },
            criteriaRange2: { name: 'criteria_range2', detail: 'Argument kryteria_zakres1 jest wymagany, kolejne argumenty kryteria_zakres są opcjonalne. Są to zakresy (od 1 do 127), w których zostaną sprawdzone skojarzone kryteria.' },
            criteria2: { name: 'criteria2', detail: 'Argument kryteria1 jest wymagany, pozostałe są opcjonalne. Są to kryteria (od 1 do 127) w postaci liczby, wyrażenia, odwołania do komórki lub tekstu określające komórki, które mają zostać uśrednione. Kryteria można wyrazić na przykład jako 32, "32", ">32", "jabłka" lub B4.' },
        },
    },
    BETA_DIST: {
        description: 'Rozkładu beta używa się zazwyczaj w badaniu zmian zawartości procentowych w próbkach, na przykład części doby spędzanej przez ludzi na oglądaniu telewizji.',
        abstract: 'Rozkładu beta używa się zazwyczaj w badaniu zmian zawartości procentowych w próbkach, na przykład części doby spędzanej przez ludzi na oglądaniu telewizji.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/beta-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Argument wymagany. Wartość między A a B, dla której określa się funkcję.' },
            alpha: { name: 'alpha', detail: 'Wymagane. Parametr rozkładu.' },
            beta: { name: 'beta', detail: 'Wymagane. Parametr rozkładu.' },
            cumulative: { name: 'cumulative', detail: 'Wymagane. Wartość logiczna, która określa postać funkcji. Jeśli wartością argumentu „skumulowany” jest PRAWDA, funkcja ROZKŁ.BETA zwraca funkcję rozkładu skumulowanego, a jeśli FAŁSZ, funkcja zwraca funkcję gęstości prawdopodobieństwa.' },
            A: { name: 'A', detail: 'opcjonalny. Dolne ograniczenie interwału wartości x.' },
            B: { name: 'B', detail: 'Argument opcjonalny. Górne ograniczenie interwału wartości x.' },
        },
    },
    BETA_INV: {
        description: 'Jeśli prawdopodobieństwo = ROZKŁ.BETA(x;...PRAWDA), wówczas ROZKŁ.BETA.ODWR(prawdopodobieństwo;...) = x. Rozkład beta może być używany w planowaniu projektów do modelowania możliwych czasów ukończenia przy danym oczekiwanym czasie ukończenia i jego zmienności.',
        abstract: 'Jeśli prawdopodobieństwo = ROZKŁ.BETA(x;...PRAWDA), wówczas ROZKŁ.BETA.ODWR(prawdopodobieństwo;...) = x. Rozkład beta może być używany w planowaniu projektów do modelowania możliwych czasów ukończenia przy danym oczekiwanym czasie ukończenia i jego zmienności.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/beta-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Wymagane. Prawdopodobieństwo skojarzone z rozkładem beta.' },
            alpha: { name: 'alpha', detail: 'Wymagane. Parametr rozkładu.' },
            beta: { name: 'beta', detail: 'Wymagane. Parametr rozkładu.' },
            A: { name: 'A', detail: 'opcjonalny. Dolne ograniczenie interwału wartości x.' },
            B: { name: 'B', detail: 'Argument opcjonalny. Górne ograniczenie interwału wartości x.' },
        },
    },
    BINOM_DIST: {
        description: 'Zwraca wartość pojedynczego składnika dwumianowego rozkładu prawdopodobieństwa. Funkcję ROZKŁ.DWUM należy stosować do rozwiązywania problemów, w których występuje stała liczba testów lub prób, wynik każdej próby może być tylko sukcesem lub porażką, próby są niezależne, a prawdopodobieństwo sukcesu jest stałe w trakcie eksperymentu. Na przykład za pomocą funkcji ROZKŁ.DWUM można obliczyć prawdopodobieństwo, że z trojga następnych nowo narodzonych dzieci dwoje będzie płci męskiej.',
        abstract: 'Zwraca wartość pojedynczego składnika dwumianowego rozkładu prawdopodobieństwa. Funkcję ROZKŁ.DWUM należy stosować do rozwiązywania problemów, w których występuje stała liczba testów lub prób, wynik każdej próby może być tylko sukcesem lub porażką, próby są niezależne, a prawdopodobieństwo sukcesu jest stałe w trakcie eksperymentu. Na przykład za pomocą funkcji ROZKŁ.DWUM można obliczyć prawdopodobieństwo, że z trojga następnych nowo narodzonych dzieci dwoje będzie płci męskiej.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/binom-dist-function',
            },
        ],
        functionParameter: {
            numberS: { name: 'number_s', detail: 'Wymagane. Liczba sukcesów w próbach.' },
            trials: { name: 'trials', detail: 'Wymagane. Liczba niezależnych prób.' },
            probabilityS: { name: 'probability_s', detail: 'Wymagane. Prawdopodobieństwo sukcesu w każdej próbie.' },
            cumulative: { name: 'cumulative', detail: 'Wymagane. Wartość logiczna, która określa postać funkcji. Jeśli argument „skumulowany” ma wartość PRAWDA, funkcja ROZKŁ.DWUM zwraca funkcję rozkładu skumulowanego, czyli prawdopodobieństwo, że zachodzi co najwyżej liczba_s sukcesów; jeśli FAŁSZ, zwraca funkcję masy prawdopodobieństwa, czyli prawdopodobieństwo, że zajdzie liczba_s sukcesów.' },
        },
    },
    BINOM_DIST_RANGE: {
        description: 'Zwraca prawdopodobieństwo wyniku próby na podstawie rozkładu dwumianowego.',
        abstract: 'Zwraca prawdopodobieństwo wyniku próby na podstawie rozkładu dwumianowego.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/binom-dist-range-function',
            },
        ],
        functionParameter: {
            trials: { name: 'trials', detail: 'Wymagane. Liczba niezależnych prób. Musi być większy lub równy 0.' },
            probabilityS: { name: 'probability_s', detail: 'Wymagane. Prawdopodobieństwo sukcesu w pojedynczej próbie. Musi być większy lub równy 0 oraz mniejszy lub równy 1.' },
            numberS: { name: 'number_s', detail: 'Wymagane. Liczba sukcesów w próbach. Musi być większy lub równy 0 oraz mniejszy lub równy liczbie prób.' },
            numberS2: { name: 'number_s2', detail: 'Opcjonalne. Jeżeli zostanie podany, funkcja zwraca prawdopodobieństwo liczby udanych prób wypadających pomiędzy argumentem Liczba_s i Liczba_s2. Musi być większy lub równy Liczba_s oraz mniejszy lub równy liczbie prób.' },
        },
    },
    BINOM_INV: {
        description: 'Zwraca najmniejszą wartość, dla której skumulowany rozkład dwumianowy jest większy lub równy wartości kryterium.',
        abstract: 'Zwraca najmniejszą wartość, dla której skumulowany rozkład dwumianowy jest większy lub równy wartości kryterium.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/binom-inv-function',
            },
        ],
        functionParameter: {
            trials: { name: 'trials', detail: 'Wymagane. Liczba prób Bernoulliego.' },
            probabilityS: { name: 'probability_s', detail: 'Wymagane. Prawdopodobieństwo sukcesu w każdej próbie.' },
            alpha: { name: 'alpha', detail: 'Wymagane. Wartość kryterium.' },
        },
    },
    CHISQ_DIST: {
        description: 'Zwraca rozkład chi-kwadrat.',
        abstract: 'Zwraca rozkład chi-kwadrat.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/chisq-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Argument wymagany. Wartość, przy której ma być szacowany rozkład.' },
            degFreedom: { name: 'deg_freedom', detail: 'Wymagane. Liczba stopni swobody.' },
            cumulative: { name: 'cumulative', detail: 'Wymagane. Wartość logiczna, która określa postać funkcji. Jeśli wartością argumentu „skumulowany” jest PRAWDA, funkcja ROZKŁ.CHI zwraca funkcję rozkładu skumulowanego, a jeśli FAŁSZ, funkcja zwraca funkcję gęstości prawdopodobieństwa.' },
        },
    },
    CHISQ_DIST_RT: {
        description: 'Rozkład χ2 jest skojarzony z testem χ2. Test χ2 służy do porównywania wartości obserwowanych i przewidywanych. Na przykład eksperyment genetyczny może mieć hipotezę, że następne pokolenie roślin będzie w określonym zestawie kolorów. Przez porównanie wyników obserwowanych z wynikami oczekiwanymi można określić prawidłowość hipotezy.',
        abstract: 'Rozkład χ2 jest skojarzony z testem χ2. Test χ2 służy do porównywania wartości obserwowanych i przewidywanych. Na przykład eksperyment genetyczny może mieć hipotezę, że następne pokolenie roślin będzie w określonym zestawie kolorów. Przez porównanie wyników obserwowanych z wynikami oczekiwanymi można określić prawidłowość hipotezy.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/chisq-dist-rt-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Argument wymagany. Wartość, przy której ma być szacowany rozkład.' },
            degFreedom: { name: 'deg_freedom', detail: 'Wymagane. Liczba stopni swobody.' },
        },
    },
    CHISQ_INV: {
        description: 'Zwraca odwrotność lewostronnego prawdopodobieństwa rozkładu chi-kwadrat.',
        abstract: 'Zwraca odwrotność lewostronnego prawdopodobieństwa rozkładu chi-kwadrat.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/chisq-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Wymagane. Prawdopodobieństwo skojarzone z rozkładem chi-kwadrat.' },
            degFreedom: { name: 'deg_freedom', detail: 'Wymagane. Liczba stopni swobody.' },
        },
    },
    CHISQ_INV_RT: {
        description: 'Jeśli prawdopodobieństwo = ROZKŁ.CHI.PS(x;...), to ROZKŁ.CHI.ODWR.PS(prawdopodobieństwo;...) = x. Ta funkcja służy do porównywania wyników obserwowanych z wynikami spodziewanymi w celu określenia, czy hipoteza jest prawidłowa.',
        abstract: 'Jeśli prawdopodobieństwo = ROZKŁ.CHI.PS(x;...), to ROZKŁ.CHI.ODWR.PS(prawdopodobieństwo;...) = x. Ta funkcja służy do porównywania wyników obserwowanych z wynikami spodziewanymi w celu określenia, czy hipoteza jest prawidłowa.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/chisq-inv-rt-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Wymagane. Prawdopodobieństwo skojarzone z rozkładem chi-kwadrat.' },
            degFreedom: { name: 'deg_freedom', detail: 'Wymagane. Liczba stopni swobody.' },
        },
    },
    CHISQ_TEST: {
        description: 'Zwraca wartość testu niezależności. Funkcja CHI.TEST zwraca wartość rozkładu chi-kwadrat (χ2) statystyki i stosownych stopni swobody. Testu χ2 można używać do określania, czy dane eksperymentalne potwierdzają przewidywania wynikające z hipotezy.',
        abstract: 'Zwraca wartość testu niezależności. Funkcja CHI.TEST zwraca wartość rozkładu chi-kwadrat (χ2) statystyki i stosownych stopni swobody. Testu χ2 można używać do określania, czy dane eksperymentalne potwierdzają przewidywania wynikające z hipotezy.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/chisq-test-function',
            },
        ],
        functionParameter: {
            actualRange: { name: 'actual_range', detail: 'Wymagane. Zakres danych zawierający wartości obserwowane, które należy porównać z wartościami przewidywanymi.' },
            expectedRange: { name: 'expected_range', detail: 'Wymagane. Zakres danych zawierający współczynnik iloczynu sum wierszy i sum kolumn do sumy końcowej.' },
        },
    },
    CONFIDENCE_NORM: {
        description: 'Przedział ufności to zakres wartości. Średnia z próby, x, znajduje się w połowie tego przedziału, zaś przedział obejmuje wartości x ± UFNOŚĆ.NORM. Na przykład, jeśli x jest średnią z próby terminów dostawy produktów pocztą, x ± UFNOŚĆ.NORM będzie przedziałem wartości średnich z populacji. Dla każdej średniej z populacji, μ0, w tym przedziale, prawdopodobieństwo uzyskania średniej z próby różniącej się od μ0 o więcej niż x jest większe niż alfa; dla każdej średniej z populacji, μ0, która nie należy do tego przedziału, prawdopodobieństwo uzyskania średniej z próby różniącej się od μ0 o więcej niż x jest mniejsze niż alfa. Innymi słowy, załóżmy że używając wartości x, odchylenia standardowego i wielkości, budujemy test dwustronny na poziomie istotności alfa, który ma sprawdzić hipotezę, że średnia z populacji wynosi μ0. Hipotezy nie odrzucimy, jeśli μ0 będzie mieścić się w przedziale ufności, a odrzucimy ją, jeśli μ0 znajdzie się poza przedziałem ufności. Przedział ufności nie daje podstaw do przyjęcia, że prawdopodobieństwo, iż termin dostawy następnej paczki zmieści się w przedziale ufności, wynosi 1 - alfa.',
        abstract: 'Przedział ufności to zakres wartości. Średnia z próby, x, znajduje się w połowie tego przedziału, zaś przedział obejmuje wartości x ± UFNOŚĆ.NORM. Na przykład, jeśli x jest średnią z próby terminów dostawy produktów pocztą, x ± UFNOŚĆ.NORM będzie przedziałem wartości średnich z populacji. Dla każdej średniej z populacji, μ0, w tym przedziale, prawdopodobieństwo uzyskania średniej z próby różniącej się od μ0 o więcej niż x jest większe niż alfa; dla każdej średniej z populacji, μ0, która nie należy do tego przedziału, prawdopodobieństwo uzyskania średniej z próby różniącej się od μ0 o więcej niż x jest mniejsze niż alfa. Innymi słowy, załóżmy że używając wartości x, odchylenia standardowego i wielkości, budujemy test dwustronny na poziomie istotności alfa, który ma sprawdzić hipotezę, że średnia z populacji wynosi μ0. Hipotezy nie odrzucimy, jeśli μ0 będzie mieścić się w przedziale ufności, a odrzucimy ją, jeśli μ0 znajdzie się poza przedziałem ufności. Przedział ufności nie daje podstaw do przyjęcia, że prawdopodobieństwo, iż termin dostawy następnej paczki zmieści się w przedziale ufności, wynosi 1 - alfa.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/confidence-norm-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: 'Wymagane. Poziom istotności używany do obliczania poziomu ufności. Poziom ufności jest równy 100*(1 – alfa)%, czyli wartość alfa równa 0,05 wskazuje poziom ufności 95%.' },
            standardDev: { name: 'standard_dev', detail: 'Wymagane. Odchylenie standardowe dla zakresu danych, które z założenia jest znane.' },
            size: { name: 'size', detail: 'Wymagane. Wielkość próby.' },
        },
    },
    CONFIDENCE_T: {
        description: 'Zwraca przedział ufności dla średniej populacji, używając rozkładu t-Studenta.',
        abstract: 'Zwraca przedział ufności dla średniej populacji, używając rozkładu t-Studenta.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/confidence-t-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: 'Wymagane. Poziom istotności używany do obliczania poziomu ufności. Poziom ufności jest równy 100*(1 – alfa)%, czyli wartość alfa równa 0,05 wskazuje poziom ufności 95%.' },
            standardDev: { name: 'standard_dev', detail: 'Wymagane. Odchylenie standardowe dla zakresu danych, które z założenia jest znane.' },
            size: { name: 'size', detail: 'Wymagane. Wielkość próby.' },
        },
    },
    CORREL: {
        description: 'Funkcja WSP.KORELACJI zwraca współczynnik korelacji dwóch zakresów komórek. Współczynnik korelacji służy do określania relacji między dwiema własnościami. Na przykład można zbadać relację między średnią temperaturą danej miejscowości a używaniem klimatyzatorów.',
        abstract: 'Funkcja WSP.KORELACJI zwraca współczynnik korelacji dwóch zakresów komórek. Współczynnik korelacji służy do określania relacji między dwiema własnościami. Na przykład można zbadać relację między średnią temperaturą danej miejscowości a używaniem klimatyzatorów.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/correl-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Wymagane. Zakres wartości komórek.' },
            array2: { name: 'array2', detail: 'Wymagane. Drugi zakres wartości komórek.' },
        },
    },
    COUNT: {
        description: 'Funkcja ILE.LICZB zlicza komórki zawierające liczby, jak również liczby umieszczone na liście argumentów. Funkcja ILE.LICZB służy do uzyskiwania liczby wpisów w polu liczbowym, które znajduje się w zakresie lub w tablicy liczb. Na przykład w celu zliczenia liczb w zakresie A1:A20 należy wprowadzić następującą formułę: =ILE.LICZB(A1:A20) . W tym przykładzie: jeśli pięć komórek w zakresie zawiera liczby, wynikiem jest wartość 5 .',
        abstract: 'Funkcja ILE.LICZB zlicza komórki zawierające liczby, jak również liczby umieszczone na liście argumentów. Funkcja ILE.LICZB służy do uzyskiwania liczby wpisów w polu liczbowym, które znajduje się w zakresie lub w tablicy liczb. Na przykład w celu zliczenia liczb w zakresie A1:A20 należy wprowadzić następującą formułę: =ILE.LICZB(A1:A20) . W tym przykładzie: jeśli pięć komórek w zakresie zawiera liczby, wynikiem jest wartość 5 .',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/count-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value 1', detail: 'Wymagane. Pierwszy element, odwołanie do komórki lub zakres, w którym mają zostać zliczone liczby.' },
            value2: { name: 'value 2', detail: 'Opcjonalne. Maksymalnie 255 dodatkowych elementów, odwołań do komórek lub zakresów, w których mają zostać zliczone liczby.' },
        },
    },
    COUNTA: {
        description: 'Funkcja ILE.NIEPUSTYCH zlicza komórki, które nie są puste w zakresie.',
        abstract: 'Funkcja ILE.NIEPUSTYCH zlicza komórki, które nie są puste w zakresie.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/counta-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Argument wartość1 jest wymagany, pozostałe są opcjonalne. Od 1 do 255 komórek, zakresów komórek lub wartości, dla których należy wyznaczyć średnią.' },
            value2: { name: 'value2', detail: 'Argument wartość1 jest wymagany, pozostałe są opcjonalne. Od 1 do 255 komórek, zakresów komórek lub wartości, dla których należy wyznaczyć średnią.' },
        },
    },
    COUNTBLANK: {
        description: 'Użyj funkcji LICZ.PUSTE , jednej z funkcji statystycznych , aby zliczyć liczbę pustych komórek w zakresie komórek.',
        abstract: 'Użyj funkcji LICZ.PUSTE , jednej z funkcji statystycznych , aby zliczyć liczbę pustych komórek w zakresie komórek.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/countblank-function',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'Wymagane. Zakres, w którym należy zliczyć puste komórki.' },
        },
    },
    COUNTIF: {
        description: 'Funkcja LICZ.JEŻELI, jedna z funkcji statystycznych , umożliwia policzenie liczby komórek, które spełniają dane kryteria. Można na przykład policzyć, ile razy konkretna nazwa miasta występuje na liście klientów.',
        abstract: 'Funkcja LICZ.JEŻELI, jedna z funkcji statystycznych , umożliwia policzenie liczby komórek, które spełniają dane kryteria. Można na przykład policzyć, ile razy konkretna nazwa miasta występuje na liście klientów.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/use-the-countif-function-in-microsoft-excel',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'Grupa komórek, które mają zostać zliczone. Zakres może zawierać liczby, tablice, nazwany zakres lub odwołania zawierające liczby. Wartości puste i tekst są ignorowane. Dowiedz się, jak zaznaczać zakresy w arkuszu .' },
            criteria: { name: 'criteria', detail: 'Liczba, wyrażenie, odwołanie do komórki lub ciąg tekstowy określające, które komórki będą zliczane. Można użyć liczby, np. 32, porównania, np. ">32", komórki, np. B4 lub wyrazu, np. "jabłka". Funkcja LICZ.JEŻELI używa tylko pojedynczego kryterium. Aby użyć wielu kryteriów, należy skorzystać z funkcji LICZ.WARUNKI .' },
        },
    },
    COUNTIFS: {
        description: 'Funkcja LICZ.WARUNKI stosuje kryteria do komórek w wielu zakresach i zlicza, ile razy wszystkie kryteria są spełnione.',
        abstract: 'Funkcja LICZ.WARUNKI stosuje kryteria do komórek w wielu zakresach i zlicza, ile razy wszystkie kryteria są spełnione.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/countifs-function',
            },
        ],
        functionParameter: {
            criteriaRange1: { name: 'criteria_range1', detail: 'Wymagane. Pierwszy zakres, w którym zostaną sprawdzone skojarzone kryteria.' },
            criteria1: { name: 'criteria1', detail: 'Wymagane. Kryteria w postaci liczby, wyrażenia, odwołania do komórki lub tekstu określające komórki, które mają być zliczane. Kryteria można wyrazić na przykład jako 32, ">32", B4, "jabłka" lub "32".' },
            criteriaRange2: { name: 'criteria_range2', detail: 'Opcjonalne. Dodatkowe zakresy i skojarzone z nimi kryteria. Maksymalna liczba par zakres/kryteria to 127.' },
            criteria2: { name: 'criteria2', detail: 'Opcjonalne. Dodatkowe zakresy i skojarzone z nimi kryteria. Maksymalna liczba par zakres/kryteria to 127.' },
        },
    },
    COVARIANCE_P: {
        description: 'Zwraca wartość kowariancji populacji, czyli średniej iloczynów odchyleń każdej pary punktów danych w dwóch zbiorach danych. Kowariancji należy używać do określania zależności między dwoma zbiorami danych. Na przykład można sprawdzić, czy większe przychody są związane z wyższym poziomem wykształcenia.',
        abstract: 'Zwraca wartość kowariancji populacji, czyli średniej iloczynów odchyleń każdej pary punktów danych w dwóch zbiorach danych. Kowariancji należy używać do określania zależności między dwoma zbiorami danych. Na przykład można sprawdzić, czy większe przychody są związane z wyższym poziomem wykształcenia.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/covariance-p-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Wymagane. Pierwszy zakres komórek zawierających liczby całkowite.' },
            array2: { name: 'array2', detail: 'Wymagane. Drugi zakres komórek zawierających liczby całkowite.' },
        },
    },
    COVARIANCE_S: {
        description: 'Zwraca kowariancję próbki, czyli średnią iloczynów odchyleń dla każdej pary punktów danych w dwóch zbiorach danych.',
        abstract: 'Zwraca kowariancję próbki, czyli średnią iloczynów odchyleń dla każdej pary punktów danych w dwóch zbiorach danych.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/covariance-s-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Wymagane. Pierwszy zakres komórek zawierających liczby całkowite.' },
            array2: { name: 'array2', detail: 'Wymagane. Drugi zakres komórek zawierających liczby całkowite.' },
        },
    },
    DEVSQ: {
        description: 'Zwraca wartość sumy kwadratów odchyleń punktów danych od ich średniej z próby.',
        abstract: 'Zwraca wartość sumy kwadratów odchyleń punktów danych od ich średniej z próby.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/devsq-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Argument liczba1 jest wymagany, pozostałe są opcjonalne. Od 1 do 255 argumentów, dla których jest obliczana suma kwadratów odchyleń. Zamiast argumentów rozdzielonych średnikami można użyć pojedynczej tablicy lub odwołania do tablicy.' },
            number2: { name: 'number2', detail: 'Argument liczba1 jest wymagany, pozostałe są opcjonalne. Od 1 do 255 argumentów, dla których jest obliczana suma kwadratów odchyleń. Zamiast argumentów rozdzielonych średnikami można użyć pojedynczej tablicy lub odwołania do tablicy.' },
        },
    },
    EXPON_DIST: {
        description: 'Zwraca skumulowaną funkcję (dystrybuantę) rozkładu wykładniczego. Funkcja ROZKŁ.EXP umożliwia modelowanie upływu czasu między zdarzeniami, np. czasu oczekiwania na wypłatę gotówki z bankomatu. Można na przykład użyć funkcji ROZKŁ.EXP do wyznaczenia prawdopodobieństwa, że zajmie to najwyżej jedną minutę.',
        abstract: 'Zwraca skumulowaną funkcję (dystrybuantę) rozkładu wykładniczego. Funkcja ROZKŁ.EXP umożliwia modelowanie upływu czasu między zdarzeniami, np. czasu oczekiwania na wypłatę gotówki z bankomatu. Można na przykład użyć funkcji ROZKŁ.EXP do wyznaczenia prawdopodobieństwa, że zajmie to najwyżej jedną minutę.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/expon-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Argument wymagany. Wartość funkcji.' },
            lambda: { name: 'lambda', detail: 'Wymagane. Wartość parametru.' },
            cumulative: { name: 'cumulative', detail: 'Wymagane. Wartość logiczna określająca postać funkcji wykładniczej, która ma zostać podana. Jeśli argument „skumulowany” ma wartość PRAWDA, funkcja ROZKŁ.EXP zwraca funkcję rozkładu skumulowanego, a jeśli FAŁSZ — funkcję gęstości prawdopodobieństwa.' },
        },
    },
    F_DIST: {
        description: 'Zwraca wartość rozkładu prawdopodobieństwa F-Snedecora. Funkcja ta umożliwia określenie, czy dwa zbiory danych mają różne stopnie zróżnicowania. Na przykład, można sprawdzić wyniki testów mężczyzn i kobiet przychodzących do szkoły średniej, i określić, czy zmienność u kobiet różni się od tej znalezionej u mężczyzn.',
        abstract: 'Zwraca wartość rozkładu prawdopodobieństwa F-Snedecora. Funkcja ta umożliwia określenie, czy dwa zbiory danych mają różne stopnie zróżnicowania. Na przykład, można sprawdzić wyniki testów mężczyzn i kobiet przychodzących do szkoły średniej, i określić, czy zmienność u kobiet różni się od tej znalezionej u mężczyzn.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/f-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Argument wymagany. Wartość, dla której ta funkcja ma zostać obliczona.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Wymagane. Wartość stopni swobody w liczniku.' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Wymagane. Wartość stopni swobody w mianowniku.' },
            cumulative: { name: 'cumulative', detail: 'Wymagane. Wartość logiczna, która określa postać funkcji. Jeśli wartością argumentu „skumulowany” jest PRAWDA, funkcja ROZKŁ.F zwraca funkcję rozkładu skumulowanego, a jeśli FAŁSZ — funkcję gęstości prawdopodobieństwa.' },
        },
    },
    F_DIST_RT: {
        description: 'Zwraca wartość (prawostronnego) rozkładu prawdopodobieństwa F-Snedecora (stopień zróżnicowania) dla dwóch zestawów danych. Ta funkcja służy do określania, czy dwa zbiory danych mają różne stopnie zróżnicowania. Można na przykład sprawdzić wyniki testów uzyskane przez chłopców i dziewczęta zdające do szkoły średniej i określić, czy zmienność wyników uzyskanych przez dziewczęta różni się od zmienności wyników chłopców.',
        abstract: 'Zwraca wartość (prawostronnego) rozkładu prawdopodobieństwa F-Snedecora (stopień zróżnicowania) dla dwóch zestawów danych. Ta funkcja służy do określania, czy dwa zbiory danych mają różne stopnie zróżnicowania. Można na przykład sprawdzić wyniki testów uzyskane przez chłopców i dziewczęta zdające do szkoły średniej i określić, czy zmienność wyników uzyskanych przez dziewczęta różni się od zmienności wyników chłopców.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/f-dist-rt-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Argument wymagany. Wartość, dla której ta funkcja ma zostać obliczona.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Wymagane. Wartość stopni swobody w liczniku.' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Wymagane. Wartość stopni swobody w mianowniku.' },
        },
    },
    F_INV: {
        description: 'Zwraca odwrotność rozkładu prawdopodobieństwa F. Jeśli p = ROZKŁ.F(x,...), to ROZKŁ.F.ODWR(p,...) = x. Rozkład F-Snedecora można stosować w teście F w celu porównania stopnia zmienności dwóch zbiorów danych. Można na przykład przeanalizować rozkład dochodów w Stanach Zjednoczonych i Kanadzie, aby określić, czy oba kraje mają podobne zróżnicowanie dochodów.',
        abstract: 'Zwraca odwrotność rozkładu prawdopodobieństwa F. Jeśli p = ROZKŁ.F(x,...), to ROZKŁ.F.ODWR(p,...) = x. Rozkład F-Snedecora można stosować w teście F w celu porównania stopnia zmienności dwóch zbiorów danych. Można na przykład przeanalizować rozkład dochodów w Stanach Zjednoczonych i Kanadzie, aby określić, czy oba kraje mają podobne zróżnicowanie dochodów.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/f-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Wymagane. Prawdopodobieństwo skojarzone ze skumulowanym rozkładem F.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Wymagane. Wartość stopni swobody w liczniku.' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Wymagane. Wartość stopni swobody w mianowniku.' },
        },
    },
    F_INV_RT: {
        description: 'Zwraca wartość funkcji odwrotnej rozkładu (prawostronnego) prawdopodobieństwa F-Snedecora. Jeżeli p = ROZKŁ.F.PS(x;...), to ROZKŁ.F.ODWR.PS(p;...) = x. Rozkład F-Snedecora można stosować w teście F w celu porównania stopnia zmienności dwóch zbiorów danych. Można na przykład przeanalizować rozkład dochodów w Stanach Zjednoczonych i Kanadzie, aby określić, czy oba kraje mają podobne zróżnicowanie dochodów.',
        abstract: 'Zwraca wartość funkcji odwrotnej rozkładu (prawostronnego) prawdopodobieństwa F-Snedecora. Jeżeli p = ROZKŁ.F.PS(x;...), to ROZKŁ.F.ODWR.PS(p;...) = x. Rozkład F-Snedecora można stosować w teście F w celu porównania stopnia zmienności dwóch zbiorów danych. Można na przykład przeanalizować rozkład dochodów w Stanach Zjednoczonych i Kanadzie, aby określić, czy oba kraje mają podobne zróżnicowanie dochodów.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/f-inv-rt-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Wymagane. Prawdopodobieństwo skojarzone ze skumulowanym rozkładem F.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Wymagane. Wartość stopni swobody w liczniku.' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Wymagane. Wartość stopni swobody w mianowniku.' },
        },
    },
    F_TEST: {
        description: 'Funkcja umożliwia określenie, czy dwie próbki mają różne wariancje. Na przykład, mając wyniki testów ze szkół prywatnych i publicznych, można sprawdzić, czy w tych szkołach występują różne poziomy zróżnicowania wyników.',
        abstract: 'Funkcja umożliwia określenie, czy dwie próbki mają różne wariancje. Na przykład, mając wyniki testów ze szkół prywatnych i publicznych, można sprawdzić, czy w tych szkołach występują różne poziomy zróżnicowania wyników.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/f-test-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Wymagane. Pierwsza tablica lub pierwszy zakres danych.' },
            array2: { name: 'array2', detail: 'Wymagane. Druga tablica lub drugi zakres danych.' },
        },
    },
    FISHER: {
        description: 'Zwraca wartość transformacji Fishera w punkcie x. Wynikiem tej transformacji jest funkcja, która ma przeważnie rozkład normalny, a nie skośny. Funkcja ta pozwala weryfikować hipotezy dotyczące współczynnika korelacji.',
        abstract: 'Zwraca wartość transformacji Fishera w punkcie x. Wynikiem tej transformacji jest funkcja, która ma przeważnie rozkład normalny, a nie skośny. Funkcja ta pozwala weryfikować hipotezy dotyczące współczynnika korelacji.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/fisher-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Argument wymagany. Wartość liczbowa, dla której ma zostać wykonana transformacja.' },
        },
    },
    FISHERINV: {
        description: 'Zwraca wartość funkcji odwrotnej transformacji Fishera. Transformacja ta jest przydatna w analizie korelacji pomiędzy zakresami lub tablicami danych. Jeżeli y = ROZKŁAD.FISHER(x), to ROZKŁAD.FISHER.ODW(y) = x.',
        abstract: 'Zwraca wartość funkcji odwrotnej transformacji Fishera. Transformacja ta jest przydatna w analizie korelacji pomiędzy zakresami lub tablicami danych. Jeżeli y = ROZKŁAD.FISHER(x), to ROZKŁAD.FISHER.ODW(y) = x.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/fisherinv-function',
            },
        ],
        functionParameter: {
            y: { name: 'y', detail: 'Argument wymagany. Wartość, dla której ma zostać wykonana transformacja odwrotna.' },
        },
    },
    FORECAST: {
        description: 'Oblicz lub przewiduj przyszłą wartość przy użyciu istniejących wartości. Przyszła wartość jest wartością y dla danej wartości x. Istniejące wartości to znane wartości x i y, a przyszła wartość jest przewidywana przy użyciu regresji liniowej. Te funkcje umożliwiają przewidywanie przyszłej sprzedaży, wymagań dotyczących zapasów lub trendów konsumpcyjnych.',
        abstract: 'Oblicz lub przewiduj przyszłą wartość przy użyciu istniejących wartości. Przyszła wartość jest wartością y dla danej wartości x. Istniejące wartości to znane wartości x i y, a przyszła wartość jest przewidywana przy użyciu regresji liniowej. Te funkcje umożliwiają przewidywanie przyszłej sprzedaży, wymagań dotyczących zapasów lub trendów konsumpcyjnych.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/forecast-and-forecast-linear-functions',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'tak Punkt danych, dla którego ma zostać określona prognoza wartości.' },
            knownYs: { name: 'known_y\'s', detail: 'tak Tablica lub zakres danych zależnych.' },
            knownXs: { name: 'known_x\'s', detail: 'tak Tablica lub zakres danych niezależnych.' },
        },
    },
    FORECAST_ETS: {
        description: 'Oblicza lub prognozuje przyszłą wartość na podstawie wartości historycznych za pomocą algorytmu AAA wygładzania wykładniczego (ETS).',
        abstract: 'Oblicza lub prognozuje przyszłą wartość na podstawie wartości historycznych za pomocą algorytmu AAA wygładzania wykładniczego (ETS).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/forecast-ets-function',
            },
        ],
        functionParameter: {
            targetDate: { name: 'Data docelowa', detail: 'Punkt danych, dla którego ma zostać przewidziana wartość.' },
            values: { name: 'Wartości', detail: 'Wartości historyczne używane do prognozy.' },
            timeline: { name: 'Oś czasu', detail: 'Niezależny zakres lub tablica liczbowych dat albo godzin ze stałym krokiem.' },
            seasonality: { name: 'Sezonowość', detail: 'Opcjonalnie. 1 oznacza wykrywanie automatyczne, a 0 brak sezonowości.' },
            dataCompletion: { name: 'Uzupełnianie danych', detail: 'Opcjonalnie. Użyj 1, aby interpolować brakujące punkty, lub 0, aby traktować je jako zera.' },
            aggregation: { name: 'Agregacja', detail: 'Opcjonalnie. Wartość od 1 do 7 określa agregację zduplikowanych znaczników czasu.' },
        },
    },
    FORECAST_ETS_CONFINT: {
        description: 'Zwraca przedział ufności dla prognozowanej wartości w określonym punkcie docelowym.',
        abstract: 'Zwraca przedział ufności dla prognozowanej wartości w określonym punkcie docelowym.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/forecast-ets-confint-function',
            },
        ],
        functionParameter: {
            targetDate: { name: 'Data docelowa', detail: 'Punkt danych, dla którego ma zostać przewidziana wartość.' },
            values: { name: 'Wartości', detail: 'Wartości historyczne używane do prognozy.' },
            timeline: { name: 'Oś czasu', detail: 'Niezależny zakres lub tablica liczbowych dat albo godzin ze stałym krokiem.' },
            confidenceLevel: { name: 'Poziom ufności', detail: 'Opcjonalnie. Liczba od 0 do 1; wartość domyślna to 0,95.' },
            seasonality: { name: 'Sezonowość', detail: 'Opcjonalnie. 1 oznacza wykrywanie automatyczne, a 0 brak sezonowości.' },
            dataCompletion: { name: 'Uzupełnianie danych', detail: 'Opcjonalnie. Użyj 1, aby interpolować brakujące punkty, lub 0, aby traktować je jako zera.' },
            aggregation: { name: 'Agregacja', detail: 'Opcjonalnie. Wartość od 1 do 7 określa agregację zduplikowanych znaczników czasu.' },
        },
    },
    FORECAST_ETS_SEASONALITY: {
        description: 'Zwraca długość powtarzającego się wzorca wykrytego przez program Excel dla określonego szeregu czasowego.',
        abstract: 'Zwraca długość powtarzającego się wzorca wykrytego przez program Excel dla określonego szeregu czasowego.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/forecast-ets-seasonality-function',
            },
        ],
        functionParameter: {
            values: { name: 'Wartości', detail: 'Wartości historyczne używane do prognozy.' },
            timeline: { name: 'Oś czasu', detail: 'Niezależny zakres lub tablica liczbowych dat albo godzin ze stałym krokiem.' },
            dataCompletion: { name: 'Uzupełnianie danych', detail: 'Opcjonalnie. Użyj 1, aby interpolować brakujące punkty, lub 0, aby traktować je jako zera.' },
            aggregation: { name: 'Agregacja', detail: 'Opcjonalnie. Wartość od 1 do 7 określa agregację zduplikowanych znaczników czasu.' },
        },
    },
    FORECAST_ETS_STAT: {
        description: 'Zwraca wartość statystyczną wynikającą z prognozy szeregów czasowych.',
        abstract: 'Zwraca wartość statystyczną wynikającą z prognozy szeregów czasowych.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/forecast-ets-stat-function',
            },
        ],
        functionParameter: {
            values: { name: 'Wartości', detail: 'Wartości historyczne używane do prognozy.' },
            timeline: { name: 'Oś czasu', detail: 'Niezależny zakres lub tablica liczbowych dat albo godzin ze stałym krokiem.' },
            statisticType: { name: 'Typ statystyki', detail: 'Wartość od 1 do 8 określa zwracaną statystykę prognozy.' },
            seasonality: { name: 'Sezonowość', detail: 'Opcjonalnie. 1 oznacza wykrywanie automatyczne, a 0 brak sezonowości.' },
            dataCompletion: { name: 'Uzupełnianie danych', detail: 'Opcjonalnie. Użyj 1, aby interpolować brakujące punkty, lub 0, aby traktować je jako zera.' },
            aggregation: { name: 'Agregacja', detail: 'Opcjonalnie. Wartość od 1 do 7 określa agregację zduplikowanych znaczników czasu.' },
        },
    },
    FORECAST_LINEAR: {
        description: 'Oblicz lub przewiduj przyszłą wartość przy użyciu istniejących wartości. Przyszła wartość jest wartością y dla danej wartości x. Istniejące wartości to znane wartości x i y, a przyszła wartość jest przewidywana przy użyciu regresji liniowej. Te funkcje umożliwiają przewidywanie przyszłej sprzedaży, wymagań dotyczących zapasów lub trendów konsumpcyjnych.',
        abstract: 'Oblicz lub przewiduj przyszłą wartość przy użyciu istniejących wartości. Przyszła wartość jest wartością y dla danej wartości x. Istniejące wartości to znane wartości x i y, a przyszła wartość jest przewidywana przy użyciu regresji liniowej. Te funkcje umożliwiają przewidywanie przyszłej sprzedaży, wymagań dotyczących zapasów lub trendów konsumpcyjnych.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/forecast-and-forecast-linear-functions',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'tak Punkt danych, dla którego ma zostać określona prognoza wartości.' },
            knownYs: { name: 'known_y\'s', detail: 'tak Tablica lub zakres danych zależnych.' },
            knownXs: { name: 'known_x\'s', detail: 'tak Tablica lub zakres danych niezależnych.' },
        },
    },
    FREQUENCY: {
        description: 'Funkcja CZĘSTOŚĆ oblicza, jak często wartości występują w określonym zakresie wartości, a następnie zwraca tablicę liczb w układzie pionowym. Funkcja CZĘSTOŚĆ umożliwia na przykład sprawdzenie liczby wyników testów mieszczących się w pewnym zakresie. Ponieważ funkcja CZĘSTOŚĆ zwraca tablicę, musi być wprowadzona jako formuła tablicowa.',
        abstract: 'Funkcja CZĘSTOŚĆ oblicza, jak często wartości występują w określonym zakresie wartości, a następnie zwraca tablicę liczb w układzie pionowym. Funkcja CZĘSTOŚĆ umożliwia na przykład sprawdzenie liczby wyników testów mieszczących się w pewnym zakresie. Ponieważ funkcja CZĘSTOŚĆ zwraca tablicę, musi być wprowadzona jako formuła tablicowa.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/frequency-function',
            },
        ],
        functionParameter: {
            dataArray: { name: 'data_array', detail: 'Wymagane. Tablica lub odwołanie do zbioru wartości, dla których mają być zliczane częstości. Jeśli argument tablica_dane nie ma żadnych wartości, funkcja CZĘSTOŚĆ zwraca tablicę zer.' },
            binsArray: { name: 'bins_array', detail: 'Wymagane. Tablica lub odwołanie do przedziałów, w których mają być grupowane wartości argumentu tablica_dane. Jeśli argument tablica_przedziały nie zawiera żadnych wartości, funkcja CZĘSTOŚĆ zwraca liczbę elementów w argumencie tablica_dane.' },
        },
    },
    GAMMA: {
        description: 'Zwraca wartość funkcji gamma.',
        abstract: 'Zwraca wartość funkcji gamma.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/gamma-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Zwraca liczbę.' },
        },
    },
    GAMMA_DIST: {
        description: 'Zwraca rozkład gamma. Funkcja ta umożliwia badanie zmiennych, które mogą mieć rozkład skośny. Rozkład gamma jest powszechnie stosowany w analizie kolejek.',
        abstract: 'Zwraca rozkład gamma. Funkcja ta umożliwia badanie zmiennych, które mogą mieć rozkład skośny. Rozkład gamma jest powszechnie stosowany w analizie kolejek.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/gamma-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Argument wymagany. Wartość, przy której ma być szacowany rozkład.' },
            alpha: { name: 'alpha', detail: 'Wymagane. Parametr rozkładu.' },
            beta: { name: 'beta', detail: 'Wymagane. Parametr rozkładu. Jeśli wartość argumentu beta = 1, funkcja ROZKŁ.GAMMA zwraca standardowy rozkład gamma.' },
            cumulative: { name: 'cumulative', detail: 'Wymagane. Wartość logiczna, która określa postać funkcji. Jeśli wartością argumentu skumulowany jest PRAWDA, funkcja ROZKŁ.GAMMA zwraca funkcję rozkładu skumulowanego, a jeśli FAŁSZ — funkcję gęstości prawdopodobieństwa.' },
        },
    },
    GAMMA_INV: {
        description: 'Zwraca funkcję odwrotną skumulowanego rozkładu gamma. Jeśli p = ROZKŁ.GAMMA(x;...), to ROZKŁ.GAMMA.ODWR(p;...) = x. Funkcja ta jest przydatna w badaniu zmiennej, której rozkład może być skośny.',
        abstract: 'Zwraca funkcję odwrotną skumulowanego rozkładu gamma. Jeśli p = ROZKŁ.GAMMA(x;...), to ROZKŁ.GAMMA.ODWR(p;...) = x. Funkcja ta jest przydatna w badaniu zmiennej, której rozkład może być skośny.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/gamma-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Wymagane. Prawdopodobieństwo związane z rozkładem gamma.' },
            alpha: { name: 'alpha', detail: 'Wymagane. Parametr rozkładu.' },
            beta: { name: 'beta', detail: 'Wymagane. Parametr rozkładu. Jeśli wartość argumentu beta = 1, funkcja ROZKŁ.GAMMA.ODWR zwraca standardowy rozkład gamma.' },
        },
    },
    GAMMALN: {
        description: 'Zwraca logarytm naturalny funkcji gamma, Γ(x).',
        abstract: 'Zwraca logarytm naturalny funkcji gamma, Γ(x).',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/gammaln-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Argument wymagany. Wartość, dla której ma zostać obliczona funkcja ROZKŁAD.LIN.GAMMA.' },
        },
    },
    GAMMALN_PRECISE: {
        description: 'Zwraca logarytm naturalny funkcji gamma, Γ(x).',
        abstract: 'Zwraca logarytm naturalny funkcji gamma, Γ(x).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/gammaln-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Argument wymagany. Wartość, dla której ma zostać obliczona funkcja ROZKŁAD.LIN.GAMMA.DOKŁ.' },
        },
    },
    GAUSS: {
        description: 'Oblicza prawdopodobieństwo, że element populacji o standardowym rozkładzie normalnym należy do zakresu między średnią a wielokrotnością odchyleń standardowych od średniej określoną przez argument z.',
        abstract: 'Oblicza prawdopodobieństwo, że element populacji o standardowym rozkładzie normalnym należy do zakresu między średnią a wielokrotnością odchyleń standardowych od średniej określoną przez argument z.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/gauss-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'Argument wymagany. Zwraca liczbę.' },
        },
    },
    GEOMEAN: {
        description: 'Zwraca średnią geometryczną tablicy lub zakresu danych dodatnich. Funkcji ŚREDNIA.GEOMETRYCZNA można na przykład użyć do obliczenia średniej stopy wzrostu danego procentu składanego przy zmiennej stopie.',
        abstract: 'Zwraca średnią geometryczną tablicy lub zakresu danych dodatnich. Funkcji ŚREDNIA.GEOMETRYCZNA można na przykład użyć do obliczenia średniej stopy wzrostu danego procentu składanego przy zmiennej stopie.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/geomean-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Argument liczba1 jest wymagany, pozostałe są opcjonalne. Od 1 do 255 argumentów, dla których jest obliczana średnia. Zamiast argumentów rozdzielonych średnikami można użyć pojedynczej tablicy lub odwołania do tablicy.' },
            number2: { name: 'number2', detail: 'Argument liczba1 jest wymagany, pozostałe są opcjonalne. Od 1 do 255 argumentów, dla których jest obliczana średnia. Zamiast argumentów rozdzielonych średnikami można użyć pojedynczej tablicy lub odwołania do tablicy.' },
        },
    },
    GROWTH: {
        description: 'Oblicza przewidywany wzrost wykładniczy, używając istniejących danych. Funkcja REGEXPW zwraca wartości y dla serii nowych wartości x określonych na podstawie istniejących wartości x i y. Można także użyć funkcji REGEXPW, aby dopasować krzywą wykładniczą do istniejących wartości x i y.',
        abstract: 'Oblicza przewidywany wzrost wykładniczy, używając istniejących danych. Funkcja REGEXPW zwraca wartości y dla serii nowych wartości x określonych na podstawie istniejących wartości x i y. Można także użyć funkcji REGEXPW, aby dopasować krzywą wykładniczą do istniejących wartości x i y.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/growth-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Wymagane. Zestaw znanych wartości y spełniających zależność y = b*m^x. Jeśli tablica znane_y znajduje się w pojedynczej kolumnie, to każda kolumna tablicy znane_x jest interpretowana jako oddzielna zmienna. Jeśli tablica znane_y znajduje się w pojedynczym wierszu, to każdy wiersz tablicy znane_x jest interpretowany jako oddzielna zmienna. Jeśli którakolwiek z liczb w known_y jest ujemna lub 0, funkcja REGEXPW zwraca #NUM! wartość błędu #ADR!.' },
            knownXs: { name: 'known_x\'s', detail: 'Opcjonalne. Zbiór znanych wartości x spełniających zależność y = b*m^x. Tablica known_x może zawierać jeden lub więcej zestawów zmiennych. Jeśli jest używana tylko jedna zmienna, known_y i known_x mogą być zakresami dowolnego kształtu, o ile mają jednakowe wymiary. Jeśli jest używana więcej niż jedna zmienna, known_y musi być wektorem (czyli zakresem o wysokości jednego wiersza lub szerokości jednej kolumny). Jeżeli argument znane_x jest pominięty, przyjmuje się, że jest on tablicą {1;2;3;...}, która ma ten sam rozmiar co tablica znane_y.' },
            newXs: { name: 'new_x\'s', detail: 'Opcjonalne. Zestaw nowych wartości x, dla których funkcja REGEXPW ma zwrócić odpowiednie wartości y. New_x musi zawierać kolumnę (lub wiersz) dla każdej zmiennej niezależnej, podobnie jak known_x. Jeśli więc known_y znajduje się w jednej kolumnie, known_x i new_x muszą mieć taką samą liczbę kolumn. Jeśli known_y znajduje się w jednym wierszu, known_x i new_x muszą mieć taką samą liczbę wierszy. Jeżeli argument nowe_ x zostanie pominięty, przyjmuje się, że jest on taki sam jak znane_x. Jeżeli zarówno znane_x jak i nowe_x zostaną pominięte, to przyjmuje się, że są one tablicą {1;2;3;...} o takiej samej wielkości co znane_y.' },
            constb: { name: 'const', detail: 'Opcjonalne. Wartość logiczna określająca, czy stała b ma mieć narzuconą wartość 1. Jeżeli stała ma wartość PRAWDA lub jest pominięta, to stała b jest obliczana normalnie. Jeśli stała ma wartość FAŁSZ, to stała b jest ustawiana jako równa 1, a wartości m są tak dostosowywane, aby y = m^x.' },
        },
    },
    HARMEAN: {
        description: 'Zwraca średnią harmoniczną zbioru danych. Średnia harmoniczna jest odwrotnością średniej arytmetycznej odwrotności.',
        abstract: 'Zwraca średnią harmoniczną zbioru danych. Średnia harmoniczna jest odwrotnością średniej arytmetycznej odwrotności.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/harmean-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Argument liczba1 jest wymagany, pozostałe są opcjonalne. Od 1 do 255 argumentów, dla których jest obliczana średnia. Zamiast argumentów rozdzielonych średnikami można użyć pojedynczej tablicy lub odwołania do tablicy.' },
            number2: { name: 'number2', detail: 'Argument liczba1 jest wymagany, pozostałe są opcjonalne. Od 1 do 255 argumentów, dla których jest obliczana średnia. Zamiast argumentów rozdzielonych średnikami można użyć pojedynczej tablicy lub odwołania do tablicy.' },
        },
    },
    HYPGEOM_DIST: {
        description: 'Zwraca rozkład hipergeometryczny. HIPERGEOM. Funkcja ROZKŁ.DIST zwraca prawdopodobieństwo podanej liczby sukcesów próbek, biorąc pod uwagę wielkość próbki, sukcesy populacji i wielkość populacji. Użyj hipergeomu. RozKŁ.DY dla problemów z skończoną populacją, gdzie każda obserwacja jest sukcesem lub porażką i gdzie każdy podzbiór o danej wielkości jest wybierany z jednakowym prawdopodobieństwem.',
        abstract: 'Zwraca rozkład hipergeometryczny. HIPERGEOM. Funkcja ROZKŁ.DIST zwraca prawdopodobieństwo podanej liczby sukcesów próbek, biorąc pod uwagę wielkość próbki, sukcesy populacji i wielkość populacji. Użyj hipergeomu. RozKŁ.DY dla problemów z skończoną populacją, gdzie każda obserwacja jest sukcesem lub porażką i gdzie każdy podzbiór o danej wielkości jest wybierany z jednakowym prawdopodobieństwem.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/hypgeom-dist-function',
            },
        ],
        functionParameter: {
            sampleS: { name: 'sample_s', detail: 'Wymagane. Liczba sukcesów w próbce.' },
            numberSample: { name: 'number_sample', detail: 'Wymagane. Wielkość próbki.' },
            populationS: { name: 'population_s', detail: 'Wymagane. Liczba sukcesów w populacji.' },
            numberPop: { name: 'number_pop', detail: 'Wymagane. Wielkość populacji.' },
            cumulative: { name: 'cumulative', detail: 'Wymagane. Wartość logiczna, która określa postać funkcji. Jeśli wartością argumentu skumulowany jest PRAWDA, funkcja ROZKŁ.HIPERGEOM zwraca funkcję rozkładu skumulowanego, a jeśli FAŁSZ, funkcja zwraca funkcję masy prawdopodobieństwa.' },
        },
    },
    INTERCEPT: {
        description: 'Oblicza punkt przecięcia się linii z osią y przy użyciu istniejących wartości znane_x i znane_y. Punkt przecięcia jest to punkt, w którym prosta regresji, poprowadzona przez wartości znane_x i znane_y, przecina oś y. Należy stosować funkcję ODCIĘTA wtedy, gdy chce się wyznaczyć wartość zmiennej zależnej przy zerowej wartości zmiennej niezależnej. Na przykład można zastosować funkcję ODCIĘTA do wyznaczenia oporności metalu przy 0°C, podczas gdy punkty pomiarowe wyznaczano w temperaturze pokojowej i wyższych.',
        abstract: 'Oblicza punkt przecięcia się linii z osią y przy użyciu istniejących wartości znane_x i znane_y. Punkt przecięcia jest to punkt, w którym prosta regresji, poprowadzona przez wartości znane_x i znane_y, przecina oś y. Należy stosować funkcję ODCIĘTA wtedy, gdy chce się wyznaczyć wartość zmiennej zależnej przy zerowej wartości zmiennej niezależnej. Na przykład można zastosować funkcję ODCIĘTA do wyznaczenia oporności metalu przy 0°C, podczas gdy punkty pomiarowe wyznaczano w temperaturze pokojowej i wyższych.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/intercept-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Wymagane. Zbiór danych lub obserwacji zależnych.' },
            knownXs: { name: 'known_x\'s', detail: 'Wymagane. Zbiór danych lub obserwacji niezależnych.' },
        },
    },
    KURT: {
        description: 'Zwraca kurtozę zbioru danych. Kurtoza charakteryzuje względną szczytowość lub płaskość rozkładu w porównaniu z rozkładem normalnym. Dodatnia kurtoza oznacza rozkład o stosunkowo dużej szczytowości. Ujemna kurtoza oznacza rozkład stosunkowo płaski.',
        abstract: 'Zwraca kurtozę zbioru danych. Kurtoza charakteryzuje względną szczytowość lub płaskość rozkładu w porównaniu z rozkładem normalnym. Dodatnia kurtoza oznacza rozkład o stosunkowo dużej szczytowości. Ujemna kurtoza oznacza rozkład stosunkowo płaski.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/kurt-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Argument liczba1 jest wymagany, pozostałe są opcjonalne. Od 1 do 255 argumentów, dla których jest obliczana kurtoza. Zamiast argumentów rozdzielonych średnikami można użyć jednej tablicy lub odwołania do tablicy.' },
            number2: { name: 'number2', detail: 'Argument liczba1 jest wymagany, pozostałe są opcjonalne. Od 1 do 255 argumentów, dla których jest obliczana kurtoza. Zamiast argumentów rozdzielonych średnikami można użyć jednej tablicy lub odwołania do tablicy.' },
        },
    },
    LARGE: {
        description: 'Zwraca k-tą największą wartość w zbiorze danych. Funkcji tej można użyć do wybrania wartości na podstawie jej względnej pozycji. Przykładowo można użyć funkcji MAX.K w celu określenia pierwszego, drugiego lub trzeciego miejsca.',
        abstract: 'Zwraca k-tą największą wartość w zbiorze danych. Funkcji tej można użyć do wybrania wartości na podstawie jej względnej pozycji. Przykładowo można użyć funkcji MAX.K w celu określenia pierwszego, drugiego lub trzeciego miejsca.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/large-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Wymagane. Tablica lub zakres danych, dla których ma zostać wyznaczona k-ta największą wartość.' },
            k: { name: 'k', detail: 'Argument wymagany. Wyznaczana pozycja danej (od największej) w tablicy lub zakresie komórek.' },
        },
    },
    LINEST: {
        description: 'Funkcja REGLINP oblicza statystykę dla linii, korzystając z metody najmniejszych kwadratów, aby obliczyć linię prostą, która najlepiej pasuje do danych, a następnie zwraca tablicę opisującą tę linię. Funkcję REGLINP można również połączyć z innymi funkcjami, aby obliczyć statystykę dla innych typów modeli, które są liniowe w nieznanych parametrach, w tym serii wielomianowych, logarytmicznych, wykładniczych i potęgowych. Funkcja zwraca tablicę wartości, musi więc być wprowadzana w postaci formuły tablicowej. Instrukcje są zgodne z przykładami przedstawionymi w tym artykule.',
        abstract: 'Funkcja REGLINP oblicza statystykę dla linii, korzystając z metody najmniejszych kwadratów, aby obliczyć linię prostą, która najlepiej pasuje do danych, a następnie zwraca tablicę opisującą tę linię. Funkcję REGLINP można również połączyć z innymi funkcjami, aby obliczyć statystykę dla innych typów modeli, które są liniowe w nieznanych parametrach, w tym serii wielomianowych, logarytmicznych, wykładniczych i potęgowych. Funkcja zwraca tablicę wartości, musi więc być wprowadzana w postaci formuły tablicowej. Instrukcje są zgodne z przykładami przedstawionymi w tym artykule.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/linest-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Argument wymagany. Jest to zestaw znanych wartości y spełniających zależność y = mx + b. Jeśli zakres known_y znajduje się w jednej kolumnie, to każda z known_x jest interpretowana jako oddzielna zmienna. Jeśli zakres known_y znajduje się w jednym wierszu, to każdy wiersz known_x jest interpretowany jako oddzielna zmienna.' },
            knownXs: { name: 'known_x\'s', detail: 'Opcjonalnie. Jest to zestaw znanych wartości x spełniających zależność y = mx + b. Zakres known_x może zawierać jeden lub więcej zestawów zmiennych. Jeśli użyto tylko jednej zmiennej, known_y i known_x mogą być zakresami o dowolnym kształcie, o ile mają jednakowe wymiary. Jeśli użyto więcej niż jednej zmiennej, known_y musi być wektorem (czyli zakresem o wysokości jednego wiersza lub szerokości jednej kolumny). Jeśli argument known_x zostanie pominięty, przyjmuje się, że jest on tablicą {1;2;3,...} o takim samym rozmiarze jak known_y .' },
            constb: { name: 'const', detail: 'Opcjonalnie. Wartość logiczna określająca, czy stała b ma mieć narzuconą wartość 0. Jeżeli stała ma wartość PRAWDA lub jest pominięta, to stała b jest obliczana normalnie. Jeśli stała ma wartość FAŁSZ, to stała b jest ustawiana jako równa 0, a wartości m są dostosowywane tak, aby wypełnić równanie y = mx.' },
            stats: { name: 'stats', detail: 'Opcjonalnie. Wartość logiczna określająca, czy mają być zwracane dodatkowe statystyki regresji. Jeśli argument statystyka ma wartość PRAWDA, funkcja REGLINP zwraca dodatkowe statystyki regresji; W rezultacie zwrócona tablica to {mn;mn-1,...,m1;b; sen,sen-1,...,se1,seb; r 2,sey ; F,df; ssreg,ssresid} . Jeśli argument statystyka ma wartość FAŁSZ lub jest pominięty, funkcja REGLINP zwraca tylko współczynniki m i stałą b. Poniżej przedstawiono dodatkowe statystyki regresji:' },
        },
    },
    LOGEST: {
        description: 'Poniżej przedstawiono równanie krzywej:',
        abstract: 'Poniżej przedstawiono równanie krzywej:',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/logest-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Wymagane. Zestaw znanych wartości y spełniających zależność y = b*m^x. Jeśli tablica znane_y znajduje się w pojedynczej kolumnie, to każda kolumna tablicy znane_x jest interpretowana jako oddzielna zmienna. Jeśli tablica znane_y znajduje się w pojedynczym wierszu, to każdy wiersz tablicy znane_x jest interpretowany jako oddzielna zmienna.' },
            knownXs: { name: 'known_x\'s', detail: 'Opcjonalne. Zbiór znanych wartości x spełniających zależność y = b*m^x. Tablica known_x może zawierać jeden lub więcej zestawów zmiennych. Jeśli jest używana tylko jedna zmienna, known_y i known_x mogą być zakresami dowolnego kształtu, o ile mają jednakowe wymiary. Jeśli jest używana więcej niż jedna zmienna, known_y musi być zakresem komórek o wysokości jednego wiersza lub szerokości jednej kolumny (nazywanej również wektorem). Jeżeli argument znane_x jest pominięty, przyjmuje się, że jest on tablicą {1;2;3;...} o tym samym rozmiarze, co znane_y.' },
            constb: { name: 'const', detail: 'Opcjonalne. Wartość logiczna określająca, czy stała b ma mieć narzuconą wartość 1. Jeżeli stała ma wartość PRAWDA lub jest pominięta, to stała b jest obliczana normalnie. Jeśli stała ma wartość FAŁSZ, to stała b jest ustawiana na wartość 1, a wartości m są dopasowywane do równania y = m^x.' },
            stats: { name: 'stats', detail: 'Opcjonalne. Wartość logiczna określająca, czy mają być zwracane dodatkowe statystyki regresji. Jeśli argument statystyka ma wartość PRAWDA, to funkcja REGEXPP zwraca dodatkowe statystyki regresji, więc zwrócona tablica przedstawia się następująco: {mn;mn-1;...;m1;b\\sen;sen-1;...;se1;seb\\r 2;sey\\F;df\\ssreg;ssresid}. Jeśli argument statystyka ma wartość FAŁSZ lub jest pominięty, to funkcja REGEXPP zwraca jedynie współczynniki m i stałą b.' },
        },
    },
    LOGNORM_DIST: {
        description: 'Funkcję tę należy stosować do analizowania danych, które zostały przetworzone logarytmicznie.',
        abstract: 'Funkcję tę należy stosować do analizowania danych, które zostały przetworzone logarytmicznie.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/lognorm-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Argument wymagany. Wartość, dla której ta funkcja ma zostać obliczona.' },
            mean: { name: 'mean', detail: 'Wymagane. Wartość średnia ln(x).' },
            standardDev: { name: 'standard_dev', detail: 'Wymagane. Odchylenie standardowe ln(x).' },
            cumulative: { name: 'cumulative', detail: 'Wymagane. Wartość logiczna, która określa postać funkcji. Jeśli wartością argumentu skumulowany jest PRAWDA, funkcja ROZKŁ.LOG zwraca funkcję rozkładu skumulowanego, a jeśli FAŁSZ, funkcja zwraca funkcję gęstości prawdopodobieństwa.' },
        },
    },
    LOGNORM_INV: {
        description: 'Zwraca odwrotność funkcji skumulowanego rozkładu logarytmiczno-normalnego x, gdzie ln(x) ma rozkład normalny z parametrami średnia i odchylenie_std. Jeśli p = ROZKŁAD.LOG(x;...), to ROZKŁ.LOG.ODWR(p;...) = x.',
        abstract: 'Zwraca odwrotność funkcji skumulowanego rozkładu logarytmiczno-normalnego x, gdzie ln(x) ma rozkład normalny z parametrami średnia i odchylenie_std. Jeśli p = ROZKŁAD.LOG(x;...), to ROZKŁ.LOG.ODWR(p;...) = x.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/lognorm-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Wymagane. Prawdopodobieństwo skojarzone z rozkładem logarytmiczno-normalnym.' },
            mean: { name: 'mean', detail: 'Wymagane. Wartość średnia ln(x).' },
            standardDev: { name: 'standard_dev', detail: 'Wymagane. Odchylenie standardowe ln(x).' },
        },
    },
    MARGINOFERROR: {
        description: 'Oblicza margines błędu na podstawie zakresu wartości i poziomu ufności.',
        abstract: 'Oblicza margines błędu na podstawie zakresu wartości i poziomu ufności.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/12487850?hl=pl',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'Zakres wartości używany do obliczenia marginesu błędu.' },
            confidence: { name: 'confidence', detail: 'Żądany poziom ufności z przedziału (0; 1).' },
        },
    },
    MAX: {
        description: 'Zwraca największą wartość w zbiorze wartości.',
        abstract: 'Zwraca największą wartość w zbiorze wartości.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/max-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Argument liczba1 jest wymagany, pozostałe są opcjonalne. Od 1 do 255 argumentów, dla których należy wyznaczyć wartość maksymalną.' },
            number2: { name: 'number2', detail: 'Argument liczba1 jest wymagany, pozostałe są opcjonalne. Od 1 do 255 argumentów, dla których należy wyznaczyć wartość maksymalną.' },
        },
    },
    MAXA: {
        description: 'Zwraca największą wartość z listy argumentów.',
        abstract: 'Zwraca największą wartość z listy argumentów.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/maxa-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Wymagane. Pierwszy argument liczbowy, dla którego ma zostać obliczona wartość maksymalna.' },
            value2: { name: 'value2', detail: 'Opcjonalne. Argumenty liczbowe, od 2 do 255 wartości, dla których należy znaleźć największą wartość.' },
        },
    },
    MAXIFS: {
        description: 'Funkcja MAKS.WARUNKÓW zwraca wartość maksymalną spośród komórek spełniających podany zestaw warunków lub kryteriów.',
        abstract: 'Funkcja MAKS.WARUNKÓW zwraca wartość maksymalną spośród komórek spełniających podany zestaw warunków lub kryteriów.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/maxifs-function',
            },
        ],
        functionParameter: {
            maxRange: { name: 'sum_range', detail: 'Zakres komórek, w którym zostanie określona wartość maksymalna.' },
            criteriaRange1: { name: 'criteria_range1', detail: 'Zbiór komórek ocenianych na podstawie kryteriów.' },
            criteria1: { name: 'criteria1', detail: 'Kryteria w postaci liczby, wyrażenia lub tekstu, definiujące, które wartości zostaną określone jako maksymalne. Takie same kryteria stosuje się w funkcjach MIN.WARUNKÓW , SUMA.WARUNKÓW i ŚREDNIA.WARUNKÓW .' },
            criteriaRange2: { name: 'criteriaRange2', detail: 'Dodatkowe zakresy i skojarzone z nimi kryteria. Maksymalnie można wprowadzić 126 par zakres/kryteria.' },
            criteria2: { name: 'criteria2', detail: 'Dodatkowe zakresy i skojarzone z nimi kryteria. Maksymalnie można wprowadzić 126 par zakres/kryteria.' },
        },
    },
    MEDIAN: {
        description: 'Zwraca medianę podanych liczb.',
        abstract: 'Zwraca medianę podanych liczb.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/median-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Pierwsza liczba, odwołanie do komórki lub zakres, dla których chcesz wyznaczyć medianę.' },
            number2: { name: 'number2', detail: 'Dodatkowe liczby, odwołania do komórek lub zakresy, dla których chcesz wyznaczyć medianę; maksymalnie 255.' },
        },
    },
    MIN: {
        description: 'Zwraca najmniejszą liczbę w zbiorze wartości.',
        abstract: 'Zwraca najmniejszą liczbę w zbiorze wartości.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/min-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Argument liczba1 jest opcjonalny, pozostałe są opcjonalne. Od 1 do 255 argumentów, dla których należy wyznaczyć wartość minimalną.' },
            number2: { name: 'number2', detail: 'Argument liczba1 jest opcjonalny, pozostałe są opcjonalne. Od 1 do 255 argumentów, dla których należy wyznaczyć wartość minimalną.' },
        },
    },
    MINA: {
        description: 'Zwraca najmniejszą wartość z listy argumentów.',
        abstract: 'Zwraca najmniejszą wartość z listy argumentów.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/mina-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Argument wartość1 jest wymagany, pozostałe są opcjonalne. Od 1 do 255 wartości, dla których należy wyznaczyć najmniejszą wartość.' },
            value2: { name: 'value2', detail: 'Argument wartość1 jest wymagany, pozostałe są opcjonalne. Od 1 do 255 wartości, dla których należy wyznaczyć najmniejszą wartość.' },
        },
    },
    MINIFS: {
        description: 'Funkcja MIN.WARUNKÓW zwraca wartość minimalną spośród komórek spełniających podany zestaw warunków lub kryteriów.',
        abstract: 'Funkcja MIN.WARUNKÓW zwraca wartość minimalną spośród komórek spełniających podany zestaw warunków lub kryteriów.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/minifs-function',
            },
        ],
        functionParameter: {
            minRange: { name: 'min_range', detail: 'Zakres komórek, w którym zostanie określona wartość minimalna.' },
            criteriaRange1: { name: 'criteria_range1', detail: 'Zbiór komórek ocenianych na podstawie kryteriów.' },
            criteria1: { name: 'criteria1', detail: 'Kryteria w postaci liczby, wyrażenia lub tekstu, definiujące, które wartości zostaną określone jako minimalne. Takie same kryteria stosuje się w funkcjach MAKS.WARUNKÓW , SUMA.WARUNKÓW i ŚREDNIA.WARUNKÓW .' },
            criteriaRange2: { name: 'criteria_range2', detail: 'Dodatkowe zakresy i skojarzone z nimi kryteria. Maksymalnie można wprowadzić 126 par zakres/kryteria.' },
            criteria2: { name: 'criteria2', detail: 'Dodatkowe zakresy i skojarzone z nimi kryteria. Maksymalnie można wprowadzić 126 par zakres/kryteria.' },
        },
    },
    MODE_MULT: {
        description: 'Jeśli istnieje więcej niż jedna dominanta, ta funkcja zwraca kilka wyników. Funkcja zwraca tablicę wartości, więc musi zostać wprowadzona w postaci formuły tablicowej.',
        abstract: 'Jeśli istnieje więcej niż jedna dominanta, ta funkcja zwraca kilka wyników. Funkcja zwraca tablicę wartości, więc musi zostać wprowadzona w postaci formuły tablicowej.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/mode-mult-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Wymagane. Pierwsza liczba zakresu, dla którego ma zostać obliczona dominanta.' },
            number2: { name: 'number2', detail: 'Opcjonalne. Argumenty liczbowe od 2 do 254, dla których należy obliczyć dominantę. Zamiast argumentów rozdzielonych średnikami można użyć pojedynczej tablicy lub odwołania do tablicy.' },
        },
    },
    MODE_SNGL: {
        description: 'Zwraca wartość najczęściej występującą lub powtarzającą się w tablicy albo w zakresie danych.',
        abstract: 'Zwraca wartość najczęściej występującą lub powtarzającą się w tablicy albo w zakresie danych.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/mode-sngl-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Wymagane. Pierwszy argument, dla którego ma zostać obliczona dominanta.' },
            number2: { name: 'number2', detail: 'Opcjonalne. Argumenty od 2 do 254, dla których należy obliczyć dominantę. Zamiast argumentów rozdzielonych średnikami można użyć pojedynczej tablicy lub odwołania do tablicy.' },
        },
    },
    NEGBINOM_DIST: {
        description: 'Zwraca ujemny rozkład dwumianowy — prawdopodobieństwo, że wystąpi liczba_p porażek przed wystąpieniem liczba_s-tego sukcesu przy prawdopodobieństwie sukcesu prawdopodobieństwo_s.',
        abstract: 'Zwraca ujemny rozkład dwumianowy — prawdopodobieństwo, że wystąpi liczba_p porażek przed wystąpieniem liczba_s-tego sukcesu przy prawdopodobieństwie sukcesu prawdopodobieństwo_s.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/negbinom-dist-function',
            },
        ],
        functionParameter: {
            numberF: { name: 'number_f', detail: 'Wymagane. Liczba porażek.' },
            numberS: { name: 'number_s', detail: 'Wymagane. Progowa liczba sukcesów.' },
            probabilityS: { name: 'probability_s', detail: 'Wymagane. Prawdopodobieństwo sukcesu.' },
            cumulative: { name: 'cumulative', detail: 'Wymagane. Wartość logiczna, która określa postać funkcji. Jeśli wartością argumentu „skumulowany” jest PRAWDA, funkcja ROZKŁ.DWUM.PRZEC zwraca funkcję rozkładu skumulowanego, a jeśli FAŁSZ, funkcja zwraca funkcję gęstości prawdopodobieństwa.' },
        },
    },
    NORM_DIST: {
        description: 'Zwraca rozkład normalny dla określonej średniej i odchylenia standardowego. Funkcja ta ma bardzo szeroki zakres zastosowań w statystyce, łącznie z badaniem hipotez.',
        abstract: 'Zwraca rozkład normalny dla określonej średniej i odchylenia standardowego. Funkcja ta ma bardzo szeroki zakres zastosowań w statystyce, łącznie z badaniem hipotez.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/norm-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Argument wymagany. Wartość, dla której należy obliczyć rozkład.' },
            mean: { name: 'mean', detail: 'Wymagane. Średnia arytmetyczna rozkładu.' },
            standardDev: { name: 'standard_dev', detail: 'Wymagane. Odchylenie standardowe rozkładu.' },
            cumulative: { name: 'cumulative', detail: 'Wymagane. Wartość logiczna, która określa postać funkcji. Jeśli wartością argumentu "skumulowany" jest PRAWDA, jest to norma. Funkcja ROZKŁ.D zwraca funkcję rozkładu skumulowanego. jeśli FAŁSZ, funkcja zwraca funkcję gęstości prawdopodobieństwa.' },
        },
    },
    NORM_INV: {
        description: 'Zwraca odwrotność skumulowanego rozkładu normalnego dla podanej średniej i odchylenia standardowego.',
        abstract: 'Zwraca odwrotność skumulowanego rozkładu normalnego dla podanej średniej i odchylenia standardowego.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/norm-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Wymagane. Prawdopodobieństwo odpowiadające rozkładowi normalnemu.' },
            mean: { name: 'mean', detail: 'Wymagane. Średnia arytmetyczna rozkładu.' },
            standardDev: { name: 'standard_dev', detail: 'Wymagane. Odchylenie standardowe rozkładu.' },
        },
    },
    NORM_S_DIST: {
        description: 'Norma. Funkcja ROZKŁ.S w programie Excel zwraca standardowy rozkład normalny ( tj. ma średnią zero i odchylenie standardowe jednego ). Funkcji tej można używać miejscu tabeli standardowych obszarów krzywej normalnej.',
        abstract: 'Norma. Funkcja ROZKŁ.S w programie Excel zwraca standardowy rozkład normalny ( tj. ma średnią zero i odchylenie standardowe jednego ). Funkcji tej można używać miejscu tabeli standardowych obszarów krzywej normalnej.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/norm-s-dist-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'Argument wymagany. Jest to wartość, dla której należy obliczyć rozkład.' },
            cumulative: { name: 'cumulative', detail: 'Wymagane. Argumentem skumulowanym może być PRAWDA lub FAŁSZ . Ta wartość logiczna określa postać funkcji. Jeśli wartością argumentu "skumulowany" jest PRAWDA, to norma. Funkcja ROZKŁ.S zwraca funkcję rozkładu skumulowanego . Jeśli ma wartość FAŁSZ, funkcja zwraca funkcję masy prawdopodobieństwa .' },
        },
    },
    NORM_S_INV: {
        description: 'Zwraca funkcję odwrotną skumulowanego, standardowego rozkładu normalnego. Rozkład ten ma średnią równą zero i standardowe odchylenie równe jeden.',
        abstract: 'Zwraca funkcję odwrotną skumulowanego, standardowego rozkładu normalnego. Rozkład ten ma średnią równą zero i standardowe odchylenie równe jeden.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/norm-s-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Wymagane. Prawdopodobieństwo odpowiadające rozkładowi normalnemu.' },
        },
    },
    PEARSON: {
        description: 'Zwraca współczynnik korelacji liniowej Pearsona r. Jest to bezwymiarowy wskaźnik, którego wartość mieści się w zakresie od -1,0 do 1,0 włącznie, i odzwierciedla stopień liniowej zależności pomiędzy dwoma zestawami danych.',
        abstract: 'Zwraca współczynnik korelacji liniowej Pearsona r. Jest to bezwymiarowy wskaźnik, którego wartość mieści się w zakresie od -1,0 do 1,0 włącznie, i odzwierciedla stopień liniowej zależności pomiędzy dwoma zestawami danych.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/pearson-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Wymagane. Zbiór wartości niezależnych.' },
            array2: { name: 'array2', detail: 'Wymagane. Zbiór wartości zależnych.' },
        },
    },
    PERCENTILE_EXC: {
        description: 'Zwraca k-ty percentyl wartości w zestawie danych (z wyłączeniem 0 i 1).',
        abstract: 'Zwraca k-ty percentyl wartości w zestawie danych (z wyłączeniem 0 i 1).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/percentile-exc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Tablica lub zakres danych określający pozycję względną.' },
            k: { name: 'k', detail: 'Wartość percentyla z zakresu od 0 do 1, z wyłączeniem 0 i 1.' },
        },
    },
    PERCENTILE_INC: {
        description: 'Zwraca k-ty percentyl wartości w zestawie danych (z uwzględnieniem 0 i 1).',
        abstract: 'Zwraca k-ty percentyl wartości w zestawie danych (z uwzględnieniem 0 i 1).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/percentile-inc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Tablica lub zakres danych określający pozycję względną.' },
            k: { name: 'k', detail: 'Wartość percentyla z zakresu od 0 do 1, z uwzględnieniem 0 i 1.' },
        },
    },
    PERCENTRANK_EXC: {
        description: 'Zwraca rangę procentową wartości w zestawie danych (z wyłączeniem 0 i 1).',
        abstract: 'Zwraca rangę procentową wartości w zestawie danych (z wyłączeniem 0 i 1).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/percentrank-exc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Tablica lub zakres danych określający pozycję względną.' },
            x: { name: 'x', detail: 'Wartość, dla której chcesz poznać rangę.' },
            significance: { name: 'significance', detail: 'Wartość określająca liczbę cyfr znaczących zwracanej wartości procentowej. Jeśli ją pominiesz, funkcja PERCENTRANK.EXC użyje trzech cyfr (0,xxx).' },
        },
    },
    PERCENTRANK_INC: {
        description: 'Zwraca rangę procentową wartości w zestawie danych (z uwzględnieniem 0 i 1).',
        abstract: 'Zwraca rangę procentową wartości w zestawie danych (z uwzględnieniem 0 i 1).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/percentrank-inc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Tablica lub zakres danych określający pozycję względną.' },
            x: { name: 'x', detail: 'Wartość, dla której chcesz poznać rangę.' },
            significance: { name: 'significance', detail: 'Wartość określająca liczbę cyfr znaczących zwracanej wartości procentowej. Jeśli ją pominiesz, funkcja PERCENTRANK.INC użyje trzech cyfr (0,xxx).' },
        },
    },
    PERMUT: {
        description: 'Zwraca liczbę permutacji dla podanej liczby obiektów, które można wybrać z szerszej grupy obiektów liczbowych. Permutacją jest dowolny zbiór lub podzbiór obiektów lub zdarzeń, gdzie ważne jest wewnętrzne uporządkowanie. Permutacje różnią się od kombinacji, dla których wewnętrzne uporządkowanie nie jest istotne. Funkcję tę należy stosować do obliczania prawdopodobieństwa typu loteryjnego.',
        abstract: 'Zwraca liczbę permutacji dla podanej liczby obiektów, które można wybrać z szerszej grupy obiektów liczbowych. Permutacją jest dowolny zbiór lub podzbiór obiektów lub zdarzeń, gdzie ważne jest wewnętrzne uporządkowanie. Permutacje różnią się od kombinacji, dla których wewnętrzne uporządkowanie nie jest istotne. Funkcję tę należy stosować do obliczania prawdopodobieństwa typu loteryjnego.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/permut-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Liczba całkowita, która opisuje liczbę obiektów.' },
            numberChosen: { name: 'number_chosen', detail: 'Wymagane. Liczba całkowita, która opisuje liczbę obiektów w każdej permutacji.' },
        },
    },
    PERMUTATIONA: {
        description: 'Zwraca liczbę permutacji dla podanej liczby obiektów (z powtórzeniami), które można wybrać spośród wszystkich obiektów.',
        abstract: 'Zwraca liczbę permutacji dla podanej liczby obiektów (z powtórzeniami), które można wybrać spośród wszystkich obiektów.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/permutationa-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Liczba całkowita, która opisuje całkowitą liczbę obiektów.' },
            numberChosen: { name: 'number_chosen', detail: 'Wymagane. Liczba całkowita, która opisuje liczbę obiektów w każdej permutacji.' },
        },
    },
    PHI: {
        description: 'Zwraca wartość funkcji gęstości dla standardowego rozkładu normalnego.',
        abstract: 'Zwraca wartość funkcji gęstości dla standardowego rozkładu normalnego.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/phi-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Argument wymagany. X jest liczbą, dla której ma zostać zwrócona gęstość dla standardowego rozkładu normalnego.' },
        },
    },
    POISSON_DIST: {
        description: 'Zwraca skumulowaną funkcję (dystrybuantę) rozkładu Poissona. Zwykłym zastosowaniem rozkładu Poissona jest prognozowanie liczby zdarzeń w danym czasie, takiej jak liczba samochodów przejeżdżających przez plac w czasie jednej minuty.',
        abstract: 'Zwraca skumulowaną funkcję (dystrybuantę) rozkładu Poissona. Zwykłym zastosowaniem rozkładu Poissona jest prognozowanie liczby zdarzeń w danym czasie, takiej jak liczba samochodów przejeżdżających przez plac w czasie jednej minuty.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/poisson-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Argument wymagany. Liczba zdarzeń.' },
            mean: { name: 'mean', detail: 'Wymagane. Oczekiwana wartość liczbowa.' },
            cumulative: { name: 'cumulative', detail: 'Wymagane. Wartość logiczna, która określa postać zwracanego rozkładu prawdopodobieństwa. Jeśli argument skumulowany ma wartość PRAWDA, funkcja ROZKŁ.POISSON zwraca skumulowane prawdopodobieństwo Poissona, że liczba przypadkowych zdarzeń będzie między zero a x włącznie; jeśli ma wartość FAŁSZ, funkcja zwraca funkcję masy prawdopodobieństwa Poissona, że liczba zdarzeń będzie równa dokładnie x.' },
        },
    },
    PROB: {
        description: 'Zwraca prawdopodobieństwo, że wartości w zakresie znajdują się pomiędzy dwiema granicami. Jeżeli argument górna_granica nie jest podany, funkcja ta zwraca prawdopodobieństwo, że wartości w zakres_x są równe dolna_granica.',
        abstract: 'Zwraca prawdopodobieństwo, że wartości w zakresie znajdują się pomiędzy dwiema granicami. Jeżeli argument górna_granica nie jest podany, funkcja ta zwraca prawdopodobieństwo, że wartości w zakres_x są równe dolna_granica.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/prob-function',
            },
        ],
        functionParameter: {
            xRange: { name: 'x_range', detail: 'Wymagane. Zakres wartości liczbowych x, z którymi są skojarzone prawdopodobieństwa.' },
            probRange: { name: 'prob_range', detail: 'Wymagane. Zbiór prawdopodobieństw skojarzonych z wartościami określonymi w argumencie zakres_x.' },
            lowerLimit: { name: 'lower_limit', detail: 'Opcjonalne. Dolna granica wartości, dla których jest poszukiwane prawdopodobieństwo.' },
            upperLimit: { name: 'upper_limit', detail: 'Opcjonalne. Górna granica wartości, dla których jest poszukiwane prawdopodobieństwo.' },
        },
    },
    QUARTILE_EXC: {
        description: 'Zwraca kwartyl zbioru danych na podstawie wartości percentylu z przedziału od 0 do 1.',
        abstract: 'Zwraca kwartyl zbioru danych na podstawie wartości percentylu z przedziału od 0 do 1.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/quartile-exc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Wymagane. Tablica lub zakres komórek z wartościami liczbowymi, dla których ma zostać obliczona wartość kwartylu.' },
            quart: { name: 'quart', detail: 'Wymagane. Wskazuje, która wartość ma zostać zwrócona.' },
        },
    },
    QUARTILE_INC: {
        description: 'Kwartyle są często używane w danych o sprzedaży i w danych statystycznych do dzielenia populacji na grupy. Funkcję KWARTYL.PRZEDZ.ZAMK można na przykład zastosować do znalezienia 25% najwyższych przychodów w populacji.',
        abstract: 'Kwartyle są często używane w danych o sprzedaży i w danych statystycznych do dzielenia populacji na grupy. Funkcję KWARTYL.PRZEDZ.ZAMK można na przykład zastosować do znalezienia 25% najwyższych przychodów w populacji.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/quartile-inc-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Wymagane. Tablica lub zakres komórek z wartościami liczbowymi, dla których ma zostać obliczona wartość kwartylu.' },
            quart: { name: 'quart', detail: 'Wymagane. Wskazuje, która wartość ma zostać zwrócona.' },
        },
    },
    RANK_AVG: {
        description: 'Zwraca pozycję liczby na liście liczb: jej rozmiar względem innych wartości na liście. Jeśli więcej niż jedna wartość ma taką samą pozycję, zwracana jest średnia pozycja.',
        abstract: 'Zwraca pozycję liczby na liście liczb: jej rozmiar względem innych wartości na liście. Jeśli więcej niż jedna wartość ma taką samą pozycję, zwracana jest średnia pozycja.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/rank-avg-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Liczba, której pozycja ma zostać określona.' },
            ref: { name: 'ref', detail: 'Wymagane. Tablica z listą liczb lub odwołanie do takiej listy. Wartości w odwołaniu niebędące liczbami są ignorowane.' },
            order: { name: 'order', detail: 'Opcjonalne. Liczba określająca sposób ustalania pozycji liczby.' },
        },
    },
    RANK_EQ: {
        description: 'Zwraca pozycję pewnej liczby na liście liczb. Jego rozmiar jest w stosunku do innych wartości na liście; Jeśli więcej niż jedna wartość ma taką samą pozycję, zwracana jest najwyższa pozycja tego zestawu wartości.',
        abstract: 'Zwraca pozycję pewnej liczby na liście liczb. Jego rozmiar jest w stosunku do innych wartości na liście; Jeśli więcej niż jedna wartość ma taką samą pozycję, zwracana jest najwyższa pozycja tego zestawu wartości.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/rank-eq-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Argument wymagany. Liczba, której pozycja ma zostać określona.' },
            ref: { name: 'ref', detail: 'Wymagane. Tablica z listą liczb lub odwołanie do takiej listy. Wartości w odwołaniu niebędące liczbami są ignorowane.' },
            order: { name: 'order', detail: 'Opcjonalne. Liczba określająca sposób ustalania pozycji liczby.' },
        },
    },
    RSQ: {
        description: 'Zwraca kwadrat korelacji iloczynu momentów Pearsona dla punktów danych w argumentach znane_y i znane_x. Aby uzyskać więcej informacji, zobacz PEARSON, funkcja . Wartość R-kwadrat można zinterpretować jako proporcję wariancji y przypisywaną do wariancji x.',
        abstract: 'Zwraca kwadrat korelacji iloczynu momentów Pearsona dla punktów danych w argumentach znane_y i znane_x. Aby uzyskać więcej informacji, zobacz PEARSON, funkcja . Wartość R-kwadrat można zinterpretować jako proporcję wariancji y przypisywaną do wariancji x.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/rsq-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Wymagane. Tablica lub zakres komórek zawierający numeryczne zależne punkty danych.' },
            knownXs: { name: 'known_x\'s', detail: 'Wymagane. Zbiór niezależnych punktów danych.' },
        },
    },
    SKEW: {
        description: 'Zwraca skośność rozkładu. Skośność charakteryzuje stopień asymetrii rozkładu wokół jego średniej. Skośność dodatnia określa rozkład z asymetrią rozciągającą się w kierunku wartości dodatnich. Skośność ujemna określa rozkład z asymetrią rozciągającą się w kierunku wartości ujemnych.',
        abstract: 'Zwraca skośność rozkładu. Skośność charakteryzuje stopień asymetrii rozkładu wokół jego średniej. Skośność dodatnia określa rozkład z asymetrią rozciągającą się w kierunku wartości dodatnich. Skośność ujemna określa rozkład z asymetrią rozciągającą się w kierunku wartości ujemnych.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/skew-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Argument liczba1 jest wymagany, pozostałe są opcjonalne. Od 1 do 255 argumentów, dla których zostanie obliczona skośność. Zamiast argumentów rozdzielonych średnikami można użyć pojedynczej tablicy lub odwołania do tablicy.' },
            number2: { name: 'number2', detail: 'Argument liczba1 jest wymagany, pozostałe są opcjonalne. Od 1 do 255 argumentów, dla których zostanie obliczona skośność. Zamiast argumentów rozdzielonych średnikami można użyć pojedynczej tablicy lub odwołania do tablicy.' },
        },
    },
    SKEW_P: {
        description: 'Zwraca skośność rozkładu na podstawie populacji, charakteryzującą stopień asymetrii rozkładu wokół średniej.',
        abstract: 'Zwraca skośność rozkładu na podstawie populacji, charakteryzującą stopień asymetrii rozkładu wokół średniej.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/skew-p-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Pierwsza liczba, odwołanie do komórki lub zakres, dla których chcesz wyznaczyć skośność.' },
            number2: { name: 'number2', detail: 'Dodatkowe liczby, odwołania do komórek lub zakresy, dla których chcesz wyznaczyć skośność; maksymalnie 255.' },
        },
    },
    SLOPE: {
        description: 'Zwraca nachylenie wykresu regresji liniowej dla wszystkich punktów danych w argumentach znane_y i znane_x. Nachylenie to współrzędna pionowa podzielona przez współrzędną poziomą między dwoma dowolnymi punktami na linii, która określa wielkość zmiany wzdłuż linii regresji.',
        abstract: 'Zwraca nachylenie wykresu regresji liniowej dla wszystkich punktów danych w argumentach znane_y i znane_x. Nachylenie to współrzędna pionowa podzielona przez współrzędną poziomą między dwoma dowolnymi punktami na linii, która określa wielkość zmiany wzdłuż linii regresji.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/slope-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Wymagane. Tablica lub zakres komórek zawierający numeryczne zależne punkty danych.' },
            knownXs: { name: 'known_x\'s', detail: 'Wymagane. Zbiór niezależnych punktów danych.' },
        },
    },
    SMALL: {
        description: 'Zwraca k-tą najmniejszą wartość ze zbioru danych. Funkcji tej należy używać do uzyskiwania wartości znajdujących się w określonej względnej pozycji w zbiorze danych.',
        abstract: 'Zwraca k-tą najmniejszą wartość ze zbioru danych. Funkcji tej należy używać do uzyskiwania wartości znajdujących się w określonej względnej pozycji w zbiorze danych.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/small-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Wymagane. Tablica lub zakres danych numerycznych, dla których należy określić k-tą najmniejszą wartość.' },
            k: { name: 'k', detail: 'Argument wymagany. Pozycja (od najniższej) w tablicy lub w zakresie danych, którą ma zwrócić funkcja.' },
        },
    },
    STANDARDIZE: {
        description: 'Zwraca wartość znormalizowaną z rozkładu opisanego przez argumenty średnia i odchylenie_std.',
        abstract: 'Zwraca wartość znormalizowaną z rozkładu opisanego przez argumenty średnia i odchylenie_std.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/standardize-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Argument wymagany. Wartość, którą zostanie znormalizowana.' },
            mean: { name: 'mean', detail: 'Wymagane. Średnia arytmetyczna rozkładu.' },
            standardDev: { name: 'standard_dev', detail: 'Wymagane. Odchylenie standardowe rozkładu.' },
        },
    },
    STDEV_P: {
        description: 'Odchylenie standardowe jest miarą szerokości rozproszenia wartości od wartości średniej.',
        abstract: 'Odchylenie standardowe jest miarą szerokości rozproszenia wartości od wartości średniej.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/stdev-p-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Wymagane. Pierwszy argument liczbowy odpowiadający populacji.' },
            number2: { name: 'number2', detail: 'Opcjonalne. Od 1 do 254 argumentów odpowiadających populacji. Zamiast argumentów rozdzielonych średnikami można użyć pojedynczej tablicy lub odwołania do tablicy.' },
        },
    },
    STDEV_S: {
        description: 'Odchylenie standardowe jest miarą tego, jak szeroko wartości są rozproszone od wartości średniej.',
        abstract: 'Odchylenie standardowe jest miarą tego, jak szeroko wartości są rozproszone od wartości średniej.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/stdev-s-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Wymagane. Pierwszy argument liczbowy odpowiadający próbce populacji. Zamiast argumentów rozdzielonych średnikami można użyć pojedynczej tablicy lub odwołania do tablicy.' },
            number2: { name: 'number2', detail: 'Opcjonalne. Od 2 do 254 argumentów liczbowych odpowiadających próbce populacji. Zamiast argumentów rozdzielonych średnikami można użyć pojedynczej tablicy lub odwołania do tablicy.' },
        },
    },
    STDEVA: {
        description: 'Szacuje odchylenie standardowe próbki. Odchylenie standardowe jest miarą tego, jak szeroko wartości są rozproszone od wartości przeciętnej (średniej).',
        abstract: 'Szacuje odchylenie standardowe próbki. Odchylenie standardowe jest miarą tego, jak szeroko wartości są rozproszone od wartości przeciętnej (średniej).',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/stdeva-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Argument wartość1 jest wymagany, pozostałe są opcjonalne. Od 1 do 255 wartości odpowiadających próbce populacji. Zamiast argumentów rozdzielonych średnikami można użyć pojedynczej tablicy lub odwołania do tablicy.' },
            value2: { name: 'value2', detail: 'Argument wartość1 jest wymagany, pozostałe są opcjonalne. Od 1 do 255 wartości odpowiadających próbce populacji. Zamiast argumentów rozdzielonych średnikami można użyć pojedynczej tablicy lub odwołania do tablicy.' },
        },
    },
    STDEVPA: {
        description: 'Oblicza odchylenie standardowe dla całej populacji podanej jako argumenty, w tym tekst i wartości logiczne. Odchylenie standardowe jest miarą tego, jak szeroko wartości są rozproszone od wartości średniej.',
        abstract: 'Oblicza odchylenie standardowe dla całej populacji podanej jako argumenty, w tym tekst i wartości logiczne. Odchylenie standardowe jest miarą tego, jak szeroko wartości są rozproszone od wartości średniej.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/stdevpa-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Argument wartość1 jest wymagany, pozostałe są opcjonalne. Od 1 do 255 wartości odpowiadających populacji. Zamiast argumentów rozdzielonych średnikami można użyć pojedynczej tablicy lub odwołania do tablicy.' },
            value2: { name: 'value2', detail: 'Argument wartość1 jest wymagany, pozostałe są opcjonalne. Od 1 do 255 wartości odpowiadających populacji. Zamiast argumentów rozdzielonych średnikami można użyć pojedynczej tablicy lub odwołania do tablicy.' },
        },
    },
    STEYX: {
        description: 'Zwraca błąd standardowy prognozowanej wartości y dla każdego x w regresji. Błąd standardowy jest miarą wielkości błędu przy prognozowaniu wartości y dla oddzielnej wartości x.',
        abstract: 'Zwraca błąd standardowy prognozowanej wartości y dla każdego x w regresji. Błąd standardowy jest miarą wielkości błędu przy prognozowaniu wartości y dla oddzielnej wartości x.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/steyx-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Wymagane. Tablica lub zakres zależnych punktów danych.' },
            knownXs: { name: 'known_x\'s', detail: 'Wymagane. Tablica lub zakres niezależnych punktów danych.' },
        },
    },
    T_DIST: {
        description: 'Zwraca lewostronny rozkład t-Studenta. Rozkład t jest stosowany przy testowaniu hipotez dla małych próbek zbiorów danych. Funkcję tę należy stosować zamiast tabeli wartości krytycznych dla rozkładu t.',
        abstract: 'Zwraca lewostronny rozkład t-Studenta. Rozkład t jest stosowany przy testowaniu hipotez dla małych próbek zbiorów danych. Funkcję tę należy stosować zamiast tabeli wartości krytycznych dla rozkładu t.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/t-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Argument wymagany. Wartość liczbowa, przy której należy oszacować rozkład.' },
            degFreedom: { name: 'degFreedom', detail: 'Wymagane. Liczba całkowita oznaczająca liczbę stopni swobody.' },
            cumulative: { name: 'cumulative', detail: 'Wymagane. Wartość logiczna, która określa postać funkcji. Jeśli wartością argumentu „skumulowany” jest PRAWDA, funkcja ROZKŁ.T zwraca funkcję rozkładu skumulowanego, a jeśli FAŁSZ, funkcja zwraca funkcję gęstości prawdopodobieństwa.' },
        },
    },
    T_DIST_2T: {
        description: 'Rozkład t-Studenta jest stosowany przy testowaniu hipotez dla małych próbek zbiorów danych. Funkcję tę należy stosować zamiast tabeli wartości krytycznych dla rozkładu t.',
        abstract: 'Rozkład t-Studenta jest stosowany przy testowaniu hipotez dla małych próbek zbiorów danych. Funkcję tę należy stosować zamiast tabeli wartości krytycznych dla rozkładu t.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/t-dist-2t-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Argument wymagany. Wartość liczbowa, przy której należy oszacować rozkład.' },
            degFreedom: { name: 'degFreedom', detail: 'Wymagane. Liczba całkowita oznaczająca liczbę stopni swobody.' },
        },
    },
    T_DIST_RT: {
        description: 'Rozkład t jest stosowany przy testowaniu hipotez dla małych próbek zbiorów danych. Funkcję tę należy stosować zamiast tabeli wartości krytycznych dla rozkładu t.',
        abstract: 'Rozkład t jest stosowany przy testowaniu hipotez dla małych próbek zbiorów danych. Funkcję tę należy stosować zamiast tabeli wartości krytycznych dla rozkładu t.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/t-dist-rt-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Argument wymagany. Wartość liczbowa, przy której należy oszacować rozkład.' },
            degFreedom: { name: 'degFreedom', detail: 'Wymagane. Liczba całkowita oznaczająca liczbę stopni swobody.' },
        },
    },
    T_INV: {
        description: 'Zwraca lewą odwrotność rozkładu t-Studenta.',
        abstract: 'Zwraca lewą odwrotność rozkładu t-Studenta.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/t-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Wymagane. Prawdopodobieństwo skojarzone z rozkładem t-Studenta.' },
            degFreedom: { name: 'degFreedom', detail: 'Wymagane. Liczba stopni swobody charakteryzująca rozkład.' },
        },
    },
    T_INV_2T: {
        description: 'Zwraca dwustronną odwrotność rozkładu t-Studenta.',
        abstract: 'Zwraca dwustronną odwrotność rozkładu t-Studenta.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/t-inv-2t-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Wymagane. Prawdopodobieństwo skojarzone z rozkładem t-Studenta.' },
            degFreedom: { name: 'degFreedom', detail: 'Wymagane. Liczba stopni swobody charakteryzująca rozkład.' },
        },
    },
    T_TEST: {
        description: 'Zwraca prawdopodobieństwo skojarzone z testem t-Studenta. Funkcję T.TEST należy stosować do określenia, czy istnieje prawdopodobieństwo tego, że dwie próbki pochodzą z tych samych podległych populacji, które mają taką samą wartość średnią.',
        abstract: 'Zwraca prawdopodobieństwo skojarzone z testem t-Studenta. Funkcję T.TEST należy stosować do określenia, czy istnieje prawdopodobieństwo tego, że dwie próbki pochodzą z tych samych podległych populacji, które mają taką samą wartość średnią.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/t-test-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Wymagane. Pierwszy zbiór danych.' },
            array2: { name: 'array2', detail: 'Wymagane. Drugi zbiór danych.' },
            tails: { name: 'tails', detail: 'Wymagane. Określa liczbę stron rozkładu. Jeśli argument strony = 1, funkcja T.TEST stosuje rozkład jednostronny. Jeśli argument strony = 2, funkcja T.TEST stosuje rozkład dwustronny.' },
            type: { name: 'type', detail: 'Wymagane. Typ testu t, który należy przeprowadzić.' },
        },
    },
    TREND: {
        description: 'Funkcja REGLINW zwraca wartości trendu liniowego. Pasuje do linii prostej (przy użyciu metody najmniejszych kwadratów) do known_y tablicy i known_x. Funkcja REGLINW zwraca wartości y wzdłuż tej linii dla tablicy new_x określonej przez Ciebie.',
        abstract: 'Funkcja REGLINW zwraca wartości trendu liniowego. Pasuje do linii prostej (przy użyciu metody najmniejszych kwadratów) do known_y tablicy i known_x. Funkcja REGLINW zwraca wartości y wzdłuż tej linii dla tablicy new_x określonej przez Ciebie.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/trend-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_y\'s', detail: 'Zestaw znanych już wartości y w relacji y = mx + b Jeśli tablica znane_y znajduje się w pojedynczej kolumnie, to każda kolumna tablicy znane_x jest interpretowana jako oddzielna zmienna. Jeśli tablica znane_y znajduje się w pojedynczym wierszu, to każdy wiersz tablicy znane_x jest interpretowany jako oddzielna zmienna.' },
            knownXs: { name: 'known_x\'s', detail: 'Opcjonalny zestaw znanych wartości x w relacji y = mx + b Tablica known_x może zawierać jeden lub więcej zestawów zmiennych. Jeśli jest używana tylko jedna zmienna, known_y i known_x mogą być zakresami dowolnego kształtu, o ile mają jednakowe wymiary. Jeśli jest używana więcej niż jedna zmienna, known_y musi być wektorem (czyli zakresem o wysokości jednego wiersza lub szerokości jednej kolumny). Jeżeli argument znane_x jest pominięty, przyjmuje się, że jest on tablicą {1;2;3;...}, która ma ten sam rozmiar co tablica znane_y.' },
            newXs: { name: 'new_x\'s', detail: 'Nowe wartości x, dla których funkcja REGLINW ma zwracać odpowiednie wartości y New_x musi zawierać kolumnę (lub wiersz) dla każdej zmiennej niezależnej, podobnie jak known_x. Jeśli więc known_y znajduje się w jednej kolumnie, known_x i new_x muszą mieć taką samą liczbę kolumn. Jeśli known_y znajduje się w jednym wierszu, known_x i new_x muszą mieć taką samą liczbę wierszy. Jeżeli argument nowe_ x zostanie pominięty, to przyjmuje się, że jest on taki sam, jak argument znane_x. Jeżeli zarówno argument znane_x, jak i nowe_x zostanie pominięty, to przyjmuje się, że są one tablicą {1;2;3;...} o takiej samej wielkości, co tablica znane_y.' },
            constb: { name: 'const', detail: 'Wartość logiczna określająca, czy stała b ma mieć wartość równą 0 Jeżeli stała ma wartość PRAWDA lub jest pominięta, to stała b jest obliczana normalnie. Jeżeli stała ma wartość FAŁSZ, to stała b jest ustawiana jako równa 0, a wartości m są tak dostosowywane, aby spełniać równanie y = mx.' },
        },
    },
    TRIMMEAN: {
        description: 'Zwraca średnią wewnętrznego zbioru danych. Funkcja ŚREDNIA.WEWN oblicza średnią, wykluczając pewien procent punktów danych z górnego i dolnego krańca zbioru danych. Funkcję tę należy stosować wtedy, gdy analizując dane, trzeba z nich wykluczyć wartości skrajne.',
        abstract: 'Zwraca średnią wewnętrznego zbioru danych. Funkcja ŚREDNIA.WEWN oblicza średnią, wykluczając pewien procent punktów danych z górnego i dolnego krańca zbioru danych. Funkcję tę należy stosować wtedy, gdy analizując dane, trzeba z nich wykluczyć wartości skrajne.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/trimmean-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Wymagane. Tablica lub zakres wartości, które należy obciąć i obliczyć dla nich średnią.' },
            percent: { name: 'percent', detail: 'Wymagane. Ułamkowa liczba określająca punkty danych, które powinny być wykluczone z obliczeń. Na przykład, jeśli procent = 0,2, ze zbioru danych zawierających 20 punktów (20 x 0,2) zostaną obcięte 4 punkty: 2 punkty z górnego obszaru i 2 punkty z dolnego obszaru zbioru danych.' },
        },
    },
    VAR_P: {
        description: 'Oblicza wariancję na podstawie całej populacji (pomija wartości logiczne i tekstowe w próbce).',
        abstract: 'Oblicza wariancję na podstawie całej populacji (pomija wartości logiczne i tekstowe w próbce).',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/var-p-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Wymagane. Pierwszy argument liczbowy odpowiadający populacji.' },
            number2: { name: 'number2', detail: 'Opcjonalne. Od 2 do 254 argumentów liczbowych odpowiadających populacji.' },
        },
    },
    VAR_S: {
        description: 'Szacuje wariancję na podstawie próbki, ignorując zawarte w niej wartości logiczne i tekst.',
        abstract: 'Szacuje wariancję na podstawie próbki, ignorując zawarte w niej wartości logiczne i tekst.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/var-s-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Wymagane. Pierwszy argument liczbowy odpowiadający próbce populacji.' },
            number2: { name: 'number2', detail: 'Opcjonalne. Od 2 do 254 argumentów liczbowych, które odpowiadają próbce populacji.' },
        },
    },
    VARA: {
        description: 'Szacuje wariancję na podstawie próbki.',
        abstract: 'Szacuje wariancję na podstawie próbki.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/vara-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Argument wartość1 jest wymagany, pozostałe są opcjonalne. Od 1 do 255 argumentów wartości, które odpowiadają próbce populacji.' },
            value2: { name: 'value2', detail: 'Argument wartość1 jest wymagany, pozostałe są opcjonalne. Od 1 do 255 argumentów wartości, które odpowiadają próbce populacji.' },
        },
    },
    VARPA: {
        description: 'Oblicza wariancję na podstawie całej populacji.',
        abstract: 'Oblicza wariancję na podstawie całej populacji.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/varpa-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: 'Argument wartość1 jest wymagany, pozostałe są opcjonalne. Od 1 do 255 argumentów wartości, które odpowiadają populacji.' },
            value2: { name: 'value2', detail: 'Argument wartość1 jest wymagany, pozostałe są opcjonalne. Od 1 do 255 argumentów wartości, które odpowiadają populacji.' },
        },
    },
    WEIBULL_DIST: {
        description: 'Zwraca skumulowaną funkcję (dystrybuantę) rozkładu Weibulla. Rozkład ten znajduje zastosowanie w analizie niezawodności, na przykład przy obliczaniu średniego czasu międzyawaryjnego urządzeń.',
        abstract: 'Zwraca skumulowaną funkcję (dystrybuantę) rozkładu Weibulla. Rozkład ten znajduje zastosowanie w analizie niezawodności, na przykład przy obliczaniu średniego czasu międzyawaryjnego urządzeń.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/weibull-dist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Argument wymagany. Wartość, dla której ta funkcja ma zostać obliczona.' },
            alpha: { name: 'alpha', detail: 'Wymagane. Parametr rozkładu.' },
            beta: { name: 'beta', detail: 'Wymagane. Parametr rozkładu.' },
            cumulative: { name: 'cumulative', detail: 'Wymagane. Wyznacza postać funkcji.' },
        },
    },
    Z_TEST: {
        description: 'Zwraca jednostronną wartość prawdopodobieństwa testu z.',
        abstract: 'Zwraca jednostronną wartość prawdopodobieństwa testu z.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/z-test-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Tablica lub zakres danych, względem których ma zostać przetestowana wartość x.' },
            x: { name: 'x', detail: 'Wartość do przetestowania.' },
            sigma: { name: 'sigma', detail: 'Znane odchylenie standardowe populacji. Jeśli je pominięto, używane jest odchylenie standardowe próbki.' },
        },
    },
};

export default locale;
