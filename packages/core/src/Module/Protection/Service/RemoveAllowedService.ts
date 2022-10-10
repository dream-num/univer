import { Worksheet } from '../../../Sheets/Domain';
import { Allowed } from '../Allowed';

export function RemoveAllowedService(workSheet: Worksheet, allowed: Allowed) {
    const protection = workSheet.getProtection();
    protection.getAllowedList().removeAllow(allowed);
}
