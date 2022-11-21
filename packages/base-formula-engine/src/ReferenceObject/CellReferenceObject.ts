import { IRangeData, referenceToGrid } from '@univer/core';
import { ErrorType } from '../Basics/ErrorType';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { BaseReferenceObject } from './BaseReferenceObject';
import { RangeReferenceObject } from './RangeReferenceObject';

export class CellReferenceObject extends BaseReferenceObject {
    constructor(token: string) {
        super(token);
        const grid = referenceToGrid(token);
        this.setForcedSheetName(grid.sheetName);
        this.setRangeData(grid.rangeData);
    }

    private _createRange(newRangeData: IRangeData) {
        const rangeReferenceObject = new RangeReferenceObject(newRangeData, this.getForcedSheetId(), this.getForcedUnitId());

        rangeReferenceObject.setUnitData(this.getUnitData());

        rangeReferenceObject.setDefaultSheetId(this.getDefaultSheetId());

        rangeReferenceObject.setRowCount(this.getRowCount());

        rangeReferenceObject.setColumnCount(this.getColumnCount());

        rangeReferenceObject.setDefaultUnitId(this.getDefaultUnitId());

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

    isCell() {
        return true;
    }

    unionBy(referenceObject: BaseReferenceObject) {
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

    unionRange(rangeData1: IRangeData, rangeData2: IRangeData) {
        const startRow1 = rangeData1.startRow;
        const startColumn1 = rangeData1.startColumn;

        const startRow2 = rangeData2.startRow;
        const startColumn2 = rangeData2.startColumn;
        let rangeData: IRangeData = {
            startRow: -1,
            startColumn: -1,
            endRow: -1,
            endColumn: -1,
        };
        if (startRow1 > startRow2) {
            rangeData.startRow = startRow2;
            rangeData.endRow = startRow1;
        } else {
            rangeData.startRow = startRow1;
            rangeData.endRow = startRow2;
        }

        if (startColumn1 > startColumn2) {
            rangeData.startColumn = startColumn2;
            rangeData.endColumn = startColumn1;
        } else {
            rangeData.startColumn = startColumn1;
            rangeData.endColumn = startColumn2;
        }

        return rangeData;
    }
}
