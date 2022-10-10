import { Range, Worksheet } from '../../../Sheets/Domain';

export function RemoveUnlockService(workSheet: Worksheet, unlock: Range) {
    const protection = workSheet.getProtection();
    protection.getUnlockList().removeUnlock(unlock);
}
