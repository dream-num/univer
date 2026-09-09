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

import type { LocaleKey } from '../locale/types';
import { DEFAULT_TEXT_FORMAT_EXCEL } from '@univerjs/core';

export const MENU_OPTIONS = (currencySymbol: string): Array<{
    label: LocaleKey;
    pattern: string | null;
} | '|'> => {
    return [
        {
            label: 'sheets-numfmt-ui.general',
            pattern: null,
        },
        {
            label: 'sheets-numfmt-ui.text',
            pattern: DEFAULT_TEXT_FORMAT_EXCEL,
        },
        '|',
        {
            label: 'sheets-numfmt-ui.number',
            pattern: '0',
        },
        {
            label: 'sheets-numfmt-ui.percent',
            pattern: '0.00%',
        },
        {
            label: 'sheets-numfmt-ui.scientific',
            pattern: '0.00E+00',
        },
        '|',
        {
            label: 'sheets-numfmt-ui.accounting',
            pattern: `"${currencySymbol}" #,##0.00_);[Red]("${currencySymbol}"#,##0.00)`,
        },
        {
            label: 'sheets-numfmt-ui.financialValue',
            pattern: '#,##0.00;[Red]#,##0.00',
        },
        {
            label: 'sheets-numfmt-ui.currency',
            pattern: `"${currencySymbol}"#,##0.00_);[Red]("${currencySymbol}"#,##0.00)`,
        },
        {
            label: 'sheets-numfmt-ui.roundingCurrency',
            pattern: `"${currencySymbol}"#,##0;[Red]"${currencySymbol}"#,##0`,
        },
        '|',
        {
            label: 'sheets-numfmt-ui.date',
            pattern: 'yyyy-mm-dd;@',
        },
        {
            label: 'sheets-numfmt-ui.time',
            pattern: 'am/pm h":"mm":"ss',
        },
        {
            label: 'sheets-numfmt-ui.dateTime',
            pattern: 'yyyy-m-d am/pm h:mm',
        },
        {
            label: 'sheets-numfmt-ui.timeDuration',
            pattern: '[h]:mm:ss',
        },
        '|',
        {
            label: 'sheets-numfmt-ui.moreFmt',
            pattern: '',
        },
    ];
};
