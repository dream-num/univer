import { IRangeData } from '@univer/core';
import { BaseReferenceObject } from './BaseReferenceObject';

export class RangeReferenceObject extends BaseReferenceObject {
    constructor(rangeData: IRangeData, forcedSheetId?: string, forcedUnitId?: string) {
        super('');
        this.setRangeData(rangeData);
        if (forcedSheetId) {
            this.setForcedSheetIdDirect(forcedSheetId);
        }

        if (forcedUnitId) {
            this.setForcedUnitIdDirect(forcedUnitId);
        }
    }
}
