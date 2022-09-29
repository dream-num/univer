import { WorkSheet } from '../Domain/WorkSheet';

/**
 *
 * @param worksheet
 * @param hideGridlines
 * @returns
 *
 * @internal
 */
export function SetHiddenGridlines(
    worksheet: WorkSheet,
    hideGridlines: boolean
): boolean {
    // get config
    const config = worksheet.getConfig();

    // store old sheet name
    const oldStatus = config.showGridlines === 0;

    // set new sheet name
    if (hideGridlines) {
        config.showGridlines = 0;
    } else {
        config.showGridlines = 1;
    }

    // return old sheet name to undo
    return oldStatus;
}
