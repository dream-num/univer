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
    'sheets-sort': {
        general: {
            sort: 'Triediť',
            'sort-asc': 'Vzostupne',
            'sort-desc': 'Zostupne',
            'sort-custom': 'Vlastné triedenie',
            'sort-asc-ext': 'Rozšíriť vzostupne',
            'sort-desc-ext': 'Rozšíriť zostupne',
            'sort-asc-cur': 'Vzostupne',
            'sort-desc-cur': 'Zostupne',
        },
        error: {
            'merge-size': 'Vybraný rozsah obsahuje zlúčené bunky rôznych veľkostí, ktoré nie je možné triediť.',
            empty: 'Vybraný rozsah nemá žiadny obsah a nedá sa triediť.',
            single: 'Vybraný rozsah má iba jeden riadok a nedá sa triediť.',
            'formula-array': 'Vybraný rozsah obsahuje maticové vzorce a nedá sa triediť.',
        },
        dialog: {
            'sort-reminder': 'Upozornenie na triedenie',
            'sort-reminder-desc': 'Rozšíriť triedenie rozsahu alebo zachovať triedenie rozsahu?',
            'sort-reminder-ext': 'Rozšíriť triedenie rozsahu',
            'sort-reminder-no': 'Zachovať triedenie rozsahu',
            'first-row-check': 'Prvý riadok sa nezúčastňuje triedenia',
            'add-condition': 'Pridať podmienku',
            cancel: 'Zrušiť',
            confirm: 'Potvrdiť',
        },
    },
};

export default locale;
