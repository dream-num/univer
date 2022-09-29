import { WorkSheet, Range } from '../../../Sheets/Domain';

export function AddUnlockService(workSheet: WorkSheet, unlock: Range) {
    const protection = workSheet.getProtection();
    protection.getUnlockList().addUnlock(unlock);
}
