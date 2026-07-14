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
    DAVERAGE: {
        description: 'Uśrednia wartości w polu (kolumnie) rekordów listy lub bazy danych, które są zgodne z warunkami określonymi przez użytkownika.',
        abstract: 'Uśrednia wartości w polu (kolumnie) rekordów listy lub bazy danych, które są zgodne z warunkami określonymi przez użytkownika.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/daverage-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'to zakres komórek, które tworzą listę lub bazę danych. Baza danych to lista powiązanych danych, na której wiersze pokrewnych informacji to rekordy, a kolumny danych to pola. Pierwszy wiersz listy zawiera etykiety poszczególnych kolumn.' },
            field: { name: 'field', detail: 'wskazuje, która kolumna jest używana w funkcji. Należy wprowadzić etykietę kolumny umieszczoną w podwójnym cudzysłowie, na przykład "Wiek" lub "Plon", lub liczbę (bez cudzysłowów) reprezentującą pozycję kolumny na liście: 1 dla pierwszej kolumny, 2 dla drugiej itd.' },
            criteria: { name: 'criteria', detail: 'to zakres komórek zawierający warunki określone przez użytkownika. Jako argumentu „kryteria” można użyć dowolnego zakresu pod warunkiem, że zawiera przynajmniej jedną etykietę kolumny i jedną komórkę poniżej etykiety, w której określa się warunek.' },
        },
    },
    DCOUNT: {
        description: 'Liczy komórki zawierające liczby znajdujące się w polu (kolumnie) rekordów listy lub bazy danych, które są zgodne z warunkami określonymi przez użytkownika.',
        abstract: 'Liczy komórki zawierające liczby znajdujące się w polu (kolumnie) rekordów listy lub bazy danych, które są zgodne z warunkami określonymi przez użytkownika.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/dcount-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Wymagane. Zakres komórek, które tworzą listę lub bazę danych. Baza danych to lista powiązanych danych, na której wiersze pokrewnych informacji to rekordy, a kolumny danych to pola. Pierwszy wiersz listy zawiera etykiety poszczególnych kolumn.' },
            field: { name: 'field', detail: 'Wymagane. Wskazuje, która kolumna jest używana w funkcji. Należy wprowadzić etykietę kolumny umieszczoną w podwójnym cudzysłowie, na przykład "Wiek" lub "Plon", lub liczbę (bez cudzysłowów) reprezentującą pozycję kolumny na liście: 1 dla pierwszej kolumny, 2 dla drugiej itd.' },
            criteria: { name: 'criteria', detail: 'Wymagane. Zakres komórek zawierający warunki określone przez użytkownika. Jako argumentu „kryteria” można użyć dowolnego zakresu pod warunkiem, że zawiera przynajmniej jedną etykietę kolumny i jedną komórkę poniżej etykiety, w której określa się warunek.' },
        },
    },
    DCOUNTA: {
        description: 'Liczy niepuste komórki znajdujące się w polu (kolumnie) rekordów listy lub bazy danych, które są zgodne z warunkami określonymi przez użytkownika.',
        abstract: 'Liczy niepuste komórki znajdujące się w polu (kolumnie) rekordów listy lub bazy danych, które są zgodne z warunkami określonymi przez użytkownika.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/dcounta-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Wymagane. Zakres komórek, które tworzą listę lub bazę danych. Baza danych to lista powiązanych danych, na której wiersze pokrewnych informacji to rekordy, a kolumny danych to pola. Pierwszy wiersz listy zawiera etykiety poszczególnych kolumn.' },
            field: { name: 'field', detail: 'Opcjonalne. Wskazuje, która kolumna jest używana w funkcji. Należy wprowadzić etykietę kolumny umieszczoną w podwójnym cudzysłowie, na przykład "Wiek" lub "Plon", lub liczbę (bez cudzysłowów) reprezentującą pozycję kolumny na liście: 1 dla pierwszej kolumny, 2 dla drugiej itd.' },
            criteria: { name: 'criteria', detail: 'Wymagane. Zakres komórek zawierający warunki określone przez użytkownika. Jako argumentu „kryteria” można użyć dowolnego zakresu pod warunkiem, że zawiera przynajmniej jedną etykietę kolumny i jedną komórkę poniżej etykiety, w której określa się warunek.' },
        },
    },
    DGET: {
        description: 'Wyodrębnia z kolumny listy lub bazy danych pojedyncze wartości, które są zgodne z warunkami określonymi przez użytkownika.',
        abstract: 'Wyodrębnia z kolumny listy lub bazy danych pojedyncze wartości, które są zgodne z warunkami określonymi przez użytkownika.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/dget-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Wymagane. Zakres komórek, które tworzą listę lub bazę danych. Baza danych to lista powiązanych danych, na której wiersze pokrewnych informacji to rekordy, a kolumny danych to pola. Pierwszy wiersz listy zawiera etykiety poszczególnych kolumn.' },
            field: { name: 'field', detail: 'Wymagane. Wskazuje, która kolumna jest używana w funkcji. Należy wprowadzić etykietę kolumny umieszczoną w podwójnym cudzysłowie, na przykład "Wiek" lub "Plon", lub liczbę (bez cudzysłowów) reprezentującą pozycję kolumny na liście: 1 dla pierwszej kolumny, 2 dla drugiej itd.' },
            criteria: { name: 'criteria', detail: 'Wymagane. Zakres komórek zawierający warunki określone przez użytkownika. Jako argumentu „kryteria” można użyć dowolnego zakresu pod warunkiem, że zawiera przynajmniej jedną etykietę kolumny i jedną komórkę poniżej etykiety, w której określa się warunek.' },
        },
    },
    DMAX: {
        description: 'Zwraca największą liczbę w polu (kolumnie) rekordów listy lub bazy danych, która jest zgodna z warunkami określonymi przez użytkownika.',
        abstract: 'Zwraca największą liczbę w polu (kolumnie) rekordów listy lub bazy danych, która jest zgodna z warunkami określonymi przez użytkownika.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/dmax-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Wymagane. Zakres komórek, które tworzą listę lub bazę danych. Baza danych to lista powiązanych danych, na której wiersze pokrewnych informacji to rekordy, a kolumny danych to pola. Pierwszy wiersz listy zawiera etykiety poszczególnych kolumn.' },
            field: { name: 'field', detail: 'Wymagane. Wskazuje, która kolumna jest używana w funkcji. Należy wprowadzić etykietę kolumny umieszczoną w podwójnym cudzysłowie, na przykład "Wiek" lub "Plon", lub liczbę (bez cudzysłowów) reprezentującą pozycję kolumny na liście: 1 dla pierwszej kolumny, 2 dla drugiej itd.' },
            criteria: { name: 'criteria', detail: 'Wymagane. Zakres komórek zawierający warunki określone przez użytkownika. Jako argumentu „kryteria” można użyć dowolnego zakresu pod warunkiem, że zawiera przynajmniej jedną etykietę kolumny i jedną komórkę poniżej etykiety, w której określa się warunek.' },
        },
    },
    DMIN: {
        description: 'Zwraca najmniejszą liczbę w polu (kolumnie) rekordów listy lub bazy danych, która jest zgodna z warunkami określonymi przez użytkownika.',
        abstract: 'Zwraca najmniejszą liczbę w polu (kolumnie) rekordów listy lub bazy danych, która jest zgodna z warunkami określonymi przez użytkownika.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/dmin-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Wymagane. Zakres komórek, które tworzą listę lub bazę danych. Baza danych to lista powiązanych danych, na której wiersze pokrewnych informacji to rekordy, a kolumny danych to pola. Pierwszy wiersz listy zawiera etykiety poszczególnych kolumn.' },
            field: { name: 'field', detail: 'Wymagane. Wskazuje, która kolumna jest używana w funkcji. Należy wprowadzić etykietę kolumny umieszczoną w podwójnym cudzysłowie, na przykład "Wiek" lub "Plon", lub liczbę (bez cudzysłowów) reprezentującą pozycję kolumny na liście: 1 dla pierwszej kolumny, 2 dla drugiej itd.' },
            criteria: { name: 'criteria', detail: 'Wymagane. Zakres komórek zawierający warunki określone przez użytkownika. Jako argumentu „kryteria” można użyć dowolnego zakresu pod warunkiem, że zawiera przynajmniej jedną etykietę kolumny i jedną komórkę poniżej etykiety, w której określa się warunek.' },
        },
    },
    DPRODUCT: {
        description: 'Mnoży wartości w polu (kolumnie) rekordów listy lub bazy danych, które są zgodne z warunkami określonymi przez użytkownika.',
        abstract: 'Mnoży wartości w polu (kolumnie) rekordów listy lub bazy danych, które są zgodne z warunkami określonymi przez użytkownika.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/dproduct-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Wymagane. Zakres komórek, które tworzą listę lub bazę danych. Baza danych to lista powiązanych danych, na której wiersze pokrewnych informacji to rekordy, a kolumny danych to pola. Pierwszy wiersz listy zawiera etykiety poszczególnych kolumn.' },
            field: { name: 'field', detail: 'Wymagane. Wskazuje, która kolumna jest używana w funkcji. Należy wprowadzić etykietę kolumny umieszczoną w podwójnym cudzysłowie, na przykład "Wiek" lub "Plon", lub liczbę (bez cudzysłowów) reprezentującą pozycję kolumny na liście: 1 dla pierwszej kolumny, 2 dla drugiej itd.' },
            criteria: { name: 'criteria', detail: 'Wymagane. Zakres komórek zawierający warunki określone przez użytkownika. Jako argumentu „kryteria” można użyć dowolnego zakresu pod warunkiem, że zawiera przynajmniej jedną etykietę kolumny i jedną komórkę poniżej etykiety, w której określa się warunek.' },
        },
    },
    DSTDEV: {
        description: 'Szacuje odchylenie standardowe populacji na podstawie próbki, używając liczb w polu (kolumnie) rekordów listy lub bazy danych, które są zgodne z warunkami określonymi przez użytkownika.',
        abstract: 'Szacuje odchylenie standardowe populacji na podstawie próbki, używając liczb w polu (kolumnie) rekordów listy lub bazy danych, które są zgodne z warunkami określonymi przez użytkownika.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/dstdev-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Wymagane. Zakres komórek, które tworzą listę lub bazę danych. Baza danych to lista powiązanych danych, na której wiersze pokrewnych informacji to rekordy, a kolumny danych to pola. Pierwszy wiersz listy zawiera etykiety poszczególnych kolumn.' },
            field: { name: 'field', detail: 'Wymagane. Wskazuje, która kolumna jest używana w funkcji. Należy wprowadzić etykietę kolumny umieszczoną w podwójnym cudzysłowie, na przykład "Wiek" lub "Plon", lub liczbę (bez cudzysłowów) reprezentującą pozycję kolumny na liście: 1 dla pierwszej kolumny, 2 dla drugiej itd.' },
            criteria: { name: 'criteria', detail: 'Wymagane. Zakres komórek zawierający warunki określone przez użytkownika. Jako argumentu „kryteria” można użyć dowolnego zakresu pod warunkiem, że zawiera przynajmniej jedną etykietę kolumny i jedną komórkę poniżej etykiety, w której określa się warunek.' },
        },
    },
    DSTDEVP: {
        description: 'Oblicza odchylenie standardowe populacji na podstawie całej populacji, używając liczb w polu (kolumnie) rekordów listy lub bazy danych, które są zgodne z warunkami określonymi przez użytkownika.',
        abstract: 'Oblicza odchylenie standardowe populacji na podstawie całej populacji, używając liczb w polu (kolumnie) rekordów listy lub bazy danych, które są zgodne z warunkami określonymi przez użytkownika.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/dstdevp-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Wymagane. Zakres komórek, które tworzą listę lub bazę danych. Baza danych to lista powiązanych danych, na której wiersze pokrewnych informacji to rekordy, a kolumny danych to pola. Pierwszy wiersz listy zawiera etykiety poszczególnych kolumn.' },
            field: { name: 'field', detail: 'Wymagane. Wskazuje, która kolumna jest używana w funkcji. Należy wprowadzić etykietę kolumny umieszczoną w podwójnym cudzysłowie, na przykład "Wiek" lub "Plon", lub liczbę (bez cudzysłowów) reprezentującą pozycję kolumny na liście: 1 dla pierwszej kolumny, 2 dla drugiej itd.' },
            criteria: { name: 'criteria', detail: 'Wymagane. Zakres komórek zawierający warunki określone przez użytkownika. Jako argumentu „kryteria” można użyć dowolnego zakresu pod warunkiem, że zawiera przynajmniej jedną etykietę kolumny i jedną komórkę poniżej etykiety, w której określa się warunek.' },
        },
    },
    DSUM: {
        description: 'Na liście lub w bazie danych funkcja DSUM zawiera sumę liczb w polach (kolumnach) rekordów zgodnych z określonymi warunkami.',
        abstract: 'Na liście lub w bazie danych funkcja DSUM zawiera sumę liczb w polach (kolumnach) rekordów zgodnych z określonymi warunkami.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/dsum-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Wymagane. Jest to zakres komórek, które tworzą listę lub bazę danych. Baza danych to lista powiązanych danych, na której wiersze informacji pokrewnych to rekordy , a kolumny danych to pola . Pierwszy wiersz listy zawiera etykiety dla każdej kolumny w tej kolumnie.' },
            field: { name: 'field', detail: 'Wymagane. Określa to, która kolumna jest używana w funkcji. Określ na przykład etykietę kolumny ujętą w podwójny cudzysłów, na przykład "Wiek" lub "Plon". Możesz również określić liczbę (bez cudzysłowów) reprezentującą pozycję kolumny na liście: na przykład 1 dla pierwszej kolumny, 2 dla drugiej kolumny itd.' },
            criteria: { name: 'criteria', detail: 'Wymagane. Jest to zakres komórek zawierający warunki określone przez użytkownika. Jako argumentu „kryteria” można użyć dowolnego zakresu pod warunkiem, że zawiera przynajmniej jedną etykietę kolumny i jedną komórkę poniżej etykiety, w której określa się warunek.' },
        },
    },
    DVAR: {
        description: 'Szacuje wariancję populacji na podstawie próbki, używając liczb w polu (kolumnie) rekordów listy lub bazy danych, które są zgodne z warunkami określonymi przez użytkownika.',
        abstract: 'Szacuje wariancję populacji na podstawie próbki, używając liczb w polu (kolumnie) rekordów listy lub bazy danych, które są zgodne z warunkami określonymi przez użytkownika.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/dvar-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Wymagane. Zakres komórek, które tworzą listę lub bazę danych. Baza danych to lista powiązanych danych, na której wiersze pokrewnych informacji to rekordy, a kolumny danych to pola. Pierwszy wiersz listy zawiera etykiety poszczególnych kolumn.' },
            field: { name: 'field', detail: 'Wymagane. Wskazuje, która kolumna jest używana w funkcji. Należy wprowadzić etykietę kolumny umieszczoną w podwójnym cudzysłowie, na przykład "Wiek" lub "Plon", lub liczbę (bez cudzysłowów) reprezentującą pozycję kolumny na liście: 1 dla pierwszej kolumny, 2 dla drugiej itd.' },
            criteria: { name: 'criteria', detail: 'Wymagane. Zakres komórek zawierający warunki określone przez użytkownika. Jako argumentu „kryteria” można użyć dowolnego zakresu pod warunkiem, że zawiera przynajmniej jedną etykietę kolumny i jedną komórkę poniżej etykiety, w której określa się warunek.' },
        },
    },
    DVARP: {
        description: 'Oblicza wariancję populacji na podstawie całej populacji, używając liczb w polu (kolumnie) rekordów listy lub bazy danych, które są zgodne z warunkami określonymi przez użytkownika.',
        abstract: 'Oblicza wariancję populacji na podstawie całej populacji, używając liczb w polu (kolumnie) rekordów listy lub bazy danych, które są zgodne z warunkami określonymi przez użytkownika.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/dvarp-function',
            },
        ],
        functionParameter: {
            database: { name: 'database', detail: 'Wymagane. Zakres komórek, które tworzą listę lub bazę danych. Baza danych to lista powiązanych danych, na której wiersze pokrewnych informacji to rekordy, a kolumny danych to pola. Pierwszy wiersz listy zawiera etykiety poszczególnych kolumn.' },
            field: { name: 'field', detail: 'Wymagane. Wskazuje, która kolumna jest używana w funkcji. Należy wprowadzić etykietę kolumny umieszczoną w podwójnym cudzysłowie, na przykład "Wiek" lub "Plon", lub liczbę (bez cudzysłowów) reprezentującą pozycję kolumny na liście: 1 dla pierwszej kolumny, 2 dla drugiej itd.' },
            criteria: { name: 'criteria', detail: 'Wymagane. Zakres komórek zawierający warunki określone przez użytkownika. Jako argumentu „kryteria” można użyć dowolnego zakresu pod warunkiem, że zawiera przynajmniej jedną etykietę kolumny i jedną komórkę poniżej etykiety, w której określa się warunek.' },
        },
    },
};

export default locale;
