import { ActionOperationType, IActionData } from './ActionBase';

export class ActionOperation<T extends IActionData> {
    protected _action: T;

    static hasObserver<U extends IActionData>(action: U): boolean {
        if (action.operation) {
            return (
                (action.operation & ActionOperationType.OBSERVER_ACTION) ===
                ActionOperationType.OBSERVER_ACTION
            );
        }
        return false;
    }

    static hasUndo<U extends IActionData>(action: U): boolean {
        if (action.operation) {
            return (
                (action.operation & ActionOperationType.UNDO_ACTION) ===
                ActionOperationType.UNDO_ACTION
            );
        }
        return false;
    }

    static hasCollaboration<U extends IActionData>(action: U): boolean {
        if (action.operation) {
            return (
                (action.operation & ActionOperationType.SERVER_ACTION) ===
                ActionOperationType.SERVER_ACTION
            );
        }
        return false;
    }

    static hasExtension<U extends IActionData>(action: U): boolean {
        if (action.operation) {
            return (
                (action.operation & ActionOperationType.EXTENSION_ACTION) ===
                ActionOperationType.EXTENSION_ACTION
            );
        }
        return false;
    }

    static make<U extends IActionData>(action: U) {
        action.operation = ActionOperationType.DEFAULT_ACTION;
        return new ActionOperation<U>(action);
    }

    protected constructor(action: T) {
        this._action = action;
    }

    removeObserver() {
        if (this._action.operation) {
            this._action.operation &= ~ActionOperationType.OBSERVER_ACTION;
        }
        return this;
    }

    removeUndo() {
        if (this._action.operation) {
            this._action.operation &= ~ActionOperationType.UNDO_ACTION;
        }
        return this;
    }

    removeCollaboration() {
        if (this._action.operation) {
            this._action.operation &= ~ActionOperationType.SERVER_ACTION;
        }
        return this;
    }

    removeExtension() {
        if (this._action.operation) {
            this._action.operation &= ~ActionOperationType.EXTENSION_ACTION;
        }
        return this;
    }

    getAction(): T {
        return this._action;
    }
}
