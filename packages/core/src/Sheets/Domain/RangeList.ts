import { Inject } from '@wendellhu/redi';
import { Worksheet } from './index';
import { Command, CommandManager } from '../../Command';
import { IOptionData, IRangeData, IRangeType } from '../../Types/Interfaces';
import { Tuples } from '../../Shared';
import { ClearRangeAction, IClearRangeActionData } from '../Action';
import { ICurrentUniverService } from '../../Service/Current.service';

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
    private _rangeList: IRangeData[];

    constructor(
        private readonly _worksheet: Worksheet,
        rangeList: IRangeType[],
        @Inject(CommandManager) private readonly _commandManager: CommandManager,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService
    ) {
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

    getRangeList(): IRangeData[] {
        return this._rangeList;
    }

    /**
     * Selects the list of Range instances.
     *
     * @returns The list of active ranges, for chaining.
     */
    activate(): RangeList {
        const { _commandManager } = this;
        // The user entered an invalid range
        if (this._rangeList[0].startRow === -1) {
            console.error('Invalid range,default set startRow -1');
            return this;
        }

        this._worksheet.getSelection().setSelection({ selection: this._rangeList });

        return this;
    }

    /**
     * Clears the range of contents, formats, and data validation rules for each Range in the range list.
     *
     * @returns This range list, for chaining.
     */
    clear(): RangeList;

    /**
     * Clears the range of contents and format, as specified with the given options. By default all data is cleared.
     *
     * @param options 	A JavaScript object that specifies advanced parameters, as listed IOptionData.
     * @returns  This range list, for chaining.
     */
    clear(options: IOptionData): RangeList;
    clear(...argument: any): RangeList {
        const { _worksheet, _commandManager, _rangeList } = this;

        // default options
        let options = {
            formatOnly: true,
            contentsOnly: true,
        };
        if (Tuples.checkup(argument, Tuples.OBJECT_TYPE)) {
            options = argument[0];
        }

        // collect action list
        const clearList = _rangeList.map((range) => {
            const clearRange: IClearRangeActionData = {
                sheetId: _worksheet.getSheetId(),
                actionName: ClearRangeAction.NAME,
                options,
                rangeData: range,
            };
            return clearRange;
        });

        const command = new Command(
            {
                WorkBookUnit: this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook(),
            },
            ...clearList
        );
        _commandManager.invoke(command);

        return this;
    }

    /**
     * Clears text formatting for each Range in the range list.
     *
     * This clears text formatting for each range, but does not reset any number formatting rules.
     * @returns  This range list, for chaining.
     */
    clearFormat(): RangeList {
        return this.clear({ formatOnly: true });
    }

    /**
     * Clears the content of each Range in the range list, leaving the formatting intact.
     *
     * @returns  This range list, for chaining.
     */
    clearContent(): RangeList {
        return this.clear({ contentsOnly: true });
    }
}
