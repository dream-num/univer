import { createIdentifier } from '@wendellhu/redi';

export interface IUndoRedoService {
    pushUndoRedo(): void;
}

export const IUndoRedoService = createIdentifier<IUndoRedoService>('univer.undo-redo.service');

/**
 * This UndoRedoService is local.
 */
export class LocalUndoRedoService implements IUndoRedoService {
    pushUndoRedo(): void {}
}

/**
 * This UndoRedoService could be hooked with collaboration service to transform local operations.
 */
export class CollaborativeUndoRedoService implements IUndoRedoService {
    pushUndoRedo(): void {}
}
