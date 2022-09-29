import { WorkSheet } from '../../../Sheets/Domain';
import { Allowed } from '../Allowed';

export function RemoveAllowedService(workSheet: WorkSheet, allowed: Allowed) {
    const protection = workSheet.getProtection();
    protection.getAllowedList().removeAllow(allowed);
}
