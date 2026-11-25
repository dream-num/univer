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

import type { LocaleType } from '@univerjs/core';
import { getCurrencySymbolByLocale } from '@univerjs/core';

const currencyIcons: Readonly<Record<string, string>> = {
    '€': 'EuroIcon',
    '₽': 'RoubleIcon',
    '¥': 'RmbIcon',
    '₫': 'DongIcon',
    '﷼': 'RialIcon',
    '₩': 'WonIcon',
    Rp: 'RupiahIcon',
    zł: 'ZlotyIcon',
};

/**
 * Get the currency symbol icon based on the locale.
 */
export function getCurrencySymbolIconByLocale(locale: LocaleType) {
    const symbol = getCurrencySymbolByLocale(locale);
    return { icon: currencyIcons[symbol] ?? 'DollarIcon', symbol, locale };
}

/**
 * Get the currency format string based on the locale and number of digits.
 */
export function getCurrencyFormat(locale: LocaleType, numberDigits: number = 2): string {
    let _numberDigits = numberDigits;

    if (numberDigits > 127) {
        _numberDigits = 127;
    }

    let decimal = '';

    if (_numberDigits > 0) {
        decimal = `.${'0'.repeat(_numberDigits)}`;
    }

    return `"${getCurrencySymbolByLocale(locale)}"#,##0${decimal}_);[Red]("${getCurrencySymbolByLocale(locale)}"#,##0${decimal})`;
}
