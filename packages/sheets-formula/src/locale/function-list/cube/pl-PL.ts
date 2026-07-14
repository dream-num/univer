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
    CUBEKPIMEMBER: {
        description: 'Zwraca właściwość kluczowego wskaźnika wydajności (KPI) oraz wyświetla nazwę KPI w komórce. Wskaźnik KPI jest miarą ilościową, taką jak miesięczny zysk brutto lub kwartalna fluktuacja pracowników, która jest używana do monitorowania wydajności organizacji.',
        abstract: 'Zwraca właściwość kluczowego wskaźnika wydajności (KPI) oraz wyświetla nazwę KPI w komórce. Wskaźnik KPI jest miarą ilościową, taką jak miesięczny zysk brutto lub kwartalna fluktuacja pracowników, która jest używana do monitorowania wydajności organizacji.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/cubekpimember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Połączenia', detail: 'Wymagane. Jest to ciąg tekstowy określający nazwę połączenia z modułem.' },
            kpiName: { name: 'Kpi_name', detail: 'Wymagane. Jest to ciąg tekstowy określający nazwę wskaźnika KPI w module.' },
            kpiProperty: { name: 'Kpi_property', detail: 'Wymagane. Jest to zwracany składnik wskaźnika KPI, który może mieć jedną z następujących postaci:' },
            caption: { name: 'Podpis', detail: 'Opcjonalne. Jest to alternatywny ciąg tekstowy, który jest wyświetlany w komórce zamiast parametrów kpi_nazwa oraz kpi_właściwość.' },
        },
    },
    CUBEMEMBER: {
        description: 'Zwraca element lub krotkę z modułu. Służy do sprawdzania, czy element lub krotka istnieje w module.',
        abstract: 'Zwraca element lub krotkę z modułu. Służy do sprawdzania, czy element lub krotka istnieje w module.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/cubemember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Połączenia', detail: 'Wymagane. Jest to ciąg tekstowy określający nazwę połączenia z modułem.' },
            memberExpression: { name: 'Member_expression', detail: 'Wymagane. Jest to ciąg tekstowy określający wyrażenie wielowymiarowe (MDX), którego wartością jest unikatowy element modułu. Ten argument może być również krotką podaną jako zakres komórek lub stała tablicowa.' },
            caption: { name: 'Podpis', detail: 'Opcjonalne. Jest to ciąg tekstowy wyświetlany w komórce zamiast podpisu modułu (jeśli zdefiniowano podpis modułu). Jeśli jest zwracana krotka, program używa podpisu ujętego w ostatnim elemencie krotki.' },
        },
    },
    CUBEMEMBERPROPERTY: {
        description: 'Funkcja WŁAŚCIWOŚĆ.ELEMENTU.MODUŁU , jedna z funkcji Moduł w programie Excel, zwraca wartość właściwości elementu z modułu. Służy do sprawdzania, czy nazwa elementu istnieje w module, a także do zwracania określonej właściwości dla tego elementu.',
        abstract: 'Funkcja WŁAŚCIWOŚĆ.ELEMENTU.MODUŁU , jedna z funkcji Moduł w programie Excel, zwraca wartość właściwości elementu z modułu. Służy do sprawdzania, czy nazwa elementu istnieje w module, a także do zwracania określonej właściwości dla tego elementu.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/cubememberproperty-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Połączenia', detail: 'Wymagane. Jest to ciąg tekstowy określający nazwę połączenia z modułem.' },
            memberExpression: { name: 'Member_expression', detail: 'Wymagane. Jest to ciąg tekstowy określający wyrażenie wielowymiarowe (MDX) dla elementu w module.' },
            property: { name: 'Właściwość', detail: 'Wymagane. Jest to ciąg tekstowy nazwy zwróconej właściwości lub odwołania do komórki, która zawiera nazwę właściwości.' },
        },
    },
    CUBERANKEDMEMBER: {
        description: 'Zwraca n-ty (czyli uszeregowany) element zestawu. Służy do zwracania elementów zestawu, na przykład najlepszego sprzedawcy lub 10 najlepszych studentów.',
        abstract: 'Zwraca n-ty (czyli uszeregowany) element zestawu. Służy do zwracania elementów zestawu, na przykład najlepszego sprzedawcy lub 10 najlepszych studentów.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/cuberankedmember-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Połączenia', detail: 'Wymagane. Jest to ciąg tekstowy określający nazwę połączenia z modułem.' },
            setExpression: { name: 'Wyrażenie_docelowe', detail: 'Wymagane. Jest to ciąg tekstowy wyrażenia zestawu, na przykład „{[Element1].dzieci}”. Może to być również funkcja ZESTAW.MODUŁÓW lub odwołanie do komórki zawierającej tę funkcję.' },
            rank: { name: 'Rank', detail: 'Wymagane. Jest to liczba całkowita określająca najwyższą wartość, jaka ma zostać zwrócona. Jeśli argument pozycja ma wartość 1, funkcja zwraca najwyższą wartość, jeśli 2 — drugą wartość itd. Aby zwrócić 5 najwyższych wartości, należy pięć razy użyć funkcji USZEREGOWANY.ELEMENT.MODUŁU, określając pozycje od 1 do 5.' },
            caption: { name: 'Podpis', detail: 'Opcjonalne. Jest to ciąg tekstowy wyświetlany w komórce zamiast podpisu modułu (jeśli zdefiniowano podpis modułu).' },
        },
    },
    CUBESET: {
        description: 'Definiuje obliczeniowy zestaw elementów lub krotek, wysyłając wyrażenie zestawu do modułu na serwerze, który tworzy zestaw i zwraca go do programu Microsoft Office Excel.',
        abstract: 'Definiuje obliczeniowy zestaw elementów lub krotek, wysyłając wyrażenie zestawu do modułu na serwerze, który tworzy zestaw i zwraca go do programu Microsoft Office Excel.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/cubeset-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Połączenia', detail: 'Wymagane. Jest to ciąg tekstowy określający nazwę połączenia z modułem.' },
            setExpression: { name: 'Wyrażenie_docelowe', detail: 'Wymagane. Jest to ciąg tekstowy wyrażenia zestawu, którego wartością jest zestaw elementów lub krotek. Może to być również odwołanie do zakresu komórek programu Excel zawierającego pewną liczbę elementów, krotek lub zestawów należących do zestawu.' },
            caption: { name: 'Podpis', detail: 'Opcjonalne. Jest to ciąg tekstowy, który jest wyświetlany w komórce zamiast podpisu modułu (jeśli taki podpis został zdefiniowany).' },
            sortOrder: { name: 'Sort_order', detail: 'Opcjonalne. Określa typ sortowania, jakie należy wykonać, i (o ile argument jest podawany) może przybierać następujące wartości:' },
            sortBy: { name: 'Sort_by', detail: 'Opcjonalne. Jest to ciąg tekstowy wartości do posortowania. Na przykład, aby uzyskać miasto o największej sprzedaży, set_expression będzie zestaw miast, a sort_by będzie miarą sprzedaży. Lub, aby uzyskać miasto o największej liczbie ludności, set_expression będzie zestawem miast, a sort_by będzie miarą populacji. Jeśli sort_order wymaga sort_by, a sort_by zostanie pominięty, funkcja ZESTAW.MODUŁÓW zwraca #VALUE! Komunikat o błędzie.' },
        },
    },
    CUBESETCOUNT: {
        description: 'Zwraca liczbę elementów zestawu.',
        abstract: 'Zwraca liczbę elementów zestawu.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/cubesetcount-function',
            },
        ],
        functionParameter: {
            set: { name: 'Ustawić', detail: 'Wymagane. Jest to ciąg tekstowy będący wyrażeniem programu Microsoft Excel, którego wartością jest zestaw zdefiniowany za pomocą funkcji ZESTAW.MODUŁÓW. Argument ten może być również funkcją ZESTAW.MODUŁÓW lub odwołaniem do komórki zawierającej tę funkcję.' },
        },
    },
    CUBEVALUE: {
        description: 'Zwraca zagregowaną wartość z modułu.',
        abstract: 'Zwraca zagregowaną wartość z modułu.',
        links: [
            {
                title: 'Instrukcje',
                url: 'https://support.microsoft.com/pl-pl/excel/functions/cubevalue-function',
            },
        ],
        functionParameter: {
            connection: { name: 'Połączenia', detail: 'Wymagane. Jest to ciąg tekstowy określający nazwę połączenia z modułem.' },
            memberExpression: { name: 'Member_expression', detail: 'Opcjonalne. Jest to ciąg tekstowy określający wyrażenie wielowymiarowe (MDX), którego wartością jest unikatowy element modułu. Ten argument może również być zestawem zdefiniowanym przy użyciu funkcji ZESTAW.MODUŁÓW. Argument wyrażenie_elementu ma zastosowanie jako wyrażenie określające część modułu, dla której funkcja ma zwrócić zagregowaną wartość. Jeśli w argumencie wyrażenie_elementu nie zostanie podana miara, program użyje domyślnej miary modułu.' },
        },
    },
};

export default locale;
