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

import type zhCN from './zh-CN';

const locale: typeof zhCN = {
    'sheets-sort': {
        general: {
            sort: 'Sort',
            'sort-asc': 'Ascending',
            'sort-desc': 'Descending',
            'sort-custom': 'Custom Sort',
            'sort-asc-ext': 'Expand Ascending',
            'sort-desc-ext': 'Expand Descending',
            'sort-asc-cur': 'Ascending',
            'sort-desc-cur': 'Descending',
        },
        error: {
            'merge-size': 'The selected range contains merged cells of different sizes, which cannot be sorted.',
            empty: 'The selected range has no content and cannot be sorted.',
            single: 'The selected range has only one row and cannot be sorted.',
            'formula-array': 'The selected range has array formulas and cannot be sorted.',
        },
        dialog: {
            'sort-reminder': 'Sort Reminder',
            'sort-reminder-desc': 'Extend range sorting or keep range sorting?',
            'sort-reminder-ext': 'Extend range sorting',
            'sort-reminder-no': 'Keep range sorting',
            'first-row-check': 'First row does not participate in sorting',
            'add-condition': 'Add condition',
            cancel: 'Cancel',
            confirm: 'Confirm',
        },
    },
};

export default locale;
