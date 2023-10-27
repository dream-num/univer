import { BreakLineCommand, DeleteLeftCommand } from '@univerjs/base-docs';
import { IMenuButtonItem, MenuGroup, MenuItemType, MenuPosition } from '@univerjs/base-ui';
import { IUndoRedoService, RedoCommand, UndoCommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { map } from 'rxjs/operators';

export function UndoMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const undoRedoService = accessor.get(IUndoRedoService);

    return {
        id: UndoCommand.id,
        group: MenuGroup.TOOLBAR_HISTORY,
        type: MenuItemType.BUTTON,
        icon: 'ForwardIcon',
        title: 'Undo',
        tooltip: 'toolbar.undo',
        positions: [MenuPosition.TOOLBAR_START],
        disabled$: undoRedoService.undoRedoStatus$.pipe(map((v) => v.undos <= 0)),
    };
}

export function RedoMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const undoRedoService = accessor.get(IUndoRedoService);

    return {
        id: RedoCommand.id,
        group: MenuGroup.TOOLBAR_HISTORY,
        type: MenuItemType.BUTTON,
        icon: 'BackIcon',
        title: 'Redo',
        tooltip: 'toolbar.redo',
        positions: [MenuPosition.TOOLBAR_START],
        disabled$: undoRedoService.undoRedoStatus$.pipe(map((v) => v.redos <= 0)),
    };
}

// TODO@Dushusir: use for test, change id later
export function BoldMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: DeleteLeftCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'BoldIcon',
        title: 'Set bold',
        tooltip: 'toolbar.bold',
        positions: [MenuPosition.TOOLBAR_START],
    };
}

export function ItalicMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: BreakLineCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'ItalicIcon',
        title: 'Set italic',
        tooltip: 'toolbar.italic',
        positions: [MenuPosition.TOOLBAR_START],
    };
}
