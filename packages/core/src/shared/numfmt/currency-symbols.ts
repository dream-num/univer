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

// Windows GetLocaleInfoEx(LOCALE_SCURRENCY), without user overrides. Territory defaults
// are shared across languages unless a specific BCP 47 tag selects another symbol.
// CLDR territory-currency data supplies inhabited territories without an NLS locale.
const currencyRegions: ReadonlyArray<readonly [string, string]> = [
    ['XDR', '001 150 419'],
    ['EC$', '029'],
    ['£', 'AC FK GB GG GI GS IM JE SH SS TA'],
    ['€', 'AD AT AX BE BL CY DE EA EE ES EU FI FR GF GP GR HR IC IE IT LT LU LV MC ME MF MQ MT NL PM PT RE SI SK SM TF VA XK YT'],
    ['د.إ.\u200F', 'AE'],
    ['؋', 'AF'],
    ['$', 'AG AI AR AS AU BB BM BN BQ BS BZ CA CC CK CL CO CU CX DG DM DO EC FJ GD GU GY HK HM JM KI KN KY LC LR MH MP MS MX NA NF NR NU NZ PN PR SB SG SR SV TK TL TT TV UM US UY VC VI ZW pap-Latn-029'],
    ['Lekë', 'AL'],
    ['֏', 'AM'],
    ['Kz', 'AO'],
    ['Afl.', 'AW'],
    ['₼', 'AZ'],
    ['KM', 'BA'],
    ['৳', 'BD'],
    ['F\u202FCFA', 'BF BJ CI GW ML NE SN TG'],
    ['лв.', 'BG'],
    ['د.ب.\u200F', 'BH'],
    ['FBu', 'BI'],
    ['Bs', 'BO'],
    ['R$', 'BR'],
    ['Nu.', 'BT'],
    ['kr', 'BV FO NO SE SJ'],
    ['P', 'BW'],
    ['Br', 'BY ET'],
    ['FC', 'CD'],
    ['FCFA', 'CF CG CM GA GQ TD'],
    ['CHF', 'CH LI'],
    ['¥', 'CN JP'],
    ['₡', 'CR'],
    ['​', 'CV'],
    ['NAf.', 'CW SX'],
    ['Kč', 'CZ'],
    ['Fdj', 'DJ'],
    ['kr.', 'DK GL IS'],
    ['DA', 'DZ'],
    ['ج.م.\u200F', 'EG'],
    ['MAD', 'EH MA'],
    ['Nfk', 'ER'],
    ['US$', 'FM IO PW TC VG en-Latn-ZW'],
    ['₾', 'GE'],
    ['GH₵', 'GH'],
    ['D', 'GM'],
    ['FG', 'GN'],
    ['Q', 'GT'],
    ['L', 'HN MD'],
    ['G', 'HT'],
    ['Ft', 'HU'],
    ['Rp', 'ID'],
    ['₪', 'IL PS'],
    ['₹', 'IN'],
    ['د.ع.\u200F', 'IQ'],
    ['IRR', 'IR'],
    ['د.ا.\u200F', 'JO'],
    ['Ksh', 'KE'],
    ['сом', 'KG'],
    ['៛', 'KH'],
    ['CF', 'KM'],
    ['₩', 'KP KR'],
    ['د.ك.\u200F', 'KW'],
    ['₸', 'KZ'],
    ['₭', 'LA'],
    ['ل.ل.\u200F', 'LB'],
    ['රු.', 'LK'],
    ['R', 'LS ZA'],
    ['د.ل.\u200F', 'LY'],
    ['Ar', 'MG'],
    ['ден.', 'MK'],
    ['K', 'MM PG ZM'],
    ['₮', 'MN'],
    ['MOP$', 'MO'],
    ['UM', 'MR'],
    ['Rs', 'MU PK'],
    ['ރ.', 'MV'],
    ['MK', 'MW'],
    ['RM', 'MY'],
    ['MTn', 'MZ'],
    ['FCFP', 'NC PF WF'],
    ['₦', 'NG'],
    ['C$', 'NI'],
    ['रु', 'NP'],
    ['ر.ع.\u200F', 'OM'],
    ['B/.', 'PA'],
    ['S/', 'PE'],
    ['₱', 'PH'],
    ['zł', 'PL'],
    ['₲', 'PY'],
    ['ر.ق.\u200F', 'QA'],
    ['lei', 'RO'],
    ['дин.', 'RS'],
    ['₽', 'RU'],
    ['RF', 'RW'],
    ['⃁', 'SA'],
    ['SR', 'SC'],
    ['ج.س.', 'SD'],
    ['Le', 'SL'],
    ['S', 'SO'],
    ['Db', 'ST'],
    ['ل.س.\u200F', 'SY'],
    ['E', 'SZ'],
    ['฿', 'TH'],
    ['смн', 'TJ'],
    ['m.', 'TM'],
    ['د.ت.\u200F', 'TN'],
    ['T$', 'TO'],
    ['₺', 'TR'],
    ['NT$', 'TW'],
    ['TSh', 'TZ'],
    ['₴', 'UA'],
    ['USh', 'UG'],
    ['сўм', 'UZ'],
    ['Bs.S', 'VE'],
    ['₫', 'VN'],
    ['VT', 'VU'],
    ['WS$', 'WS'],
    ['ر.ي.\u200F', 'YE'],
    ['ብር', 'am-Ethi-ET'],
    ['د.ج.\u200F', 'ar-Arab-DZ'],
    ['د.م.\u200F', 'ar-Arab-MA tzm-Arab-MA'],
    ['أ.م.', 'ar-Arab-MR'],
    ['КМ', 'bs-Cyrl-BA sr-Cyrl-BA'],
    ['AED', 'en-Latn-AE'],
    ['Rf', 'en-Latn-MV'],
    ['SDG', 'en-Latn-SD'],
    ['ريال', 'fa-Arab-IR'],
    ['𞤅𞤊𞤀', 'ff-Adlm-BF ff-Adlm-GW ff-Adlm-NE ff-Adlm-SN'],
    ['𞤊𞤅𞤊𞤀', 'ff-Adlm-CM'],
    ['𞤊𞤘', 'ff-Adlm-GN'],
    ['CFA', 'ff-Latn-SN'],
    ['DH', 'fr-Latn-MA'],
    ['LS', 'fr-Latn-SY'],
    ['DT', 'fr-Latn-TN'],
    ['ߖߕ.', 'nqo-Nkoo-GN'],
    ['Bs.', 'qu-Latn-BO'],
    ['den', 'sq-Latn-MK'],
    ['RSD', 'sr-Latn-RS'],
    ['ܠ.ܣ.\u200F', 'syr-Syrc-SY'],
    ['Rs.', 'ta-Taml-LK'],
    ['ⴷⵔ', 'tzm-Tfng-MA'],
    ['soʻm', 'uz-Latn-UZ'],
    ['COP', 'yrl-Latn-CO'],
    ['VES', 'yrl-Latn-VE'],
    ['HK$', 'zh-Hant-HK'],
    ['MOP', 'zh-Hant-MO'],
];

export const regionCurrencySymbols = new Map<string, string>();
for (const [symbol, regions] of currencyRegions) {
    for (const region of regions.split(' ')) regionCurrencySymbols.set(region, symbol);
}

// Keep the existing picker order, then include every regional display symbol.
export const currencySymbols = [...new Set([
    'Rp', 'zł', 'NT$', 'R$', 'HK$', '$', '£', '¥',
    '¤', '֏', '؋', '৳', '฿', '៛', '₡', '₦', '₩', '₪', '₫', '€',
    '₭', '₮', '₱', '₲', '₴', '₸', '₹', '₺', '₼', '₽', '₾', '₿', '﷼',
    ...regionCurrencySymbols.values(),
])];

const knownSymbols = new Set(currencySymbols);

export function currencySymbolFromLiteral(value: string): string | undefined {
    const literal = value.trim();
    if (knownSymbols.has(literal)) return literal;
    return literal.match(/\p{Sc}/u)?.[0];
}
