import { createIdentifier, IAccessor, IDisposable } from '@wendellhu/redi';
import { BehaviorSubject, Observable } from 'rxjs';

import { Disposable, toDisposable } from '../../Shared/Lifecycle';
import { CommandService, CommandType, ICommand, ICommandService } from '../command/command.service';

// TODO:: an undo redo element may be mergable to another undo redo element

interface IUndoRedoItem {
    /** */
    URI: string;

    undo(): Promise<boolean> | boolean;
    redo(): Promise<boolean> | boolean;
}

export interface IUndoRedoService {
    undoRedoStatus$: Observable<IUndoRedoStatus>;

    pushUndoRedo(item: IUndoRedoItem): void;

    pitchTopUndoElement(): IUndoRedoItem | null;
    pitchTopRedoElement(): IUndoRedoItem | null;

    popUndoToRedo(): void;
    popRedoToUndo(): void;
}

export const IUndoRedoService = createIdentifier<IUndoRedoService>('univer.undo-redo.service');

export interface IUndoRedoStatus {
    undos: number;
    redos: number;
}

/**
 * This UndoRedoService is local.
 */
export class LocalUndoRedoService extends Disposable implements IUndoRedoService {
    readonly undoRedoStatus$: Observable<IUndoRedoStatus>;

    private readonly _undoRedoStatus$ = new BehaviorSubject<{ undos: number; redos: number }>({ undos: 0, redos: 0 });

    private readonly _undoStack: IUndoRedoItem[] = [];

    private readonly _redoStack: IUndoRedoItem[] = [];

    constructor(@ICommandService private readonly _commandService: CommandService) {
        super();

        this.undoRedoStatus$ = this._undoRedoStatus$.asObservable();

        this.disposeWithMe(this._commandService.registerCommand(UndoCommand));
        this.disposeWithMe(this._commandService.registerCommand(RedoCommand));
        this.disposeWithMe(
            toDisposable(() => {
                this._undoRedoStatus$.complete();
            })
        );
    }

    pushUndoRedo(item: IUndoRedoItem): void {
        // redo stack should be cleared when push an undo
        this._redoStack.length = 0;

        // TODO: undo element maybe mergeable
        // TODO: undo redo stack should have a maximum capacity, maybe we should get the config from IConfigService?
        this._undoStack.push(item);
        if (this._undoStack.length > 20) {
            this._undoStack.splice(0, 1);
        }

        this.updateStatus();
    }

    pitchTopUndoElement(): IUndoRedoItem | null {
        if (this._undoStack.length) {
            return this._undoStack[this._undoStack.length - 1];
        }

        return null;
    }

    pitchTopRedoElement(): IUndoRedoItem | null {
        if (this._redoStack.length) {
            return this._redoStack[this._redoStack.length - 1];
        }

        return null;
    }

    popUndoToRedo(): void {
        const element = this._undoStack.pop();
        if (element) {
            this._redoStack.push(element);
            this.updateStatus();
        }
    }

    popRedoToUndo(): void {
        const element = this._redoStack.pop();
        if (element) {
            this._undoStack.push(element);
            this.updateStatus();
        }
    }

    private updateStatus(): void {
        this._undoRedoStatus$.next({
            undos: this._undoStack.length,
            redos: this._redoStack.length,
        });
    }
}

abstract class MultiImplementationCommand implements IDisposable {
    dispose(): void {}

    addCommandHandler(id: string, priority: number = 10) {}

    async dispatchToHandlers(accessor: IAccessor): Promise<boolean> {
        return false;
    }
}

export const UndoCommand = new (class extends MultiImplementationCommand implements ICommand {
    readonly type = CommandType.COMMAND;

    readonly id = 'univer.command.undo';

    async handler(accessor: IAccessor) {
        const undoRedoService = accessor.get(IUndoRedoService);
        const element = undoRedoService.pitchTopUndoElement();
        if (!element) {
            return false;
        }

        const result = await element.undo();
        if (result) {
            undoRedoService.popUndoToRedo();
            return true;
        }

        return false;
    }
})();

export const RedoCommand = new (class extends MultiImplementationCommand implements ICommand {
    readonly type = CommandType.COMMAND;

    readonly id = 'univer.command.redo';

    async handler(accessor: IAccessor) {
        const undoRedoService = accessor.get(IUndoRedoService);
        const element = undoRedoService.pitchTopRedoElement();
        if (!element) {
            return false;
        }

        const result = await element.redo();
        if (result) {
            undoRedoService.popRedoToUndo();
            return true;
        }

        return false;
    }
})();