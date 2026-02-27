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
            'open-find-dialog': 'Otvoriť dialóg Hľadať',
            'open-replace-dialog': 'Otvoriť dialóg Nahradiť',
            'close-dialog': 'Zavrieť dialóg Hľadať a nahradiť',
            'go-to-next-match': 'Prejsť na ďalšiu zhodu',
            'go-to-previous-match': 'Prejsť na predchádzajúcu zhodu',
            'focus-selection': 'Zamerať výber',
        },
        dialog: {
            title: 'Hľadať',
            find: 'Hľadať',
            replace: 'Nahradiť',
            'replace-all': 'Nahradiť všetko',
            'case-sensitive': 'Rozlišovať veľkosť písmen',
            'find-placeholder': 'Hľadať v tomto hárku',
            'advanced-finding': 'Rozšírené hľadanie a nahrádzanie',
            'replace-placeholder': 'Zadajte reťazec na nahradenie',
            'match-the-whole-cell': 'Zhodovať celú bunku',
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
                formula: 'Hľadať podľa vzorca',
            },
            'no-match': 'Hľadanie dokončené, ale nenašla sa zhoda.',
            'no-result': 'Žiadny výsledok',
        },
        replace: {
            'all-success': 'Nahradených všetkých {0} zhôd',
            'all-failure': 'Nahradenie zlyhalo',
            confirm: {
                title: 'Naozaj nahradiť všetky zhody?',
            },
        },
    },
    'find-replace-shortcuts': 'Hľadať a nahradiť',
};

export default locale;
