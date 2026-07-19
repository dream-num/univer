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
        description: 'Limita il risultato di una matrice alle dimensioni specificate.',
        abstract: 'Limita il risultato di una matrice alle dimensioni specificate.',
        links: [{ title: 'Istruzioni', url: 'https://support.google.com/docs/answer/3267036?hl=it' }],
        functionParameter: {
            inputRange: { name: 'intervallo_input', detail: 'L’intervallo da limitare.' },
            numRows: { name: 'numero_righe', detail: 'Il numero di righe che il risultato deve contenere.' },
            numCols: { name: 'numero_colonne', detail: 'Il numero di colonne che il risultato deve contenere.' },
        },
    },
    FLATTEN: {
        description: 'Riunisce tutti i valori di uno o più intervalli in una singola colonna.',
        abstract: 'Riunisce tutti i valori di uno o più intervalli in una singola colonna.',
        links: [{ title: 'Istruzioni', url: 'https://support.google.com/docs/answer/10307761?hl=it' }],
        functionParameter: {
            range1: { name: 'intervallo1', detail: 'Il primo intervallo da riunire.' },
            range2: { name: 'intervallo2', detail: '[facoltativo, ripetibile] Altri intervalli da riunire.' },
        },
    },
};

export default locale;
