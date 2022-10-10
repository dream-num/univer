import { Worksheet1 } from '../Domain/Worksheet1';

/**
 *
 * @param worksheet
 * @param numRows
 * @returns
 *
 * @internal
 */
export function SetFrozenRows(worksheet: Worksheet1, numRows: number): number {
    // get config
    const config = worksheet.getConfig();

    // store old sheet name
    const oldStatus = config.freezeRow;

    // set new sheet name
    config.freezeRow = numRows;

    // return old sheet name to undo
    return oldStatus;
}
