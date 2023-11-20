import { IRange, Tools } from '@univerjs/core';

import { UNIT_NAME_REGEX } from './regex';
import { matchToken } from './token';

const $ROW_REGEX = /[^0-9]/g;

const $COLUMN_REGEX = /[^A-Za-z]/g;

export interface IGridRangeName {
    unitId: string;
    sheetName: string;
    range: IRange;
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
 * Serialize an `IRange` into a string.
 * @param range The `IRange` to be serialized
 */
export function serializeRange(range: IRange): string {
    const { startColumn, startRow, endColumn, endRow } = range;
    const startStr = `${Tools.chatAtABC(startColumn) + (startRow + 1)}`;

    const endStr = `${Tools.chatAtABC(endColumn)}${endRow + 1}`;

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

    const colonIndex = refBody.indexOf(matchToken.COLON);

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
