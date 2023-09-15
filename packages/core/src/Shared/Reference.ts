import { IRangeData } from '../Types/Interfaces';
import { Tools } from './Tools';

const COLON_SYMBOL = ':';

const $ROW_REGEX = /[^0-9]/g;

const $COLUMN_REGEX = /[^A-Za-z]/g;

export interface IGridRangeName {
    sheetName: string;
    rangeData: IRangeData;
}

function singleReferenceToGrid(refBody: string) {
    const row = parseInt(refBody.replace($ROW_REGEX, '')) - 1;
    const column = Tools.ABCatNum(refBody.replace($COLUMN_REGEX, ''));

    return {
        row,
        column,
    };
}

export function referenceToGrid(refString: string): IGridRangeName {
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
        const rangeData: IRangeData = {
            startRow: row,
            startColumn: column,
            endRow: row,
            endColumn: column,
        };

        return {
            sheetName,
            rangeData,
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

    const rangeData: IRangeData = {
        startRow,
        startColumn,
        endRow,
        endColumn,
    };

    return {
        sheetName,
        rangeData,
    };
}
