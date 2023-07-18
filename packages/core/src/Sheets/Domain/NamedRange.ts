import { SheetContext } from '../../Basics';
import { CommandManager, Command } from '../../Command';
import {
    IAddNamedRangeActionData,
    IDeleteNamedRangeActionData,
    ISetNamedRangeActionData,
    AddNamedRangeAction,
} from '../Action';
import { ACTION_NAMES } from '../../Types/Const';
import { Workbook } from './index';
import { INamedRange } from '../../Types/Interfaces';

/**
 * Create, access and modify named ranges in a spreadsheet. Named ranges are ranges that have associated string aliases.
 *
 * Reference: https://developers.google.com/apps-script/reference/spreadsheet/named-range
 */
export class NamedRange {
    private _workbook: Workbook;

    private _commandManager: CommandManager;

    private _context: SheetContext;

    // private _name: string;
    // private _range: Range;
    // private _namedRangeId: string;

    constructor(workbook: Workbook) {
        this._workbook = workbook;
        this._commandManager = this._workbook.getCommandManager();
        this._context = this._workbook.getContext();

        // this._name = name;
        // this._range = range;
        // this._namedRangeId = 'named-range-' + Tools.generateRandomId(6);
        // this._addNamedRange();
    }

    addNamedRange(namedRange: INamedRange) {
        const { _workbook, _context, _commandManager } = this;

        // const namedRange: INamedRange = {
        //     namedRangeId: this._namedRangeId,
        //     name: this._name,
        //     range: {
        //         sheetId: this._worksheet.getSheetId(),
        //         rangeData: this._range.getRangeData(),
        //     },
        // };
        // Organize action data
        const actionData: IAddNamedRangeActionData = {
            actionName: AddNamedRangeAction.NAME,
            namedRange,
            sheetId: namedRange.range.sheetId,
        };

        // Execute action
        const command = new Command(
            {
                WorkBookUnit: _workbook,
            },
            actionData
        );
        _commandManager.invoke(command);

        // // manage instance
        // this._workbook.getNamedRanges().push(this);
    }

    setNamedRange(namedRange: INamedRange) {
        const { _workbook, _commandManager } = this;

        // const namedRange: INamedRange = {
        //     namedRangeId: this._namedRangeId,
        //     name: this._name,
        //     range: {
        //         sheetId: this._worksheet.getSheetId(),
        //         rangeData: this._range.getRangeData(),
        //     },
        // };
        // Organize action data
        const actionData: ISetNamedRangeActionData = {
            actionName: ACTION_NAMES.SET_NAMED_RANGE_ACTION,
            namedRange,
            sheetId: namedRange.range.sheetId,
        };

        // Execute action
        const command = new Command(
            {
                WorkBookUnit: _workbook,
            },
            actionData
        );
        _commandManager.invoke(command);
    }

    /**
     * Gets the name of this named range.
     *
     * @returns String — the name of this named range
     */
    // getName(): string {
    //     return this._name;
    // }

    /**
     * Sets/updates the name of the named range.
     * @param name 	The new name of the named range.
     *
     * @returns NamedRange — the range whose name was set by the call
     */
    // setName(name: string): NamedRange {
    //     this._name = name;

    //     this._setNamedRange();

    //     return this;
    // }

    /**
     * Gets the range referenced by this named range.
     *
     * @returns Range — the spreadsheet range that is associated with this named range
     */
    // getRange(): Range {
    //     return this._range;
    // }

    /**
     * Sets/updates the range for this named range.
     * @param range The spreadsheet range to associate with this named range.
     * @returns NamedRange — the named range for which the spreadsheet range was set
     */
    // setRange(range: Range): NamedRange {
    //     this._range = range;

    //     this._setNamedRange();

    //     return this;
    // }

    /**
     * Gets the namedRangeId of this named range.
     *
     * @returns String — the namedRangeId of this named range
     */
    // getNamedRangeId(): string {
    //     return this._namedRangeId;
    // }

    /**
     * Deletes this named range.
     */
    remove(namedRangeId: string): void {
        const { _context, _workbook, _commandManager } = this;

        // Organize action data
        const actionData: IDeleteNamedRangeActionData = {
            actionName: ACTION_NAMES.DELETE_NAMED_RANGE_ACTION,
            namedRangeId,
            sheetId: _workbook.getActiveSheet().getSheetId(),
        };

        // Execute action
        const command = new Command(
            {
                WorkBookUnit: _workbook,
            },
            actionData
        );
        _commandManager.invoke(command);

        // const namedRanges = this._workbook.getNamedRanges();

        // return namedRanges.find((currentNamedRange: NamedRange, i) => {
        //     if (currentNamedRange.getNamedRangeId() === this._namedRangeId) {
        //         // remove
        //         namedRanges.splice(i, 1);
        //         return currentNamedRange;
        //     }
        // })!;
    }
}
