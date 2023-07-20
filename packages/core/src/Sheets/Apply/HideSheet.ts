import { Worksheet } from '../Domain/Worksheet';
import { BooleanNumber } from '../../Types/Enum';
import { CommandModel } from '../../Command';
import { ISetWorkSheetHideActionData } from '../../Types/Interfaces/IActionModel';

/**
 *
 * @param worksheet
 * @param hidden
 * @returns
 *
 * @internal
 */
export function SetWorkSheetHideService(worksheet: Worksheet, hidden: BooleanNumber): BooleanNumber {
    // get config
    const config = worksheet.getConfig();

    // store old hidden setting
    const oldHidden = config.hidden;

    // set new hidden setting
    config.hidden = hidden;

    // return old hidden setting to undo
    return oldHidden;
}

export function SetWorkSheetHideServiceApply(unit: CommandModel, data: ISetWorkSheetHideActionData) {
    if (unit.WorkBookUnit == null) {
        throw new Error('Error WorkBookUnit is null');
    }

    const worksheet = unit.WorkBookUnit.getSheetBySheetId(data.sheetId);

    if (worksheet == null) {
        throw new Error(`Error worksheet is null sheetId:${data.sheetId}`);
    }

    // get config
    const config = worksheet.getConfig();

    // store old hidden setting
    const oldHidden = config?.hidden;

    // set new hidden setting
    config.hidden = data.hidden;

    // return old hidden setting to undo
    return oldHidden;
}
