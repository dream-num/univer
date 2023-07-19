import { CommonParameter } from './CommonParameter';
import { Observable } from '../Observer';

/**
 * Action Operation Type
 */
export enum ActionOperationType {
    /**
     * send obs
     */
    OBSERVER_ACTION = 0x00000001,

    /**
     * send server
     */
    SERVER_ACTION = 0x00000002,

    /**
     * push to UNDO/REDO stack
     */
    UNDO_ACTION = 0x00000004,

    /**
     * action extension
     */
    EXTENSION_ACTION = 0x00000008,

    /**
     * default obs
     */
    DEFAULT_ACTION = ActionOperationType.OBSERVER_ACTION | ActionOperationType.SERVER_ACTION | ActionOperationType.UNDO_ACTION | ActionOperationType.EXTENSION_ACTION,
}

/**
 * Action type
 */
export enum ActionType {
    REDO,
    UNDO,
}

/**
 * Format of action data param
 */
export interface IActionData {
    actionName: string;
    memberId?: string;
    operation?: ActionOperationType;
}

/**
 * Action observer props
 */
export interface IActionObserverProps {
    type: ActionType;
    data: IActionData;
    action: ActionBase<IActionData, IActionData>;
    commonParameter?: CommonParameter;
}

/**
 * WorkBookObserver for action base
 *
 * @beta
 */
export class ActionObservers extends Observable<IActionObserverProps> {}

/**
 * Basics class for action
 *
 * @beta
 */
export abstract class ActionBase<D extends IActionData, O extends IActionData = D, R = void> {
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

    getOldActionData() {
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

    abstract redo(commonParameter?: CommonParameter): void;

    abstract undo(commonParameter?: CommonParameter): void;

    abstract do(commonParameter?: CommonParameter): R;

    abstract validate(): boolean;
}
