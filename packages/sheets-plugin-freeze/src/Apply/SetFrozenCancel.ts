import { Worksheet } from '@univerjs/core';

export function SetFrozenCancel(worksheet: Worksheet): number[] {
    // get config
    const config = worksheet.getConfig();

    // store old sheet name
    const oldFreezeColumn = config.freezeColumn;
    const oldFreezeRow = config.freezeRow;

    // set new sheet name
    config.freezeColumn = -1;
    config.freezeRow = -1;

    // return old sheet name to undo
    return [oldFreezeRow, oldFreezeColumn];
}
