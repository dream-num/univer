import { Worksheet } from '@univerjs/core';
import { Allowed } from '@univerjs/core/src/Module/Protection';

export function AddAllowed(workSheet: Worksheet, allowed: Allowed) {
    const protection = workSheet.getProtection();
    protection.getAllowedList().addAllow(allowed);
}
