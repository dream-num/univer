import { IMenuItem, MenuPosition } from '@univerjs/base-ui';
import { IUndoRedoService, RedoCommand, UndoCommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { map } from 'rxjs/operators';

export function UndoMenuItemFactory(accessor: IAccessor): IMenuItem {
    const undoRedoService = accessor.get(IUndoRedoService);

    return {
        id: UndoCommand.id,
        icon: 'ForwardIcon',
        title: 'Undo',
        menu: [MenuPosition.TOOLBAR, MenuPosition.CONTEXT_MENU],
        disabled$: undoRedoService.undoRedoStatus$.pipe(map((v) => v.undos <= 0)),
    };
}

export function RedoMenuItemFactory(accessor: IAccessor): IMenuItem {
    const undoRedoService = accessor.get(IUndoRedoService);

    return {
        id: RedoCommand.id,
        icon: 'BackIcon',
        title: 'Redo',
        menu: [MenuPosition.TOOLBAR],
        disabled$: undoRedoService.undoRedoStatus$.pipe(map((v) => v.redos <= 0)),
    }
}

// export function FontSelectorMenuItemFactory(accessor: IAccessor): IMenuItem {
//
// }
