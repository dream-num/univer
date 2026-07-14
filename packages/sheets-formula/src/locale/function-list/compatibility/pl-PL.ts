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
    BETADIST: {
        description: 'Zwraca skumulowaną funkcję gęstości prawdopodobieństwa beta. Rozkładu beta używa się zazwyczaj w badaniu zmian zawartości procentowych w próbkach, na przykład części doby spędzanej przez ludzi na oglądaniu telewizji.',
        abstract: 'Zwraca skumulowaną funkcję gęstości prawdopodobieństwa beta. Rozkładu beta używa się zazwyczaj w badaniu zmian zawartości procentowych w próbkach, na przykład części doby spędzanej przez ludzi na oglądaniu telewizji.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/betadist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Argument wymagany. Wartość między A a B, dla której określa się funkcję.' },
            alpha: { name: 'alpha', detail: 'Wymagane. Parametr rozkładu.' },
            beta: { name: 'beta', detail: 'Wymagane. Parametr rozkładu.' },
            A: { name: 'A', detail: 'opcjonalny. Dolne ograniczenie interwału wartości x.' },
            B: { name: 'B', detail: 'Argument opcjonalny. Górne ograniczenie interwału wartości x.' },
        },
    },
    BETAINV: {
        description: 'Zwraca odwrotność skumulowanej funkcji gęstości prawdopodobieństwa beta. Oznacza to, że jeśli prawdopodobieństwo = ROZKŁAD.BETA(x;...), wówczas ROZKŁAD.BETA.ODW(prawdopodobieństwo;...) = x. Rozkład beta może być używany w planowaniu projektów do modelowania możliwych czasów ukończenia przy danym oczekiwanym czasie ukończenia i jego zmienności.',
        abstract: 'Zwraca odwrotność skumulowanej funkcji gęstości prawdopodobieństwa beta. Oznacza to, że jeśli prawdopodobieństwo = ROZKŁAD.BETA(x;...), wówczas ROZKŁAD.BETA.ODW(prawdopodobieństwo;...) = x. Rozkład beta może być używany w planowaniu projektów do modelowania możliwych czasów ukończenia przy danym oczekiwanym czasie ukończenia i jego zmienności.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/betainv-function',
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
    BINOMDIST: {
        description: 'Zwraca wartość pojedynczego składnika dwumianowego rozkładu prawdopodobieństwa. Funkcję ROZKŁAD.DWUM należy stosować do rozwiązywania problemów, w których występuje stała liczba testów lub prób, wynik każdej próby może być tylko sukcesem lub porażką, próby są niezależne, a prawdopodobieństwo sukcesu jest stałe w trakcie eksperymentu. Przykładowo funkcja ROZKŁAD.DWUM może obliczyć prawdopodobieństwo, że z trojga następnych nowo narodzonych dzieci dwoje będzie płci męskiej.',
        abstract: 'Zwraca wartość pojedynczego składnika dwumianowego rozkładu prawdopodobieństwa. Funkcję ROZKŁAD.DWUM należy stosować do rozwiązywania problemów, w których występuje stała liczba testów lub prób, wynik każdej próby może być tylko sukcesem lub porażką, próby są niezależne, a prawdopodobieństwo sukcesu jest stałe w trakcie eksperymentu. Przykładowo funkcja ROZKŁAD.DWUM może obliczyć prawdopodobieństwo, że z trojga następnych nowo narodzonych dzieci dwoje będzie płci męskiej.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/binomdist-function',
            },
        ],
        functionParameter: {
            numberS: { name: 'number_s', detail: 'Wymagane. Liczba sukcesów w próbach.' },
            trials: { name: 'trials', detail: 'Wymagane. Liczba niezależnych prób.' },
            probabilityS: { name: 'probability_s', detail: 'Wymagane. Prawdopodobieństwo sukcesu w każdej próbie.' },
            cumulative: { name: 'cumulative', detail: 'Wymagane. Wartość logiczna, która określa postać funkcji. Jeśli argument „skumulowany” ma wartość PRAWDA, funkcja ROZKŁAD.DWUM zwraca funkcję rozkładu skumulowanego, czyli prawdopodobieństwo, że zachodzi co najwyżej liczba_s sukcesów; jeśli FAŁSZ, zwraca funkcję masy prawdopodobieństwa, czyli prawdopodobieństwo, że zajdzie liczba_s sukcesów.' },
        },
    },
    CHIDIST: {
        description: 'Zwraca wartość prawostronnego prawdopodobieństwa rozkładu chi-kwadrat. Rozkład χ2 jest skojarzony z testem χ2. Test χ2 służy do porównywania wartości obserwowanych i przewidywanych. Na przykład eksperyment genetyczny może mieć hipotezę, że następne pokolenie roślin będzie w określonym zestawie kolorów. Przez porównanie wyników obserwowanych z wynikami oczekiwanymi można określić prawidłowość hipotezy.',
        abstract: 'Zwraca wartość prawostronnego prawdopodobieństwa rozkładu chi-kwadrat. Rozkład χ2 jest skojarzony z testem χ2. Test χ2 służy do porównywania wartości obserwowanych i przewidywanych. Na przykład eksperyment genetyczny może mieć hipotezę, że następne pokolenie roślin będzie w określonym zestawie kolorów. Przez porównanie wyników obserwowanych z wynikami oczekiwanymi można określić prawidłowość hipotezy.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/chidist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Argument wymagany. Wartość, przy której ma być szacowany rozkład.' },
            degFreedom: { name: 'deg_freedom', detail: 'Argument wymagany. Liczba stopni swobody.' },
        },
    },
    CHIINV: {
        description: 'Zwraca odwrotność prawostronnego prawdopodobieństwa rozkładu chi-kwadrat. Jeśli prawdopodobieństwo = ROZKŁAD.CHI(x;...), to ROZKŁAD.CHI.ODW(prawdopodobieństwo;...) = x. Ta funkcja służy do porównywania wyników obserwowanych z wynikami spodziewanymi w celu określenia, czy hipoteza jest prawidłowa.',
        abstract: 'Zwraca odwrotność prawostronnego prawdopodobieństwa rozkładu chi-kwadrat. Jeśli prawdopodobieństwo = ROZKŁAD.CHI(x;...), to ROZKŁAD.CHI.ODW(prawdopodobieństwo;...) = x. Ta funkcja służy do porównywania wyników obserwowanych z wynikami spodziewanymi w celu określenia, czy hipoteza jest prawidłowa.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/chiinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Wymagane. Prawdopodobieństwo skojarzone z rozkładem chi-kwadrat.' },
            degFreedom: { name: 'deg_freedom', detail: 'Wymagane. Liczba stopni swobody.' },
        },
    },
    CHITEST: {
        description: 'Zwraca wartość testu niezależności. Funkcja TEST.CHI zwraca wartość rozkładu chi-kwadrat (χ2) statystyki i stosownych stopni swobody. Testu χ2 można używać do określania, czy dane eksperymentalne potwierdzają przewidywania wynikające z hipotezy.',
        abstract: 'Zwraca wartość testu niezależności. Funkcja TEST.CHI zwraca wartość rozkładu chi-kwadrat (χ2) statystyki i stosownych stopni swobody. Testu χ2 można używać do określania, czy dane eksperymentalne potwierdzają przewidywania wynikające z hipotezy.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/chitest-function',
            },
        ],
        functionParameter: {
            actualRange: { name: 'actual_range', detail: 'Wymagane. Zakres danych zawierający wartości obserwowane, które należy porównać z wartościami przewidywanymi.' },
            expectedRange: { name: 'expected_range', detail: 'Wymagane. Zakres danych zawierający współczynnik iloczynu sum wierszy i sum kolumn do sumy końcowej.' },
        },
    },
    CONFIDENCE: {
        description: 'Zwraca przedział ufności dla średniej z populacji z rozkładem normalnym.',
        abstract: 'Zwraca przedział ufności dla średniej z populacji z rozkładem normalnym.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/confidence-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: 'Wymagane. Poziom istotności używany do obliczania poziomu ufności. Poziom ufności jest równy 100*(1 – alfa)%, czyli wartość alfa równa 0,05 wskazuje poziom ufności 95%.' },
            standardDev: { name: 'standard_dev', detail: 'Wymagane. Odchylenie standardowe dla zakresu danych, które z założenia jest znane.' },
            size: { name: 'size', detail: 'Wymagane. Wielkość próby.' },
        },
    },
    COVAR: {
        description: 'Zwraca kowariancję, czyli średnią iloczynów odchyleń dla każdej pary punktów danych w dwóch zbiorach danych.',
        abstract: 'Zwraca kowariancję, czyli średnią iloczynów odchyleń dla każdej pary punktów danych w dwóch zbiorach danych.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/covar-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Wymagane. Pierwszy zakres komórek zawierających liczby całkowite.' },
            array2: { name: 'array2', detail: 'Wymagane. Drugi zakres komórek zawierających liczby całkowite.' },
        },
    },
    CRITBINOM: {
        description: 'Zwraca najmniejszą wartość, dla której skumulowany rozkład dwumianowy jest większy lub równy wartości kryterium. Funkcji tej należy używać w aplikacjach badających niezawodność. Na przykład funkcji PRÓG.ROZKŁAD.DWUM można użyć do wyznaczenia największej liczby wadliwych części, jakie mogą zejść z linii montażowej bez odrzucenia całej serii produktów.',
        abstract: 'Zwraca najmniejszą wartość, dla której skumulowany rozkład dwumianowy jest większy lub równy wartości kryterium. Funkcji tej należy używać w aplikacjach badających niezawodność. Na przykład funkcji PRÓG.ROZKŁAD.DWUM można użyć do wyznaczenia największej liczby wadliwych części, jakie mogą zejść z linii montażowej bez odrzucenia całej serii produktów.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/critbinom-function',
            },
        ],
        functionParameter: {
            trials: { name: 'trials', detail: 'Wymagane. Liczba prób Bernoulliego.' },
            probabilityS: { name: 'probability_s', detail: 'Wymagane. Prawdopodobieństwo sukcesu w każdej próbie.' },
            alpha: { name: 'alpha', detail: 'Wymagane. Wartość kryterium.' },
        },
    },
    EXPONDIST: {
        description: 'Zwraca skumulowaną funkcję (dystrybuantę) rozkładu wykładniczego. Funkcja ROZKŁAD.EXP umożliwia modelowanie upływu czasu między zdarzeniami, np. czasu oczekiwania na wypłatę gotówki z bankomatu. Można na przykład użyć funkcji ROZKŁAD.EXP do wyznaczenia prawdopodobieństwa, że zajmie to najwyżej jedną minutę.',
        abstract: 'Zwraca skumulowaną funkcję (dystrybuantę) rozkładu wykładniczego. Funkcja ROZKŁAD.EXP umożliwia modelowanie upływu czasu między zdarzeniami, np. czasu oczekiwania na wypłatę gotówki z bankomatu. Można na przykład użyć funkcji ROZKŁAD.EXP do wyznaczenia prawdopodobieństwa, że zajmie to najwyżej jedną minutę.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/expondist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Argument wymagany. Wartość funkcji.' },
            lambda: { name: 'lambda', detail: 'Wymagane. Wartość parametru.' },
            cumulative: { name: 'cumulative', detail: 'Wymagane. Wartość logiczna określająca postać funkcji wykładniczej, która ma zostać podana. Jeśli argument „skumulowany” ma wartość PRAWDA, funkcja ROZKŁAD.EXP zwraca funkcję rozkładu skumulowanego, a jeśli FAŁSZ — funkcję gęstości prawdopodobieństwa.' },
        },
    },
    FDIST: {
        description: 'Zwraca wartość (prawostronnego) rozkładu prawdopodobieństwa F-Snedecora (stopień zróżnicowania) dla dwóch zestawów danych. Ta funkcja służy do określania, czy dwa zbiory danych mają różne stopnie zróżnicowania. Można na przykład sprawdzić wyniki testów uzyskane przez chłopców i dziewczęta zdające do szkoły średniej i określić, czy zmienność wyników uzyskanych przez dziewczęta różni się od zmienności wyników chłopców.',
        abstract: 'Zwraca wartość (prawostronnego) rozkładu prawdopodobieństwa F-Snedecora (stopień zróżnicowania) dla dwóch zestawów danych. Ta funkcja służy do określania, czy dwa zbiory danych mają różne stopnie zróżnicowania. Można na przykład sprawdzić wyniki testów uzyskane przez chłopców i dziewczęta zdające do szkoły średniej i określić, czy zmienność wyników uzyskanych przez dziewczęta różni się od zmienności wyników chłopców.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/fdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Argument wymagany. Wartość, dla której ta funkcja ma zostać obliczona.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Wymagane. Wartość stopni swobody w liczniku.' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Wymagane. Wartość stopni swobody w mianowniku.' },
        },
    },
    FINV: {
        description: 'Zwraca wartość funkcji odwrotnej rozkładu (prawostronnego) prawdopodobieństwa F-Snedecora. Jeśli p=ROZKŁAD.F(x;...), to ROZKŁAD.F.ODW(p;...)=x.',
        abstract: 'Zwraca wartość funkcji odwrotnej rozkładu (prawostronnego) prawdopodobieństwa F-Snedecora. Jeśli p=ROZKŁAD.F(x;...), to ROZKŁAD.F.ODW(p;...)=x.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/finv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Wymagane. Prawdopodobieństwo skojarzone ze skumulowanym rozkładem F.' },
            degFreedom1: { name: 'deg_freedom1', detail: 'Wymagane. Wartość stopni swobody w liczniku.' },
            degFreedom2: { name: 'deg_freedom2', detail: 'Wymagane. Wartość stopni swobody w mianowniku.' },
        },
    },
    FTEST: {
        description: 'Zwraca wynik testu F. Test F zwraca dwustronne prawdopodobieństwo, że wariancje w tablicach tablica1 i tablica2 nie różnią się znacząco. Funkcja umożliwia określenie, czy dwie próbki mają różne wariancje. Na przykład, mając wyniki testów ze szkół prywatnych i publicznych, można sprawdzić, czy w tych szkołach występują różne poziomy zróżnicowania wyników.',
        abstract: 'Zwraca wynik testu F. Test F zwraca dwustronne prawdopodobieństwo, że wariancje w tablicach tablica1 i tablica2 nie różnią się znacząco. Funkcja umożliwia określenie, czy dwie próbki mają różne wariancje. Na przykład, mając wyniki testów ze szkół prywatnych i publicznych, można sprawdzić, czy w tych szkołach występują różne poziomy zróżnicowania wyników.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/ftest-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Wymagane. Pierwsza tablica lub pierwszy zakres danych.' },
            array2: { name: 'array2', detail: 'Wymagane. Druga tablica lub drugi zakres danych.' },
        },
    },
    GAMMADIST: {
        description: 'Zwraca rozkład gamma. Funkcja ta umożliwia badanie zmiennych, które mogą mieć rozkład skośny. Rozkład gamma jest powszechnie stosowany w analizie kolejek.',
        abstract: 'Zwraca rozkład gamma. Funkcja ta umożliwia badanie zmiennych, które mogą mieć rozkład skośny. Rozkład gamma jest powszechnie stosowany w analizie kolejek.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/gammadist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Argument wymagany. Wartość, przy której ma być szacowany rozkład.' },
            alpha: { name: 'alpha', detail: 'Argument wymagany. Parametr rozkładu.' },
            beta: { name: 'beta', detail: 'Argument wymagany. Parametr rozkładu. Jeśli wartość argumentu beta = 1, funkcja ROZKŁAD.GAMMA zwraca standardowy rozkład gamma.' },
            cumulative: { name: 'cumulative', detail: 'Argument wymagany. Wartość logiczna, która określa postać funkcji. Jeśli wartością argumentu „skumulowany” jest PRAWDA, funkcja ROZKŁAD.GAMMA zwraca funkcję rozkładu skumulowanego, a jeśli FAŁSZ — funkcję gęstości prawdopodobieństwa.' },
        },
    },
    GAMMAINV: {
        description: 'Zwraca funkcję odwrotną skumulowanego rozkładu gamma. Jeśli p = ROZKŁAD.GAMMA(x;...), to ROZKŁAD.GAMMA.ODW(p;...) = x. Funkcja ta jest przydatna w badaniu zmiennej, której rozkład może być skośny.',
        abstract: 'Zwraca funkcję odwrotną skumulowanego rozkładu gamma. Jeśli p = ROZKŁAD.GAMMA(x;...), to ROZKŁAD.GAMMA.ODW(p;...) = x. Funkcja ta jest przydatna w badaniu zmiennej, której rozkład może być skośny.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/gammainv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Wymagane. Prawdopodobieństwo związane z rozkładem gamma.' },
            alpha: { name: 'alpha', detail: 'Wymagane. Parametr rozkładu.' },
            beta: { name: 'beta', detail: 'Wymagane. Parametr rozkładu. Jeśli wartość argumentu beta = 1, funkcja ROZKŁAD.GAMMA.ODW zwraca standardowy rozkład gamma.' },
        },
    },
    HYPGEOMDIST: {
        description: 'Zwraca rozkład hipergeometryczny. Funkcja ROZKŁAD.HIPERGEOM zwraca prawdopodobieństwo sukcesów danej liczby próbek przy podanym rozmiarze próbki oraz podanych sukcesach populacji i rozmiarze populacji. Funkcję ROZKŁAD.HIPERGEOM należy stosować do rozwiązywania zagadnień dotyczących skończonej populacji, gdzie każda obserwacja jest sukcesem albo porażką i gdzie każdy podzbiór o podanej wielkości wybierany jest z jednakowym prawdopodobieństwem.',
        abstract: 'Zwraca rozkład hipergeometryczny. Funkcja ROZKŁAD.HIPERGEOM zwraca prawdopodobieństwo sukcesów danej liczby próbek przy podanym rozmiarze próbki oraz podanych sukcesach populacji i rozmiarze populacji. Funkcję ROZKŁAD.HIPERGEOM należy stosować do rozwiązywania zagadnień dotyczących skończonej populacji, gdzie każda obserwacja jest sukcesem albo porażką i gdzie każdy podzbiór o podanej wielkości wybierany jest z jednakowym prawdopodobieństwem.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/hypgeomdist-function',
            },
        ],
        functionParameter: {
            sampleS: { name: 'sample_s', detail: 'Wymagane. Liczba sukcesów w próbce.' },
            numberSample: { name: 'number_sample', detail: 'Wymagane. Wielkość próbki.' },
            populationS: { name: 'population_s', detail: 'Wymagane. Liczba sukcesów w populacji.' },
            numberPop: { name: 'number_pop', detail: 'Wymagane. Wielkość populacji.' },
        },
    },
    LOGINV: {
        description: 'Zwraca wartość funkcji odwrotnej skumulowanego rozkładu logarytmiczno-normalnego x, gdzie ln(x) ma rozkład normalny z parametrami wartość_oczekiwana i odchylenie_std. Jeśli p = ROZKŁAD.LOG(x;...), to ROZKŁAD.LOG.ODW(p;...) = x.',
        abstract: 'Zwraca wartość funkcji odwrotnej skumulowanego rozkładu logarytmiczno-normalnego x, gdzie ln(x) ma rozkład normalny z parametrami wartość_oczekiwana i odchylenie_std. Jeśli p = ROZKŁAD.LOG(x;...), to ROZKŁAD.LOG.ODW(p;...) = x.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/loginv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Wymagane. Prawdopodobieństwo skojarzone z rozkładem logarytmiczno-normalnym.' },
            mean: { name: 'mean', detail: 'Wymagane. Wartość średnia ln(x).' },
            standardDev: { name: 'standard_dev', detail: 'Wymagane. Odchylenie standardowe ln(x).' },
        },
    },
    LOGNORMDIST: {
        description: 'Oblicza skumulowany rozkład logarytmiczno-normalny x, gdzie ln(x) ma rozkład normalny z parametrami średnia i odchylenie_std. Funkcję tę należy stosować do analizowania danych, które zostały przetworzone logarytmicznie.',
        abstract: 'Oblicza skumulowany rozkład logarytmiczno-normalny x, gdzie ln(x) ma rozkład normalny z parametrami średnia i odchylenie_std. Funkcję tę należy stosować do analizowania danych, które zostały przetworzone logarytmicznie.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/lognormdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Argument wymagany. Wartość, dla której ta funkcja ma zostać obliczona.' },
            mean: { name: 'mean', detail: 'Wymagane. Wartość średnia ln(x).' },
            standardDev: { name: 'standard_dev', detail: 'Wymagane. Odchylenie standardowe ln(x).' },
        },
    },
    MODE: {
        description: 'Załóżmy, że chcesz sprawdzić najpopularniejszą liczbę gatunków ptaków widzianych w próbce zliczanych ptaków na krytycznych terenach podmokłych w okresie 30 lat lub chcesz sprawdzić najczęściej występującą liczbę połączeń telefonicznych w centrum pomocy telefonicznej w godzinach poza szczytem. Aby obliczyć tryb grupy liczb, użyj funkcji WYST.NAJM .',
        abstract: 'Załóżmy, że chcesz sprawdzić najpopularniejszą liczbę gatunków ptaków widzianych w próbce zliczanych ptaków na krytycznych terenach podmokłych w okresie 30 lat lub chcesz sprawdzić najczęściej występującą liczbę połączeń telefonicznych w centrum pomocy telefonicznej w godzinach poza szczytem. Aby obliczyć tryb grupy liczb, użyj funkcji WYST.NAJM .',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/mode-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Wymagane. Pierwsza liczba zakresu, dla którego ma zostać obliczona dominanta.' },
            number2: { name: 'number2', detail: 'Opcjonalne. Argumenty liczbowe od 2 do 255, dla których należy obliczyć dominantę. Zamiast argumentów rozdzielonych średnikami można użyć pojedynczej tablicy lub odwołania do tablicy.' },
        },
    },
    NEGBINOMDIST: {
        description: 'Zwraca ujemny rozkład dwumianowy. Funkcja ROZKŁAD.DWUM.PRZEC zwraca w wyniku prawdopodobieństwo, że będzie liczba_p niepowodzeń przed liczba_s-tym sukcesem, kiedy stałe prawdopodobieństwo sukcesu jest prawdopodobieństwo_s. Funkcja ta pracuje podobnie jak funkcja zwracająca rozkład dwumianowy, z tym wyjątkiem, że liczba sukcesów jest stała, a liczba prób jest zmienna. Podobnie jak w przypadku rozkładu dwumianowego, zakłada się, że próby są niezależne.',
        abstract: 'Zwraca ujemny rozkład dwumianowy. Funkcja ROZKŁAD.DWUM.PRZEC zwraca w wyniku prawdopodobieństwo, że będzie liczba_p niepowodzeń przed liczba_s-tym sukcesem, kiedy stałe prawdopodobieństwo sukcesu jest prawdopodobieństwo_s. Funkcja ta pracuje podobnie jak funkcja zwracająca rozkład dwumianowy, z tym wyjątkiem, że liczba sukcesów jest stała, a liczba prób jest zmienna. Podobnie jak w przypadku rozkładu dwumianowego, zakłada się, że próby są niezależne.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/negbinomdist-function',
            },
        ],
        functionParameter: {
            numberF: { name: 'number_f', detail: 'Wymagane. Liczba porażek.' },
            numberS: { name: 'number_s', detail: 'Wymagane. Progowa liczba sukcesów.' },
            probabilityS: { name: 'probability_s', detail: 'Wymagane. Prawdopodobieństwo sukcesu.' },
        },
    },
    NORMDIST: {
        description: 'Funkcja ROZKŁAD.NORMALNY zwraca rozkład normalny dla określonej średniej i odchylenia standardowego. Funkcja ta ma szeroki zakres zastosowań w statystyce, w tym testowanie hipotez.',
        abstract: 'Funkcja ROZKŁAD.NORMALNY zwraca rozkład normalny dla określonej średniej i odchylenia standardowego. Funkcja ta ma szeroki zakres zastosowań w statystyce, w tym testowanie hipotez.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/normdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Argument wymagany. Wartość, dla której należy obliczyć rozkład' },
            mean: { name: 'mean', detail: 'Wymagane. Średnia arytmetyczna rozkładu' },
            standardDev: { name: 'standard_dev', detail: 'Wymagane. Odchylenie standardowe rozkładu' },
            cumulative: { name: 'cumulative', detail: 'Wymagane. Wartość logiczna, która określa postać funkcji. Jeśli wartością argumentu "skumulowany" jest PRAWDA, funkcja ROZKŁAD.NORMALNY zwraca funkcję rozkładu skumulowanego. jeśli wartością argumentu "skumulowany" jest FAŁSZ, funkcja zwraca funkcję masy prawdopodobieństwa.' },
        },
    },
    NORMINV: {
        description: 'Zwraca odwrotność skumulowanego rozkładu normalnego dla podanej średniej i odchylenia standardowego.',
        abstract: 'Zwraca odwrotność skumulowanego rozkładu normalnego dla podanej średniej i odchylenia standardowego.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/norminv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Argument wymagany. Prawdopodobieństwo odpowiadające rozkładowi normalnemu.' },
            mean: { name: 'mean', detail: 'Argument wymagany. Średnia arytmetyczna rozkładu.' },
            standardDev: { name: 'standard_dev', detail: 'Argument wymagany. Odchylenie standardowe rozkładu.' },
        },
    },
    NORMSDIST: {
        description: 'Zwraca funkcję skumulowanego rozkładu normalnego. Rozkład ten ma średnią zero i odchylenie standardowe równe jeden. Funkcję tę należy stosować zamiast tabeli obszarów standardowych krzywych normalnych.',
        abstract: 'Zwraca funkcję skumulowanego rozkładu normalnego. Rozkład ten ma średnią zero i odchylenie standardowe równe jeden. Funkcję tę należy stosować zamiast tabeli obszarów standardowych krzywych normalnych.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/normsdist-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: 'Argument wymagany. Wartość, dla której należy obliczyć rozkład.' },
        },
    },
    NORMSINV: {
        description: 'Zwraca funkcję odwrotną skumulowanego, standardowego rozkładu normalnego. Rozkład ten ma średnią równą zero i standardowe odchylenie równe jeden.',
        abstract: 'Zwraca funkcję odwrotną skumulowanego, standardowego rozkładu normalnego. Rozkład ten ma średnią równą zero i standardowe odchylenie równe jeden.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/normsinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Argument wymagany. Prawdopodobieństwo odpowiadające rozkładowi normalnemu.' },
        },
    },
    PERCENTILE: {
        description: 'Zwraca k-ty percentyl wartości w zakresie. Funkcję tę można stosować do określania progu akceptacji. Na przykład można podjąć decyzję o przebadaniu kandydatów, których wyniki są powyżej 90-ego percentylu.',
        abstract: 'Zwraca k-ty percentyl wartości w zakresie. Funkcję tę można stosować do określania progu akceptacji. Na przykład można podjąć decyzję o przebadaniu kandydatów, których wyniki są powyżej 90-ego percentylu.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/percentile-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Wymagane. Tablica lub zakres danych definiujący względną pozycję.' },
            k: { name: 'k', detail: 'Argument wymagany. Wartość percentylu z przedziału domkniętego od 0 do 1.' },
        },
    },
    PERCENTRANK: {
        description: 'Funkcja PROCENT.POZYCJA zwraca pozycję wartości w zestawie danych jako procent zbioru danych — zasadniczo względną pozycję wartości w całym zestawie danych. Za pomocą funkcji PROCENT.POZYCJA można na przykład określić pozycję wyniku testu danej osoby w polu wszystkich wyników dla tego samego testu.',
        abstract: 'Funkcja PROCENT.POZYCJA zwraca pozycję wartości w zestawie danych jako procent zbioru danych — zasadniczo względną pozycję wartości w całym zestawie danych. Za pomocą funkcji PROCENT.POZYCJA można na przykład określić pozycję wyniku testu danej osoby w polu wszystkich wyników dla tego samego testu.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/percentrank-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Wymagane. Zakres danych (lub wstępnie zdefiniowana tablica) wartości liczbowych, w których jest określana pozycja procentu.' },
            x: { name: 'x', detail: 'Argument wymagany. Wartość, dla której ma zostać określona pozycja w tablicy.' },
            significance: { name: 'significance', detail: 'Opcjonalne. Wartość identyfikująca liczbę cyfr znaczących dla zwracanej wartości procentowej. Jeśli ten argument zostanie pominięty, funkcja PROCENT.POZYCJA użyje trzech cyfr (0,xxx).' },
        },
    },
    POISSON: {
        description: 'Zwraca skumulowaną funkcję (dystrybuantę) rozkładu Poissona. Zwykłym zastosowaniem rozkładu Poissona jest prognozowanie liczby zdarzeń w danym czasie, takiej jak liczba samochodów przejeżdżających przez plac w czasie jednej minuty.',
        abstract: 'Zwraca skumulowaną funkcję (dystrybuantę) rozkładu Poissona. Zwykłym zastosowaniem rozkładu Poissona jest prognozowanie liczby zdarzeń w danym czasie, takiej jak liczba samochodów przejeżdżających przez plac w czasie jednej minuty.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/poisson-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Argument wymagany. Liczba zdarzeń.' },
            mean: { name: 'mean', detail: 'Argument wymagany. Oczekiwana wartość liczbowa.' },
            cumulative: { name: 'cumulative', detail: 'Argument wymagany. Wartość logiczna, która określa postać zwracanego rozkładu prawdopodobieństwa. Jeśli argument skumulowany ma wartość PRAWDA, funkcja ROZKŁAD.POISSON zwraca skumulowane prawdopodobieństwo Poissona, że liczba przypadkowych zdarzeń będzie między zero a x włącznie; jeśli ma wartość FAŁSZ, funkcja zwraca funkcję masy prawdopodobieństwa Poissona, że liczba zdarzeń będzie równa dokładnie x.' },
        },
    },
    QUARTILE: {
        description: 'Zwraca kwartyl zbioru danych. Kwartyle często są używane w danych o sprzedaży i w danych statystycznych do dzielenia populacji na grupy. Na przykład funkcję KWARTYL można zastosować do znalezienia górnych 25% dochodów w populacji.',
        abstract: 'Zwraca kwartyl zbioru danych. Kwartyle często są używane w danych o sprzedaży i w danych statystycznych do dzielenia populacji na grupy. Na przykład funkcję KWARTYL można zastosować do znalezienia górnych 25% dochodów w populacji.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/quartile-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Wymagane. Tablica lub zakres komórek z wartościami liczbowymi, dla których ma zostać obliczona wartość kwartylu.' },
            quart: { name: 'quart', detail: 'Wymagane. Wskazuje, która wartość ma zostać zwrócona.' },
        },
    },
    RANK: {
        description: 'Zwraca pozycję pewnej liczby na liście liczb. Pozycja liczby jest to jej wielkość w stosunku do innych wartości na liście. (Gdyby przeprowadzić sortowanie listy, pozycja liczby oznaczałaby jej miejsce na liście po sortowaniu.)',
        abstract: 'Zwraca pozycję pewnej liczby na liście liczb. Pozycja liczby jest to jej wielkość w stosunku do innych wartości na liście. (Gdyby przeprowadzić sortowanie listy, pozycja liczby oznaczałaby jej miejsce na liście po sortowaniu.)',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/rank-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'Wymagane. Liczba, której pozycja ma zostać określona.' },
            ref: { name: 'ref', detail: 'Wymagane. Odwołanie do listy liczb. Nieliczbowe wartości argumentu lista są ignorowane.' },
            order: { name: 'order', detail: 'Opcjonalne. Liczba wskazująca sposób określania pozycji liczby. Jeżeli argument lp jest równy 0 lub jest pominięty, program Microsoft Excel określa pozycję liczby, jak gdyby argument lista był listą sortowaną w kolejności malejącej. Jeżeli argument lp ma dowolną wartość niezerową, program Microsoft Excel określa pozycję liczby, jak gdyby argument lista był listą sortowaną w kolejności rosnącej.' },
        },
    },
    STDEV: {
        description: 'Szacuje odchylenie standardowe próbki. Odchylenie standardowe jest miarą tego, jak szeroko wartości są rozproszone od wartości przeciętnej (średniej).',
        abstract: 'Szacuje odchylenie standardowe próbki. Odchylenie standardowe jest miarą tego, jak szeroko wartości są rozproszone od wartości przeciętnej (średniej).',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/stdev-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Wymagane. Pierwszy argument liczbowy odpowiadający próbce populacji.' },
            number2: { name: 'number2', detail: 'Opcjonalne. Od 2 do 255 argumentów liczbowych odpowiadających próbce populacji. Zamiast argumentów rozdzielonych średnikami można użyć pojedynczej tablicy lub odwołania do tablicy.' },
        },
    },
    STDEVP: {
        description: 'Oblicza odchylenie standardowe dla całej populacji podanej w postaci argumentów. Odchylenie standardowe jest miarą tego, jak szeroko wartości są rozproszone od wartości średniej.',
        abstract: 'Oblicza odchylenie standardowe dla całej populacji podanej w postaci argumentów. Odchylenie standardowe jest miarą tego, jak szeroko wartości są rozproszone od wartości średniej.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/stdevp-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Wymagane. Pierwszy argument liczbowy odpowiadający populacji.' },
            number2: { name: 'number2', detail: 'Opcjonalne. Od 2 do 255 argumentów liczbowych odpowiadających populacji. Zamiast argumentów rozdzielonych średnikami można użyć pojedynczej tablicy lub odwołania do tablicy.' },
        },
    },
    TDIST: {
        description: 'Zwraca Punkty procentowe (prawdopodobieństwo) dla rozkładu t Studenta, gdzie wartość liczbowa (x) jest obliczoną wartością t, dla której należy obliczyć Punkty procentowe. Rozkład t jest stosowany przy testowaniu hipotez dla małych próbek zbiorów danych. Funkcję tę należy stosować zamiast tabeli wartości krytycznych dla rozkładu t.',
        abstract: 'Zwraca Punkty procentowe (prawdopodobieństwo) dla rozkładu t Studenta, gdzie wartość liczbowa (x) jest obliczoną wartością t, dla której należy obliczyć Punkty procentowe. Rozkład t jest stosowany przy testowaniu hipotez dla małych próbek zbiorów danych. Funkcję tę należy stosować zamiast tabeli wartości krytycznych dla rozkładu t.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/tdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Argument wymagany. Wartość liczbowa, przy której należy oszacować rozkład.' },
            degFreedom: { name: 'degFreedom', detail: 'Wymagane. Liczba całkowita oznaczająca liczbę stopni swobody.' },
            tails: { name: 'tails', detail: 'Wymagane. Określa liczbę stron zwracanego układu. Jeśli strony = 1, funkcja ROZKŁAD.T zwraca rozkład jednostronny. Jeśli strony = 2, funkcja ROZKŁAD.T zwraca rozkład dwustronny.' },
        },
    },
    TINV: {
        description: 'Zwraca dwustronną odwrotność rozkładu t-Studenta.',
        abstract: 'Zwraca dwustronną odwrotność rozkładu t-Studenta.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/tinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'Argument wymagany. Prawdopodobieństwo skojarzone z rozkładem dwustronnym t-Studenta.' },
            degFreedom: { name: 'degFreedom', detail: 'Argument wymagany. Liczba stopni swobody charakteryzująca rozkład.' },
        },
    },
    TTEST: {
        description: 'Zwraca prawdopodobieństwo skojarzone z testem t-Studenta. Funkcję TEST.T należy stosować do określenia, czy istnieje prawdopodobieństwo tego, że dwie próbki pochodzą z tych samych podległych populacji, które mają taką samą wartość średnią.',
        abstract: 'Zwraca prawdopodobieństwo skojarzone z testem t-Studenta. Funkcję TEST.T należy stosować do określenia, czy istnieje prawdopodobieństwo tego, że dwie próbki pochodzą z tych samych podległych populacji, które mają taką samą wartość średnią.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/ttest-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'Argument wymagany. Pierwszy zbiór danych.' },
            array2: { name: 'array2', detail: 'Argument wymagany. Drugi zbiór danych.' },
            tails: { name: 'tails', detail: 'Argument wymagany. Określa liczbę stron rozkładu. Jeśli argument strony = 1, funkcja TEST.T stosuje rozkład jednostronny. Jeśli argument strony = 2, funkcja TEST.T stosuje rozkład dwustronny.' },
            type: { name: 'type', detail: 'Argument wymagany. Typ testu t, który należy przeprowadzić.' },
        },
    },
    VAR: {
        description: 'Szacuje wariancję na podstawie próbki.',
        abstract: 'Szacuje wariancję na podstawie próbki.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/var-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Wymagane. Pierwszy argument liczbowy odpowiadający próbce populacji.' },
            number2: { name: 'number2', detail: 'Opcjonalne. Od 2 do 255 argumentów liczbowych odpowiadających próbce populacji.' },
        },
    },
    VARP: {
        description: 'Oblicza wariancję na podstawie całej populacji.',
        abstract: 'Oblicza wariancję na podstawie całej populacji.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/varp-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'Wymagane. Pierwszy argument liczbowy odpowiadający populacji.' },
            number2: { name: 'number2', detail: 'Opcjonalne. Od 2 do 255 argumentów liczbowych odpowiadających populacji.' },
        },
    },
    WEIBULL: {
        description: 'Zwraca skumulowaną funkcję (dystrybuantę) rozkładu Weibulla. Rozkład ten znajduje zastosowanie w analizie niezawodności, na przykład przy obliczaniu średniego czasu międzyawaryjnego urządzeń.',
        abstract: 'Zwraca skumulowaną funkcję (dystrybuantę) rozkładu Weibulla. Rozkład ten znajduje zastosowanie w analizie niezawodności, na przykład przy obliczaniu średniego czasu międzyawaryjnego urządzeń.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/weibull-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'Argument wymagany. Wartość, dla której ta funkcja ma zostać obliczona.' },
            alpha: { name: 'alpha', detail: 'Argument wymagany. Parametr rozkładu.' },
            beta: { name: 'beta', detail: 'Argument wymagany. Parametr rozkładu.' },
            cumulative: { name: 'cumulative', detail: 'Argument wymagany. Wyznacza postać funkcji.' },
        },
    },
    ZTEST: {
        description: 'Zwraca prawdopodobieństwo testu dwustronnego z. Dla pewnej przyjętej w hipotezie średniej z populacji, μ0, funkcja TEST.Z zwraca prawdopodobieństwo, że średnia z próbki będzie większa od średniej z obserwacji w zbiorze danych (tablicy), tj. od obserwowanej średniej próbki.',
        abstract: 'Zwraca prawdopodobieństwo testu dwustronnego z. Dla pewnej przyjętej w hipotezie średniej z populacji, μ0, funkcja TEST.Z zwraca prawdopodobieństwo, że średnia z próbki będzie większa od średniej z obserwacji w zbiorze danych (tablicy), tj. od obserwowanej średniej próbki.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/ztest-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Wymagane. Tablica lub zakres danych, w stosunku do którego ma być testowana wartość x.' },
            x: { name: 'x', detail: 'Argument wymagany. Testowana wartość.' },
            sigma: { name: 'sigma', detail: 'Opcjonalne. Odchylenie standardowe populacji (znane). W przypadku pomięcia tego argumentu stosowane będzie odchylenie standardowe próbki.' },
        },
    },
};

export default locale;
