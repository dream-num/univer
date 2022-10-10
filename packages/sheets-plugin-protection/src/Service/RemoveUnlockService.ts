import { Range, Worksheet } from '@univer/core';

export function RemoveUnlockService(workSheet: Worksheet, unlock: Range) {
    const protection = workSheet.getProtection();
    protection.getUnlockList().removeUnlock(unlock);
}
