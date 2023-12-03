import { Tools } from '../shared/tools';
import type { IRange } from '../types/interfaces/i-range';
import { AbsoluteRefType } from '../types/interfaces/i-range';

const UNIT_NAME_REGEX = '\'?\\[((?![\\/?:"<>|*\\\\]).)*\\]';
const $ROW_REGEX = /[^0-9]/g;
const $COLUMN_REGEX = /[^A-Za-z]/g;

export interface IGridRangeName {
    unitId: string;
    sheetName: string;
    range: IRange;
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
export function getAbsoluteRefTypeWitString(refString: string) {
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
    const { startColumn, startRow, endColumn, endRow, startAbsoluteRefType, endAbsoluteRefType } = range;

    const start = _getAbsoluteToken(startAbsoluteRefType);

    const end = _getAbsoluteToken(endAbsoluteRefType);

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

export function deserializeRangeWithSheet(refString: string): IGridRangeName {
    const unitIdMatch = new RegExp(UNIT_NAME_REGEX).exec(refString);
    let unitId = '';

    if (unitIdMatch != null) {
        unitId = unitIdMatch[0];
        refString = refString.replace(new RegExp(UNIT_NAME_REGEX, 'g'), '');
    }

    const sheetNameIndex = refString.indexOf('!');
    let sheetName: string = '';
    let refBody: string = '';
    if (sheetNameIndex > -1) {
        sheetName = refString.substring(0, sheetNameIndex);
        refBody = refString.substring(sheetNameIndex);
    } else {
        refBody = refString;
    }

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
        },
    };
}
