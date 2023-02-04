import { Worksheet } from '@univerjs/core';
import { Allowed } from '@univerjs/core/src/Module/Protection';

export function RemoveAllowed(workSheet: Worksheet, allowed: Allowed) {
    const protection = workSheet.getProtection();
    protection.getAllowedList().removeAllow(allowed);
}
