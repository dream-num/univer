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

import type { LocaleData } from './types';
import { getRegionalDatePattern, getRegionalTimePattern } from '../../services/region/date-format';
import { getRegionParts, RegionRules } from '../../services/region/region-rules';
import { defaultLocale, getLocale } from './locale';
import { nativeDigitFormat } from './native-digits';

// Excel for Mac 16.115 month and meridiem names that differ from the registered numfmt locales.
const calendarNames = new RegionRules<Partial<LocaleData>>();
calendarNames.add({
    mmm: 'محرم|صفر|ربيع الأول|ربيع الآخر|جمادى الأولى|جمادى الآخرة|رجب|شعبان|رمضان|شوال|ذو القعدة|ذو الحجة'.split('|'),
    mmmm: 'محرم|صفر|ربيع الأول|ربيع الآخر|جمادى الأولى|جمادى الآخرة|رجب|شعبان|رمضان|شوال|ذو القعدة|ذو الحجة'.split('|'),
}, 'ar', 'SA');
calendarNames.add({
    mmm: 'Jan|Feb|Mär|Apr|Mai|Jun|Jul|Aug|Sep|Okt|Nov|Dez'.split('|'),
}, 'de');
calendarNames.add({
    ampm: 'am|pm'.split('|'),
}, 'en', 'GB');
calendarNames.add({
    ampm: 'a.\u202Fm.|p.\u202Fm.'.split('|'),
}, 'es', 'ES');
calendarNames.add({
    ampm: 'a.m.|p.m.'.split('|'),
    mmm: 'janv|févr|mars|avr|mai|juin|juill|août|sept|oct|nov|déc'.split('|'),
}, 'fr', 'CA');
calendarNames.add({
    mmm: 'jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez'.split('|'),
}, 'pt');
calendarNames.add({
    mmm: 'сту|лют|сак|кра|май|чэр|ліп|жні|вер|кас|ліс|сне'.split('|'),
    mmmm: 'студзень|люты|сакавік|красавік|май|чэрвень|ліпень|жнівень|верасень|кастрычнік|лістапад|снежань'.split('|'),
}, 'be');
calendarNames.add({
    mmm: 'জানু|ফেব|মার্চ|এপ্রিল|মে|জুন|জুলাই|আগস্ট|সেপ্ট|অক্টো|নভেম্বর|ডিসে'.split('|'),
    mmmm: 'জানুয়ারি|ফেব্রুয়ারি|মার্চ|এপ্রিল|মে|জুন|জুলাই|আগস্ট|সেপ্টেম্বর|অক্টোবর|নভেম্বর|ডিসেম্বর'.split('|'),
}, 'bn');
calendarNames.add({
    ampm: 'a.\u202Fm.|p.\u202Fm.'.split('|'),
    mmm: 'gen|febr|març|abr|maig|juny|jul|ag|set|oct|nov|des'.split('|'),
    mmmm: 'gener|febrer|març|abril|maig|juny|juliol|agost|setembre|octubre|novembre|desembre'.split('|'),
}, 'ca');
calendarNames.add({
    mmm: 'led|úno|bře|dub|kvě|čvn|čvc|srp|zář|říj|lis|pro'.split('|'),
    mmmm: 'leden|únor|březen|duben|květen|červen|červenec|srpen|září|říjen|listopad|prosinec'.split('|'),
}, 'cs');
calendarNames.add({
    mmm: 'jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec'.split('|'),
}, 'da');
calendarNames.add({
    ampm: 'སྔ་ཆ་|ཕྱི་ཆ་'.split('|'),
    mmm: 'ཟླ་༡|ཟླ་༢|ཟླ་༣|ཟླ་༤|ཟླ་༥|ཟླ་༦|ཟླ་༧|ཟླ་༨|ཟླ་༩|ཟླ་༡༠|ཟླ་༡༡|ཟླ་༡༢'.split('|'),
    mmmm: 'སྤྱི་ཟླ་དངཔ་|སྤྱི་ཟླ་གཉིས་པ་|སྤྱི་ཟླ་གསུམ་པ་|སྤྱི་ཟླ་བཞི་པ|སྤྱི་ཟླ་ལྔ་པ་|སྤྱི་ཟླ་དྲུག་པ|སྤྱི་ཟླ་བདུན་པ་|སྤྱི་ཟླ་བརྒྱད་པ་|སྤྱི་ཟླ་དགུ་པ་|སྤྱི་ཟླ་བཅུ་པ་|སྤྱི་ཟླ་བཅུ་གཅིག་པ་|སྤྱི་ཟླ་བཅུ་གཉིས་པ་'.split('|'),
}, 'dz');
calendarNames.add({
    ampm: 'πμ|μμ'.split('|'),
    mmm: 'Ιαν|Φεβ|Μάρ|Απρ|Μάι|Ιούν|Ιούλ|Αύγ|Σεπ|Οκτ|Νοέ|Δεκ'.split('|'),
}, 'el');
calendarNames.add({
    ampm: 'ق.ظ.|ب.ظ.'.split('|'),
    mmm: 'فروردین|اردیبهشت|خرداد|تیر|مرداد|شهریور|مهر|آبان|آذر|دی|بهمن|اسفند'.split('|'),
    mmmm: 'فروردین|اردیبهشت|خرداد|تیر|مرداد|شهریور|مهر|آبان|آذر|دی|بهمن|اسفند'.split('|'),
}, 'fa');
calendarNames.add({
    mmm: 'tammi|helmi|maalis|huhti|touko|kesä|heinä|elo|syys|loka|marras|joulu'.split('|'),
    mmmm: 'tammikuu|helmikuu|maaliskuu|huhtikuu|toukokuu|kesäkuu|heinäkuu|elokuu|syyskuu|lokakuu|marraskuu|joulukuu'.split('|'),
}, 'fi');
calendarNames.add({
    mmm: 'janv|févr|mars|avr|mai|juin|juil|août|sept|oct|nov|déc'.split('|'),
}, 'fr');
calendarNames.add({
    ampm: 'לפ׳|אח׳'.split('|'),
}, 'he');
calendarNames.add({
    ampm: 'पू|अ'.split('|'),
}, 'hi');
calendarNames.add({
    mmm: 'jan|febr|márc|ápr|máj|jún|júl|aug|szept|okt|nov|dec'.split('|'),
}, 'hu');
calendarNames.add({
    ampm: 'AM|PM'.split('|'),
    mmm: 'jan|feb|mrt|apr|mei|jun|jul|aug|sep|okt|nov|dec'.split('|'),
}, 'nl');
calendarNames.add({
    ampm: 'am|pm'.split('|'),
    mmm: 'jan|feb|mar|apr|mai|jun|jul|aug|sep|okt|nov|des'.split('|'),
}, 'no');
calendarNames.add({
    mmmm: 'styczeń|luty|marzec|kwiecień|maj|czerwiec|lipiec|sierpień|wrzesień|październik|listopad|grudzień'.split('|'),
}, 'pl');
calendarNames.add({
    mmm: 'ian|feb|mar|apr|mai|iun|iul|aug|sept|oct|nov|dec'.split('|'),
}, 'ro');
calendarNames.add({
    mmm: 'янв|февр|март|апр|май|июнь|июль|авг|сент|окт|нояб|дек'.split('|'),
    mmmm: 'январь|февраль|март|апрель|май|июнь|июль|август|сентябрь|октябрь|ноябрь|декабрь'.split('|'),
}, 'ru');
calendarNames.add({
    mmmm: 'január|február|marec|apríl|máj|jún|júl|august|september|október|november|december'.split('|'),
}, 'sk');
calendarNames.add({
    mmm: 'jan|feb|mars|apr|maj|juni|juli|aug|sep|okt|nov|dec'.split('|'),
}, 'sv');
calendarNames.add({
    ampm: 'AM|PM'.split('|'),
}, 'th');
calendarNames.add({
    mmm: 'січ|лют|бер|квіт|трав|черв|лип|серп|вер|жовт|лист|груд'.split('|'),
    mmmm: 'січень|лютий|березень|квітень|травень|червень|липень|серпень|вересень|жовтень|листопад|грудень'.split('|'),
}, 'uk');
calendarNames.add({
    mmm: 'Tháng 1|Tháng 2|Tháng 3|Tháng 4|Tháng 5|Tháng 6|Tháng 7|Tháng 8|Tháng 9|Tháng 10|Tháng 11|Tháng 12'.split('|'),
    mmmm: 'Tháng 1|Tháng 2|Tháng 3|Tháng 4|Tháng 5|Tháng 6|Tháng 7|Tháng 8|Tháng 9|Tháng 10|Tháng 11|Tháng 12'.split('|'),
}, 'vi');

const calendarCache = new WeakMap<LocaleData, Map<Partial<LocaleData>, LocaleData>>();

export function getRegionalCalendarLocale(region: string, locale?: string): LocaleData {
    const language = getRegionParts(region)?.language;
    const ui = locale && getRegionParts(locale)?.language;
    // East Asian editions use their localized date tokens for native names and English for mmm/mmmm.
    if (language === ui && (ui === 'ja' || ui === 'ko' || ui === 'zh')) return defaultLocale;
    const base = getLocale(region) ?? getLocale(language ?? '') ?? defaultLocale;
    const overrides = calendarNames.resolve(region);
    if (!overrides) return base;
    let cache = calendarCache.get(base);
    if (!cache) {
        cache = new Map();
        calendarCache.set(base, cache);
    }
    let calendar = cache.get(overrides);
    if (!calendar) {
        calendar = { ...base, ...overrides };
        cache.set(overrides, calendar);
    }
    return calendar;
}

// Inferred formats written for native-digit input use Excel's localized format-code alphabet.
// An unrecognized field is stored as literal text. Unrecognized elapsed-hour codes select General.
const nativeDateCodes = new RegionRules<string>();
nativeDateCodes.add('yyyy-mm/dd', 'fr', 'CA');
nativeDateCodes.add('dd.mm/yy', 'de', 'DE');
nativeDateCodes.add('General', 'fr de it el');
nativeDateCodes.add('dd/mm/yyyy', 'fi ru');
nativeDateCodes.add('yyyy/mm/dd', 'hu');
nativeDateCodes.add('yyyy-mm/dd', 'sv');
const literalYear = new Set('de ca cs da es fi fr hu nl no pl pt ru sv'.split(' '));
const literalDay = new Set('de fi fr hu ru'.split(' '));
const literalHour = new Set('da el fi nl no pl ru sv tr'.split(' '));
const literalMinute = new Set('el ru tr'.split(' '));
const alternateCalendar = new Set('ar bn fa he hi th vi'.split(' '));

export function usesEnglishCalendarNames(region: string): boolean {
    return alternateCalendar.has(getRegionParts(region)?.language ?? '');
}

export function getNativeCalendarFormat(input: string, region: string, system: number, short: string): string | undefined {
    const language = getRegionParts(region)?.language ?? '';
    const literal = (field: string) => field.replace(/./g, '\\$&');
    let pattern = input;
    if (pattern === 'm/d/yy') {
        pattern = nativeDateCodes.resolve(region) ?? short.replace(/[.-]/g, '/').replace(/d+|m+/g, (part) => part[0].repeat(2));
        if (pattern === 'General') return undefined;
        pattern = pattern.replace(/d+|m+|y+/g, (field) => {
            if (field[0] === 'y' && literalYear.has(language)) return literal(field);
            if (field[0] === 'd' && literalDay.has(language)) return literal(field);
            if (field[0] === 'm' && literalMinute.has(language)) return literal(field);
            if (field === 'mm' && language === 'hu') return 'ss';
            if (field === 'dd' && language === 'tr') return 'mm';
            return field;
        });
    } else if (pattern === 'mmm-yy') {
        const year = short.includes('yyyy') ? 'yyyy' : 'yy';
        let month = 'mmm';
        if (language === 'fi') month = 'mm';
        else if (language === 'ku') month = literal(month);
        pattern = `${month}-${literalYear.has(language) ? literal(year) : year}`;
    } else if (pattern === 'd-mmm-yy') {
        pattern = 'dd-mmm-yy';
    } else if (pattern.includes(':')) {
        if (literalHour.has(language) && pattern.includes('[h]')) return undefined;
        pattern = pattern.replace(/\[h\]|AM\/PM|h|m+|s+|:/g, (field, index) => {
            if (language === 'hu') {
                if (field === '[h]') return '[m]';
                if (field === 'h') return 'm';
                if (field === 'mm') return 'ss';
                if (field === 'ss') return literal(field);
            }
            if (literalHour.has(language) && (field === 'h' || (field === ':' && (index === 1 || literalMinute.has(language))))) return literal(field);
            if (literalMinute.has(language) && (field === 'mm' || field === 'ss')) return language === 'tr' && field === 'ss' ? 'hh' : literal(field);
            return field;
        });
    }
    return nativeDigitFormat(system, 0, pattern);
}

const japaneseEras = [
    { name: '令和', initial: 'R', start: 20190501 },
    { name: '平成', initial: 'H', start: 19890108 },
    { name: '昭和', initial: 'S', start: 19261225 },
    { name: '大正', initial: 'T', start: 19120730 },
    { name: '明治', initial: 'M', start: 18680125 },
];

export function getJapaneseEra(year: number, month: number, day: number) {
    const date = year * 10000 + month * 100 + day;
    return japaneseEras.find((era) => date >= era.start);
}

export function parseEastAsianDate(text: string, region: string, locale?: string) {
    const language = getRegionParts(region)?.language;
    if (!locale || getRegionParts(locale)?.language !== language) return undefined;
    if (language === 'ja' || language === 'zh') {
        const gregorian = /^(\d{4})年(\d{1,2})月(\d{1,2})日$/.exec(text);
        if (gregorian) return { year: +gregorian[1], month: +gregorian[2], day: +gregorian[3], path: 'm"月"d"日"yy"年"' };
        if (language === 'ja') {
            const kanji = /^(\D{2})(\d{1,2})年(\d{1,2})月(\d{1,2})日$/.exec(text);
            const initial = /^([rhstm])(\d{1,2})([./-])(\d{1,2})\3(\d{1,2})$/i.exec(text);
            const era = japaneseEras.find(({ name, initial: letter }) => kanji?.[1] === name || initial?.[1].toUpperCase() === letter);
            if (era && (kanji || initial)) {
                const [, , year] = (kanji ?? initial)!;
                const month = kanji ? kanji[3] : initial![4];
                const day = kanji ? kanji[4] : initial![5];
                return { year: Math.floor(era.start / 10000) + Number(year) - 1, month: +month, day: +day, path: kanji ? '[$-411]m"月"d"日"ggge"年"' : '[$-411]m.d.ge' };
            }
        }
    } else if (language === 'ko') {
        const fields = /^(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일$/.exec(text);
        if (fields) return { year: +fields[1], month: +fields[2], day: +fields[3], path: 'm"월" d"일" yy"년"' };
    }
    return undefined;
}

const localizedEastAsianPatterns: Record<string, string> = {
    'm"月"d"日"yy"年"': 'yyyy"年"m"月"d"日"',
    'm"월" d"일" yy"년"': 'yyyy"년" m"월" d"일"',
    '[$-411]m"月"d"日"ggge"年"': '[$-411]ggge"年"m"月"d"日"',
    '[$-411]m.d.ge': '[$-411]ge"."m"."d',
};

export function localizeBuiltInDatePattern(pattern: string, region: string, locale?: string): string | undefined {
    if (pattern.toLowerCase() === 'm/d/yy' || pattern === 'm/d/yy h:mm') {
        const date = getRegionalDatePattern(region, locale).replace(/[.-]/g, '/');
        if (!pattern.endsWith('h:mm')) return date;
        const hour = getRegionalTimePattern(region).startsWith('hh') ? 'hh' : 'h';
        return `${date} ${hour}:mm`;
    }
    if (pattern === 'd-mmm-yy' || pattern === 'd-mmm' || pattern === 'mmm-yy') {
        const short = getRegionalDatePattern(region, locale);
        const language = getRegionParts(region)?.language;
        const day = short.includes('dd') ? 'dd' : 'd';
        let separator = short.includes('.') ? '"."' : '"-"';
        if (language === 'pt') separator = '"/"';
        const [before, after] = language === 'de' ? ['". "', '" "'] : [separator, separator];
        return `${pattern.startsWith('d') ? `${day}${before}` : ''}mmm${pattern.endsWith('yy') ? `${after}yy` : ''}`;
    }
    if (pattern === 'h:mm' || pattern === 'h:mm:ss') {
        return getRegionalTimePattern(region).startsWith('hh') ? `h${pattern}` : pattern;
    }
    if (pattern.startsWith('B1') && /mmm/i.test(pattern)) return `[$-409]${pattern.slice(2)}`;
    if (!Object.hasOwn(localizedEastAsianPatterns, pattern) || !locale) return undefined;
    const language = getRegionParts(region)?.language;
    return language === getRegionParts(locale)?.language && (language === 'ja' || language === 'ko' || language === 'zh')
        ? localizedEastAsianPatterns[pattern]
        : undefined;
}
