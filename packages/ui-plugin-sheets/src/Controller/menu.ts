import {
    ClearSelectionContentCommand,
    InsertColCommand,
    InsertRowCommand,
    SetBoldCommand,
    SetItalicCommand,
    SetStrikeThroughCommand,
    SetUnderlineCommand,
    RemoveColCommand,
    RemoveRowCommand
} from '@univerjs/base-sheets';
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
        menu: [MenuPosition.TOOLBAR],
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
    };
}

export function BoldMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: SetBoldCommand.id,
        icon: 'BoldIcon',
        title: 'Set bold',
        menu: [MenuPosition.TOOLBAR],
    };
}

export function ItalicMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: SetItalicCommand.id,
        icon: 'ItalicIcon',
        title: 'Set italic',
        menu: [MenuPosition.TOOLBAR],
    };
}

export function UnderlineMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: SetUnderlineCommand.id,
        icon: 'UnderLineIcon',
        title: 'Set underline',
        menu: [MenuPosition.TOOLBAR],
    };
}

export function StrikeThroughMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: SetStrikeThroughCommand.id,
        icon: 'DeleteLineIcon',
        title: 'Set strike through',
        menu: [MenuPosition.TOOLBAR],
    };
}

export function FontFamilySelectorMenuItemFactory(accessor: IAccessor): IMenuItem {}

export function FontSizeSelectorMenuItemFactory(accessor: IAccessor): IMenuItem {}

export function FontColorSelectorMenuItemFactory(accessor: IAccessor): IMenuItem {}

export function BackgroundColorSelectorMenuItemFactory(accessor: IAccessor): IMenuItem {}

export function CellBorderSelectorMenuItemFactory(accessor: IAccessor): IMenuItem {}

export function MergeCellMenuItemFactory(accessor: IAccessor): IMenuItem {}

export function HorizontalAlignMenuItemFactory(accessor: IAccessor): IMenuItem {}

export function VerticalAlignMenuItemFactory(accessor: IAccessor): IMenuItem {}

export function WrapTextMenuItemFactory(accessor: IAccessor): IMenuItem {}

export function TextRotateMenuItemFactory(accessor: IAccessor): IMenuItem {}

export function NumberFormatMenuItemFactory(accessor: IAccessor): IMenuItem {}

// NOTE: these menu icons should be registered by plugins not defined here.
// export function SearchReplaceMenuItemFactory(accessor: IAccessor): IMenuItem {}
// export function ImportMenuItemFactory(accessor: IAccessor): IMenuItem {}
// export function ImageMenuItemFactory(accessor: IAccessor): IMenuItem {}

export function ClearSelectionMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: ClearSelectionContentCommand.id,
        title: 'rightClick.clearContent',
        menu: [MenuPosition.CONTEXT_MENU],
    };
}

export function InsertRowMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: InsertRowCommand.id,
        menu: [MenuPosition.CONTEXT_MENU],
        title: 'rightClick.insertRow',
    };
}

export function InsertColMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: InsertColCommand.id,
        menu: [MenuPosition.CONTEXT_MENU],
        title: 'rightClick.insertColumn',
    };
}

export function RemoveRowMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: RemoveRowCommand.id,
        menu: [MenuPosition.CONTEXT_MENU],
        title: 'rightClick.deleteSelectedRow',
    };
}

export function RemoveColMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: RemoveColCommand.id,
        menu: [MenuPosition.CONTEXT_MENU],
        title: 'rightClick.deleteSelectedColumn',
    };
}
