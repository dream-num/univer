import { CommandBase } from './CommandBase';
import { CommandManager } from './CommandManager';
import { CommandType } from './CommandObservers';

/**
 * Execute the undo-redo command
 */
export class Command extends CommandBase {
    redo(): void {
        this._actions.forEach((action) => action.redo());
        CommandManager.getCommandObservers().notifyObservers({
            type: CommandType.REDO,
            actions: this._actions,
        });
    }

    undo(): void {
        this._actions.forEach((action) => action.undo());
        CommandManager.getCommandObservers().notifyObservers({
            type: CommandType.UNDO,
            actions: this._actions,
        });
    }

    invoke(): void {
        CommandManager.getCommandInjectorObservers().notifyObservers(
            this.getInjector()
        );
        CommandManager.getCommandObservers().notifyObservers({
            type: CommandType.REDO,
            actions: this._actions,
        });
    }
}
