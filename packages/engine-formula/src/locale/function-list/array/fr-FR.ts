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
        description: 'Limite le résultat d\'un tableau à une taille donnée.',
        abstract: 'Limite le résultat d\'un tableau à une taille donnée.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3267036?hl=fr',
            },
        ],
        functionParameter: {
            inputRange: { name: 'input_range', detail: 'ARRAY_CONSTRAIN(SORT(A1:F100, 1, TRUE), 10, 6)' },
            numRows: { name: 'num_rows', detail: 'Le nombre de lignes que le résultat doit contenir.' },
            numCols: { name: 'num_cols', detail: 'Le nombre de colonnes que le résultat doit contenir.' },
        },
    },
    FLATTEN: {
        description: 'Agrège toutes les valeurs d\'une ou de plusieurs plages en une seule colonne.',
        abstract: 'Agrège toutes les valeurs d\'une ou de plusieurs plages en une seule colonne.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/10307761?hl=fr',
            },
        ],
        functionParameter: {
            range1: { name: 'range1', detail: 'Première plage à agréger.' },
            range2: { name: 'range2', detail: '[facultatif] répétable Autres plages à agréger.' },
        },
    },
};

export default locale;
