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

import { getCurrencySymbolByLocale, LocaleType } from '@univerjs/core';

/**
 * Get the currency symbol icon based on the locale.
 */
export function getCurrencySymbolIconByLocale(locale: LocaleType) {
    switch (locale) {
        case LocaleType.CA_ES:
        case LocaleType.DE_DE:
        case LocaleType.ES_ES:
        case LocaleType.FR_FR:
        case LocaleType.IT_IT:
        case LocaleType.SK_SK:
            return {
                icon: 'EuroIcon',
                symbol: getCurrencySymbolByLocale(locale),
                locale,
            };
        case LocaleType.RU_RU:
            return {
                icon: 'RoubleIcon',
                symbol: getCurrencySymbolByLocale(locale),
                locale,
            };
        case LocaleType.JA_JP:
        case LocaleType.ZH_CN:
            return {
                icon: 'RmbIcon',
                symbol: getCurrencySymbolByLocale(locale),
                locale,
            };
        case LocaleType.VI_VN:
            return {
                icon: 'DongIcon',
                symbol: getCurrencySymbolByLocale(locale),
                locale,
            };
        case LocaleType.AR_SA:
        case LocaleType.FA_IR:
            return {
                icon: 'RialIcon',
                symbol: getCurrencySymbolByLocale(locale),
                locale,
            };
        case LocaleType.KO_KR:
            return {
                icon: 'WonIcon',
                symbol: getCurrencySymbolByLocale(locale),
                locale,
            };
        case LocaleType.ID_ID:
            return {
                icon: 'RupiahIcon',
                symbol: getCurrencySymbolByLocale(locale),
                locale,
            };
        case LocaleType.PL_PL:
            return {
                icon: 'ZlotyIcon',
                symbol: getCurrencySymbolByLocale(locale),
                locale,
            };
        case LocaleType.EN_US:
        case LocaleType.PT_BR:
        case LocaleType.ZH_HK:
        case LocaleType.ZH_TW:
        default:
            return {
                icon: 'DollarIcon',
                symbol: getCurrencySymbolByLocale(locale),
                locale,
            };
    }
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
