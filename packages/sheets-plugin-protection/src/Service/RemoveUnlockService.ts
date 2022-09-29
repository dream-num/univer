import { Range, WorkSheet } from '@univer/core';

export function RemoveUnlockService(workSheet: WorkSheet, unlock: Range) {
    const protection = workSheet.getProtection();
    protection.getUnlockList().removeUnlock(unlock);
}
