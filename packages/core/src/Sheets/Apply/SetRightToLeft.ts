import { Worksheet } from '../Domain';
import { BooleanNumber } from '../../Enum';
import { CommandUnit } from '../../Command';
import { ISetRightToLeftActionData } from '../Action';

/**
 *
 * @param worksheet
 * @param rightToLeft
 * @returns
 *
 * @internal
 */
export function SetRightToLeft(
    worksheet: Worksheet,
    rightToLeft: BooleanNumber
): BooleanNumber {
    // get config
    const config = worksheet.getConfig();

    // store old sheet name
    const oldState = config.rightToLeft;

    // set new sheet name
    config.rightToLeft = rightToLeft;

    // return old sheet name to undo
    return oldState;
}

export function SetRightToLeftApply(
    unit: CommandUnit,
    data: ISetRightToLeftActionData
) {
    const workbook = unit.WorkBookUnit;
    const worksheet = workbook!.getSheetBySheetId(data.sheetId)!;
    const rightToLeft = data.rightToLeft;

    // get config
    const config = worksheet.getConfig();

    // store old sheet name
    const oldState = config.rightToLeft;

    // set new sheet name
    config.rightToLeft = rightToLeft;

    // return old sheet name to undo
    return oldState;
}
