/**
 * Copyright 2023-present DreamNum Inc.
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

import { Tools } from '../shared/tools';
import type { IRange } from '../types/interfaces/i-range';
import { AbsoluteRefType, RANGE_TYPE } from '../types/interfaces/i-range';

export const UNIT_NAME_REGEX = '\'?\\[((?![\\/?:"<>|*\\\\]).)*?\\]';

const $ROW_REGEX = /[^0-9]/g;
const $COLUMN_REGEX = /[^A-Za-z]/g;

export interface IGridRangeName {
    unitId: string;
    sheetName: string;
    range: IRange;
}

export interface IAbsoluteRefTypeForRange {
    startAbsoluteRefType: AbsoluteRefType;
    endAbsoluteRefType?: AbsoluteRefType;
}

/**
 *
 * @param singleRefString for example A1 or B10,  not A1:B10
 */
export function getAbsoluteRefTypeWithSingleString(singleRefString: string) {
    const isColumnAbsolute = singleRefString[0] === '$';
    const remainChar = singleRefString.substring(1);

    const isRowAbsolute = remainChar.indexOf('$') > -1;

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
 * @returns
 */
export function serializeRangeWithSheet(sheetName: string, range: IRange): string {
    return `${sheetName}!${serializeRange(range)}`;
}

/**
 * Serialize an `IRange` and a sheetID into a string.
 * @param unit unitId or unitName
 * @param sheetName
 * @param range
 * @returns
 */
export function serializeRangeWithSpreadsheet(unit: string, sheetName: string, range: IRange): string {
    return `[${unit}]${sheetName}!${serializeRange(range)}`;
}

export function serializeRangeToRefString(gridRangeName: IGridRangeName) {
    const { unitId, sheetName, range } = gridRangeName;

    if (unitId != null && unitId.length > 0 && sheetName != null && sheetName.length > 0) {
        return serializeRangeWithSpreadsheet(unitId, sheetName, range);
    }

    if (sheetName != null && sheetName.length > 0) {
        return serializeRangeWithSheet(sheetName, range);
    }

    return serializeRange(range);
}

function singleReferenceToGrid(refBody: string) {
    const row = parseInt(refBody.replace($ROW_REGEX, '')) - 1;
    const column = Tools.ABCatNum(refBody.replace($COLUMN_REGEX, ''));

    const absoluteRefType = getAbsoluteRefTypeWithSingleString(refBody);

    return {
        row,
        column,
        absoluteRefType,
    };
}

export function handleRefStringInfo(refString: string) {
    const unitIdMatch = new RegExp(UNIT_NAME_REGEX).exec(refString);
    let unitId = '';

    if (unitIdMatch != null) {
        unitId = unitIdMatch[0].trim();
        unitId = unitId.slice(1, unitId.length - 1);
        refString = refString.replace(new RegExp(UNIT_NAME_REGEX), '');
    }

    const sheetNameIndex = refString.indexOf('!');
    let sheetName: string = '';
    let refBody: string = '';
    if (sheetNameIndex > -1) {
        sheetName = refString.substring(0, sheetNameIndex);
        if (sheetName[0] === "'" && sheetName[sheetName.length - 1] === "'") {
            sheetName = sheetName.substring(1, sheetName.length - 1);
        }
        refBody = refString.substring(sheetNameIndex);
    } else {
        refBody = refString;
    }

    return {
        refBody,
        sheetName,
        unitId,
    };
}

export function deserializeRangeWithSheet(refString: string): IGridRangeName {
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

    const startRow = startGrid.row;
    const startColumn = startGrid.column;
    const endRow = endGrid.row;
    const endColumn = endGrid.column;

    let rangeType = RANGE_TYPE.NORMAL;
    if (isNaN(startRow) && isNaN(endRow)) {
        rangeType = RANGE_TYPE.COLUMN;
    } else if (isNaN(startColumn) && isNaN(endColumn)) {
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
