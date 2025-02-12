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

import type { ICellData, IDocumentData, IRange, Nullable, Worksheet } from '@univerjs/core';
import { CellValueType, Range } from '@univerjs/core';

/**
 * The default delimiter to split the text.
 */
export enum SplitDelimiterEnum {
    /**
     * The tab character
     */
    Tab = 1,
    /**
     * The comma character
     */
    Comma = 2,
    /**
     * The semicolon character
     */
    Semicolon = 4,
    /**
     * The space character
     */
    Space = 8,
    /**
     * The custom delimiter
     */
    Custom = 16,
}

class DelimiterCounter {
    private _tabCount = 0;
    private _commaCount = 0;
    private _semicolonCount = 0;
    private _spaceCount = 0;

    add(delimiter: string) {
        switch (delimiter) {
            case '\t':
                this._tabCount++;
                break;
            case ',':
                this._commaCount++;
                break;
            case ';':
                this._semicolonCount++;
                break;
            case ' ':
                this._spaceCount++;
                break;
            default:
                break;
        }
    }

    update(cellText: string | undefined) {
        if (cellText && typeof cellText === 'string') {
            if (cellText.includes('\t')) {
                this._tabCount++;
            }
            if (cellText.includes(',')) {
                this._commaCount++;
            }
            if (cellText.includes(';')) {
                this._semicolonCount++;
            }
            if (cellText.trim().includes(' ')) {
                this._spaceCount++;
            }
        }
    }

    getDelimiter() {
        const maxCount = Math.max(this._tabCount, this._commaCount, this._semicolonCount, this._spaceCount);

        if (maxCount === 0) {
            return SplitDelimiterEnum.Tab;
        }
        if (maxCount === this._tabCount) {
            return SplitDelimiterEnum.Tab;
        }
        if (maxCount === this._commaCount) {
            return SplitDelimiterEnum.Comma;
        }
        if (maxCount === this._semicolonCount) {
            return SplitDelimiterEnum.Semicolon;
        }
        if (maxCount === this._spaceCount) {
            return SplitDelimiterEnum.Space;
        }
        return SplitDelimiterEnum.Tab;
    }
}

function getDelimiterRegexItem(delimiter: SplitDelimiterEnum, treatMultipleDelimitersAsOne: boolean, customDelimiter?: string) {
    const delimiterList = [];

    if (customDelimiter !== undefined && (delimiter & SplitDelimiterEnum.Custom) > 0) {
        delimiterList.push(customDelimiter);
    }
    if ((delimiter & SplitDelimiterEnum.Tab) > 0) {
        delimiterList.push('\t');
    }
    if ((delimiter & SplitDelimiterEnum.Comma) > 0) {
        delimiterList.push(',');
    }
    if ((delimiter & SplitDelimiterEnum.Semicolon) > 0) {
        delimiterList.push(';');
    }
    if ((delimiter & SplitDelimiterEnum.Space) > 0) {
        delimiterList.push(' ');
    }

    let str = '';
    for (const delimiter of delimiterList) {
        str += escapeRegExp(delimiter);
    }
    let allStr = '['.concat(str, ']');

    if (treatMultipleDelimitersAsOne) {
        allStr += '+';
    }

    return new RegExp(allStr);
}

function escapeRegExp(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const getStringFromDataStream = (data: IDocumentData): string => {
    const dataStream = data.body?.dataStream.replace(/\r\n$/, '') || '';
    return dataStream;
};

function cellValueToString(cellData: Nullable<ICellData>) {
    if (cellData === null || cellData === undefined) {
        return undefined;
    }

    if (cellData.p) {
        return getStringFromDataStream(cellData.p);
    }

    if (cellData.v && typeof cellData.v === 'string') {
        return cellData.v;
    }

    if (cellData.t && (cellData.t === CellValueType.FORCE_STRING || cellData.t === CellValueType.STRING)) {
        return String(cellData.v);
    }

    return undefined;
}

interface ISplitRangeTextResult {
    rs: (string[] | undefined)[];
    maxLength: number;
    lastRow: number;
}

/**
 * Split the text in the range into a two-dimensional array.
 * @param {Worksheet} sheet The worksheet which range belongs to.
 * @param {IRange} range The range to split.
 * @param {SplitDelimiterEnum} [delimiter] The delimiter to split the text.
 * @param {string} [customDelimiter] The custom delimiter to split the text. An error will be thrown if customDelimiter is not a character.
 * @param {boolean} [treatMultipleDelimitersAsOne] split multiple delimiters as one.
 * @returns {ISplitRangeTextResult} The two-dimensional array of the split text and max column length.
 */
export function splitRangeText(sheet: Worksheet, range: IRange, delimiter?: SplitDelimiterEnum, customDelimiter?: string, treatMultipleDelimitersAsOne: boolean = false): ISplitRangeTextResult {
    const sourceRange = Range.transformRange(range, sheet);
    const { startColumn, startRow, endColumn, endRow } = sourceRange;

    if (startColumn !== endColumn) {
        throw new Error('The range must be in the same column.');
    }

    if ((delimiter && (delimiter & SplitDelimiterEnum.Custom) > 0) && (customDelimiter === undefined || customDelimiter.length !== 1)) {
        throw new Error('The custom delimiter must a character.');
    }

    const needAutoDelimiter = delimiter === undefined;
    const delimiterCounter = needAutoDelimiter ? new DelimiterCounter() : null;
    const textList = [];

    // collect delimiter and text values
    for (let i = startRow; i <= endRow; i++) {
        const cell = sheet.getCell(i, startColumn);
        const cellString = cellValueToString(cell);
        textList.push(cellString);
        if (delimiterCounter) {
            delimiterCounter.update(cellString);
        }
    }

    const useDelimiter = needAutoDelimiter ? delimiterCounter!.getDelimiter() : delimiter;
    const useDelimiterRegex = getDelimiterRegexItem(useDelimiter, treatMultipleDelimitersAsOne, customDelimiter);

    let maxLength = -1;
    let lastRow = 0;
    let index = 0;
    const rs = [];

    for (const text of textList) {
        if (text !== undefined) {
            const cols = String(text).split(useDelimiterRegex);
            if (maxLength < 0) {
                maxLength = cols.length;
            } else {
                maxLength = Math.max(maxLength, cols.length);
            }
            rs.push(cols);
            lastRow = index;
        } else {
            rs.push(undefined);
        }
        index++;
    }

    return {
        rs,
        maxLength: maxLength === -1 ? 0 : maxLength,
        lastRow,
    };
}
