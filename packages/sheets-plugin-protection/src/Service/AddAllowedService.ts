import { WorkSheet } from '@univer/core';
import { Allowed } from '@univer/core/src/Module/Protection';

export function AddAllowedService(workSheet: WorkSheet, allowed: Allowed) {
    const protection = workSheet.getProtection();
    protection.getAllowedList().addAllow(allowed);
}
