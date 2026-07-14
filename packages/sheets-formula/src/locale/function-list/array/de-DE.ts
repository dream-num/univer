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
        description: 'Beschränkt ein Array-Ergebnis auf eine angegebene Größe.',
        abstract: 'Beschränkt ein Array-Ergebnis auf eine angegebene Größe.',
        links: [{ title: 'Anleitung', url: 'https://support.google.com/docs/answer/3267036?hl=de' }],
        functionParameter: {
            inputRange: { name: 'Eingabebereich', detail: 'Der zu beschränkende Bereich.' },
            numRows: { name: 'Zeilenanzahl', detail: 'Die Anzahl der Zeilen, die das Ergebnis enthalten soll.' },
            numCols: { name: 'Spaltenanzahl', detail: 'Die Anzahl der Spalten, die das Ergebnis enthalten soll.' },
        },
    },
    FLATTEN: {
        description: 'Fasst alle Werte aus einem oder mehreren Bereichen in einer einzigen Spalte zusammen.',
        abstract: 'Fasst alle Werte aus einem oder mehreren Bereichen in einer einzigen Spalte zusammen.',
        links: [{ title: 'Anleitung', url: 'https://support.google.com/docs/answer/10307761?hl=de' }],
        functionParameter: {
            range1: { name: 'Bereich1', detail: 'Der erste zusammenzufassende Bereich.' },
            range2: { name: 'Bereich2', detail: '[optional, wiederholbar] Weitere zusammenzufassende Bereiche.' },
        },
    },
};

export default locale;
