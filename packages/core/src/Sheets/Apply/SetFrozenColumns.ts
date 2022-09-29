import { WorkSheet } from '../Domain/WorkSheet';

/**
 *
 * @param worksheet
 * @param numColumns
 * @returns
 *
 * @internal
 */
export function SetFrozenColumns(worksheet: WorkSheet, numColumns: number): number {
    // get config
    const config = worksheet.getConfig();

    // store old sheet name
    const oldStatus = config.freezeColumn;

    // set new sheet name
    config.freezeColumn = numColumns;

    // return old sheet name to undo
    return oldStatus;
}
