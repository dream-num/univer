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
    'find-replace': {
        toolbar: 'Hľadať a nahradiť',
        shortcut: {
            'open-find-dialog': 'Otvoriť dialógové okno hľadania',
            'open-replace-dialog': 'Otvoriť dialógové okno nahradenia',
            'close-dialog': 'Zavrieť dialógové okno hľadania a nahradenia',
            'go-to-next-match': 'Prejsť na ďalšiu zhodu',
            'go-to-previous-match': 'Prejsť na predchádzajúcu zhodu',
            'focus-selection': 'Zamerať výber',
            panel: 'Hľadať a nahradiť',
        },
        dialog: {
            title: 'Hľadať',
            find: 'Hľadať',
            replace: 'Nahradiť',
            'replace-all': 'Nahradiť všetko',
            'case-sensitive': 'Rozlišovať veľké a malé písmená',
            'find-placeholder': 'Hľadať v tomto hárku',
            'advanced-finding': 'Pokročilé hľadanie a nahradenie',
            'replace-placeholder': 'Zadajte reťazec na nahradenie',
            'match-the-whole-cell': 'Zhoda s celou bunkou',
            'find-direction': {
                title: 'Smer hľadania',
                row: 'Hľadať podľa riadkov',
                column: 'Hľadať podľa stĺpcov',
            },
            'find-scope': {
                title: 'Rozsah hľadania',
                'current-sheet': 'Aktuálny hárok',
                workbook: 'Zošit',
            },
            'find-by': {
                title: 'Hľadať podľa',
                value: 'Hľadať podľa hodnoty',
                formula: 'Hľadať vzorec',
            },
            'no-match': 'Hľadanie bolo dokončené, ale nenašla sa žiadna zhoda.',
            'no-result': 'Žiadne výsledky',
        },
        replace: {
            'all-success': 'Všetkých {0} zhôd bolo nahradených',
            'partial-success': 'Nahradených {0} zhôd, {1} sa nepodarilo nahradiť',
            'all-failure': 'Nahradenie zlyhalo',
            confirm: {
                title: 'Ste si istí, že chcete nahradiť všetky zhody?',
            },
        },
        button: {
            confirm: 'OK',
            cancel: 'Zrušiť',
        },
    },
};

export default locale;
