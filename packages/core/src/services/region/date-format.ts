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

import { RegionRules } from './region-rules';

// Excel for Mac 16.115 short dates. Regions sharing a pattern share the same rule.
const rules = new RegionRules<string>();
rules.add('d.m.yyyy', 'bs', 'BA', 'latn');
rules.add('d/m/yy', 'ms', 'BN', 'arab');
rules.add('d/m/yy', 'ks', 'IN', 'deva');
rules.add('dd/mm/yy', 'ur', 'IN', 'arab');
rules.add('dd/mm/yy', 'hi kok', 'IN', 'latn');
rules.add('dd/mm/yyyy', 'ms', 'MY', 'arab');
rules.add('dd/mm/yyyy', 'ur', 'PK', 'arab');
rules.add('m/d/yy', 'ks', 'IN', 'arab');
rules.add('m/d/yy', 'ko', 'KR', 'kore');
rules.add('yyyy/m/d', 'zh', 'HK', 'hans');
rules.add('yyyy/m/d', 'zh', 'HK', 'hant');
rules.add('d.m.yy', 'bs', undefined, 'cyrl');
rules.add('d.m.yyyy', 'sr', undefined, 'latn');
rules.add('dd.mm.yyyy', 'be', undefined, 'tara');
rules.add('yyyy/m/d', 'yue', undefined, 'hans');
rules.add('d-m-yy', 'en', 'MV');
rules.add('d.m.yy', 'en', 'AL');
rules.add('d.m.yy', 'bs hr', 'BA');
rules.add('d.m.yy', 'sr', 'XK');
rules.add('d.m.yyyy', 'sv', 'AX FI');
rules.add('d.m.yyyy', 'sr', 'BA ME RS');
rules.add('d.m.yyyy', 'en', 'FI SI');
rules.add('d.mm.yy', 'en', 'BG');
rules.add('d.mm.yyyy', 'en', 'TR');
rules.add('d/m/yy', 'rhg', 'BD');
rules.add('d/m/yy', 'en', 'BD BN GR SG');
rules.add('d/m/yy', 'pt', 'GQ');
rules.add('d/m/yy', 'fr', 'GQ NE');
rules.add('d/m/yy', 'ru', 'KG');
rules.add('d/m/yy', 'ff', 'NE');
rules.add('d/m/yy', 'ms', 'SG');
rules.add('d/m/yy', 'yrl', 'VE');
rules.add('d/m/yyyy', 'ar', 'AE BH DZ EG EH IQ JO KW LB LY MA OM QA SY TN YE');
rules.add('d/m/yyyy', 'en', 'AU HK TH ZW');
rules.add('d/m/yyyy', 'ln', 'CF');
rules.add('d/m/yyyy', 'fr', 'CF DZ TN');
rules.add('d/m/yyyy', 'zh', 'HK');
rules.add('d/m/yyyy', 'tzm', 'MA');
rules.add('d/m/yyyy', 'shn', 'TH');
rules.add('d/mm/yy', 'fr', 'BE');
rules.add('d/mm/yy', 'en yrl', 'CO');
rules.add('d/mm/yy', 'es', 'CO GT PE');
rules.add('d/mm/yyyy', 'nl', 'BE');
rules.add('dd-mm-yy', 'en es', 'CL');
rules.add('dd-mm-yyyy', 'es', 'BQ CW');
rules.add('dd-mm-yyyy', 'ff', 'SN');
rules.add('dd.mm.yy', 'en', 'AT DE');
rules.add('dd.mm.yy', 'fr it', 'CH');
rules.add('dd.mm.yyyy', 'gsw pt', 'CH');
rules.add('dd.mm.yyyy', 'en', 'CH CZ EE RU UA');
rules.add('dd.mm.yyyy', 'se', 'FI');
rules.add('dd.mm.yyyy', 'os', 'RU');
rules.add('dd.mm.yyyy', 'yi', 'UA');
rules.add('dd/mm/yy', 'ln', 'AO');
rules.add('dd/mm/yy', 'pt', 'AO GW MZ PT ST TL');
rules.add('dd/mm/yy', 'en', 'BR BW BZ ID IN MX');
rules.add('dd/mm/yy', 'es', 'BR BZ MX');
rules.add('dd/mm/yy', 'ff', 'GW');
rules.add('dd/mm/yy', 'ms', 'ID');
rules.add('dd/mm/yy', 'bo ccp ks mni', 'IN');
rules.add('dd/mm/yy', 'ar', 'SO');
rules.add('dd/mm/yyyy', 'en', '001 150 AE AG AI AR BB BE BM BS CC CK CM CV CX CY DG DK DM ER ES FJ FK FM FR GB GD GE GG GH GI GM GS GY IE IL IM IO IT JE JM KE KI KN KY LC LR LS LT LV MG MM MO MS MT MU MW MY NA NF NG NL NO NR NU NZ PG PK PL PN PT PW RO RW SA SB SC SD SH SK SL SS SX SZ TC TK TO TT TV TZ UG VC VG VU WS ZM');
rules.add('dd/mm/yyyy', 'ar', '001 DJ ER IL KM MR PS SD SS TD');
rules.add('dd/mm/yyyy', 'uz', 'AF');
rules.add('dd/mm/yyyy', 'es', 'AG BB BM BS DM GD GY KN KY LC TC TT VC VG');
rules.add('dd/mm/yyyy', 'de', 'BE IT');
rules.add('dd/mm/yyyy', 'yo', 'BJ');
rules.add('dd/mm/yyyy', 'ms', 'CC');
rules.add('dd/mm/yyyy', 'el tr', 'CY');
rules.add('dd/mm/yyyy', 'so', 'DJ ET KE');
rules.add('dd/mm/yyyy', 'fo', 'DK');
rules.add('dd/mm/yyyy', 'oc', 'ES');
rules.add('dd/mm/yyyy', 'ca', 'FR IT');
rules.add('dd/mm/yyyy', 'ga', 'GB');
rules.add('dd/mm/yyyy', 'ha', 'GH NG');
rules.add('dd/mm/yyyy', 'ckb lrc syr', 'IQ');
rules.add('dd/mm/yyyy', 'ku', 'IQ SY');
rules.add('dd/mm/yyyy', 'om', 'KE');
rules.add('dd/mm/yyyy', 'st', 'LS');
rules.add('dd/mm/yyyy', 'sq', 'MK');
rules.add('dd/mm/yyyy', 'yue', 'MO');
rules.add('dd/mm/yyyy', 'ta', 'MY');
rules.add('dd/mm/yyyy', 'af', 'NA');
rules.add('dd/mm/yyyy', 'nds', 'NL');
rules.add('dd/mm/yyyy', 'pa ps', 'PK');
rules.add('dd/mm/yyyy', 'nl', 'SX');
rules.add('dd/mm/yyyy', 'ss', 'SZ');
rules.add('m/d/yy', 'es', '003 PH US VI');
rules.add('m/d/yy', 'sm', 'AS');
rules.add('m/d/yy', 'fr', 'BI');
rules.add('m/d/yyyy', 'ckb', 'IR');
rules.add('mm/dd/yy', 'es', 'PA PR');
rules.add('yyyy-mm-dd', 'dz', 'BT');
rules.add('yyyy-mm-dd', 'fr iu', 'CA');
rules.add('yyyy-mm-dd', 'es', 'CA HT');
rules.add('yyyy-mm-dd', 'en', 'CA SE');
rules.add('yyyy-mm-dd', 'da', 'GL');
rules.add('yyyy-mm-dd', 'sd', 'PK');
rules.add('yyyy.mm.dd', 'en', 'HU');
rules.add('yyyy/m/d', 'kk ko yue', 'CN');
rules.add('yyyy/m/d', 'en', 'CN TW');
rules.add('yyyy/mm/dd', 'en', 'JP ZA');
rules.add('d-m-yy', 'dv te');
rules.add('d-m-yyyy', 'as');
rules.add('d-mm-yyyy', 'syr');
rules.add('d.m.yy', 'dsb hsb sq');
rules.add('d.m.yyyy', 'bs fi he is mk sk sl smn');
rules.add('d.mm.yy', 'be bg');
rules.add('d.mm.yyyy', 'ku pl tr');
rules.add('d/m/yy', 'bn ca ccp dje el es ga ha haw hi ig km kn kok ky ml mni mr my or pa qu sa ta th twq ur vi');
rules.add('d/m/yyyy', 'ber bm kab khq lo nd ses sg shi sn yo yue zgh');
rules.add('d/mm/yy', 'isc ms shp');
rules.add('d/mm/yyyy', 'ar');
rules.add('dd-mm-yy', 'fy rm');
rules.add('dd-mm-yyyy', 'dyo mi nl pap wo');
rules.add('dd.mm.yy', 'az de et fo gsw hy ka kk ksh lb lv nds uk');
rules.add('dd.mm.yyyy', 'ba bua ce cs cv da hr ie inh myv nb nn no ro ru sjd sr tk tt tyv wae');
rules.add('dd/mm/yy', 'bgc bho brx cy doi gl gu hch id it jv kgp kxv mai mgh nnp raj rej sat seh so su tg uz vmw xnr yrl');
rules.add('m/d/yy', 'apw ceb cho chr cic com cst dz en fil fla kio ks lkt lut mus nez nv om osa quc rn sd ti tzm und xh zu');
rules.add('m/d/yyyy', 'lrc mzn');
rules.add('mm/dd/yyyy', 'iu');
rules.add('yy-mm-dd', 'moh');
rules.add('yy/m/d', 'eu ne sah');
rules.add('yyyy-mm-dd', 'af arn bla bo ckb co cr crj crk crl crm csw gn ht ii kl lt mic nso oc pqm rw se si sje sju srs st sv tn ts ug ve');
rules.add('yyyy.m.d', 'ko');
rules.add('yyyy.mm.dd', 'hu mn');
rules.add('yyyy/m/d', 'fa hmn ps trv za zh');
rules.add('yyyy/mm/dd', 'ain ja nr ss');

const times = new RegionRules<string>();
times.add('hh:mm:ss', 'zh', 'HK JP MO', 'hans');
times.add('h:mm:ss', 'zh', undefined, 'hant');
times.add('hh:mm:ss', 'yue', undefined, 'hans');
times.add('h mm ss', 'dz', 'BT');
times.add('h:mm:ss', 'rhg', 'BD');
times.add('h:mm:ss', 'yrl', 'CO VE');
times.add('h:mm:ss', 'tr', 'CY');
times.add('h:mm:ss', 'fr', 'DJ DZ MR SY TD TN VU');
times.add('h:mm:ss', 'sv', 'FI');
times.add('h:mm:ss', 'ha', 'GH');
times.add('h:mm:ss', 'ff', 'GH GM LR MR SL');
times.add('h:mm:ss', 'zh', 'HK JP MO TW');
times.add('h:mm:ss', 'bo ne', 'IN');
times.add('h:mm:ss', 'lrc', 'IQ');
times.add('h:mm:ss', 'ku', 'IQ SY');
times.add('h:mm:ss', 'st', 'LS');
times.add('h:mm:ss', 'pt', 'MO');
times.add('h:mm:ss', 'af', 'NA');
times.add('h:mm:ss', 'ss', 'SZ');
times.add('hh.mm.ss', 'fo', 'DK');
times.add('hh.mm.ss', 'en', 'DK ID');
times.add('hh.mm.ss', 'ms', 'ID');
times.add('hh:mm:ss', 'es', '003 BQ BR BZ CW EA GQ HT IC');
times.add('hh:mm:ss', 'en', '150 AC AI AQ AT BE BG BI BR BW BZ CC CH CK CM CN CP CQ CV CX CZ DE DG EE ES FK FR GB GE GG GI GS HM IE IM IO IT JE KE LT LV MG MM MS MT MU MV NF NG NL NO NR NU PL PN PT RO RU RW SC SE SH SI SK SX TA TH TK TR TV TZ UA UG ZA ZW');
times.add('hh:mm:ss', 'ca', 'AD FR IT');
times.add('hh:mm:ss', 'yo', 'BJ');
times.add('hh:mm:ss', 'ms', 'CC');
times.add('hh:mm:ss', 'ko yue', 'CN');
times.add('hh:mm:ss', 'kpe', 'GN');
times.add('hh:mm:ss', 'ckb', 'IR');
times.add('hh:mm:ss', 'om so', 'KE');
times.add('hh:mm:ss', 'ar', 'KM MA');
times.add('hh:mm:ss', 'ta', 'LK');
times.add('hh:mm:ss', 'sq', 'MK XK');
times.add('hh:mm:ss', 'ee', 'TG');
times.add('h.mm.ss', 'as');
times.add('hh.mm.ss', 'id jv kl rej si su');
times.add('hh:mm:ss', 'acf af agq asa ast az ba bas be ber bez blo bm bo br bs bua ce cgg co cv cy da dav de dje dua dv dyo ebu et eu ewo');
times.add('hh:mm:ss', 'ff fo fr fur fy ga gcf gd gl gsw guz gv ha hmn hr ht hy ie ig ii inh is it jgo jmc ka kaj kam kcg kde kea kgp khq');
times.add('hh:mm:ss', 'ki kk kkj kln ksb ksf ksh ku kw ky lag lb lg lij lmo ln lrc lt lu luo luy lv mas mer mfe mg mgh mgo mk mn mt mua');
times.add('hh:mm:ss', 'myv mzn nb nd nds ne nl nmg nn nnh no nqo nr nso nyn oc os pap pcm pl pms prg pt rhg rm rn ro rof ru rw rwk sah saq');
times.add('hh:mm:ss', 'sbp sc scn se seh ses sg shi shn sjd sje sju sl sn sr ss st sv sw szl teo tg th tk tn tr ts twq tyv tzm ug uk uz ve');
times.add('hh:mm:ss', 'vec vi vmw vun wa wae wo xh xog yav yi yrl za zgh zh zu');

export function getRegionalDatePattern(region: string): string {
    // The Taraskievica variant uses a padded day and a four-digit year.
    if (/^be(?:-cyrl)?(?:-by)?-tarask(?:-|$)/i.test(region)) return 'dd.mm.yyyy';
    return rules.resolve(region) ?? 'dd/mm/yyyy';
}

export function getRegionalTimePattern(region: string): string {
    return times.resolve(region) ?? 'h:mm:ss';
}
