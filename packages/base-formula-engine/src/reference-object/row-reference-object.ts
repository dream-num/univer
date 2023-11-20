import { IRange } from '@univerjs/core';

import { ErrorType } from '../basics/error-type';
import { deserializeRangeWithSheet } from '../basics/reference';
import { ErrorValueObject } from '../other-object/error-value-object';
import { BaseReferenceObject } from './base-reference-object';

export class RowReferenceObject extends BaseReferenceObject {
    constructor(token: string) {
        super(token);
        const grid = deserializeRangeWithSheet(token);
        this.setForcedSheetName(grid.sheetName);
        const range: IRange = {
            startColumn: -1,
            startRow: grid.range.startRow,
            endColumn: -1,
            endRow: -1,
        };
        this.setRangeData(range);
    }

    override isRow() {
        return true;
    }

    override unionBy(referenceObject: BaseReferenceObject) {
        if (!referenceObject.isRow()) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        const rowReferenceObject = referenceObject as RowReferenceObject;
        if (rowReferenceObject.getForcedSheetName() !== undefined) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        const currentRangeData = this.getRangeData();

        if (currentRangeData.endRow !== -1) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        const newRow = rowReferenceObject.getRangeData().startRow;

        const row = currentRangeData.startRow;

        if (newRow > row) {
            currentRangeData.endRow = newRow;
        } else {
            currentRangeData.startRow = newRow;
            currentRangeData.endRow = row;
        }

        return this;
    }
}
