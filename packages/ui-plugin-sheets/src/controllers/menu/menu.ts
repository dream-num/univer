import {
    ClearSelectionAllCommand,
    ClearSelectionContentCommand,
    ClearSelectionFormatCommand,
    CopySheetCommand,
    DeleteRangeMoveLeftCommand,
    DeleteRangeMoveUpCommand,
    InsertColAfterCommand,
    InsertColBeforeCommand,
    InsertRangeMoveDownCommand,
    InsertRangeMoveRightCommand,
    InsertRowAfterCommand,
    InsertRowBeforeCommand,
    RemoveColCommand,
    RemoveRowCommand,
    RemoveSheetCommand,
    ResetBackgroundColorCommand,
    ResetTextColorCommand,
    SelectionManagerService,
    SetBackgroundColorCommand,
    SetColHiddenCommand,
    SetColHiddenMutation,
    SetColVisibleMutation,
    SetColWidthCommand,
    SetHorizontalTextAlignCommand,
    SetRangeStyleMutation,
    SetRangeValuesMutation,
    SetRowHeightCommand,
    SetRowHiddenCommand,
    SetRowHiddenMutation,
    SetRowVisibleMutation,
    SetSelectedColsVisibleCommand,
    SetSelectedRowsVisibleCommand,
    SetSelectionsOperation,
    SetTabColorCommand,
    SetTextColorCommand,
    SetTextRotationCommand,
    SetTextWrapCommand,
    SetVerticalTextAlignCommand,
    SetWorksheetHideCommand,
    SetWorksheetRowIsAutoHeightCommand,
    SetWorksheetShowCommand,
} from '@univerjs/base-sheets';
import {
    CopyCommand,
    CutCommand,
    IMenuButtonItem,
    IMenuSelectorItem,
    MenuItemType,
    MenuPosition,
    PasteCommand,
} from '@univerjs/base-ui';
import {
    FontItalic,
    FontWeight,
    HorizontalAlign,
    ICommandService,
    IPermissionService,
    IUniverInstanceService,
    RANGE_TYPE,
    VerticalAlign,
    WrapStrategy,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { Observable } from 'rxjs';

import {
    SetRangeBoldCommand,
    SetRangeFontFamilyCommand,
    SetRangeFontSizeCommand,
    SetRangeItalicCommand,
    SetRangeStrickThroughCommand,
    SetRangeUnderlineCommand,
} from '../../commands/commands/inline-format.command';
import { RenameSheetOperation } from '../../commands/commands/rename.command';
import {
    SetInfiniteFormatPainterCommand,
    SetOnceFormatPainterCommand,
} from '../../commands/commands/set-format-painter.command';
import { SetSelectionFrozenCommand } from '../../commands/commands/set-frozen.command';
import { ShowMenuListCommand } from '../../commands/commands/unhide.command';
import { COLOR_PICKER_COMPONENT } from '../../components/color-picker';
import { FONT_FAMILY_COMPONENT, FONT_FAMILY_ITEM_COMPONENT } from '../../components/font-family';
import { FONT_SIZE_COMPONENT } from '../../components/font-size';
import { MENU_ITEM_INPUT_COMPONENT } from '../../components/menu-item-input';
import { FormatPainterStatus, IFormatPainterService } from '../../services/format-painter/format-painter.service';

export { SetBorderColorMenuItemFactory, SetBorderStyleMenuItemFactory } from './border.menu';

export enum SheetMenuPosition {
    ROW_HEADER_CONTEXT_MENU = 'rowHeaderContextMenu',
    COL_HEADER_CONTEXT_MENU = 'colHeaderContextMenu',
    SHEET_BAR = 'sheetBar',
}

export function FormatPainterMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const formatPainterService = accessor.get(IFormatPainterService);
    return {
        id: SetOnceFormatPainterCommand.id,
        subId: SetInfiniteFormatPainterCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'BrushSingle',
        title: 'Format Painter',
        tooltip: 'toolbar.formatPainter',
        positions: [MenuPosition.TOOLBAR_START],
        activated$: new Observable<boolean>((subscriber) => {
            let active = false;

            const status$ = formatPainterService.status$.subscribe((s) => {
                active = s !== FormatPainterStatus.OFF;
                subscriber.next(active);
            });

            subscriber.next(active);

            return () => {
                status$.unsubscribe();
            };
        }),
    };
}

export function BoldMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const permissionService = accessor.get(IPermissionService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);

    return {
        id: SetRangeBoldCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'BoldSingle',
        title: 'Set bold',
        tooltip: 'toolbar.bold',
        positions: [MenuPosition.TOOLBAR_START],
        disabled$: new Observable<boolean>((subscriber) => {
            let editable = false;

            // it can hook in other business logic via permissionService and sheet business logic
            const permission$ = permissionService.editable$.subscribe((e) => {
                editable = e;
                subscriber.next(!editable);
            });

            subscriber.next(!editable);

            return () => {
                permission$.unsubscribe();
            };
        }),
        activated$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (
                    id !== SetRangeStyleMutation.id &&
                    id !== SetRangeValuesMutation.id &&
                    id !== SetSelectionsOperation.id
                ) {
                    return;
                }

                const primary = selectionManagerService.getLast()?.primary;
                const worksheet = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();
                let isBold = FontWeight.NORMAL;

                if (primary != null) {
                    const range = worksheet.getRange(primary.startRow, primary.startColumn);
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
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);

    return {
        id: SetRangeItalicCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'ItalicSingle',
        title: 'Set italic',
        tooltip: 'toolbar.italic',
        positions: [MenuPosition.TOOLBAR_START],
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
                if (
                    id !== SetRangeStyleMutation.id &&
                    id !== SetRangeValuesMutation.id &&
                    id !== SetSelectionsOperation.id
                ) {
                    return;
                }

                const primary = selectionManagerService.getLast()?.primary;
                const worksheet = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();
                let isItalic = FontItalic.NORMAL;
                if (primary != null) {
                    const range = worksheet.getRange(primary.startRow, primary.startColumn);
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
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);

    return {
        id: SetRangeUnderlineCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'UnderlineSingle',
        title: 'Set underline',
        tooltip: 'toolbar.underline',
        positions: [MenuPosition.TOOLBAR_START],
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
                if (
                    id !== SetRangeStyleMutation.id &&
                    id !== SetRangeValuesMutation.id &&
                    id !== SetSelectionsOperation.id
                ) {
                    return;
                }

                const primary = selectionManagerService.getLast()?.primary;
                const worksheet = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();
                let isUnderline;
                if (primary != null) {
                    const range = worksheet.getRange(primary.startRow, primary.startColumn);
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
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);

    return {
        id: SetRangeStrickThroughCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'StrikethroughSingle',
        title: 'Set strike through',
        tooltip: 'toolbar.strikethrough',
        positions: [MenuPosition.TOOLBAR_START],
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
                if (
                    id !== SetRangeStyleMutation.id &&
                    id !== SetRangeValuesMutation.id &&
                    id !== SetSelectionsOperation.id
                ) {
                    return;
                }

                const primary = selectionManagerService.getLast()?.primary;
                const worksheet = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();
                let st;
                if (primary != null) {
                    const range = worksheet.getRange(primary.startRow, primary.startColumn);
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
        label: { name: FONT_FAMILY_ITEM_COMPONENT },
        value: 'Times New Roman',
    },
    {
        label: { name: FONT_FAMILY_ITEM_COMPONENT },
        value: 'Arial',
    },
    {
        label: { name: FONT_FAMILY_ITEM_COMPONENT },
        value: 'Tahoma',
    },
    {
        label: { name: FONT_FAMILY_ITEM_COMPONENT },
        value: 'Verdana',
    },
    {
        label: { name: FONT_FAMILY_ITEM_COMPONENT },
        value: 'Microsoft YaHei',
    },
    {
        label: { name: FONT_FAMILY_ITEM_COMPONENT },
        value: 'SimSun',
    },
    {
        label: { name: FONT_FAMILY_ITEM_COMPONENT },
        value: 'SimHei',
    },
    {
        label: { name: FONT_FAMILY_ITEM_COMPONENT },
        value: 'Kaiti',
    },
    {
        label: { name: FONT_FAMILY_ITEM_COMPONENT },
        value: 'FangSong',
    },
    {
        label: { name: FONT_FAMILY_ITEM_COMPONENT },
        value: 'NSimSun',
    },
    {
        label: { name: FONT_FAMILY_ITEM_COMPONENT },
        value: 'STXinwei',
    },
    {
        label: { name: FONT_FAMILY_ITEM_COMPONENT },
        value: 'STXingkai',
    },
    {
        label: { name: FONT_FAMILY_ITEM_COMPONENT },
        value: 'STLiti',
    },
    // The following 3 fonts do not work, temporarily delete
    // {
    //     label: 'fontFamily.HanaleiFill',
    //     style: { 'font-family': 'HanaleiFill' },
    //     value: 'HanaleiFill',
    // },
    // {
    //     label: 'fontFamily.Anton',
    //     style: { 'font-family': 'Anton' },
    //     value: 'Anton',
    // },
    // {
    //     label: 'fontFamily.Pacifico',
    //     style: { 'font-family': 'Pacifico' },
    //     value: 'Pacifico',
    // },
];

export function FontFamilySelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const permissionService = accessor.get(IPermissionService);
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);

    return {
        id: SetRangeFontFamilyCommand.id,
        tooltip: 'toolbar.font',
        type: MenuItemType.SELECTOR,

        label: FONT_FAMILY_COMPONENT,

        positions: [MenuPosition.TOOLBAR_START],
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
                if (
                    id !== SetRangeStyleMutation.id &&
                    id !== SetRangeValuesMutation.id &&
                    id !== SetSelectionsOperation.id
                ) {
                    return;
                }

                const primary = selectionManagerService.getLast()?.primary;
                const worksheet = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();
                let ff;
                if (primary != null) {
                    const range = worksheet.getRange(primary.startRow, primary.startColumn);
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
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);

    return {
        id: SetRangeFontSizeCommand.id,
        tooltip: 'toolbar.fontSize',
        type: MenuItemType.SELECTOR,
        label: {
            name: FONT_SIZE_COMPONENT,
            props: {
                min: 1,
                max: 400,
            },
        },
        positions: [MenuPosition.TOOLBAR_START],
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
                if (
                    id !== SetRangeStyleMutation.id &&
                    id !== SetRangeValuesMutation.id &&
                    id !== SetSelectionsOperation.id
                ) {
                    return;
                }

                const primary = selectionManagerService.getLast()?.primary;
                const worksheet = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();
                let fs;
                if (primary != null) {
                    const range = worksheet.getRange(primary.startRow, primary.startColumn);
                    fs = range?.getFontSize();
                }

                subscriber.next(fs ?? DEFAULT_SIZE);
            });

            subscriber.next(DEFAULT_SIZE);

            return disposable.dispose;
        }),
    };
}

export function ResetTextColorMenuItemFactory(): IMenuButtonItem {
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
        icon: 'FontColor',
        tooltip: 'toolbar.textColor.main',
        type: MenuItemType.SELECTOR,
        positions: [MenuPosition.TOOLBAR_START],
        selections: [
            {
                id: COLOR_PICKER_COMPONENT,
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

export function ResetBackgroundColorMenuItemFactory(): IMenuButtonItem {
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
        type: MenuItemType.SELECTOR,
        positions: [MenuPosition.TOOLBAR_START],
        icon: 'PaintBucket',
        selections: [
            {
                id: COLOR_PICKER_COMPONENT,
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
        icon: 'LeftJustifyingSingle',
        value: HorizontalAlign.LEFT,
    },
    {
        label: 'align.center',
        icon: 'HorizontallySingle',
        value: HorizontalAlign.CENTER,
    },
    {
        label: 'align.right',
        icon: 'RightJustifyingSingle',
        value: HorizontalAlign.RIGHT,
    },
];

export function HorizontalAlignMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<HorizontalAlign> {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    return {
        id: SetHorizontalTextAlignCommand.id,
        icon: HORIZONTAL_ALIGN_CHILDREN[0].icon,
        positions: [MenuPosition.TOOLBAR_START],
        tooltip: 'toolbar.horizontalAlignMode.main',
        type: MenuItemType.SELECTOR,
        selections: HORIZONTAL_ALIGN_CHILDREN,
        value$: new Observable<HorizontalAlign>((subscriber) => {
            const disposable = accessor.get(ICommandService).onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetHorizontalTextAlignCommand.id && id !== SetSelectionsOperation.id) {
                    return;
                }

                const primary = selectionManagerService.getLast()?.primary;
                const worksheet = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();
                let ha;
                if (primary != null) {
                    const range = worksheet.getRange(primary.startRow, primary.startColumn);
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
        icon: 'AlignTopSingle',
        value: VerticalAlign.TOP,
    },
    {
        label: 'align.middle',
        icon: 'VerticalCenterSingle',
        value: VerticalAlign.MIDDLE,
    },
    {
        label: 'align.bottom',
        icon: 'AlignBottomSingle',
        value: VerticalAlign.BOTTOM,
    },
];

export function VerticalAlignMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<VerticalAlign> {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    return {
        id: SetVerticalTextAlignCommand.id,
        icon: VERTICAL_ALIGN_CHILDREN[0].icon,
        tooltip: 'toolbar.verticalAlignMode.main',
        type: MenuItemType.SELECTOR,
        positions: [MenuPosition.TOOLBAR_START],
        selections: VERTICAL_ALIGN_CHILDREN,
        value$: new Observable<VerticalAlign>((subscriber) => {
            const disposable = accessor.get(ICommandService).onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetVerticalTextAlignCommand.id && id !== SetSelectionsOperation.id) {
                    return;
                }

                const primary = selectionManagerService.getLast()?.primary;
                const worksheet = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();
                let va;
                if (primary != null) {
                    const range = worksheet.getRange(primary.startRow, primary.startColumn);
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
        icon: 'OverflowSingle',
        value: WrapStrategy.OVERFLOW,
    },
    {
        label: 'textWrap.wrap',
        icon: 'AutowrapSingle',
        value: WrapStrategy.WRAP,
    },
    {
        label: 'textWrap.clip',
        icon: 'TruncationSingle',
        value: WrapStrategy.CLIP,
    },
];

export function WrapTextMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<WrapStrategy> {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    return {
        id: SetTextWrapCommand.id,
        tooltip: 'toolbar.textWrapMode.main',
        icon: TEXT_WRAP_CHILDREN[0].icon,
        type: MenuItemType.SELECTOR,
        positions: [MenuPosition.TOOLBAR_START],
        selections: TEXT_WRAP_CHILDREN,
        value$: new Observable((subscriber) => {
            const disposable = accessor.get(ICommandService).onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetTextWrapCommand.id && id !== SetSelectionsOperation.id) {
                    return;
                }

                const primary = selectionManagerService.getLast()?.primary;
                const worksheet = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();
                let ws;
                if (primary != null) {
                    const range = worksheet.getRange(primary.startRow, primary.startColumn);
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
        icon: 'NoRotationSingle',
        value: 0,
    },
    {
        label: 'textRotate.angleUp',
        icon: 'LeftRotationFortyFiveDegreesSingle',
        value: -45,
    },
    {
        label: 'textRotate.angleDown',
        icon: 'RightRotationFortyFiveDegreesSingle',
        value: 45,
    },
    {
        label: 'textRotate.vertical',
        icon: 'VerticalTextSingle',
        value: 'v',
    },
    {
        label: 'textRotate.rotationUp',
        icon: 'LeftRotationNinetyDegreesSingle',
        value: -90,
    },
    {
        label: 'textRotate.rotationDown',
        icon: 'RightRotationNinetyDegreesSingle',
        value: 90,
    },
];

export function TextRotateMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<number | string> {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    return {
        id: SetTextRotationCommand.id,
        tooltip: 'toolbar.textRotateMode.main',
        icon: TEXT_ROTATE_CHILDREN[0].icon,
        type: MenuItemType.SELECTOR,
        selections: TEXT_ROTATE_CHILDREN,
        positions: [MenuPosition.TOOLBAR_START],
        value$: new Observable<number | string>((subscriber) => {
            const disposable = accessor.get(ICommandService).onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetTextRotationCommand.id && id !== SetSelectionsOperation.id) {
                    return;
                }

                const primary = selectionManagerService.getLast()?.primary;
                const worksheet = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();
                let tr;
                if (primary != null) {
                    const range = worksheet.getRange(primary.startRow, primary.startColumn);
                    tr = range?.getTextRotation();
                }

                subscriber.next((tr && tr.a) ?? 0);
            });

            subscriber.next(0);

            return disposable.dispose;
        }),
    };
}

// #region - copy cut paste
// TODO@wzhudev: maybe we should move these menu factory to base-ui

export function CopyMenuItemFactory(): IMenuButtonItem {
    return {
        id: CopyCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.copy',
        icon: 'Copy',
        positions: [
            MenuPosition.CONTEXT_MENU,
            SheetMenuPosition.COL_HEADER_CONTEXT_MENU,
            SheetMenuPosition.ROW_HEADER_CONTEXT_MENU,
        ],
    };
}

export function CutMenuItemFactory(): IMenuButtonItem {
    return {
        id: CutCommand.id,
        type: MenuItemType.BUTTON,
        title: 'contextMenu.cut',
        positions: [
            MenuPosition.CONTEXT_MENU,
            SheetMenuPosition.COL_HEADER_CONTEXT_MENU,
            SheetMenuPosition.ROW_HEADER_CONTEXT_MENU,
        ],
    };
}

export function PasteMenuItemFactory(): IMenuButtonItem {
    return {
        id: PasteCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.paste',
        icon: 'PasteSpecial',
        positions: [
            MenuPosition.CONTEXT_MENU,
            SheetMenuPosition.COL_HEADER_CONTEXT_MENU,
            SheetMenuPosition.ROW_HEADER_CONTEXT_MENU,
        ],
    };
}

// #endregion

export function ClearSelectionContentMenuItemFactory(): IMenuButtonItem {
    return {
        id: ClearSelectionContentCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.clearContent',
        positions: [
            MenuPosition.CONTEXT_MENU,
            SheetMenuPosition.COL_HEADER_CONTEXT_MENU,
            SheetMenuPosition.ROW_HEADER_CONTEXT_MENU,
        ],
    };
}
export function ClearSelectionFormatMenuItemFactory(): IMenuButtonItem {
    return {
        id: ClearSelectionFormatCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.clearFormat',
        positions: [
            MenuPosition.CONTEXT_MENU,
            SheetMenuPosition.COL_HEADER_CONTEXT_MENU,
            SheetMenuPosition.ROW_HEADER_CONTEXT_MENU,
        ],
    };
}
export function ClearSelectionAllMenuItemFactory(): IMenuButtonItem {
    return {
        id: ClearSelectionAllCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.clearAll',
        positions: [
            MenuPosition.CONTEXT_MENU,
            SheetMenuPosition.COL_HEADER_CONTEXT_MENU,
            SheetMenuPosition.ROW_HEADER_CONTEXT_MENU,
        ],
    };
}

export function InsertRowBeforeMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const selectionManager = accessor.get(SelectionManagerService);

    return {
        id: InsertRowBeforeCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.insertRowBefore',
        positions: [SheetMenuPosition.ROW_HEADER_CONTEXT_MENU, MenuPosition.CONTEXT_MENU],
        hidden$: new Observable((observer) => {
            // if there are multi selections this item should be hidden
            const selections = selectionManager.getSelections();
            observer.next(selections?.length !== 1);
        }),
    };
}

export function InsertRowAfterMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const selectionManager = accessor.get(SelectionManagerService);
    return {
        id: InsertRowAfterCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.ROW_HEADER_CONTEXT_MENU],
        title: 'rightClick.insertRow',
        hidden$: new Observable((observer) => {
            // if there are multi selections this item should be hidden
            const selections = selectionManager.getSelections();
            observer.next(selections?.length !== 1);
        }),
    };
}

export function InsertColBeforeMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const selectionManager = accessor.get(SelectionManagerService);
    return {
        id: InsertColBeforeCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.COL_HEADER_CONTEXT_MENU, MenuPosition.CONTEXT_MENU],
        title: 'rightClick.insertColumnBefore',
        hidden$: new Observable((observer) => {
            // if there are multi selections this item should be hidden
            const selections = selectionManager.getSelections();
            observer.next(selections?.length !== 1);
        }),
    };
}

export function InsertColAfterMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const selectionManager = accessor.get(SelectionManagerService);
    return {
        id: InsertColAfterCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.COL_HEADER_CONTEXT_MENU],
        title: 'rightClick.insertColumn',
        hidden$: new Observable((observer) => {
            // if there are multi selections this item should be hidden
            const selections = selectionManager.getSelections();
            observer.next(selections?.length !== 1);
        }),
    };
}

export function FitContentMenuItemFactory(): IMenuButtonItem {
    return {
        id: SetWorksheetRowIsAutoHeightCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.ROW_HEADER_CONTEXT_MENU],
        title: 'rightClick.fitContent',
    };
}

export function FrozenMenuItemFactory(): IMenuButtonItem {
    return {
        id: SetSelectionFrozenCommand.id,
        type: MenuItemType.BUTTON,
        positions: [
            MenuPosition.CONTEXT_MENU,
            SheetMenuPosition.COL_HEADER_CONTEXT_MENU,
            SheetMenuPosition.ROW_HEADER_CONTEXT_MENU,
        ],
        title: 'rightClick.freeze',
    };
}

export function RemoveRowMenuItemFactory(): IMenuButtonItem {
    return {
        id: RemoveRowCommand.id,
        type: MenuItemType.BUTTON,
        positions: [MenuPosition.CONTEXT_MENU, SheetMenuPosition.ROW_HEADER_CONTEXT_MENU],
        title: 'rightClick.deleteSelectedRow',
    };
}

export function HideRowMenuItemFactory(): IMenuButtonItem {
    return {
        id: SetRowHiddenCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.ROW_HEADER_CONTEXT_MENU],
        title: 'rightClick.hideSelectedRow',
    };
}

export function HideColMenuItemFactory(): IMenuButtonItem {
    return {
        id: SetColHiddenCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.COL_HEADER_CONTEXT_MENU],
        title: 'rightClick.hideSelectedColumn',
    };
}

export function ShowRowMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);

    function hasHiddenRowsInSelections(): boolean {
        const worksheet = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();
        const rowRanges = selectionManagerService
            .getSelections()
            ?.map((s) => s.range)
            .filter((r) => r.rangeType === RANGE_TYPE.ROW);

        return !!rowRanges?.some((range) => {
            for (let r = range.startRow; r <= range.endRow; r++) {
                if (!worksheet.getRowVisible(r)) {
                    return true;
                }
            }

            return false;
        });
    }

    const commandService = accessor.get(ICommandService);

    return {
        id: SetSelectedRowsVisibleCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.ROW_HEADER_CONTEXT_MENU],
        title: 'rightClick.showHideRow',
        hidden$: new Observable((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                if (
                    c.id === SetSelectionsOperation.id ||
                    c.id === SetRowHiddenMutation.id ||
                    c.id === SetRowVisibleMutation.id
                ) {
                    subscriber.next(!hasHiddenRowsInSelections());
                }
            });

            // it only shows when selected area has hidden rows
            subscriber.next(!hasHiddenRowsInSelections());
            return () => disposable.dispose();
        }),
    };
}

export function ShowColMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);

    function hasHiddenColsInSelections(): boolean {
        const worksheet = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();
        const colRanges = selectionManagerService
            .getSelections()
            ?.map((s) => s.range)
            .filter((r) => r.rangeType === RANGE_TYPE.COLUMN);

        return !!colRanges?.some((range) => {
            for (let r = range.startRow; r <= range.endRow; r++) {
                if (!worksheet.getColVisible(r)) {
                    return true;
                }
            }

            return false;
        });
    }

    const commandService = accessor.get(ICommandService);

    return {
        id: SetSelectedColsVisibleCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.COL_HEADER_CONTEXT_MENU],
        title: 'rightClick.showHideColumn',
        hidden$: new Observable((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                if (
                    c.id === SetSelectionsOperation.id ||
                    c.id === SetColHiddenMutation.id ||
                    c.id === SetColVisibleMutation.id
                ) {
                    subscriber.next(!hasHiddenColsInSelections());
                }
            });

            subscriber.next(!hasHiddenColsInSelections());
            return () => disposable.dispose();
        }),
    };
}

export function RemoveColMenuItemFactory(): IMenuButtonItem {
    return {
        id: RemoveColCommand.id,
        type: MenuItemType.BUTTON,
        positions: [MenuPosition.CONTEXT_MENU, SheetMenuPosition.COL_HEADER_CONTEXT_MENU],
        title: 'rightClick.deleteSelectedColumn',
    };
}

export function SetRowHeightMenuItemFactory(accessor: IAccessor): IMenuButtonItem<number> {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);

    return {
        id: SetRowHeightCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.ROW_HEADER_CONTEXT_MENU],
        label: {
            name: MENU_ITEM_INPUT_COMPONENT,
            props: {
                prefix: 'rightClick.rowHeight',
                suffix: 'px',
            },
        },
        value$: new Observable((subscriber) => {
            function update() {
                const primary = selectionManagerService.getLast()?.primary;
                const worksheet = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();
                let rowHeight;
                if (primary != null) {
                    rowHeight = worksheet.getRowHeight(primary.startRow);
                }

                subscriber.next(rowHeight ?? 0);
            }

            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (
                    id === SetRangeStyleMutation.id ||
                    id === SetRangeValuesMutation.id ||
                    id === SetSelectionsOperation.id
                ) {
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
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);

    return {
        id: SetColWidthCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.COL_HEADER_CONTEXT_MENU],
        label: {
            name: MENU_ITEM_INPUT_COMPONENT,
            props: {
                prefix: 'rightClick.columnWidth',
                suffix: 'px',
            },
        },
        value$: new Observable((subscriber) => {
            function update() {
                const primary = selectionManagerService.getLast()?.primary;
                const worksheet = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();

                let colWidth: number = 0;
                if (primary != null) {
                    colWidth = worksheet.getColumnWidth(primary.startColumn);
                }

                subscriber.next(colWidth);
            }

            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (
                    id === SetRangeStyleMutation.id ||
                    id === SetRangeValuesMutation.id ||
                    id === SetSelectionsOperation.id
                ) {
                    return update();
                }
            });

            update();
            return disposable.dispose;
        }),
    };
}

const DELETE_RANGE_MENU_ID = 'sheet.menu.delete-range';
export function DeleteRangeMenuItemFactory(): IMenuSelectorItem<string> {
    return {
        id: DELETE_RANGE_MENU_ID,
        type: MenuItemType.SUBITEMS,
        title: 'rightClick.deleteCell',
        positions: [MenuPosition.CONTEXT_MENU],
    };
}

export function DeleteRangeMoveLeftMenuItemFactory(): IMenuButtonItem {
    return {
        id: DeleteRangeMoveLeftCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.moveLeft',
        positions: DELETE_RANGE_MENU_ID,
    };
}

export function DeleteRangeMoveUpMenuItemFactory(): IMenuButtonItem {
    return {
        id: DeleteRangeMoveUpCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.moveUp',
        positions: DELETE_RANGE_MENU_ID,
    };
}
const INSERT_RANGE_MENU_ID = 'sheet.menu.insert-range';
export function InsertRangeMenuItemFactory(): IMenuSelectorItem<string> {
    return {
        id: INSERT_RANGE_MENU_ID,
        type: MenuItemType.SUBITEMS,
        title: 'rightClick.insertCell',
        positions: [MenuPosition.CONTEXT_MENU],
    };
}

export function InsertRangeMoveRightMenuItemFactory(): IMenuButtonItem {
    return {
        id: InsertRangeMoveRightCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.moveRight',
        positions: INSERT_RANGE_MENU_ID,
    };
}

export function InsertRangeMoveDownMenuItemFactory(): IMenuButtonItem {
    return {
        id: InsertRangeMoveDownCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.moveDown',
        positions: INSERT_RANGE_MENU_ID,
    };
}

// right menu in main sheet bar
export function DeleteSheetMenuItemFactory(): IMenuButtonItem {
    return {
        id: RemoveSheetCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.SHEET_BAR],
        title: 'sheetConfig.delete',
    };
}

export function CopySheetMenuItemFactory(): IMenuButtonItem {
    return {
        id: CopySheetCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.SHEET_BAR],
        title: 'sheetConfig.copy',
    };
}

export function RenameSheetMenuItemFactory(): IMenuButtonItem {
    return {
        id: RenameSheetOperation.id,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.SHEET_BAR],
        title: 'sheetConfig.rename',
    };
}

export function ChangeColorSheetMenuItemFactory(): IMenuSelectorItem<string> {
    return {
        id: SetTabColorCommand.id,
        title: 'sheetConfig.changeColor',
        positions: [SheetMenuPosition.SHEET_BAR],
        type: MenuItemType.SELECTOR,
        selections: [
            {
                id: COLOR_PICKER_COMPONENT,
            },
        ],
    };
}

export function HideSheetMenuItemFactory(): IMenuButtonItem {
    return {
        id: SetWorksheetHideCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.SHEET_BAR],
        title: 'sheetConfig.hide',
    };
}

export function UnHideSheetMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<any> {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const commandService = accessor.get(ICommandService);
    const workbook = univerInstanceService.getCurrentUniverSheetInstance();
    const hiddenList = workbook.getHiddenWorksheets().map((s) => ({
        label: workbook.getSheetBySheetId(s)?.getName() || '',
        value: s,
    }));

    return {
        id: SetWorksheetShowCommand.id,
        type: MenuItemType.SELECTOR,
        positions: [SheetMenuPosition.SHEET_BAR],
        title: 'sheetConfig.unhide',
        disabled$: new Observable((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                if (c.id !== SetWorksheetHideCommand.id && c.id !== SetWorksheetShowCommand.id) {
                    return;
                }
                const newList = workbook.getHiddenWorksheets();
                subscriber.next(newList.length === 0);
            });
            subscriber.next(hiddenList.length === 0);
            return disposable.dispose;
        }),
        selections: new Observable((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                if (c.id !== SetWorksheetHideCommand.id && c.id !== SetWorksheetShowCommand.id) {
                    return;
                }
                const newList = workbook.getHiddenWorksheets().map((s) => ({
                    label: workbook.getSheetBySheetId(s)?.getName() || '',
                    value: s,
                }));
                subscriber.next(newList);
            });
            subscriber.next(hiddenList);
            return disposable.dispose;
        }),
    };
}

export function ShowMenuItemFactory(): IMenuButtonItem {
    return {
        id: ShowMenuListCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.SHEET_BAR],
        title: 'sheetConfig.unhide',
    };
}
