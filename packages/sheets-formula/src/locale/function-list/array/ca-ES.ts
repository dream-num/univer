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
        description: 'Restringeix un resultat de matriu a una mida especificada.',
        abstract: 'Restringeix un resultat de matriu a una mida especificada.',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.google.com/docs/answer/3267036?hl=en&sjid=8484774178571403392-AP',
            },
        ],
        functionParameter: {
            inputRange: { name: 'interval_entrada', detail: "L'interval a restringir." },
            numRows: { name: 'num_files', detail: 'El nombre de files que ha de contenir el resultat.' },
            numCols: { name: 'num_columnes', detail: 'El nombre de columnes que ha de contenir el resultat' },
        },
    },
    FLATTEN: {
        description: 'Aplana tots els valors d’un o més intervals en una sola columna.',
        abstract: 'Aplana tots els valors d’un o més intervals en una sola columna.',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.google.com/docs/answer/10307761?hl=zh-Hans&sjid=17375453483079636084-AP',
            },
        ],
        functionParameter: {
            range1: { name: 'interval1', detail: 'El primer interval a aplanar.' },
            range2: { name: 'interval2', detail: 'Intervals addicionals a aplanar.' },
        },
    },
};

export default locale;
