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
    DeleteRangeCommand,
    SetWorksheetColWidthCommand,
    SetWorksheetRowHeightCommand,
    RemoveRowCommand,
    RemoveColCommand,
    SetFontFamilyCommand,
    SetFontSizeCommand,
    SetTextColorCommand,
    SetBackgroundColorCommand,
    SetBorderColorCommand,
    SetBorderPositionCommand,
    SetTextRotationCommand,
    SetTextWrapCommand,
    SetHorizontalTextAlignCommand,
    SetVerticalTextAlignCommand,
    ResetTextColorCommand,
    ResetBackgroundColorCommand,
    SetBorderStyleCommand,
    DeleteRangeMoveLeftCommand,
    DeleteRangeMoveUpCommand,
    RemoveSheetCommand,
    SetWorksheetRowHideCommand,
    SetWorksheetRowShowCommand,
} from '@univerjs/base-sheets';
import { ColorPicker, DisplayTypes, IMenuButtonItem, IMenuItem, IMenuSelectorItem, MenuItemType, MenuPosition, SelectTypes, IDisplayMenuItem } from '@univerjs/base-ui';
import { FontItalic, FontWeight, IBorderData, ICommandService, IPermissionService, IUndoRedoService, RedoCommand, UndoCommand } from '@univerjs/core';

import { IAccessor } from '@wendellhu/redi';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RightMenuInput } from '../View';
import {
    BORDER_LINE_CHILDREN,
    FONT_FAMILY_CHILDREN,
    FONT_SIZE_CHILDREN,
    HORIZONTAL_ALIGN_CHILDREN,
    TEXT_ROTATE_CHILDREN,
    TEXT_WRAP_CHILDREN,
    VERTICAL_ALIGN_CHILDREN,
} from '../View/Toolbar/Const';
import { SHEET_UI_PLUGIN_NAME } from '../Basics/Const/PLUGIN_NAME';

import styles from '../View/Toolbar/index.module.less';

export function UndoMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const undoRedoService = accessor.get(IUndoRedoService);

    return {
        id: UndoCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'ForwardIcon',
        title: 'Undo',
        positions: [MenuPosition.TOOLBAR],
        disabled$: undoRedoService.undoRedoStatus$.pipe(map((v) => v.undos <= 0)),
    };
}

export function RedoMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const undoRedoService = accessor.get(IUndoRedoService);

    return {
        id: RedoCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'BackIcon',
        title: 'Redo',
        positions: [MenuPosition.TOOLBAR],
        disabled$: undoRedoService.undoRedoStatus$.pipe(map((v) => v.redos <= 0)),
    };
}

// TODO@wzhudev: in the future we will support add rich format value to in-cell texts. Then we would make some changes to how these menu items works.

export function BoldMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const permissionService = accessor.get(IPermissionService);
    const selectionManager = accessor.get(ISelectionManager);

    return {
        id: SetBoldCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'BoldIcon',
        title: 'Set bold',
        positions: [MenuPosition.TOOLBAR],
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
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetRangeStyleMutation.id && id !== SetSelectionsOperation.id) {
                    return;
                }

                const range = selectionManager.getCurrentCell();
                const isBold = range?.getFontWeight();

                subscriber.next(isBold === FontWeight.BOLD);
            });

            subscriber.next(false);
            return disposable.dispose;
        }),
    };
}

export function ItalicMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const permissionService = accessor.get(IPermissionService);
    const commandService = accessor.get(ICommandService);
    const selectionManager = accessor.get(ISelectionManager);

    return {
        id: SetItalicCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'ItalicIcon',
        title: 'Set italic',
        positions: [MenuPosition.TOOLBAR],
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
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetRangeStyleMutation.id && id !== SetSelectionsOperation.id) {
                    return;
                }

                const range = selectionManager.getCurrentCell();
                const isItalic = range?.getFontStyle();

                subscriber.next(isItalic === FontItalic.ITALIC);
            });

            subscriber.next(false);
            return disposable.dispose;
        }),
    };
}

export function UnderlineMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const permissionService = accessor.get(IPermissionService);
    const commandService = accessor.get(ICommandService);
    const selectionManager = accessor.get(ISelectionManager);

    return {
        id: SetUnderlineCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'UnderLineIcon',
        title: 'Set underline',
        positions: [MenuPosition.TOOLBAR],
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
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetRangeStyleMutation.id && id !== SetSelectionsOperation.id) {
                    return;
                }

                const range = selectionManager.getCurrentCell();
                const isUnderline = range?.getUnderline();

                subscriber.next(!!(isUnderline && isUnderline.s));
            });

            subscriber.next(false);
            return disposable.dispose;
        }),
    };
}

export function StrikeThroughMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const permissionService = accessor.get(IPermissionService);
    const commandService = accessor.get(ICommandService);
    const selectionManager = accessor.get(ISelectionManager);

    return {
        id: SetStrikeThroughCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'DeleteLineIcon',
        title: 'Set strike through',
        positions: [MenuPosition.TOOLBAR],
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
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetRangeStyleMutation.id && id !== SetSelectionsOperation.id) {
                    return;
                }

                const range = selectionManager.getCurrentCell();
                const st = range?.getStrikeThrough();

                subscriber.next(!!(st && st.s));
            });

            subscriber.next(false);
            return disposable.dispose;
        }),
    };
}

export function FontFamilySelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    // NOTE: we could get more font options from (a) font service, so user can provide their own fonts
    const permissionService = accessor.get(IPermissionService);
    const commandService = accessor.get(ICommandService);
    const selectionManager = accessor.get(ISelectionManager);

    return {
        id: SetFontFamilyCommand.id,
        title: 'toolbar.font',
        tooltip: 'toolbar.font',
        selectType: SelectTypes.NEO,
        type: MenuItemType.SELECTOR,
        display: DisplayTypes.FONT,
        positions: [MenuPosition.TOOLBAR],
        selections: FONT_FAMILY_CHILDREN,
        className: styles.selectLabelString,
        disabled$: new Observable((subscriber) => {
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
        value$: new Observable((subscriber) => {
            const defaultValue = FONT_FAMILY_CHILDREN[0].value;

            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetRangeStyleMutation.id && id !== SetSelectionsOperation.id) {
                    return;
                }

                const range = selectionManager.getCurrentCell();
                const ff = range?.getFontFamily();

                subscriber.next(ff ?? defaultValue);
            });

            subscriber.next(defaultValue);
            return disposable.dispose;
        }),
    };
}

export function FontSizeSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<number> {
    const permissionService = accessor.get(IPermissionService);
    const commandService = accessor.get(ICommandService);
    const selectionManager = accessor.get(ISelectionManager);

    return {
        id: SetFontSizeCommand.id,
        title: 'fontSize',
        tooltip: 'toolbar.fontSize',
        type: MenuItemType.SELECTOR,
        selectType: SelectTypes.NEO,
        display: DisplayTypes.INPUT,
        positions: [MenuPosition.TOOLBAR],
        selections: FONT_SIZE_CHILDREN,
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
        value$: new Observable((subscriber) => {
            const DEFAULT_SIZE = 14;
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetRangeStyleMutation.id && id !== SetSelectionsOperation.id) {
                    return;
                }

                const range = selectionManager.getCurrentCell();
                const fs = range?.getFontSize() ?? DEFAULT_SIZE;

                subscriber.next(fs);
            });

            subscriber.next(DEFAULT_SIZE);

            return disposable.dispose;
        }),
    };
}

export function ResetTextColorMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: ResetTextColorCommand.id,
        type: MenuItemType.BUTTON,
        title: 'toolbar.resetColor',
        positions: [MenuPosition.TOOLBAR],
        parentId: SetTextColorCommand.id,
    };
}

export function TextColorSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const commandService = accessor.get(ICommandService);
    const selectionManager = accessor.get(ISelectionManager);

    return {
        id: SetTextColorCommand.id,
        title: 'toolbar.textColor.main',
        icon: 'TextColorIcon',
        tooltip: 'toolbar.textColor.main',
        type: MenuItemType.SELECTOR,
        selectType: SelectTypes.NEO,
        positions: [MenuPosition.TOOLBAR],
        display: DisplayTypes.COLOR,
        className: styles.selectColorPickerParent,
        selections: [
            {
                id: SHEET_UI_PLUGIN_NAME + ColorPicker.name,
            },
        ],
        value$: new Observable<string>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetRangeStyleMutation.id && id !== SetSelectionsOperation.id) {
                    return;
                }

                const range = selectionManager.getCurrentCell();
                const color = range?.getFontColor();

                subscriber.next(color ?? '');
            });

            return disposable.dispose;
        }),
    };
}

export function ResetBackgroundColorMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: ResetBackgroundColorCommand.id,
        type: MenuItemType.BUTTON,
        title: 'toolbar.resetColor',
        positions: [MenuPosition.TOOLBAR],
        parentId: SetBackgroundColorCommand.id,
    };
}

export function BackgroundColorSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const commandService = accessor.get(ICommandService);
    const selectionManager = accessor.get(ISelectionManager);

    return {
        id: SetBackgroundColorCommand.id,
        tooltip: 'toolbar.fillColor.main',
        title: 'TextColorIcon',
        type: MenuItemType.SELECTOR,
        selectType: SelectTypes.NEO,
        positions: [MenuPosition.TOOLBAR],
        display: DisplayTypes.COLOR,
        icon: 'FillColorIcon',
        className: styles.selectColorPickerParent,
        selections: [
            {
                id: SHEET_UI_PLUGIN_NAME + ColorPicker.name,
            },
        ],
        value$: new Observable<string>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetRangeStyleMutation.id && id !== SetSelectionsOperation.id) {
                    return;
                }

                const range = selectionManager.getCurrentCell();
                const color = range?.getBackground();

                subscriber.next(color ?? '');
            });

            return disposable.dispose;
        }),
    };
}

export function SetBorderColorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<IBorderData | undefined> {
    return {
        id: SetBorderColorCommand.id,
        title: 'border',
        positions: [MenuPosition.TOOLBAR],
        parentId: SetBorderPositionCommand.id,
        display: DisplayTypes.COLOR,
        selectType: SelectTypes.NEO,
        type: MenuItemType.SELECTOR,
        selections: [
            {
                id: SHEET_UI_PLUGIN_NAME + ColorPicker.name,
            },
        ],
    };
}

export function SetBorderStyleMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<IBorderData | undefined> {
    return {
        id: SetBorderStyleCommand.id,
        title: 'borderStyle',
        positions: [MenuPosition.TOOLBAR],
        parentId: SetBorderPositionCommand.id,
        display: DisplayTypes.COLOR,
        selectType: SelectTypes.NEO,
        type: MenuItemType.SELECTOR,
        selections: [],
    };
}

export function CellBorderSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const permissionService = accessor.get(IPermissionService);
    const commandService = accessor.get(ICommandService);
    const selectionManager = accessor.get(ISelectionManager);

    return {
        id: SetBorderPositionCommand.id,
        title: 'border',
        display: DisplayTypes.ICON,
        positions: [MenuPosition.TOOLBAR],
        type: MenuItemType.DROPDOWN,
        selectType: SelectTypes.NEO,
        selections: [
            ...BORDER_LINE_CHILDREN,
            // TODO: add a set line bold menu item here
            // {
            //     label: {
            //         name: SHEET_UI_PLUGIN_NAME + LineBold.name,
            //         props: {
            //             img: 0,
            //             label: 'borderLine.borderSize',
            //         },
            //     },
            //     onClick: (...arg) => {},
            //     className: styles.selectLineBoldParent,
            //     children: BORDER_SIZE_CHILDREN,
            // },
        ],
        value$: new Observable<string>((subscriber) => {
            subscriber.next('border');
        }),
    };
}

// Merge cell command is not ready yet.
// export function MergeCellMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
//     return {
//     }
// }

export function HorizontalAlignMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<number> {
    return {
        id: SetHorizontalTextAlignCommand.id,
        title: 'horizontalAlignMode',
        positions: [MenuPosition.TOOLBAR],
        tooltip: 'toolbar.horizontalAlignMode.main',
        className: styles.selectDoubleString,
        display: DisplayTypes.SUFFIX,
        type: MenuItemType.SELECTOR,
        selectType: SelectTypes.DOUBLE,
        selections: HORIZONTAL_ALIGN_CHILDREN,
    };
}

export function VerticalAlignMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<number> {
    return {
        id: SetVerticalTextAlignCommand.id,
        title: 'verticalAlignMode',
        tooltip: 'toolbar.verticalAlignMode.main',
        className: styles.selectDoubleString,
        display: DisplayTypes.SUFFIX,
        type: MenuItemType.SELECTOR,
        positions: [MenuPosition.TOOLBAR],
        selectType: SelectTypes.DOUBLE,
        selections: VERTICAL_ALIGN_CHILDREN,
    };
}

export function WrapTextMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<number> {
    const commandService = accessor.get(ICommandService);
    const selectionManager = accessor.get(ISelectionManager);

    return {
        id: SetTextWrapCommand.id,
        title: 'textWrapMode',
        tooltip: 'toolbar.textWrapMode.main',
        type: MenuItemType.SELECTOR,
        selectType: SelectTypes.DOUBLE,
        positions: [MenuPosition.TOOLBAR],
        selections: TEXT_WRAP_CHILDREN,
        display: DisplayTypes.SUFFIX,
        value$: new Observable((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetRangeStyleMutation.id && id !== SetSelectionsOperation.id) {
                    return;
                }

                const range = selectionManager.getCurrentCell();
                const ws = range?.getWrapStrategy();

                subscriber.next(ws);
            });

            return () => disposable.dispose();
        }),
    };
}

// FIXME: set rotation would cause a bug
export function TextRotateMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<number> {
    const permissionService = accessor.get(IPermissionService);
    const commandService = accessor.get(ICommandService);
    const selectionManager = accessor.get(ISelectionManager);

    return {
        id: SetTextRotationCommand.id,
        title: 'textRotateMode',
        tooltip: 'toolbar.textRotateMode.main',
        display: DisplayTypes.SUFFIX,
        type: MenuItemType.SELECTOR,
        selectType: SelectTypes.DOUBLE,
        positions: [MenuPosition.TOOLBAR],
        value$: new Observable<number>((subscriber) => {
            commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetRangeStyleMutation.id && id !== SetSelectionsOperation.id) {
                    return;
                }

                const range = selectionManager.getCurrentCell();
                const tr = range?.getTextRotation();

                subscriber.next(tr);
            });
        }),
        selections: TEXT_ROTATE_CHILDREN,
    };
}

export function NumberFormatMenuItemFactory(accessor: IAccessor): IMenuItem {}

// NOTE: these menu icons should be registered by plugins not defined here.
// export function SearchReplaceMenuItemFactory(accessor: IAccessor): IMenuItem {}
// export function ImportMenuItemFactory(accessor: IAccessor): IMenuItem {}
// export function ImageMenuItemFactory(accessor: IAccessor): IMenuItem {}

// right menu in main container
export function ClearSelectionMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: ClearSelectionContentCommand.id,
        title: 'rightClick.clearContent',
        positions: [MenuPosition.CONTEXT_MENU],
    };
}

export function InsertRowMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: InsertRowCommand.id,
        positions: [MenuPosition.CONTEXT_MENU],
        title: 'rightClick.insertRow',
    };
}

export function InsertColMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: InsertColCommand.id,
        positions: [MenuPosition.CONTEXT_MENU],
        title: 'rightClick.insertColumn',
    };
}

export function RemoveRowMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: RemoveRowCommand.id,
        positions: [MenuPosition.CONTEXT_MENU],
        title: 'rightClick.deleteSelectedRow',
    };
}

export function HideRowMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: SetWorksheetRowHideCommand.id,
        menu: [MenuPosition.CONTEXT_MENU],
        title: 'rightClick.hideSelectedRow',
    };
}

export function ShowRowMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: SetWorksheetRowShowCommand.id,
        menu: [MenuPosition.CONTEXT_MENU],
        title: 'rightClick.showHideRow',
    };
}

export function RemoveColMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: RemoveColCommand.id,
        positions: [MenuPosition.CONTEXT_MENU],
        title: 'rightClick.deleteSelectedColumn',
    };
}

export function SetRowHeightMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: SetWorksheetRowHeightCommand.id,
        positions: [MenuPosition.CONTEXT_MENU],
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
        positions: [MenuPosition.CONTEXT_MENU],
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

export function DeleteRangeMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: DeleteRangeCommand.id,
        menu: [MenuPosition.CONTEXT_MENU],
        title: 'rightClick.deleteCell',
        subMenus: [DeleteRangeMoveLeftCommand.id, DeleteRangeMoveUpCommand.id],
    };
}

export function DeleteRangeMoveLeftMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: DeleteRangeMoveLeftCommand.id,
        menu: [MenuPosition.CONTEXT_MENU],
        title: 'rightClick.moveLeft',
        parentId: DeleteRangeCommand.id,
    };
}

export function DeleteRangeMoveUpMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: DeleteRangeMoveUpCommand.id,
        menu: [MenuPosition.CONTEXT_MENU],
        title: 'rightClick.moveUp',
        parentId: DeleteRangeCommand.id,
    };
}

// right menu in main sheet bar
export function DeleteSheetMenuItemFactory(accessor: IAccessor): IMenuItem {
    return {
        id: RemoveSheetCommand.id,
        menu: [MenuPosition.SHEET_BAR],
        title: 'sheetConfig.delete',
    };
}

export function buildMenuTree(items: IMenuItem[], parentId?: string): IDisplayMenuItem[] {
    const tree: IDisplayMenuItem[] = [];

    for (const item of items) {
        if (item.parentId === parentId) {
            const treeItem: IDisplayMenuItem = {
                ...item,
                subMenuItems: buildMenuTree(items, item.id),
            };
            tree.push(treeItem);
        }
    }

    return tree;
}
