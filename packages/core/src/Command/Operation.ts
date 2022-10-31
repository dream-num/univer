import { ActionOperation, IActionData } from './ActionBase';

export class Operation {
    protected _action: IActionData;

    static hasObserver(action: IActionData): boolean {
        if (action.operation) {
            return (
                (action.operation & ActionOperation.OBSERVER_ACTION) ===
                ActionOperation.OBSERVER_ACTION
            );
        }
        return false;
    }

    static hasUndo(action: IActionData): boolean {
        if (action.operation) {
            return (
                (action.operation & ActionOperation.UNDO_ACTION) ===
                ActionOperation.UNDO_ACTION
            );
        }
        return false;
    }

    static hasCollaboration(action: IActionData): boolean {
        if (action.operation) {
            return (
                (action.operation & ActionOperation.SERVER_ACTION) ===
                ActionOperation.SERVER_ACTION
            );
        }
        return false;
    }

    static make(action: IActionData): Operation {
        action.operation = ActionOperation.DEFAULT_ACTION;
        return new Operation(action);
    }

    protected constructor(action: IActionData) {
        this._action = action;
    }

    removeObserver(): Operation {
        if (this._action.operation) {
            this._action.operation &= ~ActionOperation.OBSERVER_ACTION;
        }
        return this;
    }

    removeUndo(): Operation {
        if (this._action.operation) {
            this._action.operation &= ~ActionOperation.UNDO_ACTION;
        }
        return this;
    }

    removeCollaboration(): Operation {
        if (this._action.operation) {
            this._action.operation &= ~ActionOperation.SERVER_ACTION;
        }
        return this;
    }

    getAction(): IActionData {
        return this._action;
    }
}
