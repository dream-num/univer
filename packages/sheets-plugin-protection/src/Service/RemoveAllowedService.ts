import { WorkSheet } from '@univer/core';
import { Allowed } from '@univer/core/src/Module/Protection';

export function RemoveAllowedService(workSheet: WorkSheet, allowed: Allowed) {
    const protection = workSheet.getProtection();
    protection.getAllowedList().removeAllow(allowed);
}
