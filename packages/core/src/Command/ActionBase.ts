import { Workbook, Worksheet } from '../Sheets/Domain';
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
    operation?: ActionOperationType;
}

/**
 * Action Operation Type
 */
export enum ActionOperationType {
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

    /**
     * default obs
     */
    DEFAULT_ACTION = 1 | 2 | 3,
}

/**
 * Basics class for action
 *
 * @beta
 */
export abstract class ActionBase<
    D extends IActionData,
    O extends IActionData = D,
    R = void
> {
    protected _workbook: Workbook;

    protected _observers: ActionObservers;

    protected _doActionData: D;

    protected _oldActionData: O;

    protected _operation: ActionOperationType;

    protected constructor(
        actionData: D,
        workbook: Workbook,
        observers: ActionObservers
    ) {
        this._doActionData = actionData;
        this._workbook = workbook;
        this._observers = observers;
        this._operation = ActionOperationType.OBSERVER_ACTION;
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

    getWorkSheet(): Worksheet {
        const { _workbook, _doActionData } = this;
        const { sheetId } = _doActionData;
        return _workbook.getSheetBySheetId(sheetId) as Worksheet;
    }

    getWorkBook(): Workbook {
        return this._workbook;
    }

    hasOperation(operation: ActionOperationType): boolean {
        return (this._operation & operation) === operation;
    }

    // TODO how to use
    addOperation(operation: ActionOperationType) {
        this._operation |= operation;
    }

    removeOperation(operation: ActionOperationType) {
        this._operation &= ~operation;
    }
}
