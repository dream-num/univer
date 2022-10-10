import { Range, Worksheet1 } from '@univer/core';

export function AddUnlockService(workSheet: Worksheet1, unlock: Range) {
    const protection = workSheet.getProtection();
    protection.getUnlockList().addUnlock(unlock);
}
