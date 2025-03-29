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
    sheet: {
        numfmt: {
            title: 'Number format',
            numfmtType: 'Format types',
            cancel: 'Cancel',
            confirm: 'Confirm',
            general: 'General',
            accounting: 'Accounting',
            text: 'Text',
            number: 'Number',
            percent: 'Percentage',
            scientific: 'Scientific',
            currency: 'Currency',
            date: 'Date',
            time: 'Time',
            thousandthPercentile: 'Thousands separator',
            preview: 'Preview',
            dateTime: 'Date and time',
            decimalLength: 'Decimal places',
            currencyType: 'Currency Symbol',
            moreFmt: 'Formats',
            financialValue: 'Financial value',
            roundingCurrency: 'Rounding up the currency',
            timeDuration: 'Duration Time',
            currencyDes: 'The currency format is used to represent general currency values. The accounting format aligns a column of values with decimal points',
            accountingDes: 'The accounting number format aligns a column of values with currency symbols and decimal points',
            dateType: 'Date Type',
            dateDes: 'The date format presents date and time series values as date values.',
            negType: 'A negative number type',
            generalDes: 'The regular format does not contain any specific number format.',
            thousandthPercentileDes: 'The percentile format is used for the representation of ordinary numbers. Monetary and accounting formats provide a specialized format for monetary value calculations.',
            addDecimal: 'Increase decimal places',
            subtractDecimal: 'Decreasing decimal places',
            customFormat: 'Custom Format',
            customFormatDes: 'Generate custom number formats based on existing formats.',
        },
    },
};

export default locale;
