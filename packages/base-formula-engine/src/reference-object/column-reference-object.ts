import { IRange } from '@univerjs/core';

import { ErrorType } from '../basics/error-type';
import { deserializeRangeWithSheet } from '../basics/reference';
import { ErrorValueObject } from '../other-object/error-value-object';
import { BaseReferenceObject } from './base-reference-object';

export class ColumnReferenceObject extends BaseReferenceObject {
    constructor(token: string) {
        super(token);
        const grid = deserializeRangeWithSheet(token);
        this.setForcedSheetName(grid.sheetName);
        const range: IRange = {
            startColumn: grid.range.startColumn,
            startRow: -1,
            endColumn: -1,
            endRow: -1,
        };
        this.setRangeData(range);
    }

    override isColumn() {
        return true;
    }

    override unionBy(referenceObject: BaseReferenceObject) {
        if (!referenceObject.isColumn()) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        const columnReferenceObject = referenceObject as ColumnReferenceObject;
        if (columnReferenceObject.getForcedSheetName() !== undefined) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        const currentRangeData = this.getRangeData();

        if (currentRangeData.endColumn !== -1) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        const newColumn = columnReferenceObject.getRangeData().startColumn;

        const column = currentRangeData.startColumn;

        if (newColumn > column) {
            currentRangeData.endColumn = newColumn;
        } else {
            currentRangeData.startColumn = newColumn;
            currentRangeData.endColumn = column;
        }

        return this;
    }
}
