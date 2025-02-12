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
    'sheets-filter': {
        toolbar: {
            'smart-toggle-filter-tooltip': 'Toggle Filter',
            'clear-filter-criteria': 'Clear Filter Conditions',
            're-calc-filter-conditions': 'Re-calc Filter Conditions',
        },
        command: {
            'not-valid-filter-range': 'The selected range only has one row and not valid for filter.',
        },
        shortcut: {
            'smart-toggle-filter': 'Toggle Filter',
        },
        panel: {
            'clear-filter': 'Clear Filter',
            cancel: 'Cancel',
            confirm: 'Confirm',
            'by-values': 'By Values',
            'by-conditions': 'By Conditions',
            'filter-only': 'Filter Only',
            'search-placeholder': 'Use space to separate keywords',
            'select-all': 'Select All',
            'input-values-placeholder': 'Input Values',
            and: 'AND',
            or: 'OR',
            empty: '(empty)',
            '?': 'Use “?” to represent a single character.',
            '*': 'Use “*” to represent multiple characters.',
        },
        conditions: {
            none: 'None',
            empty: 'Is Empty',
            'not-empty': 'Is Not Empty',
            'text-contains': 'Text Contains',
            'does-not-contain': 'Text Does Not Contain',
            'starts-with': 'Text Starts With',
            'ends-with': 'Text Ends With',
            equals: 'Text Equals',
            'greater-than': 'Greater Than',
            'greater-than-or-equal': 'Greater Than Or Equal To',
            'less-than': 'Less Than',
            'less-than-or-equal': 'Less Than Or Equal To',
            equal: 'Equal',
            'not-equal': 'Not Equal',
            between: 'Between',
            'not-between': 'Not Between',
            custom: 'Custom',
        },
        msg: {
            'filter-header-forbidden': 'You can\'t move the header row of a filter.',
        },
        date: {
            1: 'January',
            2: 'February',
            3: 'March',
            4: 'April',
            5: 'May',
            6: 'June',
            7: 'July',
            8: 'August',
            9: 'September',
            10: 'October',
            11: 'November',
            12: 'December',
        },
    },
};

export default locale;
