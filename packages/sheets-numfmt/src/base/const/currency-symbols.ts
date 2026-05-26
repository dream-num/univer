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

import { LocaleType } from '@univerjs/core';

export const localeCurrencySymbolMap = new Map<LocaleType, string>([
    [LocaleType.EN_US, '$'],
    [LocaleType.RU_RU, '₽'],
    [LocaleType.VI_VN, '₫'],
    [LocaleType.ZH_CN, '¥'],
    [LocaleType.ZH_TW, 'NT$'],
    [LocaleType.ZH_HK, 'HK$'],
    [LocaleType.FR_FR, '€'],
    [LocaleType.FA_IR, '﷼'],
    [LocaleType.KO_KR, '₩'],
    [LocaleType.ES_ES, '€'],
    [LocaleType.CA_ES, '€'],
    [LocaleType.SK_SK, '€'],
    [LocaleType.JA_JP, '¥'],
    [LocaleType.PT_BR, 'R$'],
    [LocaleType.DE_DE, '€'],
    [LocaleType.IT_IT, '€'],
    [LocaleType.ID_ID, 'Rp'],
    [LocaleType.PL_PL, 'zł'],
    [LocaleType.AR_SA, '﷼'],
]);

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
                symbol: localeCurrencySymbolMap.get(locale) || '€',
                locale,
            };
        case LocaleType.RU_RU:
            return {
                icon: 'RoubleIcon',
                symbol: localeCurrencySymbolMap.get(locale) || '₽',
                locale,
            };
        case LocaleType.JA_JP:
        case LocaleType.ZH_CN:
            return {
                icon: 'RmbIcon',
                symbol: localeCurrencySymbolMap.get(locale) || '¥',
                locale,
            };
        case LocaleType.AR_SA:
        case LocaleType.EN_US:
        case LocaleType.FA_IR:
        case LocaleType.ID_ID:
        case LocaleType.KO_KR:
        case LocaleType.PL_PL:
        case LocaleType.PT_BR:
        case LocaleType.VI_VN:
        case LocaleType.ZH_HK:
        case LocaleType.ZH_TW:
        default:
            return {
                icon: 'DollarIcon',
                symbol: localeCurrencySymbolMap.get(locale) || '$',
                locale,
            };
    }
}

/**
 * Get the currency symbol by locale.
 */
export function getCurrencySymbolByLocale(locale: LocaleType): string {
    return localeCurrencySymbolMap.get(locale) || '$';
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
