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
    SetCellBorderCommand,
    SetTextRotationCommand,
    SetTextWrapCommand,
    SetHorizontalTextAlignCommand,
    SetVerticalTextAlignCommand,
} from '@univerjs/base-sheets';
import { ColorPicker, DisplayTypes, IMenuItem, IMenuSelectorItem, MenuItemType, MenuPosition, SelectTypes } from '@univerjs/base-ui';
import { FontItalic, FontWeight, IBorderData, ICommandService, IPermissionService, IUndoRedoService, RedoCommand, UndoCommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RightMenuInput } from '../View';
import {
    BORDER_LINE_CHILDREN,
    BORDER_SIZE_CHILDREN,
    FONT_FAMILY_CHILDREN,
    FONT_SIZE_CHILDREN,
    HORIZONTAL_ALIGN_CHILDREN,
    TEXT_ROTATE_CHILDREN,
    TEXT_WRAP_CHILDREN,
    VERTICAL_ALIGN_CHILDREN,
} from '../View/Toolbar/Const';
import { LineBold, LineColor } from '../View/Common';
import { SHEET_UI_PLUGIN_NAME } from '../Basics/Const/PLUGIN_NAME';

import styles from '../View/Toolbar/index.module.less';

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

// TODO@wzhudev: in the future we will support add rich format value to in-cell texts. Then we would make some changes to how these menu items works.

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
            const disposable = commandService.onCommandExecuted((c) => {
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
            return disposable.dispose;
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

export function FontFamilySelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    // NOTE: we could get more font options from (a) font service, so user can provide their own fonts
    const permissionService = accessor.get(IPermissionService);
    const commandService = accessor.get(ICommandService);
    const selectionManager = accessor.get(ISelectionManager);

    return {
        id: SetFontFamilyCommand.id,
        title: 'font',
        tooltip: 'toolbar.font',
        selectType: SelectTypes.FIX,
        type: MenuItemType.SELECTOR,
        menu: [MenuPosition.TOOLBAR],
        selections: FONT_FAMILY_CHILDREN,
        className: styles.selectLabelString,
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
        value$: new Observable<string>((subscriber) => {
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

export function FontSizeSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    const permissionService = accessor.get(IPermissionService);
    const commandService = accessor.get(ICommandService);
    const selectionManager = accessor.get(ISelectionManager);

    return {
        id: SetFontSizeCommand.id,
        title: 'fontSize',
        tooltip: 'toolbar.fontSize',
        type: MenuItemType.SELECTOR,
        selectType: SelectTypes.INPUT,
        menu: [MenuPosition.TOOLBAR],
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
        value$: new Observable<number>((subscriber) => {
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

            return disposable.dispose;
        }),
    };
}

export function TextColorSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    const commandService = accessor.get(ICommandService);
    const selectionManager = accessor.get(ISelectionManager);

    return {
        id: SetTextColorCommand.id,
        title: 'TextColorIcon',
        icon: 'TextColorIcon',
        tooltip: 'toolbar.textColor.main',
        type: MenuItemType.SELECTOR,
        selectType: SelectTypes.DOUBLEFIX,
        menu: [MenuPosition.TOOLBAR],
        display: DisplayTypes.COLOR,
        className: styles.selectColorPickerParent,
        // FIXME: click this toolbar icon would not trigger color change
        selections: [
            {
                label: 'toolbar.resetColor',
            },
            {
                label: {
                    name: SHEET_UI_PLUGIN_NAME + ColorPicker.name,
                    props: {
                        onClick: (color: string, e: MouseEvent) => {},
                    },
                },
                className: styles.selectColorPicker,
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

export function BackgroundColorSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    const commandService = accessor.get(ICommandService);
    const selectionManager = accessor.get(ISelectionManager);

    return {
        id: SetBackgroundColorCommand.id,
        tooltip: 'toolbar.fillColor.main',
        title: 'TextColorIcon',
        type: MenuItemType.SELECTOR,
        selectType: SelectTypes.DOUBLEFIX,
        menu: [MenuPosition.TOOLBAR],
        display: DisplayTypes.COLOR,
        icon: 'FillColorIcon',
        className: styles.selectColorPickerParent,
        selections: [
            {
                label: 'toolbar.resetColor',
            },
            {
                label: {
                    name: SHEET_UI_PLUGIN_NAME + ColorPicker.name,
                    props: {
                        onClick: (color: string, e: MouseEvent) => {},
                    },
                },
                className: styles.selectColorPicker,
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

export function CellBorderSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    const permissionService = accessor.get(IPermissionService);
    const commandService = accessor.get(ICommandService);
    const selectionManager = accessor.get(ISelectionManager);

    return {
        id: SetCellBorderCommand.id,
        title: 'border',
        display: DisplayTypes.SUFFIX,
        menu: [MenuPosition.TOOLBAR],
        type: MenuItemType.SELECTOR,
        selectType: SelectTypes.DOUBLE,
        selections: [
            ...BORDER_LINE_CHILDREN,
            {
                name: 'borderColor',
                label: {
                    name: SHEET_UI_PLUGIN_NAME + LineColor.name,
                    props: {
                        color: '#000',
                        label: 'borderLine.borderColor',
                    },
                },
                className: styles.selectColorPickerParent,
                children: [
                    {
                        label: {
                            name: SHEET_UI_PLUGIN_NAME + ColorPicker.name,
                            props: {},
                        },
                        className: styles.selectColorPicker,
                        onClick: (...arg) => {
                            arg[0].stopPropagation();
                        },
                    },
                ],
            },
            {
                label: {
                    name: SHEET_UI_PLUGIN_NAME + LineBold.name,
                    props: {
                        img: 0,
                        label: 'borderLine.borderSize',
                    },
                },
                onClick: (...arg) => {},
                className: styles.selectLineBoldParent,
                children: BORDER_SIZE_CHILDREN,
            },
        ],
        value$: new Observable<IBorderData | undefined>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetRangeStyleMutation.id && id !== SetSelectionsOperation.id) {
                    return;
                }

                const range = selectionManager.getCurrentCell();
                const borderData = range?.getBorder();

                subscriber.next(borderData);
            });

            return disposable.dispose;
        }),
    };
}

// Merge cell command is not ready yet.
// export function MergeCellMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
//     return {
//     }
// }

export function HorizontalAlignMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    return {
        id: SetHorizontalTextAlignCommand.id,
        title: 'horizontalAlignMode',
        menu: [MenuPosition.TOOLBAR],
        tooltip: 'toolbar.horizontalAlignMode.main',
        className: styles.selectDoubleString,
        display: DisplayTypes.SUFFIX,
        type: MenuItemType.SELECTOR,
        selectType: SelectTypes.DOUBLE,
        selections: HORIZONTAL_ALIGN_CHILDREN,
    };
}

export function VerticalAlignMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    return {
        id: SetVerticalTextAlignCommand.id,
        title: 'verticalAlignMode',
        tooltip: 'toolbar.verticalAlignMode.main',
        className: styles.selectDoubleString,
        display: DisplayTypes.SUFFIX,
        type: MenuItemType.SELECTOR,
        menu: [MenuPosition.TOOLBAR],
        selectType: SelectTypes.DOUBLE,
        selections: VERTICAL_ALIGN_CHILDREN,
    };
}

export function WrapTextMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    const commandService = accessor.get(ICommandService);
    const selectionManager = accessor.get(ISelectionManager);

    return {
        id: SetTextWrapCommand.id,
        title: 'textWrapMode',
        tooltip: 'toolbar.textWrapMode.main',
        type: MenuItemType.SELECTOR,
        selectType: SelectTypes.DOUBLE,
        menu: [MenuPosition.TOOLBAR],
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
export function TextRotateMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
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
        menu: [MenuPosition.TOOLBAR],
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