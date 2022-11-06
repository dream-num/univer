import { SheetAction, ActionObservers, CONVERTOR_OPERATION, ISheetActionData, Workbook, WorkSheetConvertor } from '@univer/core';
import { AlternatingColorsPlugin } from '../../AlternatingColorsPlugin';
import { SetBanding } from '../../Apply/SetBanding';
import { ALTERNATING_COLORS_PLUGIN_NAME } from '../../Const';
import { IBandedRange } from '../../IBandedRange';
import { ACTION_NAMES } from '../ACTION_NAMES';

export interface ISetBandingActionData extends ISheetActionData {
    bandedRange: IBandedRange;
}

export class SetBandingAction extends SheetAction<ISetBandingActionData, ISetBandingActionData, IBandedRange> {
    constructor(actionData: ISetBandingActionData, workbook: Workbook, observers: ActionObservers) {
        super(actionData, workbook, observers);

        this._doActionData = {
            ...actionData,
            convertor: [new WorkSheetConvertor(CONVERTOR_OPERATION.SET)],
        };
        this._oldActionData = {
            actionName: ACTION_NAMES.SET_BANDING_ACTION,
            sheetId: actionData.sheetId,
            bandedRange: this.do(),
        };
        this.validate();
    }

    do(): IBandedRange {
        const { bandedRange } = this._doActionData;
        const worksheet = this.getWorkSheet();
        const context = worksheet.getContext();
        const manager = context.getPluginManager();
        const plugin = <AlternatingColorsPlugin>manager.getPluginByName(ALTERNATING_COLORS_PLUGIN_NAME);
        this._observers.onActionDoObserver.notifyObservers(this);
        return SetBanding(plugin, bandedRange);
    }

    redo(): void {
        // update pre data
        const { bandedRange, sheetId } = this._doActionData;
        this._oldActionData = {
            actionName: ACTION_NAMES.SET_BANDING_ACTION,
            sheetId,
            bandedRange: this.do(),
        };
    }

    undo(): void {
        const { bandedRange, sheetId } = this._oldActionData;
        const worksheet = this.getWorkSheet();
        const context = worksheet.getContext();
        const manager = context.getPluginManager();
        const plugin = <AlternatingColorsPlugin>manager.getPluginByName(ALTERNATING_COLORS_PLUGIN_NAME);
        this._observers.onActionUndoObserver.notifyObservers(this);

        // update current data
        this._doActionData = {
            actionName: ACTION_NAMES.SET_BANDING_ACTION,
            sheetId,
            bandedRange: SetBanding(plugin, bandedRange),
        };
    }

    validate(): boolean {
        return false;
    }
}
