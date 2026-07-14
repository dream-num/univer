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
    ACCRINT: {
        description: 'Zwraca naliczone odsetki dla papieru wartościowego, przynoszącego okresowe odsetki.',
        abstract: 'Zwraca naliczone odsetki dla papieru wartościowego, przynoszącego okresowe odsetki.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/accrint-function',
            },
        ],
        functionParameter: {
            issue: { name: 'issue', detail: 'Wymagane. Data emisji papieru wartościowego.' },
            firstInterest: { name: 'first_interest', detail: 'Wymagane. Data pierwszej raty odsetek od papieru wartościowego.' },
            settlement: { name: 'settlement', detail: 'Wymagane. Data rozliczenia papieru wartościowego. Data rozliczenia papieru wartościowego jest datą sprzedaży papieru wartościowego nabywcy, datą późniejszą niż data emisji.' },
            rate: { name: 'rate', detail: 'Wymagane. Roczna stopa kuponowa papieru wartościowego.' },
            par: { name: 'par', detail: 'Wymagane. Cena papieru wartościowego. W przypadku pominięcia wartości nominalnej funkcja NAL.ODS stosuje wartość 1000 zł.' },
            frequency: { name: 'frequency', detail: 'Wymagane. Liczba płatności kuponowych przypadających na jeden rok. W przypadku płatności rocznych częstotliwość = 1; w przypadku płatności półrocznych częstotliwość = 2; w przypadku płatności kwartalnych częstotliwość = 4.' },
            basis: { name: 'basis', detail: 'Opcjonalne. Typ podstawy wyliczania dni, który zostanie użyty.' },
            calcMethod: { name: 'calc_method', detail: 'Opcjonalne. Wartość logiczna, która określa sposób obliczania całkowitego przyrostu odsetek, gdy data w argumencie rozliczenie jest późniejsza od daty określonej w argumencie pierwsze_odsetki. Wartość PRAWDA (1) powoduje zwrócenie całkowitego przyrostu odsetek od daty określonej w argumencie emisja do daty w argumencie rozliczenie. Wartość FAŁSZ (0) powoduje zwrócenie przyrostu odsetek od daty określonej w argumencie pierwsze_odsetki do daty w argumencie rozliczenie. Jeśli argument nie zostanie wprowadzony, przyjmowana jest wartość domyślna PRAWDA.' },
        },
    },
    ACCRINTM: {
        description: 'Zwraca naliczone odsetki dla papieru wartościowego, dla którego wypłata odsetek następuje w terminie jego płatności.',
        abstract: 'Zwraca naliczone odsetki dla papieru wartościowego, dla którego wypłata odsetek następuje w terminie jego płatności.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/accrintm-function',
            },
        ],
        functionParameter: {
            issue: { name: 'issue', detail: 'Wymagane. Data emisji papieru wartościowego.' },
            settlement: { name: 'settlement', detail: 'Wymagane. Data terminu płatności papieru wartościowego.' },
            rate: { name: 'rate', detail: 'Wymagane. Roczna stopa kuponowa papieru wartościowego.' },
            par: { name: 'par', detail: 'Wymagane. Cena papieru wartościowego. W przypadku pominięcia wartości nominalnej funkcja NAL.ODS.WYKUP stosuje wartość 1000 zł.' },
            basis: { name: 'basis', detail: 'Opcjonalne. Typ podstawy wyliczania dni, który zostanie użyty.' },
        },
    },
    AMORDEGRC: {
        description: 'Zwraca amortyzację dla każdego okresu rozrachunkowego. Funkcja ta jest dostosowana do francuskiego systemu księgowego. Jeśli zakupu środka trwałego dokonuje się w połowie roku rozrachunkowego, to pod uwagę bierze się amortyzację podzieloną proporcjonalnie. Jest to funkcja podobna do funkcji AMORT.LIN, oprócz tego, że współczynniki amortyzacji stosowane w obliczeniach zależą od okresu użytkowania środków trwałych.',
        abstract: 'Zwraca amortyzację dla każdego okresu rozrachunkowego. Funkcja ta jest dostosowana do francuskiego systemu księgowego. Jeśli zakupu środka trwałego dokonuje się w połowie roku rozrachunkowego, to pod uwagę bierze się amortyzację podzieloną proporcjonalnie. Jest to funkcja podobna do funkcji AMORT.LIN, oprócz tego, że współczynniki amortyzacji stosowane w obliczeniach zależą od okresu użytkowania środków trwałych.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/amordegrc-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Wymagane. Cena zakupu środka trwałego.' },
            datePurchased: { name: 'date_purchased', detail: 'Wymagane. Data zakupu środka trwałego.' },
            firstPeriod: { name: 'first_period', detail: 'Wymagane. Data kończąca pierwszy okres.' },
            salvage: { name: 'salvage', detail: 'Wymagane. Wartość na koniec okresu użytkowania środka trwałego.' },
            period: { name: 'period', detail: 'Wymagane. Okres.' },
            rate: { name: 'rate', detail: 'Wymagane. Stopa amortyzacji.' },
            basis: { name: 'basis', detail: 'Opcjonalne. Podstawa roczna, która ma być używana.' },
        },
    },
    AMORLINC: {
        description: 'Zwraca amortyzację dla każdego okresu rozrachunkowego. Funkcja ta jest dostosowana do francuskiego systemu księgowego. Jeśli zakupu środka trwałego dokonuje się w połowie roku rozrachunkowego, to pod uwagę bierze się amortyzację podzieloną proporcjonalnie.',
        abstract: 'Zwraca amortyzację dla każdego okresu rozrachunkowego. Funkcja ta jest dostosowana do francuskiego systemu księgowego. Jeśli zakupu środka trwałego dokonuje się w połowie roku rozrachunkowego, to pod uwagę bierze się amortyzację podzieloną proporcjonalnie.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/amorlinc-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Wymagane. Cena zakupu środka trwałego.' },
            datePurchased: { name: 'date_purchased', detail: 'Wymagane. Data zakupu środka trwałego.' },
            firstPeriod: { name: 'first_period', detail: 'Wymagane. Data kończąca pierwszy okres.' },
            salvage: { name: 'salvage', detail: 'Wymagane. Wartość na koniec okresu użytkowania środka trwałego.' },
            period: { name: 'period', detail: 'Wymagane. Okres.' },
            rate: { name: 'rate', detail: 'Wymagane. Stopa amortyzacji.' },
            basis: { name: 'basis', detail: 'Opcjonalne. Podstawa roczna, która ma być używana.' },
        },
    },
    COUPDAYBS: {
        description: 'Funkcja WYPŁ.DNI.OD.POCZ zwraca liczbę dni od początku okresu dywidendy do daty rozliczenia.',
        abstract: 'Funkcja WYPŁ.DNI.OD.POCZ zwraca liczbę dni od początku okresu dywidendy do daty rozliczenia.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/coupdaybs-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Wymagane. Data rozliczenia papieru wartościowego. Data rozliczenia papieru wartościowego jest datą sprzedaży papieru wartościowego nabywcy, datą późniejszą niż data emisji.' },
            maturity: { name: 'maturity', detail: 'Wymagane. Data terminu płatności papieru wartościowego. Data spłaty to data, kiedy papier wartościowy traci ważność.' },
            frequency: { name: 'frequency', detail: 'Wymagane. Liczba płatności kuponowych przypadających na jeden rok. W przypadku płatności rocznych częstotliwość = 1; w przypadku płatności półrocznych częstotliwość = 2; w przypadku płatności kwartalnych częstotliwość = 4.' },
            basis: { name: 'basis', detail: 'Opcjonalne. Typ podstawy wyliczania dni, który zostanie użyty.' },
        },
    },
    COUPDAYS: {
        description: 'Zwraca liczbę dni w okresie dywidendy, który zawiera datę rozliczenia.',
        abstract: 'Zwraca liczbę dni w okresie dywidendy, który zawiera datę rozliczenia.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/coupdays-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Wymagane. Data rozliczenia papieru wartościowego. Data rozliczenia papieru wartościowego jest datą sprzedaży papieru wartościowego nabywcy, datą późniejszą niż data emisji.' },
            maturity: { name: 'maturity', detail: 'Wymagane. Data terminu płatności papieru wartościowego. Data spłaty to data, kiedy papier wartościowy traci ważność.' },
            frequency: { name: 'frequency', detail: 'Wymagane. Liczba płatności kuponowych przypadających na jeden rok. W przypadku płatności rocznych częstotliwość = 1; w przypadku płatności półrocznych częstotliwość = 2; w przypadku płatności kwartalnych częstotliwość = 4.' },
            basis: { name: 'basis', detail: 'Opcjonalne. Typ podstawy wyliczania dni, który zostanie użyty.' },
        },
    },
    COUPDAYSNC: {
        description: 'Zwraca liczbę dni od daty rozliczenia do daty następnego kuponu.',
        abstract: 'Zwraca liczbę dni od daty rozliczenia do daty następnego kuponu.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/coupdaysnc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Data rozliczenia papieru wartościowego.' },
            maturity: { name: 'maturity', detail: 'Data terminu wykupu papieru wartościowego.' },
            frequency: { name: 'frequency', detail: 'Liczba płatności kuponowych w roku.' },
            basis: { name: 'basis', detail: 'Typ używanej podstawy liczenia dni.' },
        },
    },
    COUPNCD: {
        description: 'Zwraca liczbę reprezentującą datę następnej płatności dywidendy po dacie rozliczenia.',
        abstract: 'Zwraca liczbę reprezentującą datę następnej płatności dywidendy po dacie rozliczenia.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/coupncd-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Wymagane. Data rozliczenia papieru wartościowego. Data rozliczenia papieru wartościowego jest datą sprzedaży papieru wartościowego nabywcy, datą późniejszą niż data emisji.' },
            maturity: { name: 'maturity', detail: 'Wymagane. Data terminu płatności papieru wartościowego. Data spłaty to data, kiedy papier wartościowy traci ważność.' },
            frequency: { name: 'frequency', detail: 'Wymagane. Liczba płatności kuponowych przypadających na jeden rok. W przypadku płatności rocznych częstotliwość = 1; w przypadku płatności półrocznych częstotliwość = 2; w przypadku płatności kwartalnych częstotliwość = 4.' },
            basis: { name: 'basis', detail: 'Opcjonalne. Typ podstawy wyliczania dni, który zostanie użyty.' },
        },
    },
    COUPNUM: {
        description: 'Zwraca liczbę wypłacanych dywidend między datą rozliczenia i datą spłaty, przy czym liczba ta jest zaokrąglana do najbliższej pełnej dywidendy.',
        abstract: 'Zwraca liczbę wypłacanych dywidend między datą rozliczenia i datą spłaty, przy czym liczba ta jest zaokrąglana do najbliższej pełnej dywidendy.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/coupnum-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Wymagane. Data rozliczenia papieru wartościowego. Data rozliczenia papieru wartościowego jest datą sprzedaży papieru wartościowego nabywcy, datą późniejszą niż data emisji.' },
            maturity: { name: 'maturity', detail: 'Wymagane. Data terminu płatności papieru wartościowego. Data spłaty to data, kiedy papier wartościowy traci ważność.' },
            frequency: { name: 'frequency', detail: 'Wymagane. Liczba płatności kuponowych przypadających na jeden rok. W przypadku płatności rocznych częstotliwość = 1; w przypadku płatności półrocznych częstotliwość = 2; w przypadku płatności kwartalnych częstotliwość = 4.' },
            basis: { name: 'basis', detail: 'Opcjonalne. Typ podstawy wyliczania dni, który zostanie użyty.' },
        },
    },
    COUPPCD: {
        description: 'Zwraca liczbę reprezentującą poprzednią datę płatności dywidendy przed datą rozliczenia.',
        abstract: 'Zwraca liczbę reprezentującą poprzednią datę płatności dywidendy przed datą rozliczenia.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/couppcd-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Wymagane. Data rozliczenia papieru wartościowego. Data rozliczenia papieru wartościowego jest datą sprzedaży papieru wartościowego nabywcy, datą późniejszą niż data emisji.' },
            maturity: { name: 'maturity', detail: 'Wymagane. Data terminu płatności papieru wartościowego. Data spłaty to data, kiedy papier wartościowy traci ważność.' },
            frequency: { name: 'frequency', detail: 'Wymagane. Liczba płatności kuponowych przypadających na jeden rok. W przypadku płatności rocznych częstotliwość = 1; w przypadku płatności półrocznych częstotliwość = 2; w przypadku płatności kwartalnych częstotliwość = 4.' },
            basis: { name: 'basis', detail: 'Opcjonalne. Typ podstawy wyliczania dni, który zostanie użyty.' },
        },
    },
    CUMIPMT: {
        description: 'Zwraca wartość skumulowanych odsetek spłaconych dla danego kredytu między argumentami okres_początkowy i okres_końcowy.',
        abstract: 'Zwraca wartość skumulowanych odsetek spłaconych dla danego kredytu między argumentami okres_początkowy i okres_końcowy.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/cumipmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Wymagane. Stopa oprocentowania.' },
            nper: { name: 'nper', detail: 'Wymagane. Ogólna liczba okresów płatności.' },
            pv: { name: 'pv', detail: 'Wymagane. Wartość obecna.' },
            startPeriod: { name: 'start_period', detail: 'Wymagane. Pierwszy okres w wyliczeniu. Okresy płatności są ponumerowane i zaczynają się od liczby 1.' },
            endPeriod: { name: 'end_period', detail: 'Wymagane. Ostatni okres w wyliczeniu.' },
            type: { name: 'type', detail: 'Wymagane. Rozkład płatności w czasie.' },
        },
    },
    CUMPRINC: {
        description: 'Zwraca skumulowaną wartość kapitału spłaconego dla danego kredytu pomiędzy argumentami okres_początkowy i okres_końcowy.',
        abstract: 'Zwraca skumulowaną wartość kapitału spłaconego dla danego kredytu pomiędzy argumentami okres_początkowy i okres_końcowy.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/cumprinc-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Wymagane. Stopa oprocentowania.' },
            nper: { name: 'nper', detail: 'Wymagane. Ogólna liczba okresów płatności.' },
            pv: { name: 'pv', detail: 'Wymagane. Wartość obecna.' },
            startPeriod: { name: 'start_period', detail: 'Wymagane. Pierwszy okres w wyliczeniu. Okresy płatności są ponumerowane i zaczynają się od liczby 1.' },
            endPeriod: { name: 'end_period', detail: 'Wymagane. Ostatni okres w wyliczeniu.' },
            type: { name: 'type', detail: 'Wymagane. Rozkład płatności w czasie.' },
        },
    },
    DB: {
        description: 'Zwraca amortyzację środka trwałego w podanym okresie, obliczoną z wykorzystaniem metody równomiernie malejącego salda.',
        abstract: 'Zwraca amortyzację środka trwałego w podanym okresie, obliczoną z wykorzystaniem metody równomiernie malejącego salda.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/db-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Wymagane. Początkowy koszt środka trwałego.' },
            salvage: { name: 'salvage', detail: 'Wymagane. Wartość środka trwałego po zakończonej amortyzacji (zwana również wartością odzyskaną środka trwałego).' },
            life: { name: 'life', detail: 'Wymagane. Liczba okresów, w czasie których środek trwały jest amortyzowany (zwana również okresem użytkowania środka trwałego).' },
            period: { name: 'period', detail: 'Wymagane. Okres, dla którego zostanie obliczona amortyzacja. Argument „okres” musi być wyrażony w tych samych jednostkach, co okres użytkowania środka trwałego.' },
            month: { name: 'month', detail: 'Opcjonalne. Liczba miesięcy w pierwszym roku. Jeśli argument „miesiąc” zostanie pominięty, przyjmuje się, że liczba miesięcy jest równa 12.' },
        },
    },
    DDB: {
        description: 'Zwraca amortyzację środka trwałego w podanym okresie, obliczoną przy użyciu metody podwójnie malejącego salda lub innej metody określonej przez użytkownika.',
        abstract: 'Zwraca amortyzację środka trwałego w podanym okresie, obliczoną przy użyciu metody podwójnie malejącego salda lub innej metody określonej przez użytkownika.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/ddb-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Wymagane. Początkowy koszt środka trwałego.' },
            salvage: { name: 'salvage', detail: 'Wymagane. Wartość środka trwałego po zakończonej amortyzacji (zwana również wartością odzyskaną środka trwałego). Ta wartość może być równa 0.' },
            life: { name: 'life', detail: 'Wymagane. Liczba okresów, w czasie których środek trwały jest amortyzowany (zwana również okresem użytkowania środka trwałego).' },
            period: { name: 'period', detail: 'Wymagane. Okres, dla którego zostanie obliczona amortyzacja. Argument „okres” musi być wyrażony w tych samych jednostkach, co okres użytkowania środka trwałego.' },
            factor: { name: 'factor', detail: 'Opcjonalne. Szybkość, z jaką zmniejsza się saldo. Jeśli argument ten zostanie pominięty, to zakłada się, że wynosi 2 (metoda podwójnie malejącego salda).' },
        },
    },
    DISC: {
        description: 'Zwraca stopę dyskontową papieru wartościowego.',
        abstract: 'Zwraca stopę dyskontową papieru wartościowego.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/disc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Data rozliczenia papieru wartościowego.' },
            maturity: { name: 'maturity', detail: 'Data terminu wykupu papieru wartościowego.' },
            pr: { name: 'pr', detail: 'Cena papieru wartościowego przypadająca na 100 USD wartości nominalnej.' },
            redemption: { name: 'redemption', detail: 'Wartość wykupu przypadająca na 100 USD wartości nominalnej.' },
            basis: { name: 'basis', detail: 'Typ używanej podstawy liczenia dni.' },
        },
    },
    DOLLARDE: {
        description: 'Konwertuje cenę w dolarach wyrażoną jako ułamek na cenę w dolarach wyrażoną jako liczbę dziesiętną.',
        abstract: 'Konwertuje cenę w dolarach wyrażoną jako ułamek na cenę w dolarach wyrażoną jako liczbę dziesiętną.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/dollarde-function',
            },
        ],
        functionParameter: {
            fractionalDollar: { name: 'fractional_dollar', detail: 'Liczba wyrażona częścią całkowitą i ułamkową, rozdzielonymi separatorem dziesiętnym.' },
            fraction: { name: 'fraction', detail: 'Liczba całkowita używana jako mianownik ułamka.' },
        },
    },
    DOLLARFR: {
        description: 'Konwertuje cenę w dolarach wyrażoną jako liczbę dziesiętną na cenę w dolarach wyrażoną jako ułamek.',
        abstract: 'Konwertuje cenę w dolarach wyrażoną jako liczbę dziesiętną na cenę w dolarach wyrażoną jako ułamek.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/dollarfr-function',
            },
        ],
        functionParameter: {
            decimalDollar: { name: 'decimal_dollar', detail: 'Liczba dziesiętna.' },
            fraction: { name: 'fraction', detail: 'Liczba całkowita używana jako mianownik ułamka.' },
        },
    },
    DURATION: {
        description: 'Funkcja CZAS.TRWANIA , jedna z funkcji Finansowych , zwraca czas trwania Makauleya dla założonej wartości nominalnej 100 zł. Czas trwania jest definiowany jako średnia ważona bieżącej wartości przepływów gotówkowych i jest używany jako miara reakcji ceny obligacji na zmiany rentowności.',
        abstract: 'Funkcja CZAS.TRWANIA , jedna z funkcji Finansowych , zwraca czas trwania Makauleya dla założonej wartości nominalnej 100 zł. Czas trwania jest definiowany jako średnia ważona bieżącej wartości przepływów gotówkowych i jest używany jako miara reakcji ceny obligacji na zmiany rentowności.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/duration-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Wymagane. Data rozliczenia papieru wartościowego. Data rozliczenia papieru wartościowego jest datą sprzedaży papieru wartościowego nabywcy, datą późniejszą niż data emisji.' },
            maturity: { name: 'maturity', detail: 'Wymagane. Data terminu płatności papieru wartościowego. Data spłaty to data, kiedy papier wartościowy traci ważność.' },
            coupon: { name: 'coupon', detail: 'Wymagane. Roczna stopa kuponowa papieru wartościowego.' },
            yld: { name: 'yld', detail: 'Wymagane. Roczna rentowność papieru wartościowego.' },
            frequency: { name: 'frequency', detail: 'Wymagane. Liczba płatności kuponowych przypadających na jeden rok. W przypadku płatności rocznych częstotliwość = 1; w przypadku płatności półrocznych częstotliwość = 2; w przypadku płatności kwartalnych częstotliwość = 4.' },
            basis: { name: 'basis', detail: 'Opcjonalne. Typ podstawy wyliczania dni, który zostanie użyty.' },
        },
    },
    EFFECT: {
        description: 'Zwraca efektywną roczną stopę procentową przy danej rocznej stopie nominalnej i liczbie okresów kapitalizacji w roku.',
        abstract: 'Zwraca efektywną roczną stopę procentową przy danej rocznej stopie nominalnej i liczbie okresów kapitalizacji w roku.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/effect-function',
            },
        ],
        functionParameter: {
            nominalRate: { name: 'nominal_rate', detail: 'Wymagane. Nominalna stopa procentowa.' },
            npery: { name: 'npery', detail: 'Wymagane. Liczba kapitalizacji w roku.' },
        },
    },
    FV: {
        description: 'Funkcja FV , jedna z funkcji finansowych , oblicza przyszłą wartość inwestycji przy założeniu stałej stopy procentowej. Funkcji FV można używać w przypadku okresowych, stałych płatności albo pojedynczej płatności (ryczałtu).',
        abstract: 'Funkcja FV , jedna z funkcji finansowych , oblicza przyszłą wartość inwestycji przy założeniu stałej stopy procentowej. Funkcji FV można używać w przypadku okresowych, stałych płatności albo pojedynczej płatności (ryczałtu).',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/fv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Argument wymagany. Stopa procentowa dla okresu.' },
            nper: { name: 'nper', detail: 'Argument wymagany. Całkowita liczba okresów płatności w okresie spłaty.' },
            pmt: { name: 'pmt', detail: 'Argument wymagany. Płatność dokonywana w każdym okresie; nie może się zmienić w czasie trwania kredytu. Rata obejmuje zazwyczaj kapitał i odsetki z wyłączeniem innych opłat i podatków. Jeśli argument „rata” zostanie pominięty, musi zostać podany argument „wb”.' },
            pv: { name: 'pv', detail: 'Opcjonalnie. Wartość bieżąca lub skumulowana wartość przyszłego strumienia płatności według wyceny na dzień obecny. Jeśli argument „wb” zostanie pominięty, przyjmuje się, że ma wartość 0 (zero) i należy określić argument „rata”.' },
            type: { name: 'type', detail: 'Opcjonalnie. Liczba 0 albo 1, która wskazuje, kiedy płatność jest należna. Jeśli argument typ zostanie pominięty, przyjmuje się, że jest równy 0.' },
        },
    },
    FVSCHEDULE: {
        description: 'Zwraca wartość przyszłą kapitału początkowego przy stopie procentowej zmiennej w poszczególnych okresach. Funkcja WART.PRZYSZŁ.KAP umożliwia obliczenie przyszłej wartości inwestycji przy zmiennej stopie procentowej.',
        abstract: 'Zwraca wartość przyszłą kapitału początkowego przy stopie procentowej zmiennej w poszczególnych okresach. Funkcja WART.PRZYSZŁ.KAP umożliwia obliczenie przyszłej wartości inwestycji przy zmiennej stopie procentowej.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/fvschedule-function',
            },
        ],
        functionParameter: {
            principal: { name: 'principal', detail: 'Wymagane. Wartość obecna.' },
            schedule: { name: 'schedule', detail: 'Wymagane. Tablica stóp procentowych, które należy zastosować.' },
        },
    },
    INTRATE: {
        description: 'Zwraca wartość stopy procentowej w pełni zainwestowanego papieru wartościowego.',
        abstract: 'Zwraca wartość stopy procentowej w pełni zainwestowanego papieru wartościowego.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/intrate-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Wymagane. Data rozliczenia papieru wartościowego. Data rozliczenia papieru wartościowego jest datą sprzedaży papieru wartościowego nabywcy, datą późniejszą niż data emisji.' },
            maturity: { name: 'maturity', detail: 'Wymagane. Data terminu płatności papieru wartościowego. Data spłaty to data, kiedy papier wartościowy traci ważność.' },
            investment: { name: 'investment', detail: 'Wymagane. Kwota zainwestowana w papier wartościowy.' },
            redemption: { name: 'redemption', detail: 'Wymagane. Kwota otrzymywana w momencie wykupu papieru wartościowego.' },
            basis: { name: 'basis', detail: 'Opcjonalne. Typ podstawy wyliczania dni, który zostanie użyty.' },
        },
    },
    IPMT: {
        description: 'Zwraca wysokość spłaty odsetek dla danego okresu dla kredytu opartego na regularnych, stałych spłatach i stałej stopie procentowej.',
        abstract: 'Zwraca wysokość spłaty odsetek dla danego okresu dla kredytu opartego na regularnych, stałych spłatach i stałej stopie procentowej.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/ipmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Wymagane. Stopa procentowa dla okresu.' },
            per: { name: 'per', detail: 'Wymagane. Okres, dla którego należy znaleźć odsetki i musi znajdować się w zakresie od 1 do liczba_okresów.' },
            nper: { name: 'nper', detail: 'Wymagane. Całkowita liczba okresów płatności w okresie spłaty.' },
            pv: { name: 'pv', detail: 'Wymagane. Wartość bieżąca lub skumulowana wartość przyszłego strumienia płatności według wyceny na dzień obecny.' },
            fv: { name: 'fv', detail: 'Opcjonalne. Przyszła wartość, czyli saldo kasowe, które ma zostać osiągnięte po dokonaniu ostatniej płatności. Jeśli argument wp jest pominięty, za jego wartość jest uznawane 0 (przyszła wartość pożyczki na przykład wynosi 0).' },
            type: { name: 'type', detail: 'Opcjonalne. Liczba 0 albo 1, która wskazuje, kiedy płatność jest należna. Jeśli argument typ zostanie pominięty, przyjmuje się, że jego wartość wynosi 0.' },
        },
    },
    IRR: {
        description: 'Zwraca wewnętrzną stopę zwrotu dla serii przepływów gotówkowych reprezentowanych przez wartości liczbowe. Przepływy gotówkowe nie muszą być równe takim, jakie byłyby dla całego roku. Muszą jednak występować w regularnych interwałach, np. rocznie lub miesięcznie. Wewnętrzna stopa zwrotu jest stopą zwrotu otrzymywaną z inwestycji składającej się z wydatków (wartości ujemne) i dochodów (wartości dodatnie) występujących regularnie.',
        abstract: 'Zwraca wewnętrzną stopę zwrotu dla serii przepływów gotówkowych reprezentowanych przez wartości liczbowe. Przepływy gotówkowe nie muszą być równe takim, jakie byłyby dla całego roku. Muszą jednak występować w regularnych interwałach, np. rocznie lub miesięcznie. Wewnętrzna stopa zwrotu jest stopą zwrotu otrzymywaną z inwestycji składającej się z wydatków (wartości ujemne) i dochodów (wartości dodatnie) występujących regularnie.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/irr-function',
            },
        ],
        functionParameter: {
            values: { name: 'values', detail: 'Tablica lub odwołanie do komórek zawierających liczby, dla których chcesz obliczyć wewnętrzną stopę zwrotu.\n1. Aby obliczyć wewnętrzną stopę zwrotu, wartości muszą zawierać co najmniej jedną wartość dodatnią i jedną ujemną.\n2. Funkcja IRR używa kolejności wartości do interpretowania kolejności przepływów gotówkowych. Wprowadź wartości płatności i dochodów w żądanej kolejności.\n3. Jeśli argument tablicowy lub odwołaniowy zawiera tekst, wartości logiczne lub puste komórki, są one ignorowane.' },
            guess: { name: 'guess', detail: 'Liczba, która według Ciebie jest zbliżona do wyniku funkcji IRR.' },
        },
    },
    ISPMT: {
        description: 'Oblicza odsetki zapłacone (lub odebrane) dla określonego okresu pożyczki (lub inwestycji) przy równych spłatach kapitału.',
        abstract: 'Oblicza odsetki zapłacone (lub odebrane) dla określonego okresu pożyczki (lub inwestycji) przy równych spłatach kapitału.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/ispmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Argument wymagany. Stopa procentowa inwestycji.' },
            per: { name: 'per', detail: 'Argument wymagany. Okres, dla którego należy znaleźć odsetki i musi wynosić od 1 do liczba_okresów.' },
            nper: { name: 'nper', detail: 'Argument wymagany. Całkowita liczba okresów płatności inwestycji.' },
            pv: { name: 'pv', detail: 'Argument wymagany. Obecna wartość inwestycji. W przypadku pożyczki wb jest kwotą pożyczki.' },
        },
    },
    MDURATION: {
        description: 'Zwraca wartość zmodyfikowanego okresu Macauley\'a dla papieru wartościowego o przyjętej wartości nominalnej 100 zł.',
        abstract: 'Zwraca wartość zmodyfikowanego okresu Macauley\'a dla papieru wartościowego o przyjętej wartości nominalnej 100 zł.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/mduration-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Wymagane. Data rozliczenia papieru wartościowego. Data rozliczenia papieru wartościowego jest datą sprzedaży papieru wartościowego nabywcy, datą późniejszą niż data emisji.' },
            maturity: { name: 'maturity', detail: 'Wymagane. Data terminu płatności papieru wartościowego. Data spłaty to data, kiedy papier wartościowy traci ważność.' },
            coupon: { name: 'coupon', detail: 'Wymagane. Roczna stopa kuponowa papieru wartościowego.' },
            yld: { name: 'yld', detail: 'Wymagane. Roczna rentowność papieru wartościowego.' },
            frequency: { name: 'frequency', detail: 'Wymagane. Liczba płatności kuponowych przypadających na jeden rok. W przypadku płatności rocznych częstotliwość = 1; w przypadku płatności półrocznych częstotliwość = 2; w przypadku płatności kwartalnych częstotliwość = 4.' },
            basis: { name: 'basis', detail: 'Opcjonalne. Typ podstawy wyliczania dni, który zostanie użyty.' },
        },
    },
    MIRR: {
        description: 'Zwraca wartość zmodyfikowanej wewnętrznej stopy zwrotu dla serii okresowych przepływów gotówkowych. Funkcja MIRR bierze pod uwagę jednocześnie koszt inwestycji oraz procent uzyskany z ponownego zainwestowania środków pieniężnych.',
        abstract: 'Zwraca wartość zmodyfikowanej wewnętrznej stopy zwrotu dla serii okresowych przepływów gotówkowych. Funkcja MIRR bierze pod uwagę jednocześnie koszt inwestycji oraz procent uzyskany z ponownego zainwestowania środków pieniężnych.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/mirr-function',
            },
        ],
        functionParameter: {
            values: { name: 'values', detail: 'Wymagane. Tablica lub odwołanie do komórek zawierających liczby. Te liczby reprezentują płatności (wartości ujemne) i przychód (wartości dodatnie) występujące w równych odstępach czasu. Aby obliczyć zmodyfikowaną wewnętrzną stopę zwrotu, wartości muszą zawierać co najmniej jedną wartość dodatnią i jedną ujemną. W przeciwnym razie funkcja MIRR zwraca wartość #DIV/0! wartość błędu #ADR!. Jeśli argument tablicowy lub odwołaniowy zawiera tekst, wartości logiczne lub puste komórki, to wartości te są ignorowane; komórki o wartości zero są jednak włączane do obliczeń.' },
            financeRate: { name: 'finance_rate', detail: 'Wymagane. Stopa oprocentowania pobierana od środków używanych w przepływach gotówkowych.' },
            reinvestRate: { name: 'reinvest_rate', detail: 'Wymagane. Stopa oprocentowania otrzymywana od reinwestowanych przepływów gotówkowych.' },
        },
    },
    NOMINAL: {
        description: 'Zwraca roczną nominalną stopę procentową.',
        abstract: 'Zwraca roczną nominalną stopę procentową.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/nominal-function',
            },
        ],
        functionParameter: {
            effectRate: { name: 'effect_rate', detail: 'Efektywna stopa procentowa.' },
            npery: { name: 'npery', detail: 'Liczba okresów kapitalizacji w roku.' },
        },
    },
    NPER: {
        description: 'Zwraca liczbę okresów inwestycji.',
        abstract: 'Zwraca liczbę okresów inwestycji.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/nper-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Stopa procentowa przypadająca na okres.' },
            pmt: { name: 'pmt', detail: 'Płatność dokonywana w każdym okresie; nie może się zmieniać w okresie trwania renty.' },
            pv: { name: 'pv', detail: 'Wartość bieżąca, czyli kwota ryczałtowa, jaką seria przyszłych płatności jest warta obecnie.' },
            fv: { name: 'fv', detail: 'Wartość przyszła, czyli saldo środków pieniężnych, które chcesz osiągnąć po dokonaniu ostatniej płatności.' },
            type: { name: 'type', detail: 'Liczba 0 lub 1 wskazująca termin płatności.' },
        },
    },
    NPV: {
        description: 'Zwraca wartość bieżącą netto inwestycji na podstawie szeregu okresowych przepływów pieniężnych i stopy dyskontowej.',
        abstract: 'Zwraca wartość bieżącą netto inwestycji na podstawie szeregu okresowych przepływów pieniężnych i stopy dyskontowej.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/npv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Stopa dyskontowa dla jednego okresu.' },
            value1: { name: 'value1', detail: 'Od 1 do 254 argumentów reprezentujących płatności i dochody.' },
            value2: { name: 'value2', detail: 'Od 1 do 254 argumentów reprezentujących płatności i dochody.' },
        },
    },
    ODDFPRICE: {
        description: 'Zwraca cenę papieru wartościowego o wartości nominalnej 100 USD z nieregularnym pierwszym okresem.',
        abstract: 'Zwraca cenę papieru wartościowego o wartości nominalnej 100 USD z nieregularnym pierwszym okresem.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/oddfprice-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Data rozliczenia papieru wartościowego.' },
            maturity: { name: 'maturity', detail: 'Data terminu wykupu papieru wartościowego.' },
            issue: { name: 'issue', detail: 'Data emisji papieru wartościowego.' },
            firstCoupon: { name: 'first_coupon', detail: 'Data pierwszego kuponu papieru wartościowego.' },
            rate: { name: 'rate', detail: 'Stopa procentowa papieru wartościowego.' },
            yld: { name: 'yld', detail: 'Roczna rentowność papieru wartościowego.' },
            redemption: { name: 'redemption', detail: 'Wartość wykupu przypadająca na 100 USD wartości nominalnej.' },
            frequency: { name: 'frequency', detail: 'Liczba płatności kuponowych w roku. Dla płatności rocznych częstotliwość wynosi 1, półrocznych 2, a kwartalnych 4.' },
            basis: { name: 'basis', detail: 'Typ używanej podstawy liczenia dni.' },
        },
    },
    ODDFYIELD: {
        description: 'Zwraca rentowność papieru wartościowego z nieregularnym pierwszym okresem.',
        abstract: 'Zwraca rentowność papieru wartościowego z nieregularnym pierwszym okresem.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/oddfyield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Data rozliczenia papieru wartościowego.' },
            maturity: { name: 'maturity', detail: 'Data terminu wykupu papieru wartościowego.' },
            issue: { name: 'issue', detail: 'Data emisji papieru wartościowego.' },
            firstCoupon: { name: 'first_coupon', detail: 'Data pierwszego kuponu papieru wartościowego.' },
            rate: { name: 'rate', detail: 'Stopa procentowa papieru wartościowego.' },
            pr: { name: 'pr', detail: 'Cena papieru wartościowego.' },
            redemption: { name: 'redemption', detail: 'Wartość wykupu przypadająca na 100 USD wartości nominalnej.' },
            frequency: { name: 'frequency', detail: 'Liczba płatności kuponowych w roku. Dla płatności rocznych częstotliwość wynosi 1, półrocznych 2, a kwartalnych 4.' },
            basis: { name: 'basis', detail: 'Typ używanej podstawy liczenia dni.' },
        },
    },
    ODDLPRICE: {
        description: 'Zwraca wartość ceny przypadającej na 100 zł wartości nominalnej papieru wartościowego o nietypowym (krótkim lub długim) ostatnim okresie.',
        abstract: 'Zwraca wartość ceny przypadającej na 100 zł wartości nominalnej papieru wartościowego o nietypowym (krótkim lub długim) ostatnim okresie.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/oddlprice-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Wymagane. Data rozliczenia papieru wartościowego. Data rozliczenia papieru wartościowego jest datą sprzedaży papieru wartościowego nabywcy, datą późniejszą niż data emisji.' },
            maturity: { name: 'maturity', detail: 'Wymagane. Data terminu płatności papieru wartościowego. Data spłaty to data, kiedy papier wartościowy traci ważność.' },
            lastInterest: { name: 'last_interest', detail: 'Wymagane. Data ostatniej dywidendy od papieru wartościowego.' },
            rate: { name: 'rate', detail: 'Wymagane. Stopa procentowa papieru wartościowego.' },
            yld: { name: 'yld', detail: 'Wymagane. Roczna rentowność papieru wartościowego.' },
            redemption: { name: 'redemption', detail: 'Wymagane. Wartość wykupu papieru wartościowego w przeliczeniu na 100 złotych wartości nominalnej.' },
            frequency: { name: 'frequency', detail: 'Wymagane. Liczba płatności kuponowych przypadających na jeden rok. W przypadku płatności rocznych częstotliwość = 1; w przypadku płatności półrocznych częstotliwość = 2; w przypadku płatności kwartalnych częstotliwość = 4.' },
            basis: { name: 'basis', detail: 'Opcjonalne. Typ podstawy wyliczania dni, który zostanie użyty.' },
        },
    },
    ODDLYIELD: {
        description: 'Zwraca wartość rentowności papieru wartościowego o nietypowym (długim lub krótkim) ostatnim okresie.',
        abstract: 'Zwraca wartość rentowności papieru wartościowego o nietypowym (długim lub krótkim) ostatnim okresie.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/oddlyield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Wymagane. Data rozliczenia papieru wartościowego. Data rozliczenia papieru wartościowego jest datą sprzedaży papieru wartościowego nabywcy, datą późniejszą niż data emisji.' },
            maturity: { name: 'maturity', detail: 'Wymagane. Data terminu płatności papieru wartościowego. Data spłaty to data, kiedy papier wartościowy traci ważność.' },
            lastInterest: { name: 'last_interest', detail: 'Wymagane. Data ostatniej dywidendy od papieru wartościowego.' },
            rate: { name: 'rate', detail: 'Wymagane. Stopa procentowa papieru wartościowego.' },
            pr: { name: 'pr', detail: 'Wymagane. Cena papieru wartościowego.' },
            redemption: { name: 'redemption', detail: 'Wymagane. Wartość wykupu papieru wartościowego w przeliczeniu na 100 złotych wartości nominalnej.' },
            frequency: { name: 'frequency', detail: 'Wymagane. Liczba płatności kuponowych przypadających na jeden rok. W przypadku płatności rocznych częstotliwość = 1; w przypadku płatności półrocznych częstotliwość = 2; w przypadku płatności kwartalnych częstotliwość = 4.' },
            basis: { name: 'basis', detail: 'Opcjonalne. Typ podstawy wyliczania dni, który zostanie użyty.' },
        },
    },
    PDURATION: {
        description: 'Zwraca liczbę okresów wymaganych przez inwestycję do osiągnięcia określonej wartości.',
        abstract: 'Zwraca liczbę okresów wymaganych przez inwestycję do osiągnięcia określonej wartości.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/pduration-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Wymagane. Stopa procentowa dla okresu.' },
            pv: { name: 'pv', detail: 'Wymagane. Wb to obecna wartość inwestycji.' },
            fv: { name: 'fv', detail: 'Wymagane. Wp to żądana przyszła wartość inwestycji.' },
        },
    },
    PMT: {
        description: 'Funkcja PMT , jedna z funkcji finansowych , oblicza kwotę spłaty pożyczki przy założeniu stałych spłat i stałej stopy procentowej.',
        abstract: 'Funkcja PMT , jedna z funkcji finansowych , oblicza kwotę spłaty pożyczki przy założeniu stałych spłat i stałej stopy procentowej.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/pmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Argument wymagany. Stopa procentowa pożyczki.' },
            nper: { name: 'nper', detail: 'Argument wymagany. Całkowita liczba spłat w ramach pożyczki.' },
            pv: { name: 'pv', detail: 'Argument wymagany. Wartość bieżąca, czyli całkowita kwota będąca wartością serii przyszłych płatności (nazywana także kapitałem).' },
            fv: { name: 'fv', detail: 'Opcjonalnie. Przyszła wartość, czyli saldo kasowe, które ma zostać osiągnięte po dokonaniu ostatniej płatności. Jeśli argument wp zostanie pominięty, zostanie przyjęta wartość 0 (zero) (czyli przyszła wartość pożyczki wynosi 0).' },
            type: { name: 'type', detail: 'Opcjonalnie. Liczba 0 (zero) albo 1, która wskazuje, kiedy płatność jest należna.' },
        },
    },
    PPMT: {
        description: 'Zwraca spłaty kapitału w podanym okresie dla inwestycji w oparciu o stałe, okresowe płatności i stałą stopę procentową.',
        abstract: 'Zwraca spłaty kapitału w podanym okresie dla inwestycji w oparciu o stałe, okresowe płatności i stałą stopę procentową.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/ppmt-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Wymagane. Stopa procentowa dla okresu.' },
            per: { name: 'per', detail: 'Wymagane. Określa okres i musi znajdować się w zakresie od 1 do liczba_okresów.' },
            nper: { name: 'nper', detail: 'Wymagane. Całkowita liczba okresów płatności w okresie spłaty.' },
            pv: { name: 'pv', detail: 'Wymagane. Obecna wartość, czyli całkowita suma bieżącej wartości szeregu przyszłych płatności.' },
            fv: { name: 'fv', detail: 'Opcjonalne. Przyszła wartość, czyli saldo kasowe, które ma zostać osiągnięte po dokonaniu ostatniej płatności. Jeśli argument wp zostanie pominięty, zostanie przyjęta wartość 0 (zero) (czyli przyszła wartość pożyczki wynosi 0).' },
            type: { name: 'type', detail: 'Opcjonalne. Liczba 0 albo 1, która wskazuje, kiedy płatność jest należna.' },
        },
    },
    PRICE: {
        description: 'Zwraca kwotę w przeliczeniu na 100 zł wartości nominalnej papieru wartościowego przynoszącego okresowe oprocentowanie.',
        abstract: 'Zwraca kwotę w przeliczeniu na 100 zł wartości nominalnej papieru wartościowego przynoszącego okresowe oprocentowanie.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/price-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Wymagane. Data rozliczenia papieru wartościowego. Data rozliczenia papieru wartościowego jest datą sprzedaży papieru wartościowego nabywcy, datą późniejszą niż data emisji.' },
            maturity: { name: 'maturity', detail: 'Wymagane. Data terminu płatności papieru wartościowego. Data spłaty to data, kiedy papier wartościowy traci ważność.' },
            rate: { name: 'rate', detail: 'Wymagane. Roczna stopa kuponowa papieru wartościowego.' },
            yld: { name: 'yld', detail: 'Wymagane. Roczna rentowność papieru wartościowego.' },
            redemption: { name: 'redemption', detail: 'Wymagane. Wartość wykupu papieru wartościowego w przeliczeniu na 100 złotych wartości nominalnej.' },
            frequency: { name: 'frequency', detail: 'Wymagane. Liczba płatności kuponowych przypadających na jeden rok. W przypadku płatności rocznych częstotliwość = 1; w przypadku płatności półrocznych częstotliwość = 2; w przypadku płatności kwartalnych częstotliwość = 4.' },
            basis: { name: 'basis', detail: 'Opcjonalne. Typ podstawy wyliczania dni, który zostanie użyty.' },
        },
    },
    PRICEDISC: {
        description: 'Zwraca kwotę w przeliczeniu na 100 zł wartości nominalnej dyskontowanego papieru wartościowego.',
        abstract: 'Zwraca kwotę w przeliczeniu na 100 zł wartości nominalnej dyskontowanego papieru wartościowego.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/pricedisc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Wymagane. Data rozliczenia papieru wartościowego. Data rozliczenia papieru wartościowego jest datą sprzedaży papieru wartościowego nabywcy, datą późniejszą niż data emisji.' },
            maturity: { name: 'maturity', detail: 'Wymagane. Data terminu płatności papieru wartościowego. Data spłaty to data, kiedy papier wartościowy traci ważność.' },
            discount: { name: 'discount', detail: 'Wymagane. Stopa dyskontowa papieru wartościowego.' },
            redemption: { name: 'redemption', detail: 'Wymagane. Wartość wykupu papieru wartościowego w przeliczeniu na 100 złotych wartości nominalnej.' },
            basis: { name: 'basis', detail: 'Opcjonalne. Typ podstawy wyliczania dni, który zostanie użyty.' },
        },
    },
    PRICEMAT: {
        description: 'Zwraca kwotę w przeliczeniu na 100 zł wartości nominalnej papieru wartościowego dającą oprocentowanie w dniu płatności.',
        abstract: 'Zwraca kwotę w przeliczeniu na 100 zł wartości nominalnej papieru wartościowego dającą oprocentowanie w dniu płatności.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/pricemat-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Wymagane. Data rozliczenia papieru wartościowego. Data rozliczenia papieru wartościowego jest datą sprzedaży papieru wartościowego nabywcy, datą późniejszą niż data emisji.' },
            maturity: { name: 'maturity', detail: 'Wymagane. Data terminu płatności papieru wartościowego. Data spłaty to data, kiedy papier wartościowy traci ważność.' },
            issue: { name: 'issue', detail: 'Wymagane. Data emisji papieru wartościowego wyrażona jako liczba kolejna daty.' },
            rate: { name: 'rate', detail: 'Wymagane. Roczna stopa oprocentowania papieru wartościowego.' },
            yld: { name: 'yld', detail: 'Wymagane. Roczna rentowność papieru wartościowego.' },
            basis: { name: 'basis', detail: 'Opcjonalne. Typ podstawy wyliczania dni, który zostanie użyty.' },
        },
    },
    PV: {
        description: 'Funkcja PV , jedna z funkcji finansowych , oblicza bieżącą wartość pożyczki lub inwestycji przy założeniu stałej stopy procentowej. Funkcji PV można używać w przypadku okresowych, stałych płatności (takich jak kredyt hipoteczny lub inna pożyczka) albo przyszłej wartości będącej celem inwestycji.',
        abstract: 'Funkcja PV , jedna z funkcji finansowych , oblicza bieżącą wartość pożyczki lub inwestycji przy założeniu stałej stopy procentowej. Funkcji PV można używać w przypadku okresowych, stałych płatności (takich jak kredyt hipoteczny lub inna pożyczka) albo przyszłej wartości będącej celem inwestycji.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/pv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Argument wymagany. Stopa procentowa dla okresu. Na przykład w przypadku pożyczki na samochód oprocentowanej na 10 procent rocznie ze spłatami miesięcznymi miesięczna stopa procentowa wynosi 10%/12, czyli 0,83%. Dlatego jako oprocentowanie należy wprowadzić w formule wartość 10%/12 albo 0,83% bądź 0,0083.' },
            nper: { name: 'nper', detail: 'Argument wymagany. Całkowita liczba okresów płatności w okresie spłaty. Na przykład osoba otrzymująca czteroletnią pożyczkę na samochód, spłacająca tę pożyczkę w miesięcznych ratach, będzie ją spłacać przez 4*12 (czyli 48) okresów. Dlatego jako argument liczba_okresów należy wprowadzić w formule liczbę 48.' },
            pmt: { name: 'pmt', detail: 'Argument wymagany. Płatność dokonywana w każdym okresie, niezmienna przez cały okres pożyczki. Rata obejmuje zazwyczaj kapitał i odsetki z wyłączeniem innych opłat i podatków. Na przykład miesięczna spłata czteroletniej pożyczki na samochód w wysokości 10 000 zł oprocentowanej na 12% wynosi 263,33 zł. Jako argument rata należy wprowadzić w formule wartość -263,33. Jeśli argument rata zostanie pominięty, musi zostać podany argument wp.' },
            fv: { name: 'fv', detail: 'Opcjonalnie. Przyszła wartość, czyli saldo kasowe, które ma zostać osiągnięte po dokonaniu ostatniej płatności. Jeśli argument wp jest pominięty, jest przyjmowana wartość 0 (na przykład przyszła wartość pożyczki wynosi 0). W przypadku oszczędzania przez 18 lat na potrzeby uzyskania kwoty 50 000 zł na określony cel 50 000 zł jest wartością przyszłą. Zakładając pewną stopę procentową, można obliczyć, ile pieniędzy trzeba odkładać co miesiąc. Jeśli argument wp zostanie pominięty, musi zostać podany argument rata.' },
            type: { name: 'type', detail: 'Opcjonalnie. Liczba 0 albo 1, która wskazuje, kiedy płatność jest należna.' },
        },
    },
    RATE: {
        description: 'Zwraca stopę procentową dla każdego okresu raty rocznej. Funkcja RATE jest obliczana przez iterację i może zawierać zero lub więcej rozwiązań. Jeśli kolejne wyniki funkcji RATE nie są zbieżne z wartością 0,00000001 po 20 iteracjach, funkcja RATE zwraca #NUM! wartość błędu #ADR!.',
        abstract: 'Zwraca stopę procentową dla każdego okresu raty rocznej. Funkcja RATE jest obliczana przez iterację i może zawierać zero lub więcej rozwiązań. Jeśli kolejne wyniki funkcji RATE nie są zbieżne z wartością 0,00000001 po 20 iteracjach, funkcja RATE zwraca #NUM! wartość błędu #ADR!.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/rate-function',
            },
        ],
        functionParameter: {
            nper: { name: 'nper', detail: 'Wymagane. Całkowita liczba okresów płatności w okresie spłaty.' },
            pmt: { name: 'pmt', detail: 'Wymagane. Płatność dokonywana w każdym okresie, niezmienna przez cały okres pożyczki. Rata obejmuje zazwyczaj kapitał i odsetki z wyłączeniem innych opłat i podatków. Jeśli argument rata zostanie pominięty, musi zostać umieszczony argument wp.' },
            pv: { name: 'pv', detail: 'Wymagane. Obecna wartość, czyli całkowita suma bieżącej wartości szeregu przyszłych płatności.' },
            fv: { name: 'fv', detail: 'Opcjonalne. Przyszła wartość, czyli saldo kasowe, które ma zostać osiągnięte po dokonaniu ostatniej płatności. Jeśli argument wp jest pominięty, za jego wartość jest uznawane 0 (przyszła wartość pożyczki na przykład wynosi 0). Jeśli argument wp zostanie pominięty, musi zostać podany argument rata.' },
            type: { name: 'type', detail: 'Opcjonalne. Liczba 0 albo 1, która wskazuje, kiedy płatność jest należna.' },
            guess: { name: 'guess', detail: 'Opcjonalne. Przypuszczenie co do wysokości oprocentowania. Jeśli pominie się argument przypuszczenie, to za jego wartość przyjmuje się 10%. Jeśli funkcja RATE nie jest zbieżna, należy spróbować innej wartości argumentu przypuszczenie. Funkcja RATE jest zwykle zbieżna dla wartości argumentu przypuszczenie zawartego pomiędzy 0 a 1.' },
        },
    },
    RECEIVED: {
        description: 'Zwraca kwotę uzyskaną w dniu spłaty dla w pełni ulokowanego papieru wartościowego.',
        abstract: 'Zwraca kwotę uzyskaną w dniu spłaty dla w pełni ulokowanego papieru wartościowego.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/received-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Wymagane. Data rozliczenia papieru wartościowego. Data rozliczenia papieru wartościowego jest datą sprzedaży papieru wartościowego nabywcy, datą późniejszą niż data emisji.' },
            maturity: { name: 'maturity', detail: 'Wymagane. Data terminu płatności papieru wartościowego. Data spłaty to data, kiedy papier wartościowy traci ważność.' },
            investment: { name: 'investment', detail: 'Wymagane. Kwota zainwestowana w papier wartościowy.' },
            discount: { name: 'discount', detail: 'Wymagane. Stopa dyskontowa papieru wartościowego.' },
            basis: { name: 'basis', detail: 'Opcjonalne. Typ podstawy wyliczania dni, który zostanie użyty.' },
        },
    },
    RRI: {
        description: 'Zwraca równoważną stopę procentową dla określonego wzrostu wartości inwestycji.',
        abstract: 'Zwraca równoważną stopę procentową dla określonego wzrostu wartości inwestycji.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/rri-function',
            },
        ],
        functionParameter: {
            nper: { name: 'nper', detail: 'Wymagane. Liczba_okresów jest liczbą okresów płatności inwestycji.' },
            pv: { name: 'pv', detail: 'Wymagane. Wb to obecna wartość inwestycji.' },
            fv: { name: 'fv', detail: 'Wymagane. Wp to przyszła wartość inwestycji.' },
        },
    },
    SLN: {
        description: 'Zwraca wartość amortyzacji liniowej środka trwałego dla jednego okresu.',
        abstract: 'Zwraca wartość amortyzacji liniowej środka trwałego dla jednego okresu.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/sln-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Wymagane. Początkowy koszt środka trwałego.' },
            salvage: { name: 'salvage', detail: 'Wymagane. Wartość środka trwałego po zakończonej amortyzacji (zwana również wartością odzyskaną środka trwałego).' },
            life: { name: 'life', detail: 'Wymagane. Liczba okresów, w których środek trwały jest amortyzowany (argument ten nazywany jest czasami czasem użytkowania środka trwałego).' },
        },
    },
    SYD: {
        description: 'Zwraca amortyzację środka trwałego w podanym okresie metodą sumy cyfr wszystkich lat amortyzacji.',
        abstract: 'Zwraca amortyzację środka trwałego w podanym okresie metodą sumy cyfr wszystkich lat amortyzacji.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/syd-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Wymagane. Początkowy koszt środka trwałego.' },
            salvage: { name: 'salvage', detail: 'Wymagane. Wartość środka trwałego po zakończonej amortyzacji (zwana również wartością odzyskaną środka trwałego).' },
            life: { name: 'life', detail: 'Wymagane. Liczba okresów, w których środek trwały jest amortyzowany (argument ten nazywany jest czasami czasem użytkowania środka trwałego).' },
            per: { name: 'per', detail: 'Wymagane. Okres musi być podany w takich samych jednostkach, jak argument czas_życia.' },
        },
    },
    TBILLEQ: {
        description: 'Zwraca rentowność ekwiwalentu dla weksla skarbowego.',
        abstract: 'Zwraca rentowność ekwiwalentu dla weksla skarbowego.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/tbilleq-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Wymagane. Data rozliczenia weksla skarbowego. Data rozliczenia papieru wartościowego jest datą sprzedaży weksla skarbowego nabywcy, datą późniejszą niż data emisji.' },
            maturity: { name: 'maturity', detail: 'Wymagane. Data spłaty weksla skarbowego. Data spłaty to data, kiedy weksel skarbowy traci ważność.' },
            discount: { name: 'discount', detail: 'Wymagane. Stopa dyskontowa weksla skarbowego.' },
        },
    },
    TBILLPRICE: {
        description: 'Zwraca cenę przypadającą na 100 zł wartości nominalnej weksla skarbowego.',
        abstract: 'Zwraca cenę przypadającą na 100 zł wartości nominalnej weksla skarbowego.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/tbillprice-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Wymagane. Data rozliczenia weksla skarbowego. Data rozliczenia papieru wartościowego jest datą sprzedaży weksla skarbowego nabywcy, datą późniejszą niż data emisji.' },
            maturity: { name: 'maturity', detail: 'Wymagane. Data spłaty weksla skarbowego. Data spłaty to data, kiedy weksel skarbowy traci ważność.' },
            discount: { name: 'discount', detail: 'Wymagane. Stopa dyskontowa weksla skarbowego.' },
        },
    },
    TBILLYIELD: {
        description: 'Zwraca rentowność weksla skarbowego.',
        abstract: 'Zwraca rentowność weksla skarbowego.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/tbillyield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Wymagane. Data rozliczenia weksla skarbowego. Data rozliczenia papieru wartościowego jest datą sprzedaży weksla skarbowego nabywcy, datą późniejszą niż data emisji.' },
            maturity: { name: 'maturity', detail: 'Wymagane. Data spłaty weksla skarbowego. Data spłaty to data, kiedy weksel skarbowy traci ważność.' },
            pr: { name: 'pr', detail: 'Wymagane. Cena weksla skarbowego przypadająca na każde 100 zł wartości nominalnej.' },
        },
    },
    VDB: {
        description: 'Zwraca amortyzację środka trwałego za podany okres, włączając w to podokresy, obliczając amortyzację metodą podwójnie malejącego salda lub inną podaną metodą. Nazwa VDB to skrót od słów Variable Declining Balance (Zmiennie malejące saldo).',
        abstract: 'Zwraca amortyzację środka trwałego za podany okres, włączając w to podokresy, obliczając amortyzację metodą podwójnie malejącego salda lub inną podaną metodą. Nazwa VDB to skrót od słów Variable Declining Balance (Zmiennie malejące saldo).',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/vdb-function',
            },
        ],
        functionParameter: {
            cost: { name: 'cost', detail: 'Wymagane. Początkowy koszt środka trwałego.' },
            salvage: { name: 'salvage', detail: 'Wymagane. Wartość środka trwałego po zakończonej amortyzacji (zwana również wartością odzyskaną środka trwałego). Ta wartość może być równa 0.' },
            life: { name: 'life', detail: 'Wymagane. Liczba okresów, w których środek trwały jest amortyzowany (argument ten nazywany jest czasami czasem użytkowania środka trwałego).' },
            startPeriod: { name: 'start_period', detail: 'Wymagane. Data rozpoczęcia obliczania odpisów amortyzacyjnych. Argument okres_początkowy musi być podany w tych samych jednostkach, co argument czas_życia.' },
            endPeriod: { name: 'end_period', detail: 'Wymagane. Data zakończenia obliczania odpisów amortyzacyjnych. Argument okres_końcowy musi być podany w tych samych jednostkach, co argument czas_życia.' },
            factor: { name: 'factor', detail: 'Opcjonalne. Szybkość, z jaką zmniejsza się saldo. Jeśli argument ten zostanie pominięty, to zakłada się, że wynosi 2 (metoda podwójnie malejącego salda). Jeśli użycie metody podwójnie malejącego salda jest niepożądane, należy zmienić wartość argumentu współczynnik. Aby poznać metodę podwójnie malejącego salda, zobacz opis funkcji DDB.' },
            noSwitch: { name: 'no_switch', detail: 'Opcjonalne. Wartość logiczna określająca, czy przełączyć się na metodę liniową obliczania amortyzacji, kiedy amortyzacja jest większa niż obliczenie malejącego salda. Jeśli argument bez_przełączenia ma wartość PRAWDA, program Microsoft Excel nie przełącza się na metodę amortyzacji liniowej, nawet jeśli amortyzacja jest większa niż obliczenie malejącego salda. Jeśli argument bez_przełączenia ma wartość FAŁSZ lub jest pominięty, funkcja VDB przełącza się na metodę amortyzacji liniowej wtedy, gdy amortyzacja przewyższa obliczenie malejącego salda.' },
        },
    },
    XIRR: {
        description: 'Zwraca wartość wewnętrznej stopy zwrotu dla serii rozłożonych w czasie przepływów gotówkowych, niekoniecznie okresowych. Aby obliczyć wewnętrzną stopę zwrotu dla serii okresowych przepływów gotówkowych, należy użyć funkcji IRR.',
        abstract: 'Zwraca wartość wewnętrznej stopy zwrotu dla serii rozłożonych w czasie przepływów gotówkowych, niekoniecznie okresowych. Aby obliczyć wewnętrzną stopę zwrotu dla serii okresowych przepływów gotówkowych, należy użyć funkcji IRR.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/xirr-function',
            },
        ],
        functionParameter: {
            values: { name: 'values', detail: 'Wymagane. Seria przepływów gotówkowych odpowiadających zestawieniu płatności według dat. Pierwsza płatność jest opcjonalna i odpowiada kosztowi lub płatności występującej na początku inwestycji. Jeśli pierwsza wartość jest kosztem lub płatnością, musi być wartością ujemną. Wszystkie kolejne płatności są dyskontowane przy założeniu, że rok ma 365 dni. Seria wartości musi zawierać co najmniej jedną wartość dodatnią i jedną ujemną.' },
            dates: { name: 'dates', detail: 'Wymagane. Zestawienie dat płatności odpowiadających płatnościom przepływów gotówkowych. Daty mogą występować w dowolnej kolejności. Daty powinny być wprowadzane przy użyciu funkcji DATA albo stanowić wyniki innych formuł lub funkcji. Na przykład w przypadku daty 23 maja 2008 należy użyć funkcji DATA(2008;5;23). Jeśli daty są wprowadzane jako tekst, mogą wystąpić problemy. .' },
            guess: { name: 'guess', detail: 'Opcjonalne. Liczba przypuszczalnie zbliżona do wyniku funkcji XIRR.' },
        },
    },
    XNPV: {
        description: 'Zwraca zdyskontowaną wartość netto serii przepływów gotówkowych, niekoniecznie okresowych. Aby obliczyć zdyskontowaną wartość netto serii przepływów gotówkowych okresowych, należy użyć funkcji NPV.',
        abstract: 'Zwraca zdyskontowaną wartość netto serii przepływów gotówkowych, niekoniecznie okresowych. Aby obliczyć zdyskontowaną wartość netto serii przepływów gotówkowych okresowych, należy użyć funkcji NPV.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/xnpv-function',
            },
        ],
        functionParameter: {
            rate: { name: 'rate', detail: 'Wymagane. Stopa dyskontowa do stosowania przy przepływach gotówkowych.' },
            values: { name: 'values', detail: 'Wymagane. Seria przepływów gotówkowych odpowiadających zestawieniu płatności według dat. Pierwsza płatność jest opcjonalna i odpowiada kosztowi lub płatności występującej na początku inwestycji. Jeśli pierwsza wartość jest kosztem lub płatnością, musi być wartością ujemną. Wszystkie kolejne płatności są dyskontowane przy założeniu, że rok ma 365 dni. Seria wartości musi zawierać co najmniej jedną ujemną i dodatnią wartość.' },
            dates: { name: 'dates', detail: 'Wymagane. Zestawienie dat płatności odpowiadających płatnościom przepływów gotówkowych. Pierwsza data płatności oznacza początek harmonogramu płatności. Wszystkie inne daty muszą być późniejsze, ale mogą występować w dowolnym porządku.' },
        },
    },
    YIELD: {
        description: 'Zwraca rentowność papieru wartościowego o okresowym oprocentowaniu. Z funkcji RENTOWNOŚĆ korzysta się do obliczania rentowności obligacji.',
        abstract: 'Zwraca rentowność papieru wartościowego o okresowym oprocentowaniu. Z funkcji RENTOWNOŚĆ korzysta się do obliczania rentowności obligacji.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/yield-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Wymagane. Data rozliczenia papieru wartościowego. Data rozliczenia papieru wartościowego jest datą sprzedaży papieru wartościowego nabywcy, datą późniejszą niż data emisji.' },
            maturity: { name: 'maturity', detail: 'Wymagane. Data terminu płatności papieru wartościowego. Data spłaty to data, kiedy papier wartościowy traci ważność.' },
            rate: { name: 'rate', detail: 'Wymagane. Roczna stopa kuponowa papieru wartościowego.' },
            pr: { name: 'pr', detail: 'Wymagane. Cena papieru wartościowego w przeliczeniu na 100 złotych wartości nominalnej.' },
            redemption: { name: 'redemption', detail: 'Wymagane. Wartość wykupu papieru wartościowego w przeliczeniu na 100 złotych wartości nominalnej.' },
            frequency: { name: 'frequency', detail: 'Wymagane. Liczba płatności kuponowych przypadających na jeden rok. W przypadku płatności rocznych częstotliwość = 1; w przypadku płatności półrocznych częstotliwość = 2; w przypadku płatności kwartalnych częstotliwość = 4.' },
            basis: { name: 'basis', detail: 'Opcjonalne. Typ podstawy wyliczania dni, który zostanie użyty.' },
        },
    },
    YIELDDISC: {
        description: 'Zwraca roczną rentowność dyskontowanego papieru wartościowego.',
        abstract: 'Zwraca roczną rentowność dyskontowanego papieru wartościowego.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/yielddisc-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Wymagane. Data rozliczenia papieru wartościowego. Data rozliczenia papieru wartościowego jest datą sprzedaży papieru wartościowego nabywcy, datą późniejszą niż data emisji.' },
            maturity: { name: 'maturity', detail: 'Wymagane. Data terminu płatności papieru wartościowego. Data spłaty to data, kiedy papier wartościowy traci ważność.' },
            pr: { name: 'pr', detail: 'Wymagane. Cena papieru wartościowego w przeliczeniu na 100 złotych wartości nominalnej.' },
            redemption: { name: 'redemption', detail: 'Wymagane. Wartość wykupu papieru wartościowego w przeliczeniu na 100 złotych wartości nominalnej.' },
            basis: { name: 'basis', detail: 'Opcjonalne. Typ podstawy wyliczania dni, który zostanie użyty.' },
        },
    },
    YIELDMAT: {
        description: 'Zwraca roczną rentowność dyskontowanego papieru wartościowego, dającego odsetki w dniu spłaty.',
        abstract: 'Zwraca roczną rentowność dyskontowanego papieru wartościowego, dającego odsetki w dniu spłaty.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/yieldmat-function',
            },
        ],
        functionParameter: {
            settlement: { name: 'settlement', detail: 'Wymagane. Data rozliczenia papieru wartościowego. Data rozliczenia papieru wartościowego jest datą sprzedaży papieru wartościowego nabywcy, datą późniejszą niż data emisji.' },
            maturity: { name: 'maturity', detail: 'Wymagane. Data terminu płatności papieru wartościowego. Data spłaty to data, kiedy papier wartościowy traci ważność.' },
            issue: { name: 'issue', detail: 'Wymagane. Data emisji papieru wartościowego wyrażona jako liczba kolejna daty.' },
            rate: { name: 'rate', detail: 'Wymagane. Roczna stopa oprocentowania papieru wartościowego.' },
            pr: { name: 'pr', detail: 'Wymagane. Cena papieru wartościowego w przeliczeniu na 100 złotych wartości nominalnej.' },
            basis: { name: 'basis', detail: 'Opcjonalne. Typ podstawy wyliczania dni, który zostanie użyty.' },
        },
    },
};

export default locale;
