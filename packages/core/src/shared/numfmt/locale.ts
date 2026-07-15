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

// Derived from numfmt 3.2.6 (MIT), commit c2cfdfa01bb1f24df51e985825671eb480daed4c.
// See packages/core/src/shared/numfmt/LICENSE.

import type { LocaleData, LocaleSettings, LocaleToken } from './types';
import { codeToLocale } from './code-to-locale';

// Locale: [language[_territory][.codeset][@modifier]]
const re_locale = /^([a-z\d]+)(?:[_-]([a-z\d]+))?(?:\.([a-z\d]+))?(?:@([a-z\d]+))?$/i;
const locales: Record<string, LocaleData> = {};

/**
 * Split a semicolon delimited string and replace instances of characters
 * @ignore
 * @param {string} str Semicolon delimited string
 * @param {string} [tilde] String to be inserted on every instance of ~
 * @returns {string[]} Array of strings
 */
const _ = (str: string, tilde: string = ''): string[] => str.replace(/~/g, tilde).split(';');

/**
 * Generate mmm and ddd properties as needed for locales. Many of them
 * are straightforward abreviations of mmmm and dddd so we can save some
 * bytes by auto-generating them.
 *
 * Both rule parameters use the same system. If shortform prop is missing:
 *
 * - 0 - use long form array unchanged
 * - 1...9 - shorten to N many characters
 * - 11...19 - shorten to 1...9 characters and add periods
 *
 * @ignore
 * @param {object} o Locale object
 * @param {number} [ml=0] Month list rule
 * @param {number} [dl=0] Day list rule
 * @returns {object} The same input object, but with ddd and mmm filled in.
 */
type ExpandableLocaleSettings = LocaleSettings & Pick<LocaleData, 'mmmm' | 'dddd'>;

const xm = (o: ExpandableLocaleSettings, ml: number = 0, dl: number = 0): LocaleSettings => {
    if (!o.mmm) {
        o.mmm = ml < 1
            ? o.mmmm.concat()
            : o.mmmm.map((d) => {
                const s = d.slice(0, ml % 10);
                return s + (ml < 10 || d === s ? '' : '.');
            });
    }
    if (!o.ddd) {
        o.ddd = dl < 1
            ? o.dddd.concat()
            : o.dddd.map((d) => {
                const s = d.slice(0, dl % 10);
                return s + (dl < 10 || d === s ? '' : '.');
            });
    }
    if (!o.mmm6 && o.mmmm6) {
        o.mmm6 = o.mmmm6;
    }
    return o;
};

/**
 * @typedef {object} LocaleData
 *   An object of properties used by a formatter when printing a number in a certain locale.
 * @property {string} group - Symbol used as a grouping separator (`1,000,000` uses `,`)
 * @property {string} decimal - Symbol used to separate integers from fractions (usually `.`)
 * @property {string} positive - Symbol used to indicate positive numbers (usually `+`)
 * @property {string} negative - Symbol used to indicate positive numbers (usually `-`)
 * @property {string} percent - Symbol used to indicate a percentage (usually `%`)
 * @property {string} exponent - Symbol used to indicate an exponent (usually `E`)
 * @property {string} nan - Symbol used to indicate NaN values (`NaN`)
 * @property {string} infinity - Symbol used to indicate infinite values (`∞`)
 * @property {Array<string>} ampm - How AM and PM should be presented
 * @property {Array<string>} mmmm6 - Long month names for the Islamic calendar (`Rajab`)
 * @property {Array<string>} mmm6 - Short month names for the Islamic calendar (`Raj.`)
 * @property {Array<string>} mmmm - Long month names for the Gregorian calendar (`November`)
 * @property {Array<string>} mmm - Short month names for the Gregorian calendar (`Nov`)
 * @property {Array<string>} dddd - Long day names (`Wednesday`)
 * @property {Array<string>} ddd - Shortened day names (`Wed`)
 * @property {Array<string>} bool - How TRUE and FALSE should be presented
 * @property {boolean} preferMDY - Is the prefered date format month first (12/31/2025) or day first (31/12/2025)
 */

/**
 * @ignore
 * @type {LocaleData}
 */
const baseLocaleData: LocaleData = {
    group: '\u00A0',
    decimal: '.',
    positive: '+',
    negative: '-',
    percent: '%',
    exponent: 'E',
    nan: 'NaN',
    infinity: '∞',
    ampm: _('AM;PM'),
    mmmm6: _('Muharram;Safar;Rabiʻ I;Rabiʻ II;Jumada I;Jumada II;Rajab;Shaʻban;Ramadan;Shawwal;Dhuʻl-Qiʻdah;Dhuʻl-Hijjah'),
    mmm6: _('Muh.;Saf.;Rab. I;Rab. II;Jum. I;Jum. II;Raj.;Sha.;Ram.;Shaw.;Dhuʻl-Q.;Dhuʻl-H.'),
    mmmm: _('January;February;March;April;May;June;July;August;September;October;November;December'),
    mmm: _('Jan;Feb;Mar;Apr;May;Jun;Jul;Aug;Sep;Oct;Nov;Dec'),
    dddd: _('Sunday;Monday;Tuesday;Wednesday;Thursday;Friday;Saturday'),
    ddd: _('Sun;Mon;Tue;Wed;Thu;Fri;Sat'),
    bool: _('TRUE;FALSE'),
    preferMDY: false,
};

/**
 * @typedef {object} LocaleToken - An object of properties for a locale tag.
 * @property {string} lang - The basic tag such as `zh_CN` or `fi`
 * @property {string} language - The language section (`zh` for `zh_CN`)
 * @property {string} territory - The territory section (`CN` for `zh_CN`)
 */

/**
 * Parse a regular IETF BCP 47 locale tag and emit an object of its parts.
 * Irregular tags and subtags are not supported.
 *
 * @param {string} locale - A BCP 47 string tag of the locale.
 * @returns {LocaleToken} - An object describing the locale.
 */
export function parseLocale(locale: string): LocaleToken {
    const lm = re_locale.exec(locale);
    if (!lm) {
        throw new SyntaxError(`Malformed locale: ${locale}`);
    }
    return {
        lang: lm[1] + (lm[2] ? `_${lm[2]}` : ''),
        language: lm[1],
        territory: lm[2] || '',
    };
}

// MS code format is: aabbcccc [$-aabbcccc]
// aa = numerical style (optional, 00 if absent)
// bb = calendar format (optional, 00 if absent)
// cc = language code
export function resolveLocale(locale: string | number): string | null {
    if (typeof locale === 'number') {
        return codeToLocale[locale & 0xFFFF] || null;
    }
    const wincode = Number.parseInt(locale, 16);
    if (Number.isFinite(wincode) && codeToLocale[wincode & 0xFFFF]) {
        return codeToLocale[wincode & 0xFFFF] || null;
    }
    if (re_locale.test(locale)) {
        return locale;
    }
    return null;
}

/**
 * Used by the formatter to pull a locate from its registered locales. If
 * subtag isn't available but the base language is, the base language is used.
 * So if `en-CA` is not found, the formatter tries to find `en` else it
 * returns a `null`.
 *
 * @param {string} locale - A BCP 47 string tag of the locale, or an Excel locale code.
 * @returns {LocaleData | null} - An object of format date properties.
 */
export function getLocale(locale: string | number): LocaleData | null {
    const tag = resolveLocale(locale);
    let obj: LocaleData | null = null;
    if (tag) {
        const c = parseLocale(tag);
        obj = locales[c.lang] || locales[c.language] || null;
    }
    return obj;
}

// creates a new locale options object
export function createLocale(settings: LocaleSettings): LocaleData {
    return Object.assign({}, baseLocaleData, settings);
}

/**
 * Register locale data for a language so for use when formatting.
 *
 * Any partial set of properties may be returned to have the defaults used where properties are missing.
 *
 * @see {LocaleData}
 * @param {object} settings - A collection of settings for a locale.
 * @param {string} [settings.group]
 *    Symbol used as a grouping separator (`1,000,000` uses `,`)
 * @param {string} [settings.decimal]
 *    Symbol used to separate integers from fractions (usually `.`)
 * @param {string} [settings.positive]
 *    Symbol used to indicate positive numbers (usually `+`)
 * @param {string} [settings.negative]
 *    Symbol used to indicate positive numbers (usually `-`)
 * @param {string} [settings.percent]
 *    Symbol used to indicate a percentage (usually `%`)
 * @param {string} [settings.exponent]
 *    Symbol used to indicate an exponent (usually `E`)
 * @param {string} [settings.nan]
 *    Symbol used to indicate NaN values (`NaN`)
 * @param {string} [settings.infinity]
 *    Symbol used to indicate infinite values (`∞`)
 * @param {Array<string>} [settings.ampm]
 *    How AM and PM should be presented.
 * @param {Array<string>} [settings.mmmm6]
 *    Long month names for the Islamic calendar (e.g. `Rajab`)
 * @param {Array<string>} [settings.mmm6]
 *    Short month names for the Islamic calendar (e.g. `Raj.`)
 * @param {Array<string>} [settings.mmmm]
 *    Long month names for the Gregorian calendar (e.g. `November`)
 * @param {Array<string>} [settings.mmm]
 *    Short month names for the Gregorian calendar (e.g. `Nov`)
 * @param {Array<string>} [settings.dddd]
 *    Long day names (e.g. `Wednesday`)
 * @param {Array<string>} [settings.ddd]
 *    Shortened day names (e.g. `Wed`)
 * @param {Array<string>} [settings.bool]
 *    How TRUE and FALSE should be presented.
 * @param {boolean} [settings.preferMDY]
 *    Is the prefered date format month first (12/31/2025) or day first (31/12/2025)
 * @param {string | LocaleToken} locale - A string BCP 47 tag or parsed locale token.
 * @returns {LocaleData} - A full collection of settings for a locale
 */
export function addLocale(settings: LocaleSettings, locale: string | LocaleToken): LocaleData {
    // parse language tag
    const c = typeof locale === 'object' ? locale : parseLocale(locale);
    // add the language
    locales[c.lang] = createLocale(settings);
    // if "xx_YY" is added also create "xx" if it is missing
    if (c.language !== c.lang && !locales[c.language]) {
        locales[c.language] = createLocale(settings);
    }
    return locales[c.lang];
}

export function listLocales(): string[] {
    return Object.keys(locales);
}

export const defaultLocale = createLocale({ group: ',', preferMDY: true });
defaultLocale.isDefault = true;

addLocale({
    group: ',',
    ampm: _('上午;下午'),
    mmmm: _('一月;二月;三月;四月;五月;六月;七月;八月;九月;十月;十一月;十二月'),
    mmm: _('1月;2月;3月;4月;5月;6月;7月;8月;9月;10月;11月;12月'),
    dddd: _('~日;~一;~二;~三;~四;~五;~六', '星期'),
    ddd: _('周日;周一;周二;周三;周四;周五;周六'),
}, 'zh_CN');
const _zh = {
    group: ',',
    ampm: _('上午;下午'),
    mmmm: _('1月;2月;3月;4月;5月;6月;7月;8月;9月;10月;11月;12月'),
    mmm: _('1月;2月;3月;4月;5月;6月;7月;8月;9月;10月;11月;12月'),
    dddd: _('~日;~一;~二;~三;~四;~五;~六', '星期'),
    ddd: _('周日;周一;周二;周三;周四;周五;周六'),
};
addLocale({
    ..._zh,
    nan: '非數值',
    dddd: _('~日;~一;~二;~三;~四;~五;~六', '星期'),
}, 'zh_TW');
addLocale({
    ..._zh,
    dddd: _('~日;~一;~二;~三;~四;~五;~六', '星期'),
}, 'zh_HK');

addLocale({
    ..._zh,
    ampm: _('午前;午後'),
    dddd: _('日~;月~;火~;水~;木~;金~;土~', '曜日'),
    ddd: _('日;月;火;水;木;金;土'),
}, 'ja');

addLocale({
    group: ',',
    ampm: _('오전;오후'),
    mmmm: _('1월;2월;3월;4월;5월;6월;7월;8월;9월;10월;11월;12월'),
    mmm: _('1월;2월;3월;4월;5월;6월;7월;8월;9월;10월;11월;12월'),
    dddd: _('일요일;월요일;화요일;수요일;목요일;금요일;토요일'),
    ddd: _('일;월;화;수;목;금;토'),
}, 'ko');

addLocale({
    group: ',',
    ampm: _('ก่อนเที่ยง;หลังเที่ยง'),
    mmmm: _('มกร~;กุมภาพันธ์;มีน~;เมษายน;พฤษภ~;มิถุนายน;กรกฎ~;สิงห~;กันยายน;ตุล~;พฤศจิกายน;ธันว~', 'าคม'),
    mmm: _('ม.ค.;ก.พ.;มี.ค.;เม.ย.;พ.ค.;มิ.ย.;ก.ค.;ส.ค.;ก.ย.;ต.ค.;พ.ย.;ธ.ค.'),
    dddd: _('วันอาทิตย์;วันจันทร์;วันอังคาร;วันพุธ;วันพฤหัสบดี;วันศุกร์;วันเสาร์'),
    ddd: _('อา.;จ.;อ.;พ.;พฤ.;ศ.;ส.'),
}, 'th');

addLocale(xm({
    decimal: ',',
    ampm: _('dop.;odp.'),
    mmmm: _('ledna;února;března;dubna;května;června;července;srpna;září;října;listopadu;prosince'),
    mmm: _('I;II;III;IV;V;VI;VII;VIII;IX;X;XI;XII'),
    dddd: _('neděle;pondělí;úterý;středa;čtvrtek;pátek;sobota'),
    bool: _('PRAVDA;NEPRAVDA'),
}, -1, 2), 'cs');

addLocale(xm({
    group: '.',
    decimal: ',',
    mmmm: _('januar;februar;marts;april;maj;juni;juli;august;september;oktober;november;december'),
    dddd: _('søn~;man~;tirs~;ons~;tors~;fre~;lør~', 'dag'),
    bool: _('SAND;FALSK'),
}, 13, 13), 'da');

addLocale(xm({
    group: '.',
    decimal: ',',
    ampm: _('a.m.;p.m.'),
    mmmm: _('januari;februari;maart;april;mei;juni;juli;augustus;september;oktober;november;december'),
    mmm: _('jan.;feb.;mrt.;apr.;mei;jun.;jul.;aug.;sep.;okt.;nov.;dec.'),
    dddd: _('zondag;maandag;dinsdag;woensdag;donderdag;vrijdag;zaterdag'),
    bool: _('WAAR;ONWAAR'),
}, -1, 2), 'nl');

addLocale({ group: ',', preferMDY: true }, 'en');
addLocale({ group: ',', preferMDY: true }, 'en_US');
addLocale({ group: ',' }, 'en_AU');
addLocale({ group: ',' }, 'en_CA');
addLocale({ group: ',' }, 'en_GB');
addLocale({ group: ',', mmm: _('Jan;Feb;Mar;Apr;May;Jun;Jul;Aug;Sept;Oct;Nov;Dec') }, 'en_IE');

addLocale(xm({
    decimal: ',',
    nan: 'epäluku',
    ampm: _('ap.;ip.'),
    mmmm: _('tammi~;helmi~;maalis~;huhti~;touko~;kesä~;heinä~;elo~;syys~;loka~;marras~;joulu~', 'kuuta'),
    mmm: _('tammik.;helmik.;maalisk.;huhtik.;toukok.;kesäk.;heinäk.;elok.;syysk.;lokak.;marrask.;jouluk.'),
    dddd: _('sunnun~;maanan~;tiis~;keskiviikkona;tors~;perjan~;lauan~', 'taina'),
    bool: _('TOSI;EPÄTOSI'),
}, -1, 2), 'fi');

const _fr = xm({
    group: '\u202F',
    decimal: ',',
    mmmm: _('janvier;février;mars;avril;mai;juin;juillet;août;septembre;octobre;novembre;décembre'),
    mmm: _('janv.;févr.;mars;avr.;mai;juin;juil.;août;sept.;oct.;nov.;déc.'),
    dddd: _('~manche;lun~;mar~;mercre~;jeu~;vendre~;same~', 'di'),
    bool: _('VRAI;FAUX'),
}, -1, 13);
addLocale({ ..._fr }, 'fr');
addLocale({ ..._fr, mmm: _('janv.;févr.;mars;avr.;mai;juin;juill.;août;sept.;oct.;nov.;déc.') }, 'fr_CA');
addLocale({ group: "'", decimal: '.', ..._fr }, 'fr_CH');

const _de = xm({
    mmmm: _('Januar;Februar;März;April;Mai;Juni;Juli;August;September;Oktober;November;Dezember'),
    mmm: _('Jan.;Feb.;März;Apr.;Mai;Juni;Juli;Aug.;Sept.;Okt.;Nov.;Dez.'),
    dddd: _('Sonn~;Mon~;Diens~;Mittwoch;Donners~;Frei~;Sams~', 'tag'),
    bool: _('WAHR;FALSCH'),
}, -1, 12);
addLocale({ group: '.', decimal: ',', ..._de }, 'de');
addLocale({ group: "'", decimal: '.', ..._de }, 'de_CH');

addLocale(xm({
    group: '.',
    decimal: ',',
    ampm: _('π.μ.;μ.μ.'),
    mmmm: _('Ιανουαρ~;Φεβρουαρ~;Μαρτ~;Απριλ~;Μαΐου;Ιουν~;Ιουλ~;Αυγούστου;Σεπτεμβρ~;Οκτωβρ~;Νοεμβρ~;Δεκεμβρ~', 'ίου'),
    mmm: _('Ιαν;Φεβ;Μαρ;Απρ;Μαΐ;Ιουν;Ιουλ;Αυγ;Σεπ;Οκτ;Νοε;Δεκ'),
    dddd: _('Κυριακή;Δευτέρα;Τρίτη;Τετάρτη;Πέμπτη;Παρασκευή;Σάββατο'),
}, -1, 3), 'el');

addLocale({
    decimal: ',',
    ampm: _('de.;du.'),
    mmmm: _('január;február;március;április;május;június;július;augusztus;szeptember;október;november;december'),
    mmm: _('jan.;febr.;márc.;ápr.;máj.;jún.;júl.;aug.;szept.;okt.;nov.;dec.'),
    dddd: _('vasárnap;hétfő;kedd;szerda;csütörtök;péntek;szombat'),
    ddd: _('V;H;K;Sze;Cs;P;Szo'),
    bool: _('IGAZ;HAMIS'),
}, 'hu');

addLocale(xm({
    group: '.',
    decimal: ',',
    ampm: _('f.h.;e.h.'),
    mmmm: _('janúar;febrúar;mars;apríl;maí;júní;júlí;ágúst;september;október;nóvember;desember'),
    dddd: _('sunnu~;mánu~;þriðju~;miðviku~;fimmtu~;föstu~;laugar~', 'dagur'),
}, 13, 13), 'is');

addLocale(xm({
    group: '.',
    decimal: ',',
    mmmm: _('Januari;Februari;Maret;April;Mei;Juni;Juli;Agustus;September;Oktober;November;Desember'),
    dddd: _('Minggu;Senin;Selasa;Rabu;Kamis;Jumat;Sabtu'),
}, 3, 3), 'id');

const _it = xm({
    mmmm: _('gennaio;febbraio;marzo;aprile;maggio;giugno;luglio;agosto;settembre;ottobre;novembre;dicembre'),
    dddd: _('domenica;lunedì;martedì;mercoledì;giovedì;venerdì;sabato'),
    bool: _('VERO;FALSO'),
}, 3, 3);
addLocale({ group: '.', decimal: ',', ..._it }, 'it');
addLocale({ group: "'", decimal: '.', ..._it }, 'it_CH');

const _no = {
    decimal: ',',
    ampm: _('a.m.;p.m.'),
    mmmm: _('januar;februar;mars;april;mai;juni;juli;august;september;oktober;november;desember'),
    mmm: _('jan.;feb.;mar.;apr.;mai;jun.;jul.;aug.;sep.;okt.;nov.;des.'),
    dddd: _('søn~;man~;tirs~;ons~;tors~;fre~;lør~', 'dag'),
    bool: _('SANN;USANN'),
};
addLocale(xm({ ..._no }, -1, 13), 'nb');
addLocale(xm({ ..._no }, -1, 13), 'no');

addLocale(xm({
    decimal: ',',
    mmmm: _('stycznia;lutego;marca;kwietnia;maja;czerwca;lipca;sierpnia;września;października;listopada;grudnia'),
    dddd: _('niedziela;poniedziałek;wtorek;środa;czwartek;piątek;sobota'),
    ddd: _('niedz.;pon.;wt.;śr.;czw.;pt.;sob.'),
    bool: _('PRAWDA;FAŁSZ'),
}, 3, -1), 'pl');

const _pt = {
    group: '.',
    decimal: ',',
    mmmm: _('janeiro;fevereiro;março;abril;maio;junho;julho;agosto;setembro;outubro;novembro;dezembro'),
    dddd: _('domingo;segunda-feira;terça-feira;quarta-feira;quinta-feira;sexta-feira;sábado'),
    bool: _('VERDADEIRO;FALSO'),
};
addLocale(xm(_pt, 13, 13), 'pt');
addLocale(xm(_pt, 13, 13), 'pt_BR');

addLocale({
    decimal: ',',
    nan: 'не\u00A0число',
    mmmm: _('января;февраля;марта;апреля;мая;июня;июля;августа;сентября;октября;ноября;декабря'),
    mmm: _('янв.;февр.;мар.;апр.;мая;июн.;июл.;авг.;сент.;окт.;нояб.;дек.'),
    dddd: _('воскресенье;понедельник;вторник;среда;четверг;пятница;суббота'),
    ddd: _('вс;пн;вт;ср;чт;пт;сб'),
    mmmm6: _('рамадан;шавваль;зуль-каада;зуль-хиджжа;мухаррам;раби-уль-авваль;раби-уль-ахир;джумад-уль-авваль;джумад-уль-ахир;раджаб;шаабан;рамадан'),
    mmm6: _('рам.;шав.;зуль-к.;зуль-х.;мух.;раб. I;раб. II;джум. I;джум. II;радж.;шааб.;рам.'),
    bool: _('ИСТИНА;ЛОЖЬ'),
}, 'ru');

addLocale(xm({
    decimal: ',',
    mmmm: _('januára;februára;marca;apríla;mája;júna;júla;augusta;septembra;októbra;novembra;decembra'),
    dddd: _('nedeľa;pondelok;utorok;streda;štvrtok;piatok;sobota'),
}, 3, 2), 'sk');

const _es = {
    group: '.',
    decimal: ',',
    ampm: _('a.\u00A0m.;p.\u00A0m.'),
    mmmm: _('enero;febrero;marzo;abril;mayo;junio;julio;agosto;septiem~;octu~;noviem~;diciem~', 'bre'),
    mmm: _('ene;feb;mar;abr;may;jun;jul;ago;sept;oct;nov;dic'),
    dddd: _('domingo;lunes;martes;miércoles;jueves;viernes;sábado'),
    ddd: _('dom;lun;mar;mié;jue;vie;sáb'),
    bool: _('VERDADERO;FALSO'),
};
const _esM3 = _('ene;feb;mar;abr;may;jun;jul;ago;sep;oct;nov;dic');
const _esM13 = _('ene.;feb.;mar.;abr.;may.;jun.;jul.;ago.;sept.;oct.;nov.;dic.');
addLocale({ ..._es }, 'es');
addLocale({ ..._es }, 'es_AR');
addLocale({ ..._es }, 'es_BO');
addLocale({ ..._es }, 'es_CL');
addLocale({ ..._es }, 'es_CO');
addLocale({ ..._es }, 'es_EC');
addLocale({ ..._es, mmm: _esM3, ampm: _('a.m.;p.m.') }, 'es_MX');
addLocale({ ..._es, mmm: _esM13 }, 'es_PY');
addLocale({ ..._es, mmm: _esM13 }, 'es_UY');
addLocale({ ..._es, mmm: _esM13, mmmm: _('enero;febrero;marzo;abril;mayo;junio;julio;agosto;setiembre;octubre;noviembre;diciembre') }, 'es_VE');

addLocale({
    decimal: ',',
    ampm: _('fm;em'),
    mmmm: _('januari;februari;mars;april;maj;juni;juli;augusti;september;oktober;november;december'),
    mmm: _('jan.;feb.;mars;apr.;maj;juni;juli;aug.;sep.;okt.;nov.;dec.'),
    dddd: _('sön~;mån~;tis~;ons~;tors~;fre~;lör~', 'dag'),
    ddd: _('sön;mån;tis;ons;tors;fre;lör'),
}, 'sv');

addLocale(xm({
    group: '.',
    decimal: ',',
    ampm: _('ÖÖ;ÖS'),
    mmmm: _('Ocak;Şubat;Mart;Nisan;Mayıs;Haziran;Temmuz;Ağustos;Eylül;Ekim;Kasım;Aralık'),
    mmm: _('Oca;Şub;Mar;Nis;May;Haz;Tem;Ağu;Eyl;Eki;Kas;Ara'),
    dddd: _('Pazar;Pazartesi;Salı;Çarşamba;Perşembe;Cuma;Cumartesi'),
    ddd: _('Paz;Pzt;Sal;Çar;Per;Cum;Cmt'),
    bool: _('DOĞRU;YANLIŞ'),
}, 3, -1), 'tr');

addLocale({
    group: ',',
    ampm: _('yb;yh'),
    mmmm: _('Ionawr;Chwefror;Mawrth;Ebrill;Mai;Mehefin;Gorffennaf;Awst;Medi;Hydref;Tachwedd;Rhagfyr'),
    mmm: _('Ion;Chwef;Maw;Ebr;Mai;Meh;Gorff;Awst;Medi;Hyd;Tach;Rhag'),
    dddd: _('Dydd Sul;Dydd Llun;Dydd Mawrth;Dydd Mercher;Dydd Iau;Dydd Gwener;Dydd Sadwrn'),
    ddd: _('Sul;Llun;Maw;Mer;Iau;Gwen;Sad'),
}, 'cy');

addLocale({
    group: '.',
    decimal: ',',
    mmmm: _('yanvar;fevral;mart;aprel;may;iyun;iyul;avqust;sentyabr;oktyabr;noyabr;dekabr'),
    mmm: _('yan;fev;mar;apr;may;iyn;iyl;avq;sen;okt;noy;dek'),
    dddd: _('bazar;bazar ertəsi;çərşənbə axşamı;çərşənbə;cümə axşamı;cümə;şənbə'),
    ddd: _('B.;B.e.;Ç.a.;Ç.;C.a.;C.;Ş.'),
}, 'az');

addLocale(xm({
    decimal: ',',
    mmmm: _('студзеня;лютага;сакавіка;красавіка;мая;чэрвеня;ліпеня;жніўня;верасня;кастрычніка;лістапада;снежня'),
    dddd: _('нядзеля;панядзелак;аўторак;серада;чацвер;пятніца;субота'),
    ddd: _('нд;пн;аў;ср;чц;пт;сб'),
}, 3, -1), 'be');

addLocale({
    decimal: ',',
    ampm: _('пр.об.;сл.об.'),
    mmmm: _('януари;февруари;март;април;май;юни;юли;август;септември;октомври;ноември;декември'),
    mmm: _('яну;фев;март;апр;май;юни;юли;авг;сеп;окт;ное;дек'),
    dddd: _('неделя;понеделник;вторник;сряда;четвъртък;петък;събота'),
    ddd: _('нд;пн;вт;ср;чт;пт;сб'),
    bool: _('ИСТИНА;ЛОЖЬ'),
}, 'bg');

addLocale({
    group: '.',
    decimal: ',',
    mmmm: _('de gener;de febrer;de març;d’abril;de maig;de juny;de juliol;d’agost;de setembre;d’octubre;de novembre;de desembre'),
    mmm: _('de gen.;de febr.;de març;d’abr.;de maig;de juny;de jul.;d’ag.;de set.;d’oct.;de nov.;de des.'),
    dddd: _('diumenge;dilluns;dimarts;dimecres;dijous;divendres;dissabte'),
    ddd: _('dg.;dl.;dt.;dc.;dj.;dv.;ds.'),
    ampm: _('a.\u00A0m.;p.\u00A0m.'),
}, 'ca');

addLocale(xm({
    group: ',',
    decimal: '.',
    mmmm: _('Enero;Pebrero;Marso;Abril;Mayo;Hunyo;Hulyo;Agosto;Setyembre;Oktubre;Nobyembre;Disyembre'),
    dddd: _('Linggo;Lunes;Martes;Miyerkules;Huwebes;Biyernes;Sabado'),
}, 3, 3), 'fil');

addLocale({
    group: ',',
    decimal: '.',
    mmmm: _('જાન્યુઆરી;ફેબ્રુઆરી;માર્ચ;એપ્રિલ;મે;જૂન;જુલાઈ;ઑગસ્ટ;સપ્ટેમ્બર;ઑક્ટોબર;નવેમ્બર;ડિસેમ્બર'),
    mmm: _('જાન્યુ;ફેબ્રુ;માર્ચ;એપ્રિલ;મે;જૂન;જુલાઈ;ઑગસ્ટ;સપ્ટે;ઑક્ટો;નવે;ડિસે'),
    dddd: _('રવિ~;સોમ~;મંગળ~;બુધ~;ગુરુ~;શુક્ર~;શનિ~', 'વાર'),
    ddd: _('રવિ;સોમ;મંગળ;બુધ;ગુરુ;શુક્ર;શનિ'),
}, 'gu');

addLocale({
    group: ',',
    decimal: '.',
    ampm: _('לפנה״צ;אחה״צ'),
    dddd: _('~ראשון;~שני;~שלישי;~רביעי;~חמישי;~שישי;~שבת', 'יום '),
    ddd: _('~א׳;~ב׳;~ג׳;~ד׳;~ה׳;~ו׳;שבת', 'יום '),
    mmmm: _('ינואר;פברואר;מרץ;אפריל;מאי;יוני;יולי;אוגוסט;ספטמבר;אוקטובר;נובמבר;דצמבר'),
    mmm: _('ינו׳;פבר׳;מרץ;אפר׳;מאי;יוני;יולי;אוג׳;ספט׳;אוק׳;נוב׳;דצמ׳'),
    mmmm6: _('רמדאן;שוואל;ד׳ו אל־קעדה;ד׳ו אל־חיג׳ה;מוחרם;רביע אל־אוול;רביע א־ת׳אני;ג׳ומאדא אל־אולא;ג׳ומאדא א־ת׳אניה;רג׳ב;שעבאן;רמדאן'),
    mmm6: _('רמדאן;שוואל;ד׳ו אל־קעדה;ד׳ו אל־חיג׳ה;מוחרם;רביע א׳;רביע ב׳;ג׳ומאדא א׳;ג׳ומאדא ב׳;רג׳ב;שעבאן;רמדאן'),
}, 'he');

addLocale(xm({
    group: '.',
    decimal: ',',
    mmmm: _('siječnja;veljače;ožujka;travnja;svibnja;lipnja;srpnja;kolovoza;rujna;listopada;studenoga;prosinca'),
    mmm: _('sij;velj;ožu;tra;svi;lip;srp;kol;ruj;lis;stu;pro'),
    dddd: _('nedjelja;ponedjeljak;utorak;srijeda;četvrtak;petak;subota'),
}, -1, 3), 'hr');

addLocale({
    decimal: ',',
    mmmm: _('հունվարի;փետրվարի;մարտի;ապրիլի;մայիսի;հունիսի;հուլիսի;օգոստոսի;սեպտեմբերի;հոկտեմբերի;նոյեմբերի;դեկտեմբերի'),
    mmm: _('հնվ;փտվ;մրտ;ապր;մյս;հնս;հլս;օգս;սեպ;հոկ;նոյ;դեկ'),
    dddd: _('կիրակի;երկուշաբթի;երեքշաբթի;չորեքշաբթի;հինգշաբթի;ուրբաթ;շաբաթ'),
    ddd: _('կիր;երկ;երք;չրք;հնգ;ուր;շբթ'),
}, 'hy');

addLocale(xm({
    decimal: ',',
    mmmm: _('იანვარი;თებერვალი;მარტი;აპრილი;მაისი;ივნისი;ივლისი;აგვისტო;სექტემბერი;ოქტომბერი;ნოემბერი;დეკემბერი'),
    dddd: _('კვირა;ორშაბათი;სამშაბათი;ოთხშაბათი;ხუთშაბათი;პარასკევი;შაბათი'),
}, 3, 3), 'ka');

addLocale(xm({
    decimal: ',',
    mmmm: _('қаңтар;ақпан;наурыз;сәуір;мамыр;маусым;шілде;тамыз;қыркүйек;қазан;қараша;желтоқсан'),
    dddd: _('жексенбі;дүйсенбі;сейсенбі;сәрсенбі;бейсенбі;жұма;сенбі'),
    ddd: _('жс;дс;сс;ср;бс;жм;сб'),
}, 13, -1), 'kk');

addLocale({
    group: ',',
    mmmm: _('ಜನವರಿ;ಫೆಬ್ರವರಿ;ಮಾರ್ಚ್;ಏಪ್ರಿಲ್;ಮೇ;ಜೂನ್;ಜುಲೈ;ಆಗಸ್ಟ್;ಸೆಪ್ಟೆಂಬರ್;ಅಕ್ಟೋಬರ್;ನವೆಂಬರ್;ಡಿಸೆಂಬರ್'),
    mmm: _('ಜನವರಿ;ಫೆಬ್ರವರಿ;ಮಾರ್ಚ್;ಏಪ್ರಿ;ಮೇ;ಜೂನ್;ಜುಲೈ;ಆಗಸ್ಟ್;ಸೆಪ್ಟೆಂ;ಅಕ್ಟೋ;ನವೆಂ;ಡಿಸೆಂ'),
    dddd: _('ಭಾನು~;ಸೋಮ~;ಮಂಗಳ~;ಬುಧ~;ಗುರು~;ಶುಕ್ರ~;ಶನಿ~', 'ವಾರ'),
    ddd: _('ಭಾನು;ಸೋಮ;ಮಂಗಳ;ಬುಧ;ಗುರು;ಶುಕ್ರ;ಶನಿ'),
    ampm: _('ಪೂರ್ವಾಹ್ನ;ಅಪರಾಹ್ನ'),
}, 'kn');

addLocale({
    decimal: ',',
    mmmm: _('sausio;vasario;kovo;balandžio;gegužės;birželio;liepos;rugpjūčio;rugsėjo;spalio;lapkričio;gruodžio'),
    mmm: _('saus.;vas.;kov.;bal.;geg.;birž.;liep.;rugp.;rugs.;spal.;lapkr.;gruod.'),
    dddd: _('sekmadienis;pirmadienis;antradienis;trečiadienis;ketvirtadienis;penktadienis;šeštadienis'),
    ddd: _('sk;pr;an;tr;kt;pn;št'),
    ampm: _('priešpiet;popiet'),
}, 'lt');

addLocale({
    decimal: ',',
    mmmm: _('janvāris;februāris;marts;aprīlis;maijs;jūnijs;jūlijs;augusts;septembris;oktobris;novembris;decembris'),
    mmm: _('janv.;febr.;marts;apr.;maijs;jūn.;jūl.;aug.;sept.;okt.;nov.;dec.'),
    dddd: _('svētdiena;pirmdiena;otrdiena;trešdiena;ceturtdiena;piektdiena;sestdiena'),
    ddd: _('svētd.;pirmd.;otrd.;trešd.;ceturtd.;piektd.;sestd.'),
    ampm: _('priekšpusdienā;pēcpusdienā'),
}, 'lv');

addLocale({
    group: ',',
    decimal: '.',
    mmmm: _('ജനുവരി;ഫെബ്രുവരി;മാർച്ച്;ഏപ്രിൽ;മേയ്;ജൂൺ;ജൂലൈ;ഓഗസ്റ്റ്;സെപ്റ്റംബർ;ഒക്‌ടോബർ;നവംബർ;ഡിസംബർ'),
    mmm: _('ജനു;ഫെബ്രു;മാർ;ഏപ്രി;മേയ്;ജൂൺ;ജൂലൈ;ഓഗ;സെപ്റ്റം;ഒക്ടോ;നവം;ഡിസം'),
    dddd: _('ഞായറാഴ്‌ച;തിങ്കളാഴ്‌ച;ചൊവ്വാഴ്ച;ബുധനാഴ്‌ച;വ്യാഴാഴ്‌ച;വെള്ളിയാഴ്‌ച;ശനിയാഴ്‌ച'),
    ddd: _('ഞായർ;തിങ്കൾ;ചൊവ്വ;ബുധൻ;വ്യാഴം;വെള്ളി;ശനി'),
}, 'ml');

addLocale({
    group: ',',
    decimal: '.',
    mmmm: _('нэгдүгээ~;хоёрдугаа~;гуравдугаа~;дөрөвдүгээ~;тавдугаа~;зургаадугаа~;долоодугаа~;наймдугаа~;есдүгээ~;аравдугаа~;арван нэгдүгээ~;арван хоёрдугаа~', 'р сар'),
    mmm: _('1~;2~;3~;4~;5~;6~;7~;8~;9~;10~;11~;12~', '-р сар'),
    dddd: _('ням;даваа;мягмар;лхагва;пүрэв;баасан;бямба'),
    ddd: _('Ня;Да;Мя;Лх;Пү;Ба;Бя'),
    ampm: _('ү.ө.;ү.х.'),
}, 'mn');

addLocale({
    group: ',',
    decimal: '.',
    mmmm: _('जानेवारी;फेब्रुवारी;मार्च;एप्रिल;मे;जून;जुलै;ऑगस्ट;सप्टेंबर;ऑक्टोबर;नोव्हेंबर;डिसेंबर'),
    mmm: _('जाने;फेब्रु;मार्च;एप्रि;मे;जून;जुलै;ऑग;सप्टें;ऑक्टो;नोव्हें;डिसें'),
    dddd: _('रविवार;सोमवार;मंगळवार;बुधवार;गुरुवार;शुक्रवार;शनिवार'),
    ddd: _('रवि;सोम;मंगळ;बुध;गुरु;शुक्र;शनि'),
}, 'mr');

addLocale(xm({
    group: ',',
    decimal: '.',
    mmmm: _('ဇန်နဝါရီ;ဖေဖော်ဝါရီ;မတ်;ဧပြီ;မေ;ဇွန်;ဇူလိုင်;ဩဂုတ်;စက်တင်ဘာ;အောက်တိုဘာ;နိုဝင်ဘာ;ဒီဇင်ဘာ'),
    mmm: _('ဇန်;ဖေ;မတ်;ဧ;မေ;ဇွန်;ဇူ;ဩ;စက်;အောက်;နို;ဒီ'),
    dddd: _('တနင်္ဂနွေ;တနင်္လာ;အင်္ဂါ;ဗုဒ္ဓဟူး;ကြာသပတေး;သောကြာ;စနေ'),
    ampm: _('နံနက်;ညနေ'),
}, -1, 0), 'my');

addLocale({
    group: ',',
    decimal: '.',
    mmmm: _('ਜਨਵਰੀ;ਫ਼ਰਵਰੀ;ਮਾਰਚ;ਅਪ੍ਰੈਲ;ਮਈ;ਜੂਨ;ਜੁਲਾਈ;ਅਗਸਤ;ਸਤੰਬਰ;ਅਕਤੂਬਰ;ਨਵੰਬਰ;ਦਸੰਬਰ'),
    mmm: _('ਜਨ;ਫ਼ਰ;ਮਾਰਚ;ਅਪ੍ਰੈ;ਮਈ;ਜੂਨ;ਜੁਲਾ;ਅਗ;ਸਤੰ;ਅਕਤੂ;ਨਵੰ;ਦਸੰ'),
    dddd: _('ਐਤਵਾਰ;ਸੋਮਵਾਰ;ਮੰਗਲਵਾਰ;ਬੁੱਧਵਾਰ;ਵੀਰਵਾਰ;ਸ਼ੁੱਕਰਵਾਰ;ਸ਼ਨਿੱਚਰਵਾਰ'),
    ddd: _('ਐਤ;ਸੋਮ;ਮੰਗਲ;ਬੁੱਧ;ਵੀਰ;ਸ਼ੁੱਕਰ;ਸ਼ਨਿੱਚਰ'),
    ampm: _('ਪੂ.ਦੁ.;ਬਾ.ਦੁ.'),
}, 'pa');

addLocale({
    group: '.',
    decimal: ',',
    mmmm: _('ianuarie;februarie;martie;aprilie;mai;iunie;iulie;august;septem~;octom~;noiem~;decem~', 'brie'),
    mmm: _('ian.;feb.;mar.;apr.;mai;iun.;iul.;aug.;sept.;oct.;nov.;dec.'),
    dddd: _('duminică;luni;marți;miercuri;joi;vineri;sâmbătă'),
    ddd: _('dum.;lun.;mar.;mie.;joi;vin.;sâm.'),
    ampm: _('a.m.;p.m.'),
}, 'ro');

addLocale(xm({
    group: '.',
    decimal: ',',
    mmmm: _('januar;februar;marec;april;maj;junij;julij;avgust;september;oktober;november;december'),
    mmm: _('jan.;feb.;mar.;apr.;maj;jun.;jul.;avg.;sep.;okt.;nov.;dec.'),
    dddd: _('nedelja;ponedeljek;torek;sreda;četrtek;petek;sobota'),
    ampm: _('dop.;pop.'),
}, -1, 13), 'sl');

addLocale(xm({
    group: '.',
    decimal: ',',
    mmmm: _('јануар;фебруар;март;април;мај;јун;јул;август;септембар;октобар;новембар;децембар'),
    dddd: _('недеља;понедељак;уторак;среда;четвртак;петак;субота'),
}, 3, 3), 'sr');

addLocale({
    group: ',',
    decimal: '.',
    mmmm: _('ஜனவரி;பிப்ரவரி;மார்ச்;ஏப்ரல்;மே;ஜூன்;ஜூலை;ஆகஸ்ட்;செப்டம்பர்;அக்டோபர்;நவம்பர்;டிசம்பர்'),
    mmm: _('ஜன.;பிப்.;மார்.;ஏப்.;மே;ஜூன்;ஜூலை;ஆக.;செப்.;அக்.;நவ.;டிச.'),
    dddd: _('ஞாயிறு;திங்கள்;செவ்வாய்;புதன்;வியாழன்;வெள்ளி;சனி'),
    ddd: _('ஞாயி.;திங்.;செவ்.;புத.;வியா.;வெள்.;சனி'),
}, 'ta');

addLocale({
    group: ',',
    decimal: '.',
    mmmm: _('జనవరి;ఫిబ్రవరి;మార్చి;ఏప్రిల్;మే;జూన్;జులై;ఆగస్టు;సెప్టెంబర్;అక్టోబర్;నవంబర్;డిసెంబర్'),
    mmm: _('జన;ఫిబ్ర;మార్చి;ఏప్రి;మే;జూన్;జులై;ఆగ;సెప్టెం;అక్టో;నవం;డిసెం'),
    dddd: _('ఆదివారం;సోమవారం;మంగళవారం;బుధవారం;గురువారం;శుక్రవారం;శనివారం'),
    ddd: _('ఆది;సోమ;మంగళ;బుధ;గురు;శుక్ర;శని'),
}, 'te');

addLocale({
    decimal: ',',
    mmmm: _('січня;лютого;березня;квітня;травня;червня;липня;серпня;вересня;жовтня;листопада;грудня'),
    mmm: _('січ.;лют.;бер.;квіт.;трав.;черв.;лип.;серп.;вер.;жовт.;лист.;груд.'),
    dddd: _('неділю;понеділок;вівторок;середу;четвер;пʼятницю;суботу'),
    ddd: _('нд;пн;вт;ср;чт;пт;сб'),
    ampm: _('дп;пп'),
}, 'uk');

addLocale({
    group: '.',
    decimal: ',',
    mmmm: _('~1;~2;~3;~4;~5;~6;~7;~8;~9;~10;~11;~12', 'tháng '),
    mmm: _('~1;~2;~3;~4;~5;~6;~7;~8;~9;~10;~11;~12', 'thg '),
    dddd: _('Chủ Nhật;Thứ Hai;Thứ Ba;Thứ Tư;Thứ Năm;Thứ Sáu;Thứ Bảy'),
    ddd: _('CN;Th 2;Th 3;Th 4;Th 5;Th 6;Th 7'),
    ampm: _('SA;CH'),
}, 'vi');

addLocale(xm({
    group: '٬',
    decimal: '٫',
    ampm: _('ص;م'),
    mmmm: _('يناير;فبراير;مارس;أبريل;مايو;يونيو;يوليو;أغسطس;سبتمبر;أكتوبر;نوفمبر;ديسمبر'),
    dddd: _('الأحد;الاثنين;الثلاثاء;الأربعاء;الخميس;الجمعة;السبت'),
    mmmm6: _('رمضان;شوال;ذو القعدة;ذو الحجة;محرم;ربيع الأول;ربيع الآخرة;جمادى الأولى;جمادى الآخرة;رجب;شعبان;رمضان'),
}, 0, 0), 'ar');

addLocale({
    group: ',',
    decimal: '.',
    mmmm: _('জানুয়ারী;ফেব্রুয়ারী;মার্চ;এপ্রিল;মে;জুন;জুলাই;আগস্ট;সেপ্টেম্বর;অক্টোবর;নভেম্বর;ডিসেম্বর'),
    mmm: _('জানু;ফেব;মার্চ;এপ্রি;মে;জুন;জুল;আগ;সেপ্টেঃ;অক্টোঃ;নভেঃ;ডিসেঃ'),
    dddd: _('রবিবার;সোমবার;মঙ্গলবার;বুধবার;বৃহস্পতিবার;শুক্রবার;শনিবার'),
    ddd: _('রবি;সোম;মঙ্গল;বুধ;বৃহস্পতি;শুক্র;শনি'),
}, 'bn');

addLocale({
    group: ',',
    decimal: '.',
    mmmm: _('जनवरी;फ़रवरी;मार्च;अप्रैल;मई;जून;जुलाई;अगस्त;सितंबर;अक्तूबर;नवंबर;दिसंबर'),
    mmm: _('जन॰;फ़र॰;मार्च;अप्रैल;मई;जून;जुल॰;अग॰;सित॰;अक्तू॰;नव॰;दिस॰'),
    dddd: _('रविवार;सोमवार;मंगलवार;बुधवार;गुरुवार;शुक्रवार;शनिवार'),
    ddd: _('रवि;सोम;मंगल;बुध;गुरु;शुक्र;शनि'),
    ampm: _('am;pm'),
}, 'hi');
