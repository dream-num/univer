import { Worksheet1 } from '@univer/core';
import { Allowed } from '@univer/core/src/Module/Protection';

export function RemoveAllowedService(workSheet: Worksheet1, allowed: Allowed) {
    const protection = workSheet.getProtection();
    protection.getAllowedList().removeAllow(allowed);
}
