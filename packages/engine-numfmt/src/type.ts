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

type FormatType =
    | 'currency'
    | 'date'
    | 'datetime'
    | 'error'
    | 'fraction'
    | 'general'
    | 'grouped'
    | 'number'
    | 'percent'
    | 'scientific'
    | 'text'
    | 'time';

/**
 * An arbirarty number that represents the format's specificity if you want to compare one to another. Integer comparisons roughly match Excel's resolutions when it determines which format wins out.
 *
 * text: 15
 * datetime: 10.8
 * date: 10.8
 * time: 10.8
 * percent: 10.6
 * currency: 10.4
 * grouped: 10.2
 * scientific: 6
 * number: 4
 * fraction: 2
 * general: 0
 * error: 0
 */
type Level = 15 | 10.8 | 10.6 | 10.4 | 10.2 | 6 | 4 | 2 | 0;

interface Info {
    type: FormatType;

    /**
     * Correspond to the output from same named functions found on the formatters.
     */
    isDate: boolean;
    isText: boolean;
    isPercent: boolean;

    /** The maximum number of decimals this format will emit. */
    maxDecimals: number;

    /**
     * 1 if the format uses color on the negative portion of the string, else a 0. This replicates Excel's CELL("color") functionality.
     */
    color: 0 | 1;

    /**
     * 1 if the positive portion of the number format contains an open parenthesis, else a 0. This is replicates Excel's CELL("parentheses") functionality.
     */
    parentheses: 0 | 1;

    /**
     * 1 if the positive portion of the format uses a thousands separator, else a 0.
     */
    grouped: 1;
    /**
     * Corresponds to Excel's CELL("format") functionality. It is should match Excel's quirky behaviour fairly well.
     */
    code: string;
    /**
     * The multiplier used when formatting the number (100 for percentages).
     */
    scale: 1;

    /**
     * An arbirarty number that represents the format's specificity if you want to compare one to another. Integer comparisons roughly match Excel's resolutions when it determines which format wins out.
     */
    level: Level;
    _partitions: Array<{
        color: string;
        tokens: Array<{ type: 'num'; num: string } | { type: 'point'; value: string } | { type: 'frac'; num: string }>;
    }>;
}

interface DateInfo {
    /** If any `y` or `b` operator was found in the pattern. */
    year: boolean;

    /** If any `m` operator was found in the pattern. */
    month: boolean;

    /** If any `d` operator was found in the pattern (including ones that emit weekday). */
    day: boolean;

    /** If any `h` operator was found in the pattern. */
    hours: boolean;

    /** If any `:m` operator was found in the pattern. */
    minutes: boolean;
    /** If any `s` operator was found in the pattern. */
    seconds: boolean;

    /** Will be set to `12` if AM/PM operators are being used in the formatting string, else it will be set to `24`. */
    clockType: 24 | 12;
}

interface Options {
    /**
     * A [BCP 47](https://www.rfc-editor.org/rfc/bcp/bcp47.txt) string tag. Locale default is english with a \u00a0 grouping symbol
     *
     * @default ""
     */
    locale: LocaleTag;

    /**
     * Should the formatter throw an error if a provided pattern is invalid. If not, a formatter will be constructed which only ever outputs an error string (see invalid in this table).
     * @default true
     */
    throws: boolean;

    /**
     * The string emitted when no-throw mode fails to parse a pattern.
     * @default "######"
     */
    invalid: string;

    /**
     * By default the formatters will emit [non-breaking-space](https://en.wikipedia.org/wiki/Non-breaking_space) rather than a regular space when emitting the formatted number. Setting this to false will make it use regular spaces instead.
     * @default true
     */
    nbsp: boolean;

    /**
     * Simulate the Lotus 1-2-3 [1900 leap year bug](https://docs.microsoft.com/en-us/office/troubleshoot/excel/wrongly-assumes-1900-is-leap-year). It is a requirement in the Ecma OOXML specification so it is on by default.
     *
     * @default false
     */
    leap1900: boolean;

    /**
     * Should the formatter throw an error when trying to format a date that is out of bounds?
     *
     * @default false
     */
    dateErrorThrows: boolean;

    /**
     * Should the formatter switch to a General number format when trying to format a date that is out of bounds?
     * @default true
     */
    dateErrorNumber: boolean;

    /**
     * The string emitted when a formatter fails to format a date that is out of bounds.
     * @default "######"
     */
    overflow: string;

    /**
     * Extends the allowed range of dates from Excel bounds (1900–9999) to Google Sheet bounds (0–99999).
     * @default true
     */
    dateSpanLarge: boolean;

    /**
     * Normally when date objects are used with the formatter, time zone is taken into account. This makes the formatter ignore the timezone offset.
     * @default false
     */
    ignoreTimezone: boolean;

    /**
     * when using the numfmt.parseDate, numfmt.parseValue and numfmt.dateFromSerial functions, the output will be a Date object.
     * @default false
     */
    nativeDate: boolean;
}

interface LocaleData {
    // non-breaking space
    group: string;
    decimal: string;
    positive: string;
    negative: string;
    percent: string;
    exponent: string;
    nan: string;
    infinity: string;
    ampm: [string, string];

    // gregorian calendar
    mmmm: string[];
    mmm: string[];
    dddd: string[];
    ddd: string[];

    // islamic calendar
    mmmm6: string[];
    mmm6: string[];
}

interface Formatter {
    isDate(): boolean;
    isPercent(): boolean;
    isText(): boolean;
    color(value: number): string;
    info: Info;
    dateInfo: DateInfo;
    (value: number): string;
}

type LocaleTag =
    | 'zh-CN'
    | 'zh'
    | 'zh-TW'
    | 'cs'
    | 'da'
    | 'nl'
    | 'en'
    | 'fi'
    | 'fr'
    | 'de'
    | 'el'
    | 'hu'
    | 'is'
    | 'id'
    | 'it'
    | 'ja'
    | 'ko'
    | 'nb'
    | 'pl'
    | 'pt'
    | 'ru'
    | 'sk'
    | 'es'
    | 'sv'
    | 'th'
    | 'tr';

export interface ParsedReturnType {
    /**
     * The parsed value. For dates, this will be an Excel style serial date unless the nativeDate option is used.
     */
    v: number | string | boolean | Date;
    /**
     * (Optionally) the number format string of the input. This property will not be present if it amounts to the General format.
     */
    z?: string;
}

type _Year = number;
type _MonthIndex = number;
type _Date = number | undefined;
type _Hours = number | undefined;
type _Minutes = number | undefined;
type _Seconds = number | undefined;
type _Ms = number | undefined;
type DateValue = [_Year, _MonthIndex, _Date, _Hours, _Minutes, _Seconds, _Ms];

type ParseValue = number | boolean | DateValue | Date | null;

export interface Numfmt {
    (value: string, opt?: Options): Formatter;

    format(pattern: string, value: ParseValue, opt?: Partial<Options>): string;

    round(value: number, places?: number): number;

    /**
     * @internal
     */
    parseLocale(tag: LocaleTag): void;
    getLocale(tag: LocaleTag): LocaleData | null;

    addLocale(data: Partial<LocaleData>, tag: LocaleTag): void;

    isDate(format: string): boolean;
    isPercent(format: string): boolean;
    isText(format: string): boolean;

    getInfo(format: string): Info;

    parseValue(value: string, op?: Options): ParsedReturnType;
    parseNumber(value: string, op?: Options): ParsedReturnType;
    parseDate(value: string, op?: Options): ParsedReturnType;
    parseTime(value: string, op?: Options): ParsedReturnType;
    parseBool(value: string, op?: Options): ParsedReturnType;

    dateToSerial(value: Date | [number, number, number], opt?: Options): number | string;

    dateFromSerial(value: number, opt?: Options): Date;

    options(op: Partial<Options>): void;
}
