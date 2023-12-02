import type { IRange } from '@univerjs/core';
import { deserializeRangeWithSheet } from '@univerjs/core';

import { ErrorType } from '../basics/error-type';
import { ErrorValueObject } from '../other-object/error-value-object';
import { BaseReferenceObject } from './base-reference-object';
import { RangeReferenceObject } from './range-reference-object';

export class CellReferenceObject extends BaseReferenceObject {
    constructor(token: string) {
        super(token);
        const grid = deserializeRangeWithSheet(token);
        this.setForcedUnitIdDirect(grid.unitId);
        this.setForcedSheetName(grid.sheetName);
        this.setRangeData(grid.range);
    }

    override isCell() {
        return true;
    }

    override unionBy(referenceObject: BaseReferenceObject) {
        if (!referenceObject.isCell()) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        const cellReferenceObject = referenceObject as CellReferenceObject;
        // if (cellReferenceObject.getForcedSheetName() !== undefined) {
        //     return ErrorValueObject.create(ErrorType.REF);
        // }

        const newRangeData = this.unionRange(this.getRangeData(), cellReferenceObject.getRangeData());

        return this._createRange(newRangeData);
    }

    override unionRange(rangeData1: IRange, rangeData2: IRange) {
        const startRow1 = rangeData1.startRow;
        const startColumn1 = rangeData1.startColumn;

        const startRow2 = rangeData2.startRow;
        const startColumn2 = rangeData2.startColumn;
        const range: IRange = {
            startRow: -1,
            startColumn: -1,
            endRow: -1,
            endColumn: -1,
        };
        if (startRow1 > startRow2) {
            range.startRow = startRow2;
            range.endRow = startRow1;
        } else {
            range.startRow = startRow1;
            range.endRow = startRow2;
        }

        if (startColumn1 > startColumn2) {
            range.startColumn = startColumn2;
            range.endColumn = startColumn1;
        } else {
            range.startColumn = startColumn1;
            range.endColumn = startColumn2;
        }

        return range;
    }

    private _createRange(newRangeData: IRange) {
        const rangeReferenceObject = new RangeReferenceObject(
            newRangeData,
            this.getForcedSheetId(),
            this.getForcedUnitId()
        );

        rangeReferenceObject.setUnitData(this.getUnitData());

        rangeReferenceObject.setDefaultSheetId(this.getDefaultSheetId());

        rangeReferenceObject.setDefaultUnitId(this.getDefaultUnitId());

        rangeReferenceObject.setRuntimeData(this.getRuntimeData());

        rangeReferenceObject.setArrayFormulaCellData(this.getArrayFormulaCellData());

        rangeReferenceObject.setRuntimeArrayFormulaCellData(this.getRuntimeArrayFormulaCellData());

        const { x, y } = this.getRefOffset();

        rangeReferenceObject.setRefOffset(x, y);

        const forceId = this.getForcedUnitId();

        if (forceId != null) {
            rangeReferenceObject.setForcedSheetIdDirect(this.getForcedUnitId());
        }

        // const forcedSheetID = this.getForcedSheetId();
        // if (forcedSheetID) {
        //     rangeReferenceObject.setForcedSheetIdDirect(forcedSheetID);
        // }

        // const forcedUnitId = this.getForcedUnitId();
        // if (forcedUnitId) {
        //     rangeReferenceObject.setForcedUnitIdDirect(forcedUnitId);
        // }

        return rangeReferenceObject;
    }
}
