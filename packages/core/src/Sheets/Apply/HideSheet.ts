import { Worksheet } from '../Domain/Worksheet';
import { BooleanNumber } from '../../Enum';
import { CommandUnit, ISetWorkSheetHideActionData } from '../../Command';

/**
 *
 * @param worksheet
 * @param hidden
 * @returns
 *
 * @internal
 */
export function SetWorkSheetHideService(
    worksheet: Worksheet,
    hidden: BooleanNumber
): BooleanNumber {
    // get config
    const config = worksheet.getConfig();

    // store old hidden setting
    const oldHidden = config.hidden;

    // set new hidden setting
    config.hidden = hidden;

    // return old hidden setting to undo
    return oldHidden;
}

export function SetWorkSheetHideServiceApply(
    unit: CommandUnit,
    data: ISetWorkSheetHideActionData
) {
    const worksheet = unit.WorkBookUnit!.getSheetBySheetId(data.sheetId);

    // get config
    const config = worksheet!.getConfig();

    // store old hidden setting
    const oldHidden = config.hidden;

    // set new hidden setting
    config.hidden = data.hidden;

    // return old hidden setting to undo
    return oldHidden;
}
