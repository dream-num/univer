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

import type { IRange, IUnitRangeName, IUnitRangeWithName } from '@univerjs/core';
import { AbsoluteRefType, RANGE_TYPE, Tools } from '@univerjs/core';

import { includeFormulaLexerToken } from '../../basics/match-token';
import { isReferenceString, UNIT_NAME_REGEX_PRECOMPILING } from '../../basics/regex';
import { prefixToken, SPACE_TOKEN } from '../../basics/token';

const $ROW_REGEX = /[^0-9]/g;
const $COLUMN_REGEX = /[^A-Za-z]/g;

export interface IAbsoluteRefTypeForRange {
    startAbsoluteRefType: AbsoluteRefType;
    endAbsoluteRefType?: AbsoluteRefType;
}

/**
 *
 * @param singleRefString for example A1 or B10,  not A1:B10
 */
export function getAbsoluteRefTypeWithSingleString(singleRefString: string) {
    let isColumnAbsolute = singleRefString[0] === '$';
    const remainChar = singleRefString.substring(1);

    let isRowAbsolute = remainChar.indexOf('$') > -1;

    if (Tools.isStringNumber(remainChar) && isColumnAbsolute && !isRowAbsolute) {
        isColumnAbsolute = false;
        isRowAbsolute = true;
    }

    if (isColumnAbsolute && isRowAbsolute) {
        return AbsoluteRefType.ALL;
    }
    if (isColumnAbsolute) {
        return AbsoluteRefType.COLUMN;
    }
    if (isRowAbsolute) {
        return AbsoluteRefType.ROW;
    }

    return AbsoluteRefType.NONE;
}

/**
 *
 * @param refString for example A1:B10
 */
export function getAbsoluteRefTypeWitString(refString: string): IAbsoluteRefTypeForRange {
    const sheetArray = refString.split('!');

    if (sheetArray.length > 1) {
        refString = sheetArray[sheetArray.length - 1];
    }

    const refArray = refString.split(':');

    if (refArray.length > 1) {
        return {
            startAbsoluteRefType: getAbsoluteRefTypeWithSingleString(refArray[0]),
            endAbsoluteRefType: getAbsoluteRefTypeWithSingleString(refArray[1]),
        };
    }

    return { startAbsoluteRefType: getAbsoluteRefTypeWithSingleString(refArray[0]) };
}

function _getAbsoluteToken(absoluteRefType = AbsoluteRefType.NONE) {
    let rowAbsoluteString = '';

    let columnAbsoluteString = '';

    if (absoluteRefType === AbsoluteRefType.ROW) {
        rowAbsoluteString = '$';
    } else if (absoluteRefType === AbsoluteRefType.COLUMN) {
        columnAbsoluteString = '$';
    } else if (absoluteRefType === AbsoluteRefType.ALL) {
        rowAbsoluteString = '$';
        columnAbsoluteString = '$';
    }

    return {
        rowAbsoluteString,
        columnAbsoluteString,
    };
}

/**
 * Serialize an `IRange` into a string.
 * @param range The `IRange` to be serialized
 */
export function serializeRange(range: IRange): string {
    const {
        startColumn,
        startRow,
        endColumn,
        endRow,
        startAbsoluteRefType,
        endAbsoluteRefType,
        rangeType = RANGE_TYPE.NORMAL,
    } = range;

    const start = _getAbsoluteToken(startAbsoluteRefType);

    const end = _getAbsoluteToken(endAbsoluteRefType);

    if (rangeType === RANGE_TYPE.ROW || rangeType === RANGE_TYPE.ALL) {
        const startStr = `${start.rowAbsoluteString}${startRow + 1}`;

        const endStr = `${end.rowAbsoluteString}${endRow + 1}`;

        return `${startStr}:${endStr}`;
    }
    if (rangeType === RANGE_TYPE.COLUMN) {
        const startStr = `${start.columnAbsoluteString}${Tools.chatAtABC(startColumn)}`;

        const endStr = `${end.columnAbsoluteString}${Tools.chatAtABC(endColumn)}`;

        return `${startStr}:${endStr}`;
    }

    const startStr = `${start.columnAbsoluteString}${Tools.chatAtABC(startColumn)}${start.rowAbsoluteString}${
        startRow + 1
    }`;

    const endStr = `${end.columnAbsoluteString}${Tools.chatAtABC(endColumn)}${end.rowAbsoluteString}${endRow + 1}`;

    if (startStr === endStr) {
        return startStr;
    }

    return `${startStr}:${endStr}`;
}

/**
 * Serialize an `IRange` and a sheetID into a string.
 * @param sheetName
 * @param range
 */
export function serializeRangeWithSheet(sheetName: string, range: IRange): string {
    return `${addQuotesBothSides(sheetName)}!${serializeRange(range)}`;
}

/**
 * Serialize an `IRange` and a sheetID into a string.
 * @param unit unitId or unitName
 * @param sheetName
 * @param range
 */
export function serializeRangeWithSpreadsheet(unit: string, sheetName: string, range: IRange): string {
    if (needsQuoting(unit) || needsQuoting(sheetName)) {
        return `'[${quoteSheetName(unit)}]${quoteSheetName(sheetName)}'!${serializeRange(range)}`;
    }

    return `[${unit}]${sheetName}!${serializeRange(range)}`;
}

export function serializeRangeToRefString(gridRangeName: IUnitRangeName) {
    const { unitId, sheetName, range } = gridRangeName;

    if (unitId != null && unitId.length > 0 && sheetName != null && sheetName.length > 0) {
        return serializeRangeWithSpreadsheet(unitId, sheetName, range);
    }

    if (sheetName != null && sheetName.length > 0) {
        return serializeRangeWithSheet(sheetName, range);
    }

    return serializeRange(range);
}

export function singleReferenceToGrid(refBody: string) {
    const row = Number.parseInt(refBody.replace($ROW_REGEX, '')) - 1;
    const column = Tools.ABCatNum(refBody.replace($COLUMN_REGEX, ''));

    const absoluteRefType = getAbsoluteRefTypeWithSingleString(refBody);

    return {
        row,
        column,
        absoluteRefType,
    };
}

export function handleRefStringInfo(refString: string) {
    const unitIdMatch = UNIT_NAME_REGEX_PRECOMPILING.exec(refString);
    let unitId = '';

    if (unitIdMatch != null) {
        unitId = unitIdMatch[0].trim();
        unitId = unquoteSheetName(unitId.slice(1, unitId.length - 1));
        refString = refString.replace(UNIT_NAME_REGEX_PRECOMPILING, '');
    }

    const sheetNameIndex = refString.indexOf('!');
    let sheetName: string = '';
    let refBody: string = '';
    if (sheetNameIndex > -1) {
        sheetName = refString.substring(0, sheetNameIndex);
        if (sheetName[0] === "'" && sheetName[sheetName.length - 1] === "'") {
            sheetName = sheetName.substring(1, sheetName.length - 1);
        }

        sheetName = unquoteSheetName(sheetName);
        refBody = refString.substring(sheetNameIndex + 1);
    } else {
        refBody = refString;
    }

    return {
        refBody,
        sheetName,
        unitId,
    };
}

export function deserializeRangeWithSheet(refString: string): IUnitRangeName {
    const { refBody, sheetName, unitId } = handleRefStringInfo(refString);

    const colonIndex = refBody.indexOf(':');

    if (colonIndex === -1) {
        const grid = singleReferenceToGrid(refBody);
        const row = grid.row;
        const column = grid.column;
        const absoluteRefType = grid.absoluteRefType;
        const range: IRange = {
            startRow: row,
            startColumn: column,
            endRow: row,
            endColumn: column,
            startAbsoluteRefType: absoluteRefType,
            endAbsoluteRefType: absoluteRefType,
        };

        return {
            unitId,
            sheetName,
            range,
        };
    }

    const refStartString = refBody.substring(0, colonIndex);
    const refEndString = refBody.substring(colonIndex + 1);

    const startGrid = singleReferenceToGrid(refStartString);

    const endGrid = singleReferenceToGrid(refEndString);

    // range A1:B10 === B10:A1
    const startRow = startGrid.row > endGrid.row ? endGrid.row : startGrid.row;
    const startColumn = startGrid.column > endGrid.column ? endGrid.column : startGrid.column;
    const endRow = startGrid.row > endGrid.row ? startGrid.row : endGrid.row;
    const endColumn = startGrid.column > endGrid.column ? startGrid.column : endGrid.column;

    let rangeType = RANGE_TYPE.NORMAL;
    if (Number.isNaN(startRow) && Number.isNaN(endRow)) {
        rangeType = RANGE_TYPE.COLUMN;
    } else if (Number.isNaN(startColumn) && Number.isNaN(endColumn)) {
        rangeType = RANGE_TYPE.ROW;
    }

    return {
        unitId,
        sheetName,
        range: {
            startRow,
            startColumn,
            endRow,
            endColumn,

            startAbsoluteRefType: startGrid.absoluteRefType,

            endAbsoluteRefType: endGrid.absoluteRefType,

            rangeType,
        },
    };
}

/**
 * LOG10 is a formula, google sheet support it on Log10:L
 * EXCEL support it on Log10:Log10
 */
const EXCEPTION_REF_STRINGS = ['LOG10'];

export function isReferenceStringWithEffectiveColumn(refString: string) {
    const noPrefixRefString = replaceRefPrefixString(refString);

    if (!isReferenceString(noPrefixRefString)) {
        return false;
    }

    if (EXCEPTION_REF_STRINGS.includes(noPrefixRefString.toUpperCase().trim())) {
        return false;
    }

    const { range } = deserializeRangeWithSheet(noPrefixRefString);

    /**
     * As of the latest information I have, which is up to the end of 2023,
     * the maximum limit for columns in Excel is 16,384.
     * This standard applies to Excel 2007 and later versions,
     * where each worksheet can support columns ranging from A to XFD.
     * Therefore, the symbol for the maximum column is XFD.
     */
    if (range.endColumn >= 16384) {
        return false;
    }

    return true;
}

export function replaceRefPrefixString(token: string) {
    const tokenArray = [];
    let isNotPreFix = false;
    for (let i = 0, len = token.length; i < len; i++) {
        const char = token[i];
        if (char === SPACE_TOKEN && !isNotPreFix) {
            tokenArray.push(char);
        } else if (!isNotPreFix && (char === prefixToken.AT || char === prefixToken.MINUS || char === prefixToken.PLUS)) {
            continue;
        } else {
            tokenArray.push(char);
            isNotPreFix = true;
        }
    }
    return tokenArray.join('');
}

/**
 * implement getSheetIdByName
 * function getSheetIdByName(name: string) {
        return univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getSheetBySheetName(name)?.getSheetId() || '';
    }
 */
export function getRangeWithRefsString(refString: string, getSheetIdByName: (name: string) => string): IUnitRangeWithName[] {
    const valueArray = refString?.split(',') || [];

    if (refString === '' || valueArray.length === 0) {
        return [];
    }

    const result = isReferenceStrings(refString);

    if (!result) {
        return [];
    }

    const ranges = valueArray.map((ref) => {
        const unitRange = deserializeRangeWithSheet(ref);
        return {
            unitId: unitRange.unitId,
            sheetId: getSheetIdByName(unitRange.sheetName),
            range: unitRange.range,
            sheetName: unitRange.sheetName,
        };
    });

    return ranges;
}

export function isReferenceStrings(refString: string) {
    const valueArray = refString?.split(',') || [];
    return valueArray.every((refString) => {
        return isReferenceStringWithEffectiveColumn(refString.trim());
    });
}

/**
 * Determine whether the sheet name needs to be wrapped in quotes
 * Excel will quote the worksheet name if any of the following is true:
 *  - It contains any space or punctuation characters, such as  ()$,;-{}"'（）【】“”‘’%… and many more
 *  - It is a valid cell reference in A1 notation, e.g. B1048576 is quoted
 *  - It is a valid cell reference in R1C1 notation, e.g. RC, RC2, R5C, R-4C, RC-8, R, C
 *  - It starts with a non-letter, e.g. 99, 1.5, 12a, 💩a
 *  - Excel will not quote worksheet names if they only contain non-punctuation, non-letter characters in non-initial positions. For example, a💩 remains unquoted.*
 *  In addition, if a worksheet name contains single quotes, these will be doubled up within the name itself. For example, the sheet name a'b'c becomes 'a''b''c'.
 *
 *  reference https://stackoverflow.com/questions/41677779/when-does-excel-surround-sheet-names-with-single-quotes-in-workbook-xml-or-othe
 *
 * @param name Sheet name
 * @returns Result
 */
export function needsQuoting(name: string) {
    if (name.length === 0) {
        return false;
    }

    if (includeFormulaLexerToken(name)) {
        return true;
    }

    // Check if the name is a valid cell reference in A1 or R1C1 notation
    if (isA1Notation(name) || isR1C1Notation(name)) {
        return true;
    }

    // Check if the name starts with a non-letter
    if (startsWithNonAlphabetic(name)) {
        return true;
    }

    // Check for spaces, punctuation and special characters

    if (/[\s!$%^&*()+\-=\[\]{};':"\\|,.<>\/?（）]/.test(name)) {
        return true;
    }

    return false;
}

/**
 * Add quotes to the sheet name
 */
export function addQuotesBothSides(name: string) {
    return needsQuoting(name) ? `'${quoteSheetName(name)}'` : name;
}

/**
 * Add a single quote before the single quote
 * @param name
 * @returns Quoted name
 */
function quoteSheetName(name: string) {
    return name.replace(/'/g, "''");
}

/**
 * Replace double single quotes with single quotes
 * @param name
 * @returns Unquoted name
 */
function unquoteSheetName(name: string) {
    return name.replace(/''/g, "'");
}

function isA1Notation(name: string) {
    const match = name.match(/[1-9][0-9]{0,6}/);
    // Excel has a limit on the number of rows and columns: targetRow > 1048576 || targetColumn > 16384, Univer has no limit
    return /^[A-Z]+[1-9][0-9]{0,6}$/.test(name) && match !== null;
}

function isR1C1Notation(name: string) {
    return /^(R(-?[0-9]+)?C(-?[0-9]+)?|C(-?[0-9]+)?|R(-?[0-9]+)?)$/.test(name);
}

function startsWithNonAlphabetic(name: string) {
    // Check if the first character is not a letter (including non-English characters)
    return !/^\p{Letter}/u.test(name.charAt(0));
}
