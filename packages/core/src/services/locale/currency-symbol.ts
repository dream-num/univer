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

import { getRegionTag, LocaleType } from '../../types/enum/locale-type';

const localeCurrencySymbols: readonly (readonly [string, string])[] = [
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
    ['en-IN', '₹'],
];

const localeCurrencySymbolMap = new Map(
    localeCurrencySymbols.map(([locale, symbol]) => [getRegionTag(locale).toLowerCase(), symbol] as const)
);

export function getCurrencySymbolByLocale(locale: string): string {
    return localeCurrencySymbolMap.get(getRegionTag(locale).toLowerCase()) ?? '$';
}
