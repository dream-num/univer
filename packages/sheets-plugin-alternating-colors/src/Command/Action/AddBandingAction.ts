import { SheetAction, ActionObservers, CONVERTOR_OPERATION, ISheetActionData, Workbook, WorkSheetConvertor } from '@univer/core';
import { AlternatingColorsPlugin } from '../../AlternatingColorsPlugin';
import { AddBanding } from '../../Apply/AddBanding';
import { DeleteBanding } from '../../Apply/DeleteBanding';
import { ALTERNATING_COLORS_PLUGIN_NAME } from '../../Const';
import { IBandedRange } from '../../IBandedRange';
import { ACTION_NAMES } from '../ACTION_NAMES';
import { IDeleteBandingActionData } from './DeleteBandingAction';

export interface IAddBandingActionData extends ISheetActionData {
    bandedRange: IBandedRange;
}

export class AddBandingAction extends SheetAction<IAddBandingActionData, IDeleteBandingActionData, void> {
    constructor(actionData: IAddBandingActionData, workbook: Workbook, observers: ActionObservers) {
        super(actionData, workbook, observers);

        this._doActionData = {
            ...actionData,
            convertor: [new WorkSheetConvertor(CONVERTOR_OPERATION.SET)],
        };
        this.do();
        this._oldActionData = {
            actionName: ACTION_NAMES.DELETE_BANDING_ACTION,
            sheetId: actionData.sheetId,
            bandedRangeId: actionData.bandedRange.bandedRangeId,
        };
        this.validate();
    }

    do(): void {
        const worksheet = this.getWorkSheet();
        const context = worksheet.getContext();
        const manager = context.getPluginManager();
        const plugin = <AlternatingColorsPlugin>manager.getPluginByName(ALTERNATING_COLORS_PLUGIN_NAME);

        const { bandedRange } = this._doActionData;
        this._observers.onActionDoObserver.notifyObservers(this);
        AddBanding(plugin, bandedRange);
    }

    redo(): void {
        this.do();
        // no need store
    }

    undo(): void {
        const { bandedRangeId, sheetId } = this._oldActionData;
        const worksheet = this.getWorkSheet();
        const context = worksheet.getContext();
        const manager = context.getPluginManager();
        const plugin = <AlternatingColorsPlugin>manager.getPluginByName(ALTERNATING_COLORS_PLUGIN_NAME);
        this._observers.onActionUndoObserver.notifyObservers(this);

        // update current data
        this._doActionData = {
            actionName: ACTION_NAMES.ADD_BANDING_ACTION,
            sheetId,
            bandedRange: DeleteBanding(plugin, bandedRangeId),
        };
    }

    validate(): boolean {
        return false;
    }
}
