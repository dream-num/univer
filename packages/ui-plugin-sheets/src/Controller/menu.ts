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
} from '@univerjs/base-sheets';
import { ColorPicker, DisplayTypes, IMenuItem, IMenuSelectorItem, MenuItemType, MenuPosition, SelectTypes } from '@univerjs/base-ui';
import { FontItalic, FontWeight, ICommandService, IPermissionService, IUndoRedoService, RedoCommand, UndoCommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RightMenuInput } from '../View';
import { BORDER_LINE_CHILDREN, BORDER_SIZE_CHILDREN, FONT_FAMILY_CHILDREN, FONT_SIZE_CHILDREN } from '../View/Toolbar/Const';
import { ColorSelect, LineBold, LineColor } from '../View/Common';
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
            commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetRangeStyleMutation.id && id !== SetSelectionsOperation.id) {
                    return;
                }

                const range = selectionManager.getCurrentCell();
                const ff = range?.getFontFamily();

                subscriber.next(ff);
            });

            subscriber.next(FONT_FAMILY_CHILDREN[0].value);
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
            commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetRangeStyleMutation.id && id !== SetSelectionsOperation.id) {
                    return;
                }

                const range = selectionManager.getCurrentCell();
                const fs = range?.getFontSize();

                subscriber.next(fs);
            });
        }),
    };
}

export function FontColorSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    return {
        id: SetTextColorCommand.id,
        title: 'textColor',
        type: MenuItemType.SELECTOR,
        selectType: SelectTypes.DOUBLEFIX,
        menu: [MenuPosition.TOOLBAR],
        label: {
            name: SHEET_UI_PLUGIN_NAME + ColorSelect.name,
            props: {
                getComponent: (ref: ColorSelect) => {},
                color: '#000',
                label: {
                    name: 'TextColorIcon',
                },
            },
        },
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
    };
}

export function BackgroundColorSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    return {
        id: SetBackgroundColorCommand.id,
        title: 'fillColor',
        type: MenuItemType.SELECTOR,
        selectType: SelectTypes.DOUBLEFIX,
        menu: [MenuPosition.TOOLBAR],
        label: {
            name: SHEET_UI_PLUGIN_NAME + ColorSelect.name,
            props: {
                getComponent: (ref: ColorSelect) => {},
                color: '#fff',
                label: {
                    name: 'FillColorIcon',
                },
            },
        },
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
    };
}

export function CellBorderSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    return {
        id: SetCellBorderCommand.id,
        title: 'border',
        display: DisplayTypes.SUFFIX,
        menu: [MenuPosition.TOOLBAR],
        type: MenuItemType.SELECTOR,
        selectType: SelectTypes.DOUBLEFIX,
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
    };
}

// this._toolList = [
//     {
//         type: 3,
//         display: 1,
//         show: this._config.border,
//         tooltip: 'toolbar.border.main',
//         className: styles.selectDoubleString,
//         onClick: (value: string) => {
//             if (value) {
//                 this._borderInfo.type = value as BorderType;
//             }
//             this.hideTooltip();
//             this.setBorder();
//         },
//         name: 'border',
//     },
//     {
//         type: 5,
//         tooltip: 'toolbar.mergeCell.main',
//         label: {
//             name: 'MergeIcon',
//         },
//         show: this._config.mergeCell,
//         onClick: (value: string) => {
//             this.setMerge(value ?? 'all');
//             this.hideTooltip();
//         },
//         name: 'mergeCell',
//         children: MERGE_CHILDREN,
//     },
//     {
//         type: 3,
//         tooltip: 'toolbar.horizontalAlignMode.main',
//         className: styles.selectDoubleString,
//         display: 1,
//         name: 'horizontalAlignMode',
//         show: this._config.horizontalAlignMode,
//         onClick: (value: HorizontalAlign) => {
//             this.setHorizontalAlignment(value);
//             this.hideTooltip();
//         },
//         children: HORIZONTAL_ALIGN_CHILDREN,
//     },
//     {
//         type: 3,
//         tooltip: 'toolbar.verticalAlignMode.main',
//         className: styles.selectDoubleString,
//         display: 1,
//         name: 'verticalAlignMode',
//         show: this._config.verticalAlignMode,
//         onClick: (value: VerticalAlign) => {
//             this.setVerticalAlignment(value);
//             this.hideTooltip();
//         },
//         children: VERTICAL_ALIGN_CHILDREN,
//     },
//     {
//         type: 3,
//         className: styles.selectDoubleString,
//         tooltip: 'toolbar.textWrapMode.main',
//         display: 1,
//         name: 'textWrapMode',
//         show: this._config.textWrapMode,
//         onClick: (value: WrapStrategy) => {
//             this.setWrapStrategy(value);
//             this.hideTooltip();
//         },
//         children: TEXT_WRAP_CHILDREN,
//     },
//     {
//         type: 3,
//         className: styles.selectDoubleString,
//         name: 'textRotateMode',
//         tooltip: 'toolbar.textRotateMode.main',
//         display: 1,
//         show: this._config.textRotateMode,
//         onClick: (value: number | string) => {
//             this.setTextRotation(value);
//             this.hideTooltip();
//         },
//         children: TEXT_ROTATE_CHILDREN,
//     },
// ];

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
