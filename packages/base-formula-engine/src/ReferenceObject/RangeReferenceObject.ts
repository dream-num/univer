import { IRange } from '@univerjs/core';

import { BaseReferenceObject } from './BaseReferenceObject';

export class RangeReferenceObject extends BaseReferenceObject {
    constructor(range: IRange, forcedSheetId?: string, forcedUnitId?: string) {
        super('');
        this.setRangeData(range);
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
