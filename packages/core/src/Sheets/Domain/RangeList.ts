import { ICurrentUniverService } from '../../services/current.service';
import { IRangeType, ISelectionRange } from '../../Types/Interfaces';
import type { Worksheet } from './Worksheet';

/**
 * A collection of one or more Range instances in the same sheet.
 *
 * @remarks
 * You can use this class to apply operations on collections of non-adjacent ranges or cells.
 *
 * Reference from: https://developers.google.com/apps-script/reference/spreadsheet/range-list
 *
 */
export class RangeList {
    private _rangeList: ISelectionRange[];

    constructor(private readonly _worksheet: Worksheet, rangeList: IRangeType[], @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService) {
        const workbook = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
        this._rangeList = [];

        // Convert the rangeList passed in by the user into a standard format
        rangeList.forEach((range: IRangeType) => {
            // this._rangeList.push(
            //     new TransformTool(this._workbook).transformRangeType(range)
            // );
            this._rangeList.push(workbook.transformRangeType(range).rangeData);
        });

        // The user entered an invalid range
        if (this._rangeList[0].startRow === -1) {
            console.error('Invalid range,default set startRow -1');
        }
    }

    getRangeList(): ISelectionRange[] {
        return this._rangeList;
    }

    /**
     * Selects the list of Range instances.
     *
     * @returns The list of active ranges, for chaining.
     */
    activate(): RangeList {
        // The user entered an invalid range
        if (this._rangeList[0].startRow === -1) {
            console.error('Invalid range,default set startRow -1');
            return this;
        }

        return this;
    }
}
