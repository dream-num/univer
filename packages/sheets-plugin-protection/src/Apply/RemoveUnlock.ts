import { Range, Worksheet } from '@univer/core';

export function RemoveUnlock(workSheet: Worksheet, unlock: Range) {
    const protection = workSheet.getProtection();
    protection.getUnlockList().removeUnlock(unlock);
}
