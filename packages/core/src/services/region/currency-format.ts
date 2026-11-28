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

import { regionCurrencySymbols } from '../../shared/numfmt/currency-symbols';
import { getRegionParts, RegionRules } from './region-rules';

export interface IRegionalCurrencyFormat {
    readonly symbol: string;
    readonly positive: string;
    readonly negative: string;
}

// Excel for Mac 16.115. Each layout uses # for the unsigned amount and $ for the currency symbol.
const layouts = new RegionRules<string>();
layouts.add('# $;(# $)', 'sr', '', 'latn');
layouts.add('# $;(# $)', 'sr', 'BA ME', 'latn');
layouts.add('# $;-# $', 'uz', '', 'cyrl');
layouts.add('# $;-# $', 'uz', 'UZ', 'cyrl');
layouts.add('$ #;-$ #', 'ks', 'IN', 'deva');
layouts.add('$#;($#)', 'ks', 'IN', 'aran');
layouts.add('$#;($#)', 'hi kok', 'IN', 'latn');
layouts.add('$#;($#)', 'ff', 'NG', 'adlm');
layouts.add('$#;($#)', 'pa', 'PK', 'aran');
layouts.add('$#;($#)', 'sr', 'XK', 'cyrl');
layouts.add('# $;(# $)', 'en', 'AL PL RO');
layouts.add('# $;(# $)', 'pt', 'PT');
layouts.add('# $;(# $)', 'sr', 'RS XK');
layouts.add('# $;-# $', 'en', '150 BG CZ DE DK ES FI GE GR HU IT RU SE SI UA');
layouts.add('# $;-# $', 'ca', 'AD IT');
layouts.add('# $;-# $', 'fo', 'DK');
layouts.add('# $;-# $', 'oc', 'ES');
layouts.add('# $;-# $', 'pt', 'LU');
layouts.add('# $;-# $', 'sq', 'MK');
layouts.add('# $;-# $', 'sd', 'PK');
layouts.add('# $;-# $', 'yi', 'UA');
layouts.add('#$;(#$)', 'ar', 'AE DZ LY MA TN');
layouts.add('#$;(#$)', 'bn en rhg', 'BD');
layouts.add('$ #;$ -#', 'en', 'AT BE CH NL');
layouts.add('$ #;$ -#', 'de', 'BE CH');
layouts.add('$ #;$ -#', 'fr gsw it pt', 'CH');
layouts.add('$ #;$ -#', 'nds', 'NL');
layouts.add('$ #;$ -#', 'es', 'PY');
layouts.add('$ #;($ #)', 'en', 'AR');
layouts.add('$ #;($ #)', 'es', 'AR BO UY');
layouts.add('$ #;-$ #', 'de', 'AT LI');
layouts.add('$ #;-$ #', 'es', 'BR CO PE');
layouts.add('$ #;-$ #', 'en', 'BR CV MM MV NO SA');
layouts.add('$#;$-#', 'es', 'CL EC VE');
layouts.add('$#;($#)', 'ar', '001 DJ EH ER IL KM MR PS SD SO SS TD');
layouts.add('$#;($#)', 'es', '003 AG BB BM BQ BS BZ CA CW DM DO EA GD GQ GY HT IC KN KY LC PH TC TT VC VG VI');
layouts.add('$#;($#)', 'pt', 'AO GQ GW MO MZ ST TL');
layouts.add('$#;($#)', 'nl', 'AW BQ CW SR SX');
layouts.add('$#;($#)', 'sv', 'AX');
layouts.add('$#;($#)', 'fr', 'BF BI BJ BL CF DJ DZ GA GF GN GP GQ KM MF MG MQ MR MU NC NE PF PM RW SC SY TD TF TG TN VU WF YT');
layouts.add('$#;($#)', 'ff', 'BF CM GH GM GN GW LR MR NE SL SN');
layouts.add('$#;($#)', 'no', 'BV');
layouts.add('$#;($#)', 'iu', 'CA');
layouts.add('$#;($#)', 'sw', 'CD TZ UG');
layouts.add('$#;($#)', 'kk', 'CN');
layouts.add('$#;($#)', 'el tr', 'CY');
layouts.add('$#;($#)', 'ha', 'GH NE NG');
layouts.add('$#;($#)', 'bo ccp mni', 'IN');
layouts.add('$#;($#)', 'syr', 'IQ');
layouts.add('$#;($#)', 'ckb', 'IQ IR');
layouts.add('$#;($#)', 'om', 'KE');
layouts.add('$#;($#)', 'ru', 'KG KZ');
layouts.add('$#;($#)', 'st', 'LS');
layouts.add('$#;($#)', 'nb', 'SJ');
layouts.add('$#;($#)', 'it', 'SM');
layouts.add('$#;($#)', 'shn', 'TH');
layouts.add('$#;($#)', 'tg', 'TJ');
layouts.add('$#;($#)', 'yrl', 'VE');
layouts.add('$#;($#)', 'sq', 'XK');
layouts.add('$#;-$#', 'es', '419 CR CU GT HN MX NI PA PR SV US');
layouts.add('$#;-$#', 'dz', 'BT');
layouts.add('$#;-$#', 'en', 'CL CO EE FR LT LV PT SK');
layouts.add('$#;-$#', 'yrl', 'CO');
layouts.add('$#;-$#', 'ca pt', 'FR');
layouts.add('# $;(# $)', 'bg br ca et eu fo fr gl pl prg ro sk sl sq szl');
layouts.add('# $;-# $', 'ar ast az ba be bs bua ce ckb cs cv da de dsb el es ff fi fur gsw hr hsb hu hy inh is it ka kk ksh ky lb');
layouts.add('# $;-# $', 'lij lmo lt lv mk myv nds os pms ru sah sc scn se sjd sje sju smn sr sv tg tk tt tyv uk vec vi');
layouts.add('#$;(#$)', 'ccp km');
layouts.add('#$;-#$', 'he oc');
layouts.add('$ #;$ -#', 'wa wae');
layouts.add('$ #;($ #)', 'fa fy nb nl nn no');
layouts.add('$ #;-$ #', 'arn bo co dv gn ha ii iu kea kgp mi mn mni moh my ne pa pt qu rhg rw sa sd shn sw syr ts wo yi yrl');
layouts.add('$#;$-#', 'kl lo');
layouts.add('$#;-$#', 'hi id ie kok ks mt nso om st ti tn tr ve xh');

// Unqualified language tags use the measured local symbol, with shared territory defaults below.
const symbols = new RegionRules<string>();
symbols.add('$', 'zh', '', 'hant');
symbols.add('$', 'zh', 'CN HK JP', 'hant');
symbols.add('soʻm', 'uz', 'UZ', 'latn');
symbols.add('¤', 'sr', '', 'latn');
symbols.add('¤', 'az uz', '', 'cyrl');
symbols.add('¥', 'yue zh', '', 'hans');
symbols.add('¥', 'zh', 'HK MO MY', 'hans');
symbols.add('КМ', 'bs', 'BA', 'cyrl');
symbols.add('ر', 'pa', 'PK', 'arab');
symbols.add('$', 'apw bla cho chr cic com cr crj crk crl crm cst csw en fla haw hch iu kio kpe lkt lut mi mic mus naq nez', '');
symbols.add('$', 'nv osa pqm srs trv vai', '');
symbols.add('$', 'zh', 'MO MY');
symbols.add('AED', 'en', 'AE');
symbols.add('ALL', 'en', 'AL');
symbols.add('Ar', 'mg', '');
symbols.add('Br', 'be om ti', '');
symbols.add('Bs', 'qu', '');
symbols.add('CA$', 'moh', '');
symbols.add('CA$', 'moh', 'CA');
symbols.add('CHF', 'rm wae', '');
symbols.add('CLP', 'arn', '');
symbols.add('CLP', 'arn', 'CL');
symbols.add('CZK', 'en', 'CZ');
symbols.add('DZD', 'kab', '');
symbols.add('ETB', 'wal', '');
symbols.add('ETB', 'so wal', 'ET');
symbols.add('FBu', 'rn', '');
symbols.add('FC', 'ln lu', '');
symbols.add('FCFA', 'agq bas dua ewo jgo kkj ksf mgo mua nmg nnh sg yav', '');
symbols.add('FG', 'nqo', '');
symbols.add('Ft', 'hu', '');
symbols.add('F CF', 'blo bm dje dyo khq ses twq wo', '');
symbols.add('G', 'fr', 'HT');
symbols.add('GH₵', 'ak ee gaa', '');
symbols.add('Gs.', 'es', 'PY');
symbols.add('HK$', 'yue', '');
symbols.add('HTG', 'ht', '');
symbols.add('HUF', 'en', 'HU');
symbols.add('IQD', 'mid', '');
symbols.add('IRR', 'lrc mzn', '');
symbols.add('K', 'bem my', '');
symbols.add('K', 'my', 'MM');
symbols.add('KGS', 'ru', 'KG');
symbols.add('Ksh', 'dav ebu guz kam ki kln luo luy mas mer saq sw', '');
symbols.add('Kč', 'cs', '');
symbols.add('Lekë', 'sq', '');
symbols.add('MAD', 'ber shi tzm zgh', '');
symbols.add('MK', 'ny', '');
symbols.add('MKD', 'sq', 'MK');
symbols.add('MMK', 'rhg shn', '');
symbols.add('MTn', 'mgh seh vmw', '');
symbols.add('Nfk', 'byn tig', '');
symbols.add('Nu.', 'dz', '');
symbols.add('PLN', 'prg szl', '');
symbols.add('R', 'af nr nso ss st tn ts ve xh zu', '');
symbols.add('R$', 'kgp pt yrl', '');
symbols.add('RF', 'rw', '');
symbols.add('RM', 'ms', '');
symbols.add('RON', 'ro', '');
symbols.add('RUB', 'ba bua ce cv inh myv sjd tyv', '');
symbols.add('Rf', 'en', 'MV');
symbols.add('Rp', 'id jv rej su', '');
symbols.add('Rs', 'mfe ur', '');
symbols.add('Rs.', 'ta', 'LK');
symbols.add('S', 'so', '');
symbols.add('S/', 'isc shp', '');
symbols.add('SYP', 'fr ku', 'SY');
symbols.add('T$', 'to', '');
symbols.add('THB', 'en shn', 'TH');
symbols.add('TMT', 'tk', '');
symbols.add('TND', 'fr', 'TN');
symbols.add('TSh', 'asa bez jmc kde ksb lag rof rwk sbp vun', '');
symbols.add('USh', 'cgg lg nyn teo xog', '');
symbols.add('WS$', 'sm', '');
symbols.add('ZWG', 'nd sn', '');
symbols.add('kr', 'fo nb no se sje sju sv', '');
symbols.add('kr.', 'da is kl', '');
symbols.add('soʻm', 'uz', '');
symbols.add('zł', 'pl', '');
symbols.add('zł', 'pl', 'PL');
symbols.add('£', 'cy gd gv kw nus', '');
symbols.add('¤', 'es', 'VI');
symbols.add('¥', 'ain bo hmn ii ja ug za', '');
symbols.add('¥', 'zh', 'SG');
symbols.add('ден.', 'mk', '');
symbols.add('сом', 'ky', '');
symbols.add('сом.', 'tg', '');
symbols.add('֏', 'hy', '');
symbols.add('؋', 'ps', '');
symbols.add('د.ج.', 'ar', 'DZ');
symbols.add('د.ع.', 'ckb', '');
symbols.add('د.ع.', 'ar', 'IQ');
symbols.add('د.م.', 'ar', 'MA');
symbols.add('ریال', 'fa', '');
symbols.add('ریال', 'fa', 'IR');
symbols.add('ل.س.', 'syr', '');
symbols.add('ރ.', 'dv', '');
symbols.add('रू', 'ne', '');
symbols.add('৳', 'ccp', '');
symbols.add('රු.', 'si', '');
symbols.add('฿', 'th', '');
symbols.add('ብር', 'am', '');
symbols.add('ብር', 'am', 'ET');
symbols.add('៛', 'km', '');
symbols.add('​', 'kea', '');
symbols.add('₦', 'ff ha ig kaj kcg pcm yo', '');
symbols.add('₩', 'ko', '');
symbols.add('₪', 'he', '');
symbols.add('₫', 'vi', '');
symbols.add('€', 'acf ast bg br ca co de dsb el es et eu fi fr fur fy gcf gl gsw hr hsb ie it ksh lb lij lmo lt lv mt nds', '');
symbols.add('€', 'nl oc pms sc scn sk sl sr vec wa', '');
symbols.add('₭', 'lo', '');
symbols.add('₮', 'mn', '');
symbols.add('₱', 'ceb fil', '');
symbols.add('₲', 'gn', '');
symbols.add('₴', 'uk', '');
symbols.add('₴', 'uk', 'UA');
symbols.add('₸', 'kk', '');
symbols.add('₹', 'as bgc bho bn brx doi gu hi kn kok ks kxv mai ml mni mr nnp or pa raj sa sat sd ta te xnr', '');
symbols.add('₺', 'ku tr', '');
symbols.add('₼', 'az', '');
symbols.add('₽', 'ru sah tt', '');
symbols.add('₽', 'ru sah tt', 'RU');
symbols.add('₾', 'ka os', '');
symbols.add('⃁', 'ar', '');

// Territories where Excel's default symbol differs from the general currency symbol table.
const excelSymbols = new Map<string, string>();
for (const [symbol, territories] of [
    ['$', 'TW'],
    ['A$', 'HM'],
    ['Bs.D', 'VE'],
    ['Cg.', 'CW SX'],
    ['DZD', 'DZ'],
    ['F CF', 'BF BJ CI GW ML NE SN TG'],
    ['HK$', 'HK'],
    ['HTG', 'HT'],
    ['IQD', 'IQ'],
    ['KPW', 'KP'],
    ['MMK', 'MM'],
    ['MRU', 'MR'],
    ['PLN', 'PL'],
    ['RD$', 'DO'],
    ['RON', 'RO'],
    ['RSD', 'RS'],
    ['RUB', 'RU'],
    ['SDG', 'SD'],
    ['SHP', 'AC'],
    ['TJS', 'TJ'],
    ['TMT', 'TM'],
    ['UAH', 'UA'],
    ['US$', 'DG TL'],
    ['ZWG', 'ZW'],
    ['¤', '001 003 150 419 AQ CP CQ'],
    ['د.أ.', 'JO'],
    ['रू', 'NP'],
    ['€', 'BG'],
]) {
    for (const territory of territories.split(' ')) excelSymbols.set(territory, symbol);
}

let lastRegion: string | undefined;
let lastFormat: IRegionalCurrencyFormat = { symbol: '$', positive: '$#', negative: '($#)' };

export function getRegionalCurrencyFormat(region = 'en-US'): IRegionalCurrencyFormat {
    if (region !== lastRegion) {
        const territory = getRegionParts(region)?.territory ?? '';
        const symbol = symbols.resolve(region) ?? excelSymbols.get(territory) ?? regionCurrencySymbols.get(territory)?.replace(/[\u200E\u200F]/g, '') ?? '¤';
        const [positive, negative] = (layouts.resolve(region) ?? '$#;($#)').split(';');
        lastFormat = Object.freeze({ symbol, positive, negative });
        lastRegion = region;
    }
    return lastFormat;
}
