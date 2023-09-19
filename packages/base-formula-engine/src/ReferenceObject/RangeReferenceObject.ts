import { ISelectionRange } from '@univerjs/core';

import { BaseReferenceObject } from './BaseReferenceObject';

export class RangeReferenceObject extends BaseReferenceObject {
    constructor(rangeData: ISelectionRange, forcedSheetId?: string, forcedUnitId?: string) {
        super('');
        this.setRangeData(rangeData);
        if (forcedSheetId) {
            this.setForcedSheetIdDirect(forcedSheetId);
        }

        if (forcedUnitId) {
            this.setForcedUnitIdDirect(forcedUnitId);
        }
    }

    override isRange() {
        return true;
    }
}
