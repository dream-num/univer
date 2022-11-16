import { SheetActionBase, ActionObservers, ActionType, ISheetActionData, ICellInfo, ISelection, Nullable, Workbook } from '@univer/core';
import { ACTION_NAMES } from '../../Basics';
import { SetSelectionValue } from '../Apply/SetSelectionValue';

export interface ISelectionModelValue {
    selection: ISelection;
    cell: Nullable<ICellInfo>;
}

export interface ISetSelectionValueActionData extends ISheetActionData {
    selections: ISelectionModelValue[];
}

export class SetSelectionValueAction extends SheetActionBase<ISetSelectionValueActionData, ISetSelectionValueActionData, ISelectionModelValue[]> {
    constructor(actionData: ISetSelectionValueActionData, workbook: Workbook, observers: ActionObservers) {
        super(actionData, workbook, observers);

        this._doActionData = {
            ...actionData,
            convertor: [],
        };

        const selections = this.do();

        this._oldActionData = {
            ...actionData,
            selections,
        };

        this.validate();
    }

    do(): ISelectionModelValue[] {
        const { selections } = this._doActionData;
        const worksheet = this.getWorkSheet();

        const result = SetSelectionValue(worksheet, selections);

        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });

        return result;
    }

    redo(): void {
        // update pre data
        const { sheetId } = this._doActionData;
        const selections = this.do();
        this._oldActionData = {
            actionName: ACTION_NAMES.SET_SELECTION_VALUE_ACTION,
            sheetId,
            selections,
        };
    }

    undo(): void {
        const { selections, sheetId } = this._oldActionData;
        const worksheet = this.getWorkSheet();

        // update current data
        this._doActionData = {
            actionName: ACTION_NAMES.SET_SELECTION_VALUE_ACTION,
            sheetId,
            selections: SetSelectionValue(worksheet, selections),
        };

        this._observers.notifyObservers({
            type: ActionType.UNDO,
            data: this._oldActionData,
            action: this,
        });
    }

    validate(): boolean {
        return false;
    }
}
