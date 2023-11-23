import { Tools } from '../shared/tools';
import { IRange } from '../types/interfaces/i-range';

const UNIT_NAME_REGEX = '\'?\\[((?![\\/?:"<>|*\\\\]).)*\\]';
const $ROW_REGEX = /[^0-9]/g;
const $COLUMN_REGEX = /[^A-Za-z]/g;

export interface IGridRangeName {
    unitId: string;
    sheetName: string;
    range: IRange;
}

export enum AbsoluteRefType {
    NONE,
    ROW,
    COLUMN,
    ALL,
}

function singleReferenceToGrid(refBody: string) {
    const row = parseInt(refBody.replace($ROW_REGEX, '')) - 1;
    const column = Tools.ABCatNum(refBody.replace($COLUMN_REGEX, ''));

    return {
        row,
        column,
    };
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
        return getAbsoluteRefTypeWithSingleString(refArray[0]) && getAbsoluteRefTypeWithSingleString(refArray[1]);
    }

    return getAbsoluteRefTypeWithSingleString(refArray[0]);
}

/**
 * Serialize an `IRange` into a string.
 * @param range The `IRange` to be serialized
 */
export function serializeRange(range: IRange, type: AbsoluteRefType = AbsoluteRefType.NONE): string {
    const { startColumn, startRow, endColumn, endRow } = range;

    let rowAbsoluteString = '';

    let columnAbsoluteString = '';

    if (type === AbsoluteRefType.ROW) {
        rowAbsoluteString = '$';
    } else if (type === AbsoluteRefType.COLUMN) {
        columnAbsoluteString = '$';
    } else if (type === AbsoluteRefType.ALL) {
        rowAbsoluteString = '$';
        columnAbsoluteString = '$';
    }

    const startStr = `${columnAbsoluteString}${Tools.chatAtABC(startColumn)}${rowAbsoluteString}${startRow + 1}`;

    const endStr = `${columnAbsoluteString}${Tools.chatAtABC(endColumn)}${rowAbsoluteString}${endRow + 1}`;

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
export function serializeRangeWithSheet(
    sheetName: string,
    range: IRange,
    type: AbsoluteRefType = AbsoluteRefType.NONE
): string {
    return `${sheetName}!${serializeRange(range, type)}`;
}

/**
 * Serialize an `IRange` and a sheetID into a string.
 * @param unit unitId or unitName
 * @param sheetName
 * @param range
 * @returns
 */
export function serializeRangeWithSpreadsheet(
    unit: string,
    sheetName: string,
    range: IRange,
    type: AbsoluteRefType = AbsoluteRefType.NONE
): string {
    return `[${unit}]${sheetName}!${serializeRange(range, type)}`;
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
        const range: IRange = {
            startRow: row,
            startColumn: column,
            endRow: row,
            endColumn: column,
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
        },
    };
}
