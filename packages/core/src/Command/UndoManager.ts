import { Command } from './index';

/**
 * Manage Undo Redo
 */
export class UndoManager {
    private _undoStack: Command[];

    private _redoStack: Command[];

    constructor() {
        this._undoStack = [];
        this._redoStack = [];
    }

    push(command: Command): void {
        if (command.canUndo()) {
            this._redoStack.push(command);
        }
    }

    undo(): Command | undefined {
        const command = this._redoStack.pop();
        if (command) {
            this._undoStack.push(command);
            return command;
        }
    }

    redo(): Command | undefined {
        const command = this._undoStack.pop();
        if (command) {
            this._redoStack.push(command);
            return command;
        }
    }
}
