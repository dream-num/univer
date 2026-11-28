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

import { getFormulaSeparators, isExcelRegionLanguage } from './formula-separators';
import { getRegionParts, RegionRules } from './region-rules';

export interface IRegionalNumberFormat {
    readonly decimal: string;
    readonly spaceBeforePercent: boolean;
    readonly group: string;
    readonly htmlGroup: string;
    readonly grouping: readonly [number, number];
}

const standard = [3, 3] as const;
const paired = [3, 2] as const;
const ungrouped = [0, 0] as const;
const rules = new RegionRules<'default' | 'paired' | ' ' | "'" | '٬' | ''>();

// Excel for Mac 16.115. Specific script and territory rules precede language defaults.
rules.add('paired', 'ks', 'IN', 'aran');
rules.add('paired', 'mni', 'IN', 'mtei');
rules.add('default', 'pa', '', 'arab');
rules.add('default', 'sr', 'XK', 'latn');
rules.add("'", 'de', 'LI');
rules.add('٬', 'sd', 'PK');
rules.add('paired', 'rhg', 'BD');
rules.add('paired', 'en', 'BD IN');
rules.add('paired', 'bo', 'IN');
rules.add(' ', 'en', 'AL BG CV CZ EE FI FR GE HU LT LV NO PT RU SE SK UA ZA');
rules.add(' ', 'pt', 'AO CV FR GW MZ PT ST TL');
rules.add(' ', 'de', 'AT');
rules.add(' ', 'ff', 'BF GN GW');
rules.add(' ', 'yo', 'BJ');
rules.add(' ', 'sw', 'CD');
rules.add(' ', 'ar so', 'DJ');
rules.add(' ', 'ca', 'FR');
rules.add(' ', 'kpe', 'GN');
rules.add(' ', 'es', 'HT');
rules.add(' ', 'ee', 'TG');
rules.add(' ', 'yi', 'UA');
rules.add(' ', 'sr', 'XK');
rules.add('', 'fa', 'AF');
rules.add('default', 'uz', 'AF');
rules.add('default', 'fr', 'BI CF DZ GQ KM LU MA MG MR MU NE RW SC SY TD TN VU');
rules.add('default', 'ln', 'CF');
rules.add('default', 'kk', 'CN');
rules.add('default', 'oc', 'ES');
rules.add('default', 'sq', 'MK');
rules.add('default', 'ta', 'MY SG');
rules.add('default', 'af', 'NA');
rules.add('default', 'pa', 'PK');
rules.add('default', 'ss', 'SZ');
rules.add("'", 'gsw tn wae');
rules.add('paired', 'as bgc bho bn brx ccp doi dz gu hi kn kok kxv mai ml mr ne nnp or pa raj sa sat ta te ur xnr');
rules.add(' ', 'acf af ba be bg blo br bua ce cs cv et fi fr gcf ht hu hy ie inh ka kea kk ky ln lt lu lv mgh myv nb nn no nqo nr oc os pl rm ru sah se seh sjd sje sju sk smn sq ss sv tg tk ts tt tyv uk uz ve vmw xh');
rules.add('', 'la quc und');

let lastRegion: string | undefined;
let lastFormat: IRegionalNumberFormat = { decimal: '.', group: ',', htmlGroup: ',', grouping: standard, spaceBeforePercent: false };

export function getRegionalNumberFormat(region = ''): IRegionalNumberFormat {
    if (region !== lastRegion) {
        const { decimal } = getFormulaSeparators(region);
        const parts = getRegionParts(region);
        const recognized = !parts || isExcelRegionLanguage(parts.language);
        const territory = parts?.territory;
        const posix = /^en-(?:latn-)?us-(?:u-va-)?posix$/i.test(region);
        let style = rules.resolve(region);
        if (!recognized || posix) {
            style = '';
        } else if (territory && /^(?:AX|FI|NO|SE|SJ)$/.test(territory)) {
            style = ' ';
        } else if (territory === 'CH') {
            style = decimal === ',' ? ' ' : "'";
        } else if (territory === 'US' || territory === 'CA' || territory === 'GB') {
            style = decimal === ',' ? ' ' : parts?.language === 'und' ? '' : 'default';
        } else if (territory && territory !== 'XK' && /^(?:X[A-Z]|Q[M-Z])$/.test(territory)) {
            style = 'default';
        }
        const defaultGroup = decimal === ',' ? '.' : decimal === '٫' ? '٬' : ',';
        const group = style == null || style === 'default' || style === 'paired' ? defaultGroup : style;
        // Excel's HTML importer recognizes grouped numbers even when the region does not display grouping.
        const htmlGroup = posix ? '' : group || defaultGroup;
        const grouping = style === 'paired' ? paired : group ? standard : ungrouped;
        const spaceBeforePercent = recognized && (territory
            ? /^(?:AX|FI|NO|SJ)$/.test(territory)
            : /^(?:fi|nb|nn|no|se|smn)$/.test(parts?.language ?? ''));
        lastFormat = Object.freeze({ decimal, group, htmlGroup, grouping, spaceBeforePercent });
        lastRegion = region;
    }
    return lastFormat;
}
