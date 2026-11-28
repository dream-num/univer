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

import { getRegionParts, RegionRules } from './region-rules';

export interface IFormulaSeparators {
    readonly decimal: string;
    readonly argument: string;
    readonly arrayColumn: string;
    readonly arrayRow: string;
}

// The English interface uses a semicolon between array rows.
function profile(decimal: string, argument: string): IFormulaSeparators {
    return Object.freeze({ decimal, argument, arrayColumn: decimal === ',' ? '\\' : ',', arrayRow: ';' });
}

const dotComma = profile('.', ',');
const commaSemicolon = profile(',', ';');
const dotSemicolon = profile('.', ';');
const arabicDecimal = profile('٫', ';');
const arabicSemicolon = profile('٫', '؛');
const arabicComma = profile('.', '،');

const rules = new RegionRules<IFormulaSeparators>();

// Excel for Mac 16.115, measured with FormulaLocal. More specific rules precede language defaults.
// Script changes the grammar for some languages even within the same territory.
rules.add(dotComma, 'ff', 'NG', 'adlm');
rules.add(dotComma, 'kk', 'CN', 'arab');
rules.add(dotComma, 'ks', 'IN', 'aran deva');
rules.add(dotComma, 'ku', 'IQ SY', 'latn');
rules.add(dotComma, 'ms', 'BN CC MY', 'arab');
rules.add(arabicDecimal, 'pa', 'PK', 'arab');
rules.add(dotSemicolon, 'sd', 'PK', 'arab');
rules.add(dotComma, 'ur', 'IN PK', 'arab');
rules.add(dotSemicolon, 'az', 'IR', 'cyrl');
rules.add(dotSemicolon, 'uz', 'AF', 'cyrl');
rules.add(dotComma, 'az', 'IR');
rules.add(dotComma, 'uz', 'AF');

rules.add(dotComma, 'af', 'NA');
rules.add(dotComma, 'ar', '001 EH ER IL KM PS SD SO SS TD');
rules.add(commaSemicolon, 'ar', 'DJ DZ LY MA MR TN');
rules.add(dotSemicolon, 'ar', 'AE');
rules.add(dotComma, 'ckb', 'IQ IR');
rules.add(dotSemicolon, 'de', 'LI');
rules.add(dotSemicolon, 'dz', 'BT');
rules.add(commaSemicolon, 'ee', 'TG');
rules.add(dotComma, 'el tr', 'CY');
rules.add(commaSemicolon, 'en', 'AL AR AT BE BG BR CL CO CV CZ DE DK EE ES FI FR GE GR HU ID IT LT LV NL NO PL PT RO RU SE SI SK TR UA ZA');
rules.add(dotComma, 'es', '003 AG BB BM BS BZ CA DM GD GY HT KN KY LC MX PH TC TT US VC VG VI');
rules.add(dotSemicolon, 'es', '419 CU DO GT HN NI PA PE PR SV');
rules.add(commaSemicolon, 'ff', 'BF GN GW MR SN');
rules.add(dotComma, 'ff', 'CM GH GM LR NE SL');
rules.add(dotComma, 'fr', 'BI KM MG MU NE RW SC SY TD VU');
rules.add(dotSemicolon, 'ga', 'IE');
rules.add(dotComma, 'gsw', 'LI');
rules.add(dotComma, 'ha', 'GH NE NG');
rules.add(dotSemicolon, 'ko', 'KP');
rules.add(commaSemicolon, 'kpe', 'GN');
rules.add(commaSemicolon, 'ms', 'BN ID');
rules.add(dotComma, 'ms', 'SG');
rules.add(dotSemicolon, 'ne', 'IN');
rules.add(dotComma, 'nl', 'SX');
rules.add(dotComma, 'om so', 'KE');
rules.add(dotComma, 'ps', 'PK');
rules.add(dotComma, 'pt', 'MO');
rules.add(dotSemicolon, 'qu', 'EC PE');
rules.add(dotComma, 'so', 'ET');
rules.add(commaSemicolon, 'so', 'DJ');
rules.add(dotComma, 'ss', 'SZ');
rules.add(dotComma, 'st', 'LS');
rules.add(dotComma, 'sw', 'TZ UG');
rules.add(commaSemicolon, 'sw', 'CD');
rules.add(dotSemicolon, 'ta', 'LK');
rules.add(commaSemicolon, 'tzm', 'MA');
rules.add(commaSemicolon, 'yi', 'UA');
rules.add(commaSemicolon, 'yo', 'BJ');

rules.add(commaSemicolon, 'acf af ast az be ber bg blo br bs bua ca ce cs cv da de dsb dyo el es et eu fi fo fr fur fy gcf gl hr hsb hu');
rules.add(commaSemicolon, 'hy id ie inh is it jv ka kab kea kgp kk kl ksh ku ky lb lij lmo ln lo lt lu lv mgh mk myv nb nds nl nn no nqo');
rules.add(commaSemicolon, 'nr oc os pap pl pms prg pt qu rej rm ro ru rw sah sc scn se seh sg shi sjd sje sju sk sl smn sq sr ss su sv');
rules.add(commaSemicolon, 'szl tg tk tr ts tt tyv uk uz ve vec vi vmw wa wo yrl zgh');
rules.add(dotSemicolon, 'am ba co cy ff fil gd gsw ha haw ig ii ml mn ms mt my nso om si so st sw te ti tn tzm und ur xh yi yo zu');
rules.add(arabicDecimal, 'ar ckb ks ps');
rules.add(arabicSemicolon, 'fa');
rules.add(arabicComma, 'dv');

// These measured languages use the default punctuation. A language unknown to Excel uses the root list separator.
rules.add(dotComma, 'la agq ain ak apw arn as asa bas bem bez bgc bho bla bm bn bo brx byn ccp ceb cgg cho chr cic com cr crj crk crl');
rules.add(dotComma, 'crm cst csw dav dje doi dua ebu eo ewo fla gaa gn gu guz gv hch he hi hmn ht ia io isc iu ja jbo jgo jmc kaj kam');
rules.add(dotComma, 'kcg kde khq ki kio kkj kln km kn kok ksb ksf kw kxv lag lg lkt lrc luo lut luy mai mas mer mfe mg mgo mi mic mid');
rules.add(dotComma, 'mni moh mr mua mus mzn naq nd nez nmg nnh nnp nus nv ny nyn or osa pcm pqm quc raj rhg rn rof rwk sa saq sat sbp');
rules.add(dotComma, 'ses shn shp sm sn srs syr teo th tig to tok trv twq ug vai vun wae wal xnr xog yav yue za zh');

const commaDecimalTerritories = new Set(['AX', 'DE', 'FI', 'NO', 'SE', 'SJ']);
export function isExcelRegionLanguage(language: string): boolean {
    return rules.has(language);
}

export function getFormulaSeparators(region: string): IFormulaSeparators {
    const parts = getRegionParts(region);
    if (!parts) return dotComma;
    const { language, script, territory } = parts;
    if (!rules.has(language)) return dotSemicolon;
    if (territory && commaDecimalTerritories.has(territory)) return commaSemicolon;
    if (territory === 'US' || territory === 'CA' || territory === 'GB' || territory === 'CH') {
        if (territory === 'CH' && (!script || script === 'latn')) {
            if (language === 'rm') return commaSemicolon;
            if (language === 'de' || language === 'fr' || language === 'it') return dotSemicolon;
        }
        if (territory === 'CA' && language === 'fr') return commaSemicolon;
        if ((language === 'und' && territory !== 'CH') || (territory === 'US' && language === 'haw') ||
            (territory === 'GB' && (language === 'cy' || language === 'gd')) ||
            (script === 'latn' && language === 'sr') || (script === 'cyrl' && (language === 'az' || language === 'uz'))) {
            return dotSemicolon;
        }
        return dotComma;
    }
    // A private-use territory has no regional number settings. ZZ (unknown region) inherits the language settings.
    if (territory && territory !== 'XK' && /^(?:X[A-Z]|Q[M-Z])$/.test(territory)) return dotComma;
    return rules.resolve(region) ?? dotComma;
}
