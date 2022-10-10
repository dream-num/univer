import { ActionBase, ActionObservers, CONVERTOR_OPERATION, IActionData, Workbook1, WorkSheetConvertor } from '@univer/core';
import { AlternatingColorsPlugin } from '../../AlternatingColorsPlugin';
import { AddBanding } from '../../Apply/AddBanding';
import { DeleteBanding } from '../../Apply/DeleteBanding';
import { ALTERNATING_COLORS_PLUGIN_NAME } from '../../Const';
import { IBandedRange } from '../../IBandedRange';
import { ACTION_NAMES } from '../ACTION_NAMES';
import { IAddBandingActionData } from './AddBandingAction';

export interface IDeleteBandingActionData extends IActionData {
    bandedRangeId: string;
}

export class DeleteBandingAction extends ActionBase<IDeleteBandingActionData, IAddBandingActionData, IBandedRange> {
    constructor(actionData: IDeleteBandingActionData, workbook: Workbook1, observers: ActionObservers) {
        super(actionData, workbook, observers);

        this._doActionData = {
            ...actionData,
            convertor: [new WorkSheetConvertor(CONVERTOR_OPERATION.SET)],
        };
        this._oldActionData = {
            actionName: ACTION_NAMES.ADD_BANDING_ACTION,
            sheetId: actionData.sheetId,
            bandedRange: this.do(),
        };
        this.validate();
    }

    do(): IBandedRange {
        const { bandedRangeId } = this._doActionData;
        const worksheet = this.getWorkSheet();
        const context = worksheet.getContext();
        const manager = context.getPluginManager();
        const plugin = <AlternatingColorsPlugin>manager.getPluginByName(ALTERNATING_COLORS_PLUGIN_NAME);
        this._observers.onActionDoObserver.notifyObservers(this);
        return DeleteBanding(plugin, bandedRangeId);
    }

    redo(): void {
        // update pre data
        const { sheetId } = this._doActionData;

        this._oldActionData = {
            sheetId,
            actionName: ACTION_NAMES.ADD_BANDING_ACTION,
            bandedRange: this.do(),
            convertor: [new WorkSheetConvertor(CONVERTOR_OPERATION.INSERT)],
        };
    }

    undo(): void {
        const { bandedRange } = this._oldActionData;
        const worksheet = this.getWorkSheet();
        const context = worksheet.getContext();
        const manager = context.getPluginManager();
        const plugin = <AlternatingColorsPlugin>manager.getPluginByName(ALTERNATING_COLORS_PLUGIN_NAME);
        this._observers.onActionUndoObserver.notifyObservers(this);
        AddBanding(plugin, bandedRange);
    }

    validate(): boolean {
        return false;
    }
}
