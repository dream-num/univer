import { Worksheet } from '../Domain/Worksheet';
import { BooleanNumber } from '../../Enum';

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
