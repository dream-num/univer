import { IRange } from '../types/interfaces/i-range';
import { Tools } from './tools';

const COLON_SYMBOL = ':';

const $ROW_REGEX = /[^0-9]/g;

const $COLUMN_REGEX = /[^A-Za-z]/g;

export interface IGridRangeName {
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
 * @param sheetID ID of the Worksheet
 * @param range The `IRange` to be serialized
 */
export function serializeRange(range: IRange): string {
    const { startColumn, startRow, endColumn, endRow } = range;
    return `${Tools.chatAtABC(startColumn) + (startRow + 1)}:${Tools.chatAtABC(endColumn)}${endRow + 1}`;
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

export function deserializeRangeWithSheet(refString: string): IGridRangeName {
    const sheetNameIndex = refString.indexOf('!');
    let sheetName: string = '';
    let refBody: string = '';
    if (sheetNameIndex > -1) {
        sheetName = refString.substring(0, sheetNameIndex);
        refBody = refString.substring(sheetNameIndex);
    } else {
        refBody = refString;
    }

    const colonIndex = refBody.indexOf(COLON_SYMBOL);

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
        sheetName,
        range: {
            startRow,
            startColumn,
            endRow,
            endColumn,
        },
    };
}
