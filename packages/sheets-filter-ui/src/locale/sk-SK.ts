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
    'sheets-filter': {
        toolbar: {
            'smart-toggle-filter-tooltip': 'Prepnúť filter',
            'clear-filter-criteria': 'Vymazať podmienky filtra',
            're-calc-filter-conditions': 'Prepočítať podmienky filtra',
        },
        command: {
            'not-valid-filter-range': 'Vybraný rozsah má iba jeden riadok a nie je vhodný na filtrovanie.',
        },
        shortcut: {
            'smart-toggle-filter': 'Prepnúť filter',
        },
        panel: {
            'clear-filter': 'Vymazať filter',
            cancel: 'Zrušiť',
            confirm: 'Potvrdiť',
            'by-values': 'Podľa hodnôt',
            'by-colors': 'Podľa farieb',
            'filter-by-cell-fill-color': 'Filtrovať podľa farby výplne bunky',
            'filter-by-cell-text-color': 'Filtrovať podľa farby textu bunky',
            'filter-by-color-none': 'Stĺpec obsahuje iba jednu farbu',
            'by-conditions': 'Podľa podmienok',
            'filter-only': 'Len filtrovať',
            'search-placeholder': 'Použite medzeru na oddelenie kľúčových slov',
            'select-all': 'Vybrať všetko',
            'input-values-placeholder': 'Zadajte hodnoty',
            and: 'A',
            or: 'ALEBO',
            empty: '(prázdne)',
            '?': 'Použite „?“ na označenie jedného znaku.',
            '*': 'Použite „*“ na označenie viacerých znakov.',
        },
        conditions: {
            none: 'Žiadne',
            empty: 'Je prázdne',
            'not-empty': 'Nie je prázdne',
            'text-contains': 'Text obsahuje',
            'does-not-contain': 'Text neobsahuje',
            'starts-with': 'Text začína na',
            'ends-with': 'Text končí na',
            equals: 'Text sa rovná',
            'greater-than': 'Väčšie ako',
            'greater-than-or-equal': 'Väčšie alebo rovné',
            'less-than': 'Menšie ako',
            'less-than-or-equal': 'Menšie alebo rovné',
            equal: 'Rovné',
            'not-equal': 'Nie je rovné',
            between: 'Medzi',
            'not-between': 'Nie medzi',
            custom: 'Vlastné',
        },
        msg: {
            'filter-header-forbidden': 'Riadok hlavičky filtra sa nedá presunúť.',
        },
        date: {
            1: 'Január',
            2: 'Február',
            3: 'Marec',
            4: 'Apríl',
            5: 'Máj',
            6: 'Jún',
            7: 'Júl',
            8: 'August',
            9: 'September',
            10: 'Október',
            11: 'November',
            12: 'December',
        },
        sync: {
            title: 'Filter je viditeľný pre všetkých',
            statusTips: {
                on: 'Po zapnutí budú všetci spolupracovníci vidieť výsledky filtra',
                off: 'Po vypnutí budete výsledky filtra vidieť iba vy',
            },
            switchTips: {
                on: '"Filter je viditeľný pre všetkých" je zapnutý, všetci spolupracovníci uvidia výsledky filtra',
                off: '"Filter je viditeľný pre všetkých" je vypnutý, výsledky filtra uvidíte iba vy',
            },
        },
    },
};

export default locale;
