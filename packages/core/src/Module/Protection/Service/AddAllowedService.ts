import { Worksheet } from '../../../Sheets/Domain';
import { Allowed } from '../Allowed';

export function AddAllowedService(workSheet: Worksheet, allowed: Allowed) {
    const protection = workSheet.getProtection();
    protection.getAllowedList().addAllow(allowed);
}
