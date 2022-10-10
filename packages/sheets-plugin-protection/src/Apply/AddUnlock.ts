import { Range, Worksheet } from '@univer/core';

export function AddUnlock(workSheet: Worksheet, unlock: Range) {
    const protection = workSheet.getProtection();
    protection.getUnlockList().addUnlock(unlock);
}
