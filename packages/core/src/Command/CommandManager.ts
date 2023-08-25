import { Inject } from '@wendellhu/redi';
import { Class } from '../Shared/Types';
import { ActionBase, IActionData } from './ActionBase';
import { CommandObservers } from './CommandObservers';
import { ActionObservers } from './ActionObservers';
import { CommandInjectorObservers } from './CommandInjectorObservers';
import { UndoManager } from './UndoManager';
import { ActionExtensionManager } from './ActionExtensionManager';
import { Command } from './Command';

/**
 * Manage command
 */
export class CommandManager {
    private static _actionClass: Map<string, Class<ActionBase<IActionData>>>;

    private static _commandObservers: CommandObservers;

    private static _actionObservers: ActionObservers;

    private static _commandInjectorObservers: CommandInjectorObservers;

    private _actionExtensionManager: ActionExtensionManager;

    constructor(@Inject(UndoManager) private readonly _undoManager: UndoManager) {
        this._actionExtensionManager = new ActionExtensionManager();
    }

    static staticInitialize() {
        this._actionClass = new Map<string, Class<ActionBase<IActionData>>>();
        this._actionObservers = new ActionObservers();
        this._commandObservers = new CommandObservers();
        this._commandInjectorObservers = new CommandInjectorObservers();
    }

    static getAction(name: string) {
        return this._actionClass.get(name);
    }

    static getActionObservers(): ActionObservers {
        return this._actionObservers;
    }

    static getCommandObservers(): CommandObservers {
        return this._commandObservers;
    }

    static register(name: string, clazz: Class<ActionBase<IActionData>>) {
        this._actionClass.set(name, clazz);
    }

    static getCommandInjectorObservers(): CommandInjectorObservers {
        return this._commandInjectorObservers;
    }

    getActionExtensionManager(): ActionExtensionManager {
        return this._actionExtensionManager;
    }

    undo(): void {
        const { _undoManager } = this;
        const command = _undoManager.undo();
        if (command) {
            command.undo();
        }
    }

    redo(): void {
        const { _undoManager } = this;
        const command = _undoManager.redo();
        if (command) {
            command.redo();
        }
    }

    invoke(command: Command): void {
        const { _undoManager } = this;
        const { actionDataList } = command;

        // Action may be added or reissued
        this._actionExtensionManager.handle(actionDataList);

        command.invoke();

        _undoManager.push(command);
    }
}

CommandManager.staticInitialize();
