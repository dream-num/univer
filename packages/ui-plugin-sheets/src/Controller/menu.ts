import {
    ClearSelectionContentCommand,
    ISelectionManager,
    InsertColCommand,
    InsertRowCommand,
    SetBoldCommand,
    SetItalicCommand,
    SetSelectionsOperation,
    SetStrikeThroughCommand,
    SetUnderlineCommand,
    SetRangeStyleMutation,
    RemoveColCommand,
    RemoveRowCommand,
    SetWorksheetRowHeightCommand,
    SetWorksheetColWidthCommand,
    DeleteRangeCommand,
} from '@univerjs/base-sheets';
import { IMenuItem, MenuPosition } from '@univerjs/base-ui';
import { FontItalic, FontWeight, ICommandService, IPermissionService, IUndoRedoService, RedoCommand, UndoCommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RightMenuInput } from '../View/RightMenu/RightMenuInput';

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
    const commandService = accessor.get(ICommandService);
    const permissionService = accessor.get(IPermissionService);
    const selectionManager = accessor.get(ISelectionManager);

    return {
        id: SetBoldCommand.id,
        icon: 'BoldIcon',
        title: 'Set bold',
        menu: [MenuPosition.TOOLBAR],
        disabled$: new Observable<boolean>((subscriber) => {
            let editable = false;
            function update() {
                subscriber.next(!editable);
            }

            update();

            // it can hook in other business logic via permissionService and sheet business logic
            const permission$ = permissionService.editable$.subscribe((e) => {
                editable = e;
                update();
            });

            return () => {
                permission$.unsubscribe();
            };
        }),
        activated$: new Observable<boolean>((subscriber) => {
            commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetRangeStyleMutation.id && id !== SetSelectionsOperation.id) {
                    return;
                }

                // FIXME: range is undefined when moving selection with cursor
                const range = selectionManager.getCurrentCell();
                const isBold = range?.getFontWeight();

                subscriber.next(isBold === FontWeight.BOLD);
            });
            subscriber.next(false);
        }),
    };
}

export function ItalicMenuItemFactory(accessor: IAccessor): IMenuItem {
    const permissionService = accessor.get(IPermissionService);
    const commandService = accessor.get(ICommandService);
    const selectionManager = accessor.get(ISelectionManager);

    return {
        id: SetItalicCommand.id,
        icon: 'ItalicIcon',
        title: 'Set italic',
        menu: [MenuPosition.TOOLBAR],
        disabled$: new Observable<boolean>((subscriber) => {
            let editable = false;
            function update() {
                subscriber.next(!editable);
            }

            update();

            const permission$ = permissionService.editable$.subscribe((e) => {
                editable = e;
                update();
            });

            return () => {
                permission$.unsubscribe();
            };
        }),
        activated$: new Observable<boolean>((subscriber) => {
            commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetRangeStyleMutation.id && id !== SetSelectionsOperation.id) {
                    return;
                }

                const range = selectionManager.getCurrentCell();
                const isItalic = range?.getFontStyle();

                subscriber.next(isItalic === FontItalic.ITALIC);
            });
            subscriber.next(false);
        }),
    };
}

export function UnderlineMenuItemFactory(accessor: IAccessor): IMenuItem {
    const permissionService = accessor.get(IPermissionService);
    const commandService = accessor.get(ICommandService);
    const selectionManager = accessor.get(ISelectionManager);

    return {
        id: SetUnderlineCommand.id,
        icon: 'UnderLineIcon',
        title: 'Set underline',
        menu: [MenuPosition.TOOLBAR],
        disabled$: new Observable<boolean>((subscriber) => {
            let editable = false;
            function update() {
                subscriber.next(!editable);
            }

            update();

            const permission$ = permissionService.editable$.subscribe((e) => {
                editable = e;
                update();
            });

            return () => {
                permission$.unsubscribe();
            };
        }),
        activated$: new Observable<boolean>((subscriber) => {
            commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetRangeStyleMutation.id && id !== SetSelectionsOperation.id) {
                    return;
                }

                const range = selectionManager.getCurrentCell();
                const isUnderline = range?.getUnderline();

                subscriber.next(!!(isUnderline && isUnderline.s));
            });
            subscriber.next(false);
        }),
    };
}

export function StrikeThroughMenuItemFactory(accessor: IAccessor): IMenuItem {
    const permissionService = accessor.get(IPermissionService);
    const commandService = accessor.get(ICommandService);
    const selectionManager = accessor.get(ISelectionManager);

    return {
        id: SetStrikeThroughCommand.id,
        icon: 'DeleteLineIcon',
        title: 'Set strike through',
        menu: [MenuPosition.TOOLBAR],
        disabled$: new Observable<boolean>((subscriber) => {
            let editable = false;
            function update() {
                subscriber.next(!editable);
            }

            update();

            const permission$ = permissionService.editable$.subscribe((e) => {
                editable = e;
                update();
            });

            return () => {
                permission$.unsubscribe();
            };
        }),
        activated$: new Observable<boolean>((subscriber) => {
            commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetRangeStyleMutation.id && id !== SetSelectionsOperation.id) {
                    return;
                }

                const range = selectionManager.getCurrentCell();
                const st = range?.getStrikeThrough();

                subscriber.next(!!(st && st.s));
            });
            subscriber.next(false);
        }),
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

export function SetRowHeightMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: SetWorksheetRowHeightCommand.id,
        menu: [MenuPosition.CONTEXT_MENU],
        title: 'rightClick.rowHeight',
        label: {
            name: RightMenuInput.name,
            props: {
                prefix: 'rightClick.rowHeight',
                suffix: 'px',
            },
        },
    };
}

export function SetColWidthMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: SetWorksheetColWidthCommand.id,
        menu: [MenuPosition.CONTEXT_MENU],
        title: 'rightClick.columnWidth',
        label: {
            name: RightMenuInput.name,
            props: {
                prefix: 'rightClick.columnWidth',
                suffix: 'px',
            },
        },
    };
}

// TODO@Dushusir use real command id
export function DeleteRangeMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: `${DeleteRangeCommand.id}.parent`,
        menu: [MenuPosition.CONTEXT_MENU],
        title: 'rightClick.deleteCell',
        subMenus: [DeleteRangeCommand.id, `${DeleteRangeCommand.id}up`],
    };
}
export function DeleteRangeMoveLeftMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: DeleteRangeCommand.id,
        menu: [MenuPosition.CONTEXT_MENU],
        title: 'rightClick.moveLeft',
        parentId: `${DeleteRangeCommand.id}.parent`,
    };
}

export function DeleteRangeMoveUpMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: `${DeleteRangeCommand.id}up`,
        menu: [MenuPosition.CONTEXT_MENU],
        title: 'rightClick.moveUp',
        parentId: `${DeleteRangeCommand.id}.parent`,
    };
}
