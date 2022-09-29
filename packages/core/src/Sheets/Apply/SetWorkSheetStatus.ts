import { WorkSheet } from '../Domain/WorkSheet';
import { BooleanNumber } from '../../Enum';

/**
 *
 * @param worksheet
 * @param sheetStatus
 * @returns
 *
 * @internal
 */
export function SetWorkSheetStatus(
    worksheet: WorkSheet,
    sheetStatus: BooleanNumber
): BooleanNumber {
    // get config
    const config = worksheet.getConfig();

    // store old sheet name
    const oldStatus = config.status;

    // set new sheet name
    config.status = sheetStatus;

    // return old sheet name to undo
    return oldStatus;
}
