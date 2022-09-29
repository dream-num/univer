import { Range, WorkSheet } from '@univer/core';

export function AddUnlockService(workSheet: WorkSheet, unlock: Range) {
    const protection = workSheet.getProtection();
    protection.getUnlockList().addUnlock(unlock);
}
