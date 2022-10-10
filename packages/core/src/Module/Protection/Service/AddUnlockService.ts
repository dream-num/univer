import { Worksheet, Range } from '../../../Sheets/Domain';

export function AddUnlockService(workSheet: Worksheet, unlock: Range) {
    const protection = workSheet.getProtection();
    protection.getUnlockList().addUnlock(unlock);
}
