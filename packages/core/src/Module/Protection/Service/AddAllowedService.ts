import { WorkSheet } from '../../../Sheets/Domain';
import { Allowed } from '../Allowed';

export function AddAllowedService(workSheet: WorkSheet, allowed: Allowed) {
    const protection = workSheet.getProtection();
    protection.getAllowedList().addAllow(allowed);
}
