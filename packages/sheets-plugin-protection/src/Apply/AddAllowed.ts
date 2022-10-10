import { Worksheet } from '@univer/core';
import { Allowed } from '@univer/core/src/Module/Protection';

export function AddAllowed(workSheet: Worksheet, allowed: Allowed) {
    const protection = workSheet.getProtection();
    protection.getAllowedList().addAllow(allowed);
}
