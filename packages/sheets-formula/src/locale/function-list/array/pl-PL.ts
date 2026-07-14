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
    ARRAY_CONSTRAIN: {
        description: 'Ogranicza wynik tablicowy do określonego rozmiaru.',
        abstract: 'Ogranicza wynik tablicowy do określonego rozmiaru.',
        links: [{ title: 'Instrukcje', url: 'https://support.google.com/docs/answer/3267036?hl=pl' }],
        functionParameter: {
            inputRange: { name: 'zakres_wejściowy', detail: 'Zakres, który ma zostać ograniczony.' },
            numRows: { name: 'liczba_wierszy', detail: 'Liczba wierszy, które ma zawierać wynik.' },
            numCols: { name: 'liczba_kolumn', detail: 'Liczba kolumn, które ma zawierać wynik.' },
        },
    },
    FLATTEN: {
        description: 'Spłaszcza wszystkie wartości z co najmniej jednego zakresu do jednej kolumny.',
        abstract: 'Spłaszcza wszystkie wartości z co najmniej jednego zakresu do jednej kolumny.',
        links: [{ title: 'Instrukcje', url: 'https://support.google.com/docs/answer/10307761?hl=pl' }],
        functionParameter: {
            range1: { name: 'zakres1', detail: 'Pierwszy zakres do spłaszczenia.' },
            range2: { name: 'zakres2', detail: '[opcjonalny, powtarzalny] Dodatkowe zakresy do spłaszczenia.' },
        },
    },
};

export default locale;
