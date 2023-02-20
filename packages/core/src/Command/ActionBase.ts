import { ActionObservers } from './ActionObservers';

/**
 * Format of action data param
 */
export interface IActionData {
    actionName: string;
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
     * action extension
     */
    EXTENSION_ACTION = 4,

    /**
     * default obs
     */
    DEFAULT_ACTION = 1 | 2 | 3 | 4,
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
    protected _observers: ActionObservers;

    protected _doActionData: D;

    protected _oldActionData: O;

    protected _operation: ActionOperationType;

    protected constructor(actionData: D, observers: ActionObservers) {
        this._doActionData = actionData;
        this._observers = observers;
        this._operation = ActionOperationType.OBSERVER_ACTION;
    }

    getDoActionData() {
        return this._doActionData;
    }

    getOldActionDaa() {
        return this._oldActionData;
    }

    hasOperation(operation: ActionOperationType): boolean {
        return (this._operation & operation) === operation;
    }

    addOperation(operation: ActionOperationType) {
        this._operation |= operation;
    }

    removeOperation(operation: ActionOperationType) {
        this._operation &= ~operation;
    }

    abstract redo(): void;

    abstract undo(): void;

    abstract do(): R;

    abstract validate(): boolean;
}
