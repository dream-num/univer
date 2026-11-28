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

import { DateSystem, excelSerialToDateTimeParts, getRegionalNumberFormat, numfmt } from '@univerjs/core';
import type { BaseValueObject } from '../../engine/value-object/base-value-object';
import { ErrorType } from '../../basics/error-type';
import { ErrorValueObject } from '../../engine/value-object/base-value-object';
import { StringValueObject } from '../../engine/value-object/primitive-object';
import { mapFinancialScalars } from '../financial/scalar-arguments';
import { formatExcelFixedDecimal, groupExcelInteger } from './excel-fixed-decimal';
import { formatExcelTextNumber } from './format-excel-text-number';
import { formatJapaneseGeneral } from './japanese-number-format';
import { normalizeExcelFormatCode, Text } from './text';

const JAPANESE_ERAS = [
    { start: 20190501, narrow: 'R', abbreviated: '令', name: '令和' },
    { start: 19890108, narrow: 'H', abbreviated: '平', name: '平成' },
    { start: 19261225, narrow: 'S', abbreviated: '昭', name: '昭和' },
    { start: 19120730, narrow: 'T', abbreviated: '大', name: '大正' },
    { start: 18681023, narrow: 'M', abbreviated: '明', name: '明治' },
];
const JAPANESE_FORMAT = /\[\$-0*(?:411|ja-JP)\]/i;
const OVERFLOW = '\0';

function formatLiteralDigits(code: string, value: number, region?: string): string | undefined {
    const match = /^([1-9][1-9,]*)(0*)(?:\.(0*)([1-9][0-9]*)?)?$/.exec(code);
    if (!match) return;
    const [, prefix, wholePlaceholders, fractionPlaceholders, fractionLiteral] = match;
    const literal = prefix.replace(/,/g, '');
    if (fractionPlaceholders === undefined && !wholePlaceholders) return `${value < 0 ? '-' : ''}${literal}`;
    const decimals = fractionPlaceholders?.length ?? 0;
    const amount = formatExcelFixedDecimal(Math.abs(value), decimals, false);
    const [integer, fraction = ''] = amount.split('.');
    const minimum = wholePlaceholders.length;
    const wholeNumber = integer === '0' && minimum === 0 ? '' : integer.padStart(minimum, '0');
    const whole = prefix.includes(',') ? groupExcelInteger(wholeNumber, region) : wholeNumber;
    const fractional = decimals || fractionLiteral ? `${getRegionalNumberFormat(region).decimal}${fraction}${fractionLiteral ?? ''}` : '';
    return `${value < 0 ? '-' : ''}${literal}${whole}${fractional}`;
}

function normalizeCalendarElapsed(code: string, serial: number): string {
    if (!code.includes('[') || serial < 0) return code;
    const { BREAK, DATETIME, DURATION } = numfmt.tokenTypes;
    const tokens = numfmt.tokenize(code);
    if (tokens.some(({ type }) => type === BREAK)) return code;
    let calendar = false;
    let elapsedHour = false;
    const clockSeconds = (serial - Math.floor(serial)) * 86400;
    const clockMinute = Math.floor(Math.round(clockSeconds) / 60);
    // With a calendar field first, Excel uses the seconds within the rounded minute as the elapsed date fraction.
    const elapsedSeconds = Math.round((clockSeconds - clockMinute * 60 + 0.5) * 86400);
    return tokens.map(({ raw, type }) => {
        if (elapsedHour && type === DATETIME && /^m+$/i.test(raw)) {
            return `"${String(clockMinute % 60).padStart(raw.length, '0')}"`;
        }
        if (type === DATETIME && /^[ymdgeb]/i.test(raw)) calendar = true;
        if (type !== DURATION || !calendar) return raw;
        const unit = raw[1].toLowerCase();
        elapsedHour = unit === 'h';
        const duration = Math.floor(elapsedSeconds / (elapsedHour ? 3600 : unit === 'm' ? 60 : 1));
        return `"${String(duration).padStart(raw.length - 2, '0')}"`;
    }).join('');
}

function negativeDateSection(code: string): { code: string; prefix: string } | undefined {
    const { BREAK, CONDITION } = numfmt.tokenTypes;
    const tokens = numfmt.tokenize(code);
    if (tokens.some(({ type }) => type === CONDITION)) return;
    const sections = [''];
    for (const { raw, type } of tokens) {
        if (type === BREAK) sections.push('');
        else sections[sections.length - 1] += raw;
    }
    const section = sections[1] ?? sections[0];
    if (numfmt.isDateFormat(section)) return { code: section, prefix: sections.length === 1 ? '-' : '' };
}

function normalizeJapaneseEra(code: string, serial: number, dateSystem: DateSystem): string {
    if (!JAPANESE_FORMAT.test(code)) return code;
    const parts = excelSerialToDateTimeParts(serial, { dateSystem });
    if (!parts) return code;
    const date = parts.year * 10000 + parts.month * 100 + parts.day;
    const era = JAPANESE_ERAS.find(({ start }) => date >= start);
    if (!era) return code;
    const year = parts.year - Math.floor(era.start / 10000) + 1;
    return numfmt.tokenize(code).map(({ raw, type }) => {
        if (type !== numfmt.tokenTypes.DATETIME) return raw;
        if (/^g+$/i.test(raw)) return `"${raw.length === 1 ? era.narrow : raw.length === 2 ? era.abbreviated : era.name}"`;
        if (/^e+$/i.test(raw)) return `"${String(year).padStart(raw.length, '0')}"`;
        return raw;
    }).join('');
}

function isValidTextFormat(code: string): boolean {
    if (!code.includes('[')) return true;
    let elapsed = 0;
    const { BREAK, DURATION, MODIFIER } = numfmt.tokenTypes;
    for (const token of numfmt.tokenize(code)) {
        if (token.type === BREAK) elapsed = 0;
        if (token.type === MODIFIER || (token.type === DURATION && ++elapsed > 1)) return false;
    }
    return true;
}

export class ExcelText extends Text {
    override calculate(value: BaseValueObject, format: BaseValueObject): BaseValueObject {
        return mapFinancialScalars([value, format], ([cell, codeValue]) => this._format(cell, codeValue));
    }

    private _format(cell: BaseValueObject, codeValue: BaseValueObject): BaseValueObject {
        if (cell.isError()) return cell;
        if (codeValue.isError()) return codeValue;
        if (codeValue.isBoolean()) return ErrorValueObject.create(ErrorType.VALUE);
        const value = this.getFormatInput(cell);
        const code = codeValue.isNull() ? '' : String(codeValue.getValue());
        if (code === '') return this._result(typeof value === 'string' ? value : value < 0 ? '-' : '');
        if (!isValidTextFormat(code)) return ErrorValueObject.create(ErrorType.VALUE);

        let rendered: string;
        try {
            const dateSystem = cell.getDateSystem();
            const region = this.getNumberFormatRegion();
            let pattern = normalizeExcelFormatCode(code, region);
            let input = value;
            let prefix = '';
            if (typeof value === 'number' && Number.isFinite(value)) {
                const digitFormat = formatLiteralDigits(pattern, value, region);
                if (digitFormat !== undefined) return this._result(digitFormat);
                const dbNumber = /^\[DBNum([1-3])\](\[\$-[^\]]+\])?General$/i.exec(code);
                if (dbNumber) {
                    const general = formatExcelTextNumber(value);
                    return this._result(JAPANESE_FORMAT.test(code) ? formatJapaneseGeneral(value, general, Number(dbNumber[1])) : general);
                }
                if (dateSystem === DateSystem.Date1904 && value < 0) {
                    const dateSection = negativeDateSection(pattern);
                    if (dateSection) {
                        pattern = dateSection.code;
                        prefix = dateSection.prefix;
                        input = -value;
                    }
                }
                pattern = normalizeCalendarElapsed(pattern, Number(input));
                pattern = normalizeJapaneseEra(pattern, Number(input), dateSystem);
            }
            rendered = numfmt.format(pattern, input, { dateSystem, region, throws: true, dateErrorThrows: true, overflow: OVERFLOW });
            if (rendered !== OVERFLOW) rendered = prefix + rendered;
        } catch {
            return ErrorValueObject.create(ErrorType.VALUE);
        }
        return this._result(rendered);
    }

    private _result(rendered: string): BaseValueObject {
        return rendered === OVERFLOW || rendered.length > 255 ? ErrorValueObject.create(ErrorType.VALUE) : StringValueObject.create(rendered);
    }
}
