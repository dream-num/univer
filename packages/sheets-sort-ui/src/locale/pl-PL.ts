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
    'sheets-sort-ui': {
        general: {
            sort: 'Sortuj',
            'sort-asc': 'Rosnąco',
            'sort-desc': 'Malejąco',
            'sort-custom': 'Sortowanie niestandardowe',
            'sort-asc-ext': 'Rozszerz rosnąco',
            'sort-desc-ext': 'Rozszerz malejąco',
            'sort-asc-cur': 'Rosnąco',
            'sort-desc-cur': 'Malejąco',
        },
        error: {
            'merge-size': 'Wybrany zakres zawiera scalone komórki o różnych rozmiarach, których nie można sortować.',
            empty: 'Wybrany zakres nie zawiera treści i nie można go sortować.',
            single: 'Wybrany zakres ma tylko jeden wiersz i nie można go sortować.',
            'formula-array': 'Wybrany zakres zawiera formuły tablicowe i nie można go sortować.',
        },
        dialog: {
            'sort-reminder': 'Przypomnienie o sortowaniu',
            'sort-reminder-desc': 'Rozszerzyć sortowanie zakresu czy zachować sortowanie zakresu?',
            'sort-reminder-ext': 'Rozszerz sortowanie zakresu',
            'sort-reminder-no': 'Zachowaj sortowanie zakresu',
            'first-row-check': 'Pierwszy wiersz nie bierze udziału w sortowaniu',
            'add-condition': 'Dodaj warunek',
            cancel: 'Anuluj',
            confirm: 'Potwierdź',
        },
        info: {
            tooltip: 'Podpowiedź',
        },
    },
};

export default locale;
