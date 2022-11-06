import { CommandBase } from './CommandBase';

/**
 * Manage Undo Redo
 */
export class UndoManager {
    private _undoStack: CommandBase[];

    private _redoStack: CommandBase[];

    constructor() {
        this._undoStack = [];
        this._redoStack = [];
    }

    push(command: CommandBase): void {
        this._redoStack.push(command);
    }

    undo(): CommandBase | undefined {
        const command = this._redoStack.pop();
        if (command) {
            this._undoStack.push(command);
            return command;
        }
    }

    redo(): CommandBase | undefined {
        const command = this._undoStack.pop();
        if (command) {
            this._redoStack.push(command);
            return command;
        }
    }
}
