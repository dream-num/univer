import { codeToLocale } from './core/code-to-locale';
import { dec2frac } from './core/dec2frac';
import { color, formatNumber, isDate, isPercent, isText } from './core/format-number';
import { addLocale, getLocale, LocaleData, parseLocale } from './core/locale';
import { options, OptionsData } from './core/options';
import { PartType } from './core/parse-part';
import { parseCatch, parsePattern, PatternType } from './core/parse-pattern';
import { parseBool, parseDate, parseNumber, parseTime, parseValue } from './core/parse-value';
import { round } from './core/round';
import { dateFromSerial, dateToSerial } from './core/serial-date';

export interface FormatterType {
    pattern: string | undefined;
    error: string;
    options: (opts?: OptionsData) => {
        overflow?: string | undefined;
        dateErrorThrows?: boolean | undefined;
        dateSpanLarge?: boolean | undefined;
        dateErrorNumber?: boolean | undefined;
        invalid?: string | undefined;
        locale?: string | undefined;
        leap1900?: boolean | undefined;
        nbsp?: boolean | undefined;
        throws?: boolean | undefined;
        ignoreTimezone?: boolean | undefined;
    };
    locale: string;
    (value: number | string | null | unknown | void, opts?: OptionsData): string;
    color(value: number | string | null | unknown | void, ops?: OptionsData | undefined): string;
    isDate(): boolean;
    isText(): boolean;
    isPercent(): boolean;
}

const _cache: { [key: string]: PatternType } = {};

function getFormatter(parseData: PatternType, initOpts: OptionsData = {}): FormatterType {
    const { pattern, partitions, locale } = parseData;

    const getRuntimeOptions = (opts: OptionsData = {}) => {
        const runOpts = { ...options(), ...initOpts, ...opts };
        if (locale) {
            runOpts.locale = locale;
        }
        return runOpts;
    };

    const formatter: FormatterType = (value: number | string | null | unknown | void, opts?: OptionsData) => {
        if (value) {
            const o = getRuntimeOptions(opts);
            return formatNumber(dateToSerial(value as any[] | Date, o) as string | number, partitions as PartType[], o);
        }
        return String();
    };
    formatter.color = (value, opts = {}) => {
        const o = getRuntimeOptions(opts);
        return color(dateToSerial(value as any[] | Date, o) as number, partitions as PartType[]);
    };
    formatter.isPercent = () => isPercent(partitions as PartType[]);
    formatter.isDate = () => isDate(partitions as PartType[]);
    formatter.isText = () => isText(partitions as PartType[]);
    formatter.pattern = pattern;
    if (parseData.error) {
        formatter.error = parseData.error;
    }
    formatter.options = getRuntimeOptions;
    formatter.locale = locale || (initOpts && initOpts.locale) || '';
    return Object.freeze(formatter);
}

function numfmt(pattern?: string, opts: OptionsData = {}): FormatterType {
    if (!pattern) {
        pattern = 'General';
    }
    let parseData = null;
    if (_cache[pattern]) {
        parseData = _cache[pattern];
    } else {
        const constructOpts = { ...options(), ...opts };
        parseData = constructOpts.throws ? parsePattern(pattern) : parseCatch(pattern);
        if (!parseData.error) {
            _cache[pattern] = parseData;
        }
    }
    return getFormatter(parseData, opts);
}

numfmt.isDate = (d: string) => numfmt(d, { throws: false }).isDate();
numfmt.isPercent = (d: string) => numfmt(d, { throws: false }).isPercent();
numfmt.isText = (d: string) => numfmt(d, { throws: false }).isText();

numfmt.dateToSerial = dateToSerial;
numfmt.dateFromSerial = dateFromSerial;
numfmt.options = options;
numfmt.dec2frac = dec2frac;
numfmt.round = round;
numfmt.codeToLocale = codeToLocale;
numfmt.getLocale = getLocale;
numfmt.parseLocale = parseLocale;
numfmt.addLocale = (options: LocaleData, l4e: string) => {
    const c = parseLocale(l4e);
    // when locale is changed, expire all cached patterns
    delete _cache[c.lang || ''];
    delete _cache[c.language || ''];
    return addLocale(options, c);
};

// SSF interface compatibility
function format(pattern: string | undefined, value: any[] | Date, l4e: any, noThrows = false) {
    const opts = l4e && typeof l4e === 'object' ? l4e : { locale: l4e, throws: !noThrows };
    return numfmt(pattern, opts)(dateToSerial(value, opts), opts);
}
numfmt.format = format;
numfmt.is_date = numfmt.isDate;
numfmt.parseNumber = parseNumber;
numfmt.parseDate = parseDate;
numfmt.parseTime = parseTime;
numfmt.parseBool = parseBool;
numfmt.parseValue = parseValue;

export { numfmt };
