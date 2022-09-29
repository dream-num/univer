import { Range, WorkSheet } from '../../../Sheets/Domain';

export function RemoveUnlockService(workSheet: WorkSheet, unlock: Range) {
    const protection = workSheet.getProtection();
    protection.getUnlockList().removeUnlock(unlock);
}
