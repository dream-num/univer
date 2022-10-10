import { Workbook1, Worksheet1 } from '../Sheets/Domain';
import { ActionObservers } from './ActionObservers';

/**
 * Format of action data param
 */
export interface IActionData {
    actionName: string;
    sheetId: string;
    convertor?: object[];
    rangeRef?: string;
    memberId?: string;
}

/**
 * Action Operation Type
 */
export enum ActionOperation {
    /**
     * send obs
     */
    OBSERVER_ACTION = 1,

    /**
     * send server
     */
    SERVER_ACTION = 2,

    /**
     * push to UNDO/REDO stack
     */
    UNDO_ACTION = 3,
}

/**
 * Base class for action
 *
 * @beta
 */
export abstract class ActionBase<
    D extends IActionData,
    O extends IActionData = D,
    R = void
> {
    protected _workbook: Workbook1;

    protected _observers: ActionObservers;

    protected _doActionData: D;

    protected _oldActionData: O;

    protected _operation: ActionOperation;

    protected constructor(
        actionData: D,
        workbook: Workbook1,
        observers: ActionObservers
    ) {
        this._doActionData = actionData;
        this._workbook = workbook;
        this._observers = observers;
        this._operation = ActionOperation.OBSERVER_ACTION;
    }

    abstract redo(): void;

    abstract undo(): void;

    abstract do(): R;

    abstract validate(): boolean;

    getDoActionData() {
        return this._doActionData;
    }

    getOldActionDaa() {
        return this._oldActionData;
    }

    getWorkSheet(): Worksheet1 {
        const { _workbook, _doActionData } = this;
        const { sheetId } = _doActionData;
        return _workbook.getSheetBySheetId(sheetId) as Worksheet1;
    }

    getWorkBook(): Workbook1 {
        return this._workbook;
    }

    hasOperation(operation: ActionOperation): boolean {
        return (this._operation & operation) === operation;
    }

    // TODO how to use
    addOperation(operation: ActionOperation) {
        this._operation |= operation;
    }

    removeOperation(operation: ActionOperation) {
        this._operation &= ~operation;
    }
}
