import { Worksheet } from '../Domain/Worksheet';
import { CommandModel } from '../../Command';
import { ISetHiddenGridlinesActionData } from '../../Types/Interfaces/IActionModel';

/**
 *
 * @param worksheet
 * @param hideGridlines
 * @returns
 *
 * @internal
 */
export function SetHiddenGridlines(worksheet: Worksheet, hideGridlines: boolean): boolean {
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

export function SetHiddenGridlinesApply(unit: CommandModel, data: ISetHiddenGridlinesActionData) {
    const workbook = unit.WorkBookUnit;
    const worksheet = workbook!.getSheetBySheetId(data.sheetId)!;
    const hideGridlines = data.hideGridlines;

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
