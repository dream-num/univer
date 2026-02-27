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
        description: 'Obmedzí výsledok poľa na zadanú veľkosť.',
        abstract: 'Obmedzí výsledok poľa na zadanú veľkosť.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.google.com/docs/answer/3267036?hl=en&sjid=8484774178571403392-AP',
            },
        ],
        functionParameter: {
            inputRange: { name: 'vstupný_rozsah', detail: 'Rozsah na obmedzenie.' },
            numRows: { name: 'počet_riadkov', detail: 'Počet riadkov, ktoré má výsledok obsahovať.' },
            numCols: { name: 'počet_stĺpcov', detail: 'Počet stĺpcov, ktoré má výsledok obsahovať.' },
        },
    },
    FLATTEN: {
        description: 'Zploští všetky hodnoty z jedného alebo viacerých rozsahov do jedného stĺpca.',
        abstract: 'Zploští všetky hodnoty z jedného alebo viacerých rozsahov do jedného stĺpca.',
        links: [
            {
                title: 'Inštrukcia',
                url: 'https://support.google.com/docs/answer/10307761?hl=zh-Hans&sjid=17375453483079636084-AP',
            },
        ],
        functionParameter: {
            range1: { name: 'rozsah1', detail: 'Prvý rozsah na zploštenie.' },
            range2: { name: 'rozsah2', detail: 'Ďalšie rozsahy na zploštenie.' },
        },
    },
};

export default locale;
