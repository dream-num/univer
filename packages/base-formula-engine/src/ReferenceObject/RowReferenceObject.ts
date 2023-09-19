import { ISelectionRange, referenceToGrid } from '@univerjs/core';

import { ErrorType } from '../Basics/ErrorType';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { BaseReferenceObject } from './BaseReferenceObject';

export class RowReferenceObject extends BaseReferenceObject {
    constructor(token: string) {
        super(token);
        const grid = referenceToGrid(token);
        this.setForcedSheetName(grid.sheetName);
        const rangeData: ISelectionRange = {
            startColumn: -1,
            startRow: grid.rangeData.startRow,
            endColumn: -1,
            endRow: -1,
        };
        this.setRangeData(rangeData);
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
