import { Range, Worksheet1 } from '../../../Sheets/Domain';

export function RemoveUnlockService(workSheet: Worksheet1, unlock: Range) {
    const protection = workSheet.getProtection();
    protection.getUnlockList().removeUnlock(unlock);
}
