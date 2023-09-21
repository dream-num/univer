import {
    ClearSelectionContentCommand,
    CopySheetCommand,
    DeleteRangeMoveLeftCommand,
    DeleteRangeMoveUpCommand,
    InsertColAfterCommand,
    InsertRowAfterCommand,
    RemoveColCommand,
    RemoveRowCommand,
    RemoveSheetCommand,
    ResetBackgroundColorCommand,
    ResetTextColorCommand,
    SelectionManagerService,
    SetBackgroundColorCommand,
    SetBoldCommand,
    SetFontFamilyCommand,
    SetFontSizeCommand,
    SetHorizontalTextAlignCommand,
    SetItalicCommand,
    SetRangeStyleMutation,
    SetSelectionsOperation,
    SetStrikeThroughCommand,
    SetTabColorCommand,
    SetTextColorCommand,
    SetTextRotationCommand,
    SetTextWrapCommand,
    SetUnderlineCommand,
    SetVerticalTextAlignCommand,
    SetWorksheetColWidthCommand,
    SetWorksheetHideCommand,
    SetWorksheetRowHeightCommand,
    SetWorksheetRowHideCommand,
    SetWorksheetRowShowCommand,
} from '@univerjs/base-sheets';
import {
    ColorPicker,
    CopyCommand,
    DisplayTypes,
    IMenuButtonItem,
    IMenuSelectorItem,
    MenuItemType,
    MenuPosition,
    SelectTypes,
} from '@univerjs/base-ui';
import {
    FontItalic,
    FontWeight,
    HorizontalAlign,
    ICommandService,
    ICurrentUniverService,
    IPermissionService,
    IUndoRedoService,
    RedoCommand,
    UndoCommand,
    VerticalAlign,
    WrapStrategy,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SHEET_UI_PLUGIN_NAME } from '../Basics/Const/PLUGIN_NAME';
import { RenameSheetCommand } from '../commands/rename.command';
import { ShowMenuListCommand } from '../commands/unhide.command';

export const CONTEXT_MENU_INPUT_LABEL = 'CONTEXT_MENU_INPUT';

export { SetBorderColorMenuItemFactory, SetBorderStyleMenuItemFactory } from './menu/border.menu';

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
    const currentUniverService = accessor.get(ICurrentUniverService);
    const selectionManagerService = accessor.get(SelectionManagerService);

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

                const cellRange = selectionManagerService.getLast()?.cellRange;
                const worksheet = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet();
                let isBold = FontWeight.NORMAL;
                if (cellRange != null) {
                    const range = worksheet.getRange(cellRange.row, cellRange.column);
                    isBold = range?.getFontWeight();
                }

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
    const currentUniverService = accessor.get(ICurrentUniverService);
    const selectionManagerService = accessor.get(SelectionManagerService);

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

                const cellRange = selectionManagerService.getLast()?.cellRange;
                const worksheet = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet();
                let isItalic = FontItalic.NORMAL;
                if (cellRange != null) {
                    const range = worksheet.getRange(cellRange.row, cellRange.column);
                    isItalic = range?.getFontStyle();
                }

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
    const currentUniverService = accessor.get(ICurrentUniverService);
    const selectionManagerService = accessor.get(SelectionManagerService);

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

                const cellRange = selectionManagerService.getLast()?.cellRange;
                const worksheet = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet();
                let isUnderline;
                if (cellRange != null) {
                    const range = worksheet.getRange(cellRange.row, cellRange.column);
                    isUnderline = range?.getUnderline();
                }

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
    const currentUniverService = accessor.get(ICurrentUniverService);
    const selectionManagerService = accessor.get(SelectionManagerService);

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

                const cellRange = selectionManagerService.getLast()?.cellRange;
                const worksheet = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet();
                let st;
                if (cellRange != null) {
                    const range = worksheet.getRange(cellRange.row, cellRange.column);
                    st = range?.getStrikeThrough();
                }

                subscriber.next(!!(st && st.s));
            });

            subscriber.next(false);
            return disposable.dispose;
        }),
    };
}

export const FONT_SIZE_CHILDREN = [
    {
        label: '9',
        value: 9,
    },
    {
        label: '10',
        value: 10,
    },
    {
        label: '11',
        value: 11,
    },
    {
        label: '12',
        value: 12,
    },
    {
        label: '14',
        value: 14,
    },
    {
        label: '16',
        value: 16,
    },
    {
        label: '18',
        value: 18,
    },
    {
        label: '20',
        value: 20,
    },

    {
        label: '22',
        value: 22,
    },
    {
        label: '24',
        value: 24,
    },
    {
        label: '26',
        value: 26,
    },
    {
        label: '28',
        value: 28,
    },
    {
        label: '36',
        value: 36,
    },
    {
        label: '48',
        value: 48,
    },
    {
        label: '72',
        value: 72,
    },
];

export const FONT_FAMILY_CHILDREN = [
    {
        label: 'fontFamily.TimesNewRoman',
        style: { 'font-family': 'Times New Roman' },
        value: 'Times New Roman',
        selected: true,
    },
    {
        label: 'fontFamily.Arial',
        style: { 'font-family': 'Arial' },
        value: 'Arial',
    },
    {
        label: 'fontFamily.Tahoma',
        style: { 'font-family': 'Tahoma' },
        value: 'Tahoma',
    },
    {
        label: 'fontFamily.Verdana',
        style: { 'font-family': 'Verdana' },
        value: 'Verdana',
    },
    {
        label: 'fontFamily.MicrosoftAccorblack',
        style: { 'font-family': '微软雅黑' },
        value: '微软雅黑',
    },
    {
        label: 'fontFamily.SimSun',
        style: { 'font-family': '宋体' },
        value: '宋体',
    },
    {
        label: 'fontFamily.SimHei',
        style: { 'font-family': '黑体' },
        value: '黑体',
    },
    {
        label: 'fontFamily.Kaiti',
        style: { 'font-family': '楷体' },
        value: '楷体',
    },
    {
        label: 'fontFamily.FangSong',
        style: { 'font-family': '仿宋' },
        value: '仿宋',
    },
    {
        label: 'fontFamily.NSimSun',
        style: { 'font-family': '新宋体' },
        value: '新宋体',
    },
    {
        label: 'fontFamily.STXinwei',
        style: { 'font-family': '华文新魏' },
        value: '华文新魏',
    },
    {
        label: 'fontFamily.STXingkai',
        style: { 'font-family': '华文行楷' },
        value: '华文行楷',
    },
    {
        label: 'fontFamily.STLiti',
        style: { 'font-family': '华文隶书' },
        value: '华文隶书',
    },
    {
        label: 'fontFamily.HanaleiFill',
        style: { 'font-family': 'HanaleiFill' },
        value: 'HanaleiFill',
    },
    {
        label: 'fontFamily.Anton',
        style: { 'font-family': 'Anton' },
        value: 'Anton',
    },
    {
        label: 'fontFamily.Pacifico',
        style: { 'font-family': 'Pacifico' },
        value: 'Pacifico',
    },
];

export function FontFamilySelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const permissionService = accessor.get(IPermissionService);
    const commandService = accessor.get(ICommandService);
    const currentUniverService = accessor.get(ICurrentUniverService);
    const selectionManagerService = accessor.get(SelectionManagerService);

    return {
        id: SetFontFamilyCommand.id,
        title: 'toolbar.font',
        tooltip: 'toolbar.font',
        selectType: SelectTypes.NEO,
        type: MenuItemType.SELECTOR,
        display: DisplayTypes.FONT,
        positions: [MenuPosition.TOOLBAR],
        selections: FONT_FAMILY_CHILDREN,
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

                const cellRange = selectionManagerService.getLast()?.cellRange;
                const worksheet = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet();
                let ff;
                if (cellRange != null) {
                    const range = worksheet.getRange(cellRange.row, cellRange.column);
                    ff = range?.getFontFamily();
                }

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
    const currentUniverService = accessor.get(ICurrentUniverService);
    const selectionManagerService = accessor.get(SelectionManagerService);

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

                const cellRange = selectionManagerService.getLast()?.cellRange;
                const worksheet = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet();
                let fs;
                if (cellRange != null) {
                    const range = worksheet.getRange(cellRange.row, cellRange.column);
                    fs = range?.getFontSize();
                }

                subscriber.next(fs ?? DEFAULT_SIZE);
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
        positions: SetTextColorCommand.id,
    };
}

export function TextColorSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const commandService = accessor.get(ICommandService);

    return {
        id: SetTextColorCommand.id,
        title: 'toolbar.textColor.main',
        icon: 'TextColorIcon',
        tooltip: 'toolbar.textColor.main',
        type: MenuItemType.SELECTOR,
        selectType: SelectTypes.NEO,
        positions: [MenuPosition.TOOLBAR],
        display: DisplayTypes.COLOR,
        selections: [
            {
                id: SHEET_UI_PLUGIN_NAME + ColorPicker.name,
            },
        ],
        value$: new Observable<string>((subscriber) => {
            const defaultColor = '#000';
            const disposable = commandService.onCommandExecuted((c) => {
                if (c.id === SetTextColorCommand.id) {
                    const color = (c.params as { value: string }).value;
                    subscriber.next(color ?? defaultColor);
                }
            });

            subscriber.next(defaultColor);
            return disposable.dispose;
        }),
    };
}

export function ResetBackgroundColorMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: ResetBackgroundColorCommand.id,
        type: MenuItemType.BUTTON,
        title: 'toolbar.resetColor',
        positions: SetBackgroundColorCommand.id,
    };
}

export function BackgroundColorSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const commandService = accessor.get(ICommandService);

    return {
        id: SetBackgroundColorCommand.id,
        tooltip: 'toolbar.fillColor.main',
        title: 'TextColorIcon',
        type: MenuItemType.SELECTOR,
        selectType: SelectTypes.NEO,
        positions: [MenuPosition.TOOLBAR],
        display: DisplayTypes.COLOR,
        icon: 'FillColorIcon',
        selections: [
            {
                id: SHEET_UI_PLUGIN_NAME + ColorPicker.name,
            },
        ],
        value$: new Observable<string>((subscriber) => {
            const defaultColor = '#fff';
            const disposable = commandService.onCommandExecuted((c) => {
                if (c.id === SetBackgroundColorCommand.id) {
                    const color = (c.params as { value: string }).value;
                    subscriber.next(color ?? defaultColor);
                }
            });

            subscriber.next(defaultColor);
            return disposable.dispose;
        }),
    };
}

export const HORIZONTAL_ALIGN_CHILDREN = [
    {
        label: 'align.left',
        icon: 'LeftAlignIcon',
        value: HorizontalAlign.LEFT,
    },
    {
        label: 'align.center',
        icon: 'CenterAlignIcon',
        value: HorizontalAlign.CENTER,
    },
    {
        label: 'align.right',
        icon: 'RightAlignIcon',
        value: HorizontalAlign.RIGHT,
    },
];

export function HorizontalAlignMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<HorizontalAlign> {
    const currentUniverService = accessor.get(ICurrentUniverService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    return {
        id: SetHorizontalTextAlignCommand.id,
        title: 'horizontalAlignMode',
        icon: HORIZONTAL_ALIGN_CHILDREN[0].icon,
        positions: [MenuPosition.TOOLBAR],
        tooltip: 'toolbar.horizontalAlignMode.main',
        display: DisplayTypes.ICON,
        type: MenuItemType.SELECTOR,
        selectType: SelectTypes.NEO,
        selections: HORIZONTAL_ALIGN_CHILDREN,
        value$: new Observable<HorizontalAlign>((subscriber) => {
            const disposable = accessor.get(ICommandService).onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetHorizontalTextAlignCommand.id && id !== SetSelectionsOperation.id) {
                    return;
                }

                const cellRange = selectionManagerService.getLast()?.cellRange;
                const worksheet = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet();
                let ha;
                if (cellRange != null) {
                    const range = worksheet.getRange(cellRange.row, cellRange.column);
                    ha = range?.getHorizontalAlignment();
                }

                subscriber.next(ha ?? HorizontalAlign.LEFT);
            });

            subscriber.next(HorizontalAlign.LEFT);

            return disposable.dispose;
        }),
    };
}

export const VERTICAL_ALIGN_CHILDREN = [
    {
        label: 'align.top',
        icon: 'TopVerticalIcon',
        value: VerticalAlign.TOP,
    },
    {
        label: 'align.middle',
        icon: 'CenterVerticalIcon',
        value: VerticalAlign.MIDDLE,
    },
    {
        label: 'align.bottom',
        icon: 'BottomVerticalIcon',
        value: VerticalAlign.BOTTOM,
    },
];

export function VerticalAlignMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<VerticalAlign> {
    const currentUniverService = accessor.get(ICurrentUniverService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    return {
        id: SetVerticalTextAlignCommand.id,
        title: 'verticalAlignMode',
        icon: VERTICAL_ALIGN_CHILDREN[0].icon,
        tooltip: 'toolbar.verticalAlignMode.main',
        display: DisplayTypes.ICON,
        type: MenuItemType.SELECTOR,
        positions: [MenuPosition.TOOLBAR],
        selectType: SelectTypes.NEO,
        selections: VERTICAL_ALIGN_CHILDREN,
        value$: new Observable<VerticalAlign>((subscriber) => {
            const disposable = accessor.get(ICommandService).onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetVerticalTextAlignCommand.id && id !== SetSelectionsOperation.id) {
                    return;
                }

                const cellRange = selectionManagerService.getLast()?.cellRange;
                const worksheet = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet();
                let va;
                if (cellRange != null) {
                    const range = worksheet.getRange(cellRange.row, cellRange.column);
                    va = range?.getVerticalAlignment();
                }

                subscriber.next(va ?? VerticalAlign.TOP);
            });

            subscriber.next(VerticalAlign.TOP);

            return disposable.dispose;
        }),
    };
}

export const TEXT_WRAP_CHILDREN = [
    {
        label: 'textWrap.overflow',
        icon: 'OverflowIcon',
        value: WrapStrategy.OVERFLOW,
    },
    {
        label: 'textWrap.wrap',
        icon: 'BrIcon',
        value: WrapStrategy.WRAP,
    },
    {
        label: 'textWrap.clip',
        icon: 'CutIcon',
        value: WrapStrategy.CLIP,
    },
];

export function WrapTextMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<WrapStrategy> {
    const currentUniverService = accessor.get(ICurrentUniverService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    return {
        id: SetTextWrapCommand.id,
        title: 'textWrapMode',
        tooltip: 'toolbar.textWrapMode.main',
        icon: TEXT_WRAP_CHILDREN[0].icon,
        type: MenuItemType.SELECTOR,
        selectType: SelectTypes.NEO,
        positions: [MenuPosition.TOOLBAR],
        selections: TEXT_WRAP_CHILDREN,
        display: DisplayTypes.ICON,
        value$: new Observable((subscriber) => {
            const disposable = accessor.get(ICommandService).onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetTextWrapCommand.id && id !== SetSelectionsOperation.id) {
                    return;
                }

                const cellRange = selectionManagerService.getLast()?.cellRange;
                const worksheet = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet();
                let ws;
                if (cellRange != null) {
                    const range = worksheet.getRange(cellRange.row, cellRange.column);
                    ws = range?.getWrapStrategy();
                }

                subscriber.next(ws ?? WrapStrategy.OVERFLOW);
            });

            subscriber.next(WrapStrategy.OVERFLOW);

            return disposable.dispose;
        }),
    };
}

export const TEXT_ROTATE_CHILDREN = [
    {
        label: 'textRotate.none',
        icon: 'TextRotateIcon',
        value: 0,
    },
    {
        label: 'textRotate.angleUp',
        icon: 'TextRotateAngleUpIcon',
        value: -45,
    },
    {
        label: 'textRotate.angleDown',
        icon: 'TextRotateAngleDownIcon',
        value: 45,
    },
    {
        label: 'textRotate.vertical',
        icon: 'TextRotateVerticalIcon',
        value: 'v',
    },
    {
        label: 'textRotate.rotationUp',
        icon: 'TextRotateRotationUpIcon',
        value: -90,
    },
    {
        label: 'textRotate.rotationDown',
        icon: 'TextRotateRotationDownIcon',
        value: 90,
    },
];

export function TextRotateMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<number | string> {
    const currentUniverService = accessor.get(ICurrentUniverService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    return {
        id: SetTextRotationCommand.id,
        title: 'textRotateMode',
        tooltip: 'toolbar.textRotateMode.main',
        icon: TEXT_ROTATE_CHILDREN[0].icon,
        display: DisplayTypes.ICON,
        type: MenuItemType.SELECTOR,
        selectType: SelectTypes.NEO,
        selections: TEXT_ROTATE_CHILDREN,
        positions: [MenuPosition.TOOLBAR],
        value$: new Observable<number | string>((subscriber) => {
            const disposable = accessor.get(ICommandService).onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetTextRotationCommand.id && id !== SetSelectionsOperation.id) {
                    return;
                }

                const cellRange = selectionManagerService.getLast()?.cellRange;
                const worksheet = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet();
                let tr;
                if (cellRange != null) {
                    const range = worksheet.getRange(cellRange.row, cellRange.column);
                    tr = range?.getTextRotation();
                }

                subscriber.next((tr && tr.a) ?? 0);
            });

            subscriber.next(0);

            return disposable.dispose;
        }),
    };
}

export function CopyMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: CopyCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.copy',
        positions: [MenuPosition.CONTEXT_MENU],
    };
}

export function ClearSelectionMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: ClearSelectionContentCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.clearContent',
        positions: [MenuPosition.CONTEXT_MENU],
    };
}

export function InsertRowMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: InsertRowAfterCommand.id,
        type: MenuItemType.BUTTON,
        positions: [MenuPosition.CONTEXT_MENU],
        title: 'rightClick.insertRow',
    };
}

export function InsertColMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: InsertColAfterCommand.id,
        type: MenuItemType.BUTTON,
        positions: [MenuPosition.CONTEXT_MENU],
        title: 'rightClick.insertColumn',
    };
}

export function RemoveRowMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: RemoveRowCommand.id,
        type: MenuItemType.BUTTON,
        positions: [MenuPosition.CONTEXT_MENU],
        title: 'rightClick.deleteSelectedRow',
    };
}

export function HideRowMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: SetWorksheetRowHideCommand.id,
        type: MenuItemType.BUTTON,
        positions: [MenuPosition.CONTEXT_MENU],
        title: 'rightClick.hideSelectedRow',
    };
}

export function ShowRowMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: SetWorksheetRowShowCommand.id,
        type: MenuItemType.BUTTON,
        positions: [MenuPosition.CONTEXT_MENU],
        title: 'rightClick.showHideRow',
    };
}

export function RemoveColMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: RemoveColCommand.id,
        type: MenuItemType.BUTTON,
        positions: [MenuPosition.CONTEXT_MENU],
        title: 'rightClick.deleteSelectedColumn',
    };
}

export function SetRowHeightMenuItemFactory(accessor: IAccessor): IMenuButtonItem<number> {
    const commandService = accessor.get(ICommandService);
    const currentUniverService = accessor.get(ICurrentUniverService);
    const selectionManagerService = accessor.get(SelectionManagerService);

    return {
        id: SetWorksheetRowHeightCommand.id,
        type: MenuItemType.BUTTON,
        positions: [MenuPosition.CONTEXT_MENU],
        title: 'rightClick.rowHeight',
        display: DisplayTypes.CUSTOM,
        label: {
            name: CONTEXT_MENU_INPUT_LABEL,
            props: {
                prefix: 'rightClick.rowHeight',
                suffix: 'px',
            },
        },
        value$: new Observable((subscriber) => {
            function update() {
                const cellRange = selectionManagerService.getLast()?.cellRange;
                const worksheet = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet();
                let rowHeight;
                if (cellRange != null) {
                    const range = worksheet.getRange(cellRange.row, cellRange.column);
                    rowHeight = range?.getHeight();
                }

                subscriber.next(rowHeight ?? 0);
            }

            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id === SetRangeStyleMutation.id || id === SetSelectionsOperation.id) {
                    return update();
                }
            });

            update();
            return disposable.dispose;
        }),
    };
}

export function SetColWidthMenuItemFactory(accessor: IAccessor): IMenuButtonItem<number> {
    const commandService = accessor.get(ICommandService);
    const currentUniverService = accessor.get(ICurrentUniverService);
    const selectionManagerService = accessor.get(SelectionManagerService);

    return {
        id: SetWorksheetColWidthCommand.id,
        type: MenuItemType.BUTTON,
        display: DisplayTypes.CUSTOM,
        positions: [MenuPosition.CONTEXT_MENU],
        title: 'rightClick.columnWidth',
        label: {
            name: CONTEXT_MENU_INPUT_LABEL,
            props: {
                prefix: 'rightClick.columnWidth',
                suffix: 'px',
            },
        },
        value$: new Observable((subscriber) => {
            function update() {
                const cellRange = selectionManagerService.getLast()?.cellRange;
                const worksheet = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet();
                let rowHeight;
                if (cellRange != null) {
                    const range = worksheet.getRange(cellRange.row, cellRange.column);
                    rowHeight = range?.getWidth();
                }

                subscriber.next(rowHeight ?? 0);
            }

            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id === SetRangeStyleMutation.id || id === SetSelectionsOperation.id) {
                    return update();
                }
            });

            update();
            return disposable.dispose;
        }),
    };
}

const DELETE_RANGE_MENU_ID = 'sheet.menu.delete-range';
export function DeleteRangeMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: DELETE_RANGE_MENU_ID,
        type: MenuItemType.SUBITEMS,
        title: 'rightClick.deleteCell',
        positions: [MenuPosition.CONTEXT_MENU],
        selectType: SelectTypes.NEO,
    };
}

export function DeleteRangeMoveLeftMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: DeleteRangeMoveLeftCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.moveLeft',
        positions: DELETE_RANGE_MENU_ID,
    };
}

export function DeleteRangeMoveUpMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: DeleteRangeMoveUpCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.moveUp',
        positions: DELETE_RANGE_MENU_ID,
    };
}

// right menu in main sheet bar
export function DeleteSheetMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: RemoveSheetCommand.id,
        type: MenuItemType.BUTTON,
        positions: [MenuPosition.SHEET_BAR],
        title: 'sheetConfig.delete',
    };
}

export function CopySheetMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: CopySheetCommand.id,
        type: MenuItemType.BUTTON,
        positions: [MenuPosition.SHEET_BAR],
        title: 'sheetConfig.copy',
    };
}

export function RenameSheetMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: RenameSheetCommand.id,
        type: MenuItemType.BUTTON,
        positions: [MenuPosition.SHEET_BAR],
        title: 'sheetConfig.rename',
    };
}

export function ChangeColorSheetMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: SetTabColorCommand.id,
        title: 'sheetConfig.changeColor',
        positions: [MenuPosition.SHEET_BAR],
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

export function HideSheetMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: SetWorksheetHideCommand.id,
        type: MenuItemType.BUTTON,
        positions: [MenuPosition.SHEET_BAR],
        title: 'sheetConfig.hide',
    };
}

export function UnHideSheetMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: ShowMenuListCommand.id,
        type: MenuItemType.BUTTON,
        positions: [MenuPosition.SHEET_BAR],
        title: 'sheetConfig.unhide',
    };
}
