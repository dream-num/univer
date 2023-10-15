import { createIdentifier, IAccessor, IDisposable } from '@wendellhu/redi';
import { BehaviorSubject, Observable } from 'rxjs';

import { Disposable, toDisposable } from '../../Shared/lifecycle';
import { CommandService, CommandType, ICommand, ICommandInfo, ICommandService } from '../command/command.service';
import { ICurrentUniverService } from '../current.service';

// TODO:: an undo redo element may be mergeable to another undo redo element

interface IUndoRedoItem {
    /** URI maps to unitId for UniverSheet / UniverDoc / UniverSlide */
    URI: string;

    undo(): Promise<boolean> | boolean;
    redo(): Promise<boolean> | boolean;
}

export interface IUndoRedoService {
    // This should be by unitId.
    undoRedoStatus$: Observable<IUndoRedoStatus>;

    pushUndoRedo(item: IUndoRedoItem): void;

    pitchTopUndoElement(): IUndoRedoItem | null;
    pitchTopRedoElement(): IUndoRedoItem | null;

    popUndoToRedo(): void;
    popRedoToUndo(): void;

    clearUndoRedo(URI: string): void;
}

export interface IUndoRedoCommandInfos {
    undos: ICommandInfo[];
    redos: ICommandInfo[];
}

export const IUndoRedoService = createIdentifier<IUndoRedoService>('univer.undo-redo.service');

export interface IUndoRedoStatus {
    undos: number;
    redos: number;
}

const STACK_CAPACITY = 20;

/**
 * This UndoRedoService is local.
 */
export class LocalUndoRedoService extends Disposable implements IUndoRedoService {
    readonly undoRedoStatus$: Observable<IUndoRedoStatus>;

    private readonly _undoRedoStatus$ = new BehaviorSubject<{ undos: number; redos: number }>({ undos: 0, redos: 0 });

    private readonly _undoStacks = new Map<string, IUndoRedoItem[]>();

    private readonly _redoStacks = new Map<string, IUndoRedoItem[]>();

    constructor(
        @ICurrentUniverService private readonly _currentUniverSheet: ICurrentUniverService,
        @ICommandService private readonly _commandService: CommandService
    ) {
        super();

        this.undoRedoStatus$ = this._undoRedoStatus$.asObservable();

        this.disposeWithMe(this._commandService.registerCommand(UndoCommand));
        this.disposeWithMe(this._commandService.registerCommand(RedoCommand));
        this.disposeWithMe(toDisposable(() => this._undoRedoStatus$.complete()));
        this.disposeWithMe(toDisposable(this._currentUniverSheet.focused$.subscribe(() => this.updateStatus())));
    }

    pushUndoRedo(item: IUndoRedoItem): void {
        const { URI } = item;

        const redoStack = this.getRedoStack(URI, true);
        const undoStack = this.getUndoStack(URI, true);

        // redo stack should be cleared when pushing an undo
        redoStack.length = 0;

        // TODO: undo element maybe mergeable
        // TODO: undo redo stack should have a maximum capacity, maybe we should get the config from IConfigService?
        undoStack.push(item);
        if (undoStack.length > STACK_CAPACITY) {
            undoStack.splice(0, 1);
        }

        // TODO: update status with URI, the UI doesn't have to update perhaps
        this.updateStatus();
    }

    clearUndoRedo(URI: string): void {
        const redoStack = this.getRedoStack(URI);
        if (redoStack) {
            redoStack.length = 0;
        }

        const undoStack = this.getUndoStack(URI);
        if (undoStack) {
            undoStack.length = 0;
        }

        this.updateStatus();
    }

    pitchTopUndoElement(): IUndoRedoItem | null {
        const undoStack = this.getUndoStackForFocused();
        if (undoStack.length) {
            return undoStack[undoStack.length - 1];
        }

        return null;
    }

    pitchTopRedoElement(): IUndoRedoItem | null {
        const redoStack = this.getRedoStackForFocused();
        if (redoStack.length) {
            return redoStack[redoStack.length - 1];
        }

        return null;
    }

    popUndoToRedo(): void {
        const undoStack = this.getUndoStackForFocused();
        const element = undoStack.pop();
        if (element) {
            const redoStack = this.getRedoStackForFocused();
            redoStack.push(element);
            this.updateStatus();
        }
    }

    popRedoToUndo(): void {
        const redoStack = this.getRedoStackForFocused();
        const element = redoStack.pop();
        if (element) {
            const undoStack = this.getUndoStackForFocused();
            undoStack.push(element);
            this.updateStatus();
        }
    }

    private updateStatus(): void {
        const URI = this._currentUniverSheet.getFocusedUniverInstance()?.getUnitId();
        const undos = (URI && this._undoStacks.get(URI)?.length) || 0;
        const redos = (URI && this._redoStacks.get(URI)?.length) || 0;

        this._undoRedoStatus$.next({
            undos,
            redos,
        });
    }

    private getUndoStack(unitId: string): IUndoRedoItem[] | null;
    private getUndoStack(unitId: string, createAsNeeded: true): IUndoRedoItem[];
    private getUndoStack(unitId: string, createAsNeeded = false): IUndoRedoItem[] | null {
        let stack = this._undoStacks.get(unitId);
        if (!stack && createAsNeeded) {
            stack = [];
            this._undoStacks.set(unitId, stack);
        }

        return stack || null;
    }

    private getRedoStack(unitId: string): IUndoRedoItem[] | null;
    private getRedoStack(unitId: string, createAsNeeded: true): IUndoRedoItem[];
    private getRedoStack(unitId: string, createAsNeeded = false): IUndoRedoItem[] | null {
        let stack = this._redoStacks.get(unitId);
        if (!stack && createAsNeeded) {
            stack = [];
            this._redoStacks.set(unitId, stack);
        }

        return stack || null;
    }

    private getUndoStackForFocused(): IUndoRedoItem[] {
        const URI = this._currentUniverSheet.getFocusedUniverInstance()?.getUnitId();
        if (!URI) {
            throw new Error('No focused univer instance!');
        }

        return this.getUndoStack(URI, true);
    }

    private getRedoStackForFocused(): IUndoRedoItem[] {
        const URI = this._currentUniverSheet.getFocusedUniverInstance()?.getUnitId();
        if (!URI) {
            throw new Error('No focused univer instance!');
        }

        return this.getRedoStack(URI, true);
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
