import { Worksheet1 } from '../../../Sheets/Domain';
import { Allowed } from '../Allowed';

export function AddAllowedService(workSheet: Worksheet1, allowed: Allowed) {
    const protection = workSheet.getProtection();
    protection.getAllowedList().addAllow(allowed);
}
