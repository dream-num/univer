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

import { getRegionTag } from '../../types/enum/locale-type';

export interface IFormulaSeparators {
    readonly decimal: string;
    readonly argument: string;
    readonly arrayColumn: string;
    readonly arrayRow: string;
    readonly arabicPunctuation?: boolean;
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
const arabicDecimalComma = profile('٫', ',');
const arabicComma = profile('.', '،');

interface IRegionalRule {
    separators: IFormulaSeparators;
    territories?: string[];
    scripts?: string[];
}

const rulesByLanguage = new Map<string, IRegionalRule[]>();

function register(separators: IFormulaSeparators, languages: string, territories?: string, scripts?: string): void {
    const rule = { separators, territories: territories?.split(' '), scripts: scripts?.split(' ') };
    for (const language of languages.split(' ')) {
        const rules = rulesByLanguage.get(language);
        if (rules) rules.push(rule);
        else rulesByLanguage.set(language, [rule]);
    }
}

// Excel for Mac 16.115, measured with FormulaLocal. More specific rules precede language defaults.
// Script changes the grammar for some languages even within the same territory.
register(arabicDecimal, 'ckb', 'IQ', 'arab');
register(dotComma, 'dv', 'MV', 'latn');
register(dotComma, 'fa ps', 'AF IR', 'aran cyrl latn');
register(dotComma, 'ff fo', 'NG', 'arab');
register(dotComma, 'ff', 'NG', 'adlm cyrl');
register(dotComma, 'ff', 'AF EG', 'adlm');
register(commaSemicolon, 'ff', 'FR MA ZZ', 'adlm');
register(dotComma, 'ks', 'PK');
register(dotComma, 'ks', 'IN', 'aran cyrl deva latn');
register(dotComma, 'ku', 'IQ IR SY');
register(dotComma, 'pa', 'PK', 'aran cyrl');
register(dotSemicolon, 'tzm', 'MA', 'tfng');
register(dotComma, 'kk', 'CN', 'arab');
register(dotComma, 'ms', 'BN CC MY', 'arab');
register(arabicDecimal, 'pa', 'PK', 'arab');
register(arabicDecimalComma, 'pa', 'PK');
register(dotSemicolon, 'sd', 'PK', 'arab');
register(dotComma, 'ur', 'IN PK', 'arab');
register(dotSemicolon, 'az', 'IR', 'cyrl');
register(dotSemicolon, 'uz', 'AF', 'cyrl');
register(dotComma, 'az', 'IR');
register(dotComma, 'uz', 'AF');

register(dotComma, 'af', 'NA');
register(dotComma, 'ar', '001 EH ER IL KM PS SD SO SS TD');
register(commaSemicolon, 'ar', 'DJ DZ LY MA MR TN');
register(dotSemicolon, 'ar', 'AE');
register(dotComma, 'ckb', 'IQ IR');
register(dotSemicolon, 'de', 'LI');
register(dotSemicolon, 'dz', 'BT');
register(commaSemicolon, 'ee', 'TG');
register(dotComma, 'el tr', 'CY');
register(commaSemicolon, 'en', 'AL AR AT BE BG BR CL CO CV CZ DE DK EE ES FI FR GE GR HU ID IT LT LV NL NO PL PT RO RU SE SI SK TR UA ZA');
register(dotComma, 'es', '003 AG BB BM BS BZ CA DM GD GY HT KN KY LC MX PH TC TT US VC VG VI');
register(dotSemicolon, 'es', '419 CU DO GT HN NI PA PE PR SV');
register(commaSemicolon, 'ff', 'BF GN GW MR SN');
register(dotComma, 'ff', 'CM GH GM LR NE SL');
register(dotComma, 'fr', 'BI KM MG MU NE RW SC SY TD VU');
register(dotSemicolon, 'ga', 'IE');
register(dotComma, 'gsw', 'LI');
register(dotComma, 'ha', 'GH NE NG');
register(dotSemicolon, 'ko', 'KP');
register(commaSemicolon, 'kpe', 'GN');
register(commaSemicolon, 'ms', 'BN ID');
register(dotComma, 'ms', 'SG');
register(dotSemicolon, 'ne', 'IN');
register(dotComma, 'nl', 'SX');
register(dotComma, 'om so', 'KE');
register(dotComma, 'ps', 'PK');
register(dotComma, 'pt', 'MO');
register(dotSemicolon, 'qu', 'EC PE');
register(dotComma, 'so', 'ET');
register(commaSemicolon, 'so', 'DJ');
register(dotComma, 'ss', 'SZ');
register(dotComma, 'st', 'LS');
register(dotComma, 'sw', 'TZ UG');
register(commaSemicolon, 'sw', 'CD');
register(dotSemicolon, 'ta', 'LK');
register(commaSemicolon, 'tzm', 'DZ MA');
register(commaSemicolon, 'yi', 'UA');
register(commaSemicolon, 'yo', 'BJ');

register(commaSemicolon, 'acf af ast az be ber bg blo br bs bua ca ce cs cv da de dsb dyo el es et eu fi fo fr fur fy gcf gl hr hsb hu');
register(commaSemicolon, 'hy id ie inh is it jv ka kab kea kgp kk kl ksh ku ky lb lij lmo ln lo lt lu lv mgh mk myv nb nds nl nn no nqo');
register(commaSemicolon, 'nr oc os pap pl pms prg pt qu rej rm ro ru rw sah sc scn se seh sg shi sjd sje sju sk sl smn sq sr ss su sv');
register(commaSemicolon, 'szl tg tk tr ts tt tyv uk uz ve vec vi vmw wa wo yrl zgh');
register(dotSemicolon, 'am ba co cy ff fil gd gsw ha haw ig ii ml mn ms mt my nso om si so st sw te ti tn tzm und ur xh yi yo zu');
register(arabicDecimal, 'ar ckb ks ps');
register(arabicSemicolon, 'fa');
register(arabicComma, 'dv');

// These measured languages use the default punctuation. A language unknown to Excel uses the root list separator.
register(dotComma, 'la agq ain ak apw arn as asa bas bem bez bgc bho bla bm bn bo brx byn ccp ceb cgg cho chr cic com cr crj crk crl');
register(dotComma, 'crm cst csw dav dje doi dua ebu eo ewo fla gaa gn gu guz gv hch he hi hmn ht ia io isc iu ja jbo jgo jmc kaj kam');
register(dotComma, 'kcg kde khq ki kio kkj kln km kn kok ksb ksf kw kxv lag lg lkt lrc luo lut luy mai mas mer mfe mg mgo mi mic mid');
register(dotComma, 'mni moh mr mua mus mzn naq nd nez nmg nnh nnp nus nv ny nyn or osa pcm pqm quc raj rhg rn rof rwk sa saq sat sbp');
register(dotComma, 'ses shn shp sm sn srs syr teo th tig to tok trv twq ug vai vun wae wal xnr xog yav yue za zh');

const commaDecimalTerritories = new Set(['AX', 'DE', 'FI', 'NO', 'SE', 'SJ']);
// Excel resolves these older language names using the modern formatting data.
const languageAliases = new Map([['sh', 'sr'], ['tl', 'fil']]);

// Read language, script and territory without using the host's locale data. Variants and extensions
// do not change Excel's default formula punctuation.
const regionTag = /^([a-z]{2,8})(?:-([a-z]{4}))?(?:-([a-z]{2}|[0-9]{3}))?(?:-(?:[a-z0-9]{5,8}|[0-9][a-z0-9]{3}))*(?:-[0-9a-wy-z](?:-[a-z0-9]{2,8})+)*(?:-x(?:-[a-z0-9]{1,8})+)?$/i;

export function isExcelRegionLanguage(language: string): boolean {
    return rulesByLanguage.has(languageAliases.get(language) ?? language);
}

function resolveProfile(language: string, script?: string, territory?: string): IFormulaSeparators {
    const languageRules = rulesByLanguage.get(language);
    // Excel recognizes Dari with Afghan settings and uses the root grammar for other territories.
    if (language === 'prs' && (!territory || territory === 'AF')) return script ? dotComma : arabicSemicolon;
    if (!languageRules) return dotSemicolon;
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
    return languageRules.find((rule) =>
        (!rule.territories || (territory && rule.territories.includes(territory))) &&
        (!rule.scripts || (script && rule.scripts.includes(script)))
    )?.separators ?? dotComma;
}

// These are input aliases. Excel still displays the region's preferred separators.
const arabicPunctuationLanguages = new Set('ar dv fa he mzn nqo prs ug ur yi'.split(' '));
const arabicPunctuationScripts = new Set('adlm arab cprt hebr khar nkoo syrc thaa'.split(' '));
const fulahTerritories = new Set('BF CM GH GM GN GW LR MR NE NG SL SN'.split(' '));

function acceptsArabicPunctuation(language: string, script?: string, territory?: string): boolean {
    if (script && arabicPunctuationScripts.has(script)) {
        return !(language === 'ff' && script === 'adlm' && (!territory || fulahTerritories.has(territory)));
    }
    switch (language) {
        case 'ks': return script !== 'deva';
        case 'ku': return territory !== 'TR' && !(script === 'latn' && (territory === 'IQ' || territory === 'SY'));
        case 'lrc': return !script;
        case 'ps': return !(script === 'latn' && territory === 'PK');
        case 'syr': return !(territory === 'IQ' && (script === 'syre' || script === 'syrj' || script === 'syrn'));
        case 'tzm': return territory !== 'MA';
        default: return arabicPunctuationLanguages.has(language);
    }
}

export function getFormulaSeparators(region: string): IFormulaSeparators {
    const parts = regionTag.exec(getRegionTag(region));
    if (!parts) return dotComma;

    const inputLanguage = parts[1].toLowerCase();
    const language = languageAliases.get(inputLanguage) ?? inputLanguage;
    const script = parts[2]?.toLowerCase() ?? (inputLanguage === 'sh' ? 'latn' : undefined);
    const territory = parts[3]?.toUpperCase();
    const separators = resolveProfile(language, script, territory);
    return acceptsArabicPunctuation(language, script, territory) ? { ...separators, arabicPunctuation: true } : separators;
}
