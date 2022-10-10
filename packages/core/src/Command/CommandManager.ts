import { UndoManager } from './UndoManager';
import { Inject } from '../IOC';
import { Command } from './Command';
import { Class } from '../Shared';
import { ActionBase, IActionData } from './ActionBase';
import { ActionObservers } from './ActionObservers';
import { Workbook } from '../Sheets/Domain';
import { CommandObservers } from './CommandObservers';
import { CommandInjectorObservers } from './CommandInjectorObservers';

/**
 * Manage command
 */
export class CommandManager {
    private static _actionClass: Map<string, Class<ActionBase<IActionData>>>;

    private static _commandObservers: CommandObservers;

    private static _actionObservers: ActionObservers;

    private static _commandInjectorObservers: CommandInjectorObservers;

    static staticInitialize() {
        this._actionClass = new Map<string, Class<ActionBase<IActionData>>>();
        this._actionObservers = new ActionObservers();
        this._commandObservers = new CommandObservers();
        this._commandInjectorObservers = new CommandInjectorObservers();
    }

    static getAction(name: string) {
        return this._actionClass[name];
    }

    static getActionObservers(): ActionObservers {
        return this._actionObservers;
    }

    static getCommandObservers(): CommandObservers {
        return this._commandObservers;
    }

    static register(name: string, clazz: Class<ActionBase<IActionData>>) {
        this._actionClass[name] = clazz;
    }

    static getCommandInjectorObservers(): CommandInjectorObservers {
        return this._commandInjectorObservers;
    }

    @Inject('WorkBook')
    private _workbook: Workbook;

    @Inject('UndoManager')
    private _undoManager: UndoManager;

    undo(): void {
        const { _workbook, _undoManager } = this;
        const server = _workbook.getServer();
        const command = _undoManager.undo();
        if (command) {
            command.undo();
            server.pushMessageQueue(command.getOldData());
        }
    }

    redo(): void {
        const { _workbook, _undoManager } = this;
        const server = _workbook.getServer();
        const command = _undoManager.redo();
        if (command) {
            command.redo();
            server.pushMessageQueue(command.getDoData());
        }
    }

    invoke(command: Command): void {
        const { _workbook, _undoManager } = this;
        const server = _workbook.getServer();
        command.invoke();
        _undoManager.push(command);
        server.pushMessageQueue(command.getDoData());
    }
}

CommandManager.staticInitialize();
