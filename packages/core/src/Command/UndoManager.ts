import { SheetsCommand } from './SheetsCommand';

/**
 * Manage Undo Redo
 */
export class UndoManager {
    private _undoStack: SheetsCommand[];

    private _redoStack: SheetsCommand[];

    constructor() {
        this._undoStack = [];
        this._redoStack = [];
    }

    push(command: SheetsCommand): void {
        this._redoStack.push(command);
    }

    undo(): SheetsCommand | undefined {
        const command = this._redoStack.pop();
        if (command) {
            this._undoStack.push(command);
            return command;
        }
    }

    redo(): SheetsCommand | undefined {
        const command = this._undoStack.pop();
        if (command) {
            this._redoStack.push(command);
            return command;
        }
    }
}
