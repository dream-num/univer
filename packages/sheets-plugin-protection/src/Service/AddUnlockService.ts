import { Range, Worksheet } from '@univer/core';

export function AddUnlockService(workSheet: Worksheet, unlock: Range) {
    const protection = workSheet.getProtection();
    protection.getUnlockList().addUnlock(unlock);
}
