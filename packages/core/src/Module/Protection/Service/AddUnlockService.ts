import { Worksheet1, Range } from '../../../Sheets/Domain';

export function AddUnlockService(workSheet: Worksheet1, unlock: Range) {
    const protection = workSheet.getProtection();
    protection.getUnlockList().addUnlock(unlock);
}
