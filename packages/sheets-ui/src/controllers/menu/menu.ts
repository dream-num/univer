/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
    BooleanNumber,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    EDITOR_ACTIVATED,
    FOCUSING_SHEET,
    FontItalic,
    FontWeight,
    HorizontalAlign,
    ICommandService,
    IContextService,
    IUniverInstanceService,
    RANGE_TYPE,
    ThemeService,
    UniverInstanceType,
    VerticalAlign,
    WrapStrategy,
} from '@univerjs/core';
import { SetInlineFormatCommand, SetTextSelectionsOperation, TextSelectionManagerService } from '@univerjs/docs';
import {
    getCurrentSheetDisabled$,
    ResetBackgroundColorCommand,
    ResetTextColorCommand,
    SelectionManagerService,
    SetBackgroundColorCommand,
    SetColHiddenMutation,
    SetColVisibleMutation,
    SetColWidthCommand,
    SetHorizontalTextAlignCommand,
    SetRangeValuesMutation,
    SetRowHeightCommand,
    SetRowHiddenMutation,
    SetRowVisibleMutation,
    SetSelectedColsVisibleCommand,
    SetSelectedRowsVisibleCommand,
    SetSelectionsOperation,
    SetTextRotationCommand,
    SetTextWrapCommand,
    SetVerticalTextAlignCommand,
    SetWorksheetRowIsAutoHeightCommand,
} from '@univerjs/sheets';
import type { IMenuButtonItem, IMenuSelectorItem } from '@univerjs/ui';
import {
    CopyCommand,
    CutCommand,
    FONT_FAMILY_LIST,
    FONT_SIZE_LIST,
    getMenuHiddenObservable,
    IClipboardInterfaceService,
    MenuGroup,
    MenuItemType,
    MenuPosition,
    PasteCommand,
} from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';
import { Observable } from 'rxjs';

import {
    SheetPasteBesidesBorderCommand,
    SheetPasteColWidthCommand,
    SheetPasteFormatCommand,
    SheetPasteValueCommand,
} from '../../commands/commands/clipboard.command';
import { HideColConfirmCommand, HideRowConfirmCommand } from '../../commands/commands/hide-row-col-confirm.command';
import {
    SetRangeBoldCommand,
    SetRangeFontFamilyCommand,
    SetRangeFontSizeCommand,
    SetRangeItalicCommand,
    SetRangeStrickThroughCommand,
    SetRangeTextColorCommand,
    SetRangeUnderlineCommand,
} from '../../commands/commands/inline-format.command';
import {
    SetInfiniteFormatPainterCommand,
    SetOnceFormatPainterCommand,
} from '../../commands/commands/set-format-painter.command';
import {
    CancelFrozenCommand,
    SetColumnFrozenCommand,
    SetRowFrozenCommand,
    SetSelectionFrozenCommand,
} from '../../commands/commands/set-frozen.command';
import { COLOR_PICKER_COMPONENT } from '../../components/color-picker';
import { FONT_FAMILY_COMPONENT, FONT_FAMILY_ITEM_COMPONENT } from '../../components/font-family';
import { FONT_SIZE_COMPONENT } from '../../components/font-size';
import { MENU_ITEM_INPUT_COMPONENT } from '../../components/menu-item-input';
import { FormatPainterStatus, IFormatPainterService } from '../../services/format-painter/format-painter.service';

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
        group: MenuGroup.TOOLBAR_FORMAT,
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
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.SHEET),
        disabled$: getCurrentSheetDisabled$(accessor),
    };
}

export function BoldMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const contextService = accessor.get(IContextService);
    const selectionManagerService = accessor.get(SelectionManagerService);

    return {
        id: SetRangeBoldCommand.id,
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON,
        icon: 'BoldSingle',
        title: 'Set bold',
        tooltip: 'toolbar.bold',
        positions: [MenuPosition.TOOLBAR_START],
        disabled$: getCurrentSheetDisabled$(accessor),
        activated$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id === SetRangeValuesMutation.id || id === SetSelectionsOperation.id) {
                    const primary = selectionManagerService.getLast()?.primary;
                    const worksheet = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();
                    let isBold = FontWeight.NORMAL;

                    if (primary != null) {
                        const range = worksheet.getRange(primary.startRow, primary.startColumn);
                        isBold = range?.getFontWeight();
                    }

                    subscriber.next(isBold === FontWeight.BOLD);
                }

                if (
                    (id === SetTextSelectionsOperation.id || id === SetInlineFormatCommand.id) &&
                    contextService.getContextValue(EDITOR_ACTIVATED) &&
                    contextService.getContextValue(FOCUSING_SHEET)
                ) {
                    const textRun = getFontStyleAtCursor(accessor);

                    if (textRun == null) {
                        return;
                    }

                    const bl = textRun.ts?.bl;

                    subscriber.next(bl === BooleanNumber.TRUE);
                }
            });

            subscriber.next(false);

            return disposable.dispose;
        }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.SHEET),
    };
}

export function ItalicMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    const contextService = accessor.get(IContextService);

    return {
        id: SetRangeItalicCommand.id,
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON,
        icon: 'ItalicSingle',
        title: 'Set italic',
        tooltip: 'toolbar.italic',
        positions: [MenuPosition.TOOLBAR_START],
        disabled$: getCurrentSheetDisabled$(accessor),
        activated$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id === SetRangeValuesMutation.id || id === SetSelectionsOperation.id) {
                    const primary = selectionManagerService.getLast()?.primary;
                    const worksheet = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();
                    let isItalic = FontItalic.NORMAL;
                    if (primary != null) {
                        const range = worksheet.getRange(primary.startRow, primary.startColumn);
                        isItalic = range?.getFontStyle();
                    }

                    subscriber.next(isItalic === FontItalic.ITALIC);
                }

                if (
                    (id === SetTextSelectionsOperation.id || id === SetInlineFormatCommand.id) &&
                    contextService.getContextValue(EDITOR_ACTIVATED) &&
                    contextService.getContextValue(FOCUSING_SHEET)
                ) {
                    const textRun = getFontStyleAtCursor(accessor);

                    if (textRun == null) {
                        return;
                    }

                    const it = textRun.ts?.it;

                    subscriber.next(it === BooleanNumber.TRUE);
                }
            });

            subscriber.next(false);
            return disposable.dispose;
        }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.SHEET),
    };
}

export function UnderlineMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    const contextService = accessor.get(IContextService);

    return {
        id: SetRangeUnderlineCommand.id,
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON,
        icon: 'UnderlineSingle',
        title: 'Set underline',
        tooltip: 'toolbar.underline',
        positions: [MenuPosition.TOOLBAR_START],
        disabled$: getCurrentSheetDisabled$(accessor),
        activated$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id === SetRangeValuesMutation.id || id === SetSelectionsOperation.id) {
                    const primary = selectionManagerService.getLast()?.primary;
                    const worksheet = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();
                    let isUnderline;
                    if (primary != null) {
                        const range = worksheet.getRange(primary.startRow, primary.startColumn);
                        isUnderline = range?.getUnderline();
                    }

                    subscriber.next(!!(isUnderline && isUnderline.s));
                }

                if (
                    (id === SetTextSelectionsOperation.id || id === SetInlineFormatCommand.id) &&
                    contextService.getContextValue(EDITOR_ACTIVATED) &&
                    contextService.getContextValue(FOCUSING_SHEET)
                ) {
                    const textRun = getFontStyleAtCursor(accessor);

                    if (textRun == null) {
                        return;
                    }

                    const ul = textRun.ts?.ul;

                    subscriber.next(ul?.s === BooleanNumber.TRUE);
                }
            });

            subscriber.next(false);
            return disposable.dispose;
        }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.SHEET),
    };
}

export function StrikeThroughMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    const contextService = accessor.get(IContextService);

    return {
        id: SetRangeStrickThroughCommand.id,
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON,
        icon: 'StrikethroughSingle',
        title: 'Set strike through',
        tooltip: 'toolbar.strikethrough',
        positions: [MenuPosition.TOOLBAR_START],
        disabled$: getCurrentSheetDisabled$(accessor),
        activated$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id === SetRangeValuesMutation.id || id === SetSelectionsOperation.id) {
                    const primary = selectionManagerService.getLast()?.primary;
                    const worksheet = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();
                    let st;
                    if (primary != null) {
                        const range = worksheet.getRange(primary.startRow, primary.startColumn);
                        st = range?.getStrikeThrough();
                    }

                    subscriber.next(!!(st && st.s));
                }

                if (
                    (id === SetTextSelectionsOperation.id || id === SetInlineFormatCommand.id) &&
                    contextService.getContextValue(EDITOR_ACTIVATED) &&
                    contextService.getContextValue(FOCUSING_SHEET)
                ) {
                    const textRun = getFontStyleAtCursor(accessor);

                    if (textRun == null) {
                        return;
                    }

                    const st = textRun.ts?.st;

                    subscriber.next(st?.s === BooleanNumber.TRUE);
                }
            });

            subscriber.next(false);
            return disposable.dispose;
        }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.SHEET),
    };
}

export function FontFamilySelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);

    return {
        id: SetRangeFontFamilyCommand.id,
        tooltip: 'toolbar.font',
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.SELECTOR,
        label: FONT_FAMILY_COMPONENT,
        positions: [MenuPosition.TOOLBAR_START],
        selections: FONT_FAMILY_LIST.map((item) => ({
            label: {
                name: FONT_FAMILY_ITEM_COMPONENT,
                hoverable: true,
            },
            value: item.value,
        })),
        disabled$: getCurrentSheetDisabled$(accessor),
        value$: new Observable((subscriber) => {
            const defaultValue = FONT_FAMILY_LIST[0].value;

            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetRangeValuesMutation.id && id !== SetSelectionsOperation.id) {
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
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.SHEET),
    };
}

export function FontSizeSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<number> {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    const contextService = accessor.get(IContextService);

    const disabled$ = getCurrentSheetDisabled$(accessor);

    return {
        id: SetRangeFontSizeCommand.id,
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.SELECTOR,
        tooltip: 'toolbar.fontSize',
        label: {
            name: FONT_SIZE_COMPONENT,
            props: {
                min: 1,
                max: 400,
                disabled$,
            },
        },
        positions: [MenuPosition.TOOLBAR_START],
        selections: FONT_SIZE_LIST,
        disabled$,
        value$: new Observable((subscriber) => {
            const DEFAULT_SIZE = 14;
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id === SetRangeValuesMutation.id || id === SetSelectionsOperation.id) {
                    const primary = selectionManagerService.getLast()?.primary;
                    const worksheet = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet();
                    let fs;
                    if (primary != null) {
                        const range = worksheet.getRange(primary.startRow, primary.startColumn);
                        fs = range?.getFontSize();
                    }

                    subscriber.next(fs ?? DEFAULT_SIZE);
                }

                if (
                    (id === SetTextSelectionsOperation.id || id === SetInlineFormatCommand.id) &&
                    contextService.getContextValue(EDITOR_ACTIVATED) &&
                    contextService.getContextValue(FOCUSING_SHEET)
                ) {
                    const textRun = getFontStyleAtCursor(accessor);

                    if (textRun == null) {
                        return;
                    }

                    const fs = textRun.ts?.fs;

                    subscriber.next(fs ?? DEFAULT_SIZE);
                }
            });

            subscriber.next(DEFAULT_SIZE);

            return disposable.dispose;
        }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.SHEET),
    };
}

export function ResetTextColorMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: ResetTextColorCommand.id,
        type: MenuItemType.BUTTON,
        title: 'toolbar.resetColor',
        icon: 'NoColor',
        positions: SetRangeTextColorCommand.id,
        disabled$: getCurrentSheetDisabled$(accessor),
    };
}

export function TextColorSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const commandService = accessor.get(ICommandService);
    const themeService = accessor.get(ThemeService);

    return {
        id: SetRangeTextColorCommand.id,
        icon: 'FontColor',
        tooltip: 'toolbar.textColor.main',

        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON_SELECTOR,
        positions: [MenuPosition.TOOLBAR_START],
        selections: [
            {
                label: {
                    name: COLOR_PICKER_COMPONENT,
                    hoverable: false,
                },
            },
        ],
        value$: new Observable<string>((subscriber) => {
            const defaultColor = themeService.getCurrentTheme().textColor;
            const disposable = commandService.onCommandExecuted((c) => {
                if (c.id === SetRangeTextColorCommand.id) {
                    const color = (c.params as { value: string }).value;
                    subscriber.next(color ?? defaultColor);
                }
            });

            subscriber.next(defaultColor);
            return disposable.dispose;
        }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.SHEET),
        disabled$: getCurrentSheetDisabled$(accessor),
    };
}

export function ResetBackgroundColorMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: ResetBackgroundColorCommand.id,
        type: MenuItemType.BUTTON,
        title: 'toolbar.resetColor',
        icon: 'NoColor',
        positions: SetBackgroundColorCommand.id,
        disabled$: getCurrentSheetDisabled$(accessor),
    };
}

export function BackgroundColorSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const commandService = accessor.get(ICommandService);
    const themeService = accessor.get(ThemeService);

    return {
        id: SetBackgroundColorCommand.id,
        tooltip: 'toolbar.fillColor.main',
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON_SELECTOR,
        positions: [MenuPosition.TOOLBAR_START],
        icon: 'PaintBucket',
        selections: [
            {
                label: {
                    name: COLOR_PICKER_COMPONENT,
                    hoverable: false,
                },
            },
        ],
        value$: new Observable<string>((subscriber) => {
            const defaultColor = themeService.getCurrentTheme().primaryColor;
            const disposable = commandService.onCommandExecuted((c) => {
                if (c.id === SetBackgroundColorCommand.id) {
                    const color = (c.params as { value: string }).value;
                    subscriber.next(color ?? defaultColor);
                }
            });

            subscriber.next(defaultColor);
            return disposable.dispose;
        }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.SHEET),
        disabled$: getCurrentSheetDisabled$(accessor),
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
        group: MenuGroup.TOOLBAR_LAYOUT,
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
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.SHEET),
        disabled$: getCurrentSheetDisabled$(accessor),
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
        group: MenuGroup.TOOLBAR_LAYOUT,
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
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.SHEET),
        disabled$: getCurrentSheetDisabled$(accessor),
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
    const selectionManagerService = accessor.get(SelectionManagerService);
    const univerInstanceService = accessor.get(IUniverInstanceService);

    return {
        id: SetTextWrapCommand.id,
        tooltip: 'toolbar.textWrapMode.main',
        icon: TEXT_WRAP_CHILDREN[0].icon,
        group: MenuGroup.TOOLBAR_LAYOUT,
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
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.SHEET),
        disabled$: getCurrentSheetDisabled$(accessor),
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
    const selectionManagerService = accessor.get(SelectionManagerService);
    const univerInstanceService = accessor.get(IUniverInstanceService);

    return {
        id: SetTextRotationCommand.id,
        tooltip: 'toolbar.textRotateMode.main',
        icon: TEXT_ROTATE_CHILDREN[0].icon,
        group: MenuGroup.TOOLBAR_LAYOUT,
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

                if (tr?.v === BooleanNumber.TRUE) {
                    subscriber.next('v');
                } else {
                    subscriber.next((tr && tr.a) ?? 0);
                }
            });

            subscriber.next(0);

            return disposable.dispose;
        }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.SHEET),
        disabled$: getCurrentSheetDisabled$(accessor),
    };
}

// #region - copy cut paste
// TODO@wzhudev: maybe we should move these menu factory to @univerjs/ui

function menuClipboardDisabledObservable(injector: IAccessor): Observable<boolean> {
    return new Observable((subscriber) => subscriber.next(!injector.get(IClipboardInterfaceService).supportClipboard));
}

export function CopyMenuItemFactory(): IMenuButtonItem {
    return {
        id: CopyCommand.id,
        group: MenuGroup.CONTEXT_MENU_FORMAT,
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
        group: MenuGroup.CONTEXT_MENU_FORMAT,
        type: MenuItemType.BUTTON,
        title: 'contextMenu.cut',
        positions: [
            MenuPosition.CONTEXT_MENU,
            SheetMenuPosition.COL_HEADER_CONTEXT_MENU,
            SheetMenuPosition.ROW_HEADER_CONTEXT_MENU,
        ],
    };
}

export function PasteMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: PasteCommand.id,
        group: MenuGroup.CONTEXT_MENU_FORMAT,
        type: MenuItemType.BUTTON,
        title: 'rightClick.paste',
        icon: 'PasteSpecial',
        disabled$: menuClipboardDisabledObservable(accessor),
        positions: [
            MenuPosition.CONTEXT_MENU,
            SheetMenuPosition.COL_HEADER_CONTEXT_MENU,
            SheetMenuPosition.ROW_HEADER_CONTEXT_MENU,
        ],
    };
}

export const PASTE_SPECIAL_MENU_ID = 'sheet.menu.paste-special';
export function PasteSpacialMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    return {
        id: PASTE_SPECIAL_MENU_ID,
        group: MenuGroup.CONTEXT_MENU_FORMAT,
        type: MenuItemType.SUBITEMS,
        icon: 'PasteSpecial',
        title: 'rightClick.pasteSpecial',
        disabled$: menuClipboardDisabledObservable(accessor),
        positions: [
            MenuPosition.CONTEXT_MENU,
            SheetMenuPosition.COL_HEADER_CONTEXT_MENU,
            SheetMenuPosition.ROW_HEADER_CONTEXT_MENU,
        ],
    };
}

export function PasteValueMenuItemFactory(accessor: IAccessor): IMenuButtonItem<string> {
    return {
        id: SheetPasteValueCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.pasteValue',
        positions: [PASTE_SPECIAL_MENU_ID],
        disabled$: menuClipboardDisabledObservable(accessor),
    };
}

export function PasteFormatMenuItemFactory(accessor: IAccessor): IMenuButtonItem<string> {
    return {
        id: SheetPasteFormatCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.pasteFormat',
        positions: [PASTE_SPECIAL_MENU_ID],
        disabled$: menuClipboardDisabledObservable(accessor),
    };
}

export function PasteColWidthMenuItemFactory(accessor: IAccessor): IMenuButtonItem<string> {
    return {
        id: SheetPasteColWidthCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.pasteColWidth',
        positions: [PASTE_SPECIAL_MENU_ID],
        disabled$: menuClipboardDisabledObservable(accessor),
    };
}

export function PasteBesidesBorderMenuItemFactory(accessor: IAccessor): IMenuButtonItem<string> {
    return {
        id: SheetPasteBesidesBorderCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.pasteBesidesBorder',
        positions: [PASTE_SPECIAL_MENU_ID],
        disabled$: menuClipboardDisabledObservable(accessor),
    };
}

export function FitContentMenuItemFactory(): IMenuButtonItem {
    return {
        id: SetWorksheetRowIsAutoHeightCommand.id,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.ROW_HEADER_CONTEXT_MENU],
        icon: 'AutoHeight',
        title: 'rightClick.fitContent',
    };
}

export const SHEET_FROZEN_MENU_ID = 'sheet.menu.sheet-frozen';

export function SheetFrozenMenuItemFactory(): IMenuSelectorItem<string> {
    return {
        id: SHEET_FROZEN_MENU_ID,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.SUBITEMS,
        title: 'rightClick.freeze',
        icon: 'FreezeToSelectedSingle',
        positions: [MenuPosition.CONTEXT_MENU],
    };
}

export const SHEET_FROZEN_HEADER_MENU_ID = 'sheet.header-menu.sheet-frozen';

export function SheetFrozenHeaderMenuItemFactory(): IMenuSelectorItem<string> {
    return {
        id: SHEET_FROZEN_HEADER_MENU_ID,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.SUBITEMS,
        title: 'rightClick.freeze',
        icon: 'FreezeToSelectedSingle',
        positions: [SheetMenuPosition.ROW_HEADER_CONTEXT_MENU, SheetMenuPosition.COL_HEADER_CONTEXT_MENU],
    };
}

export function FrozenMenuItemFactory(): IMenuButtonItem {
    return {
        id: SetSelectionFrozenCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SHEET_FROZEN_MENU_ID, SHEET_FROZEN_HEADER_MENU_ID],
        title: 'rightClick.freeze',
        icon: 'FreezeToSelectedSingle',
    };
}

export function FrozenRowMenuItemFactory(): IMenuButtonItem {
    return {
        id: SetRowFrozenCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SHEET_FROZEN_MENU_ID],
        title: 'rightClick.freezeRow',
        icon: 'FreezeRowSingle',
    };
}

export function FrozenColMenuItemFactory(): IMenuButtonItem {
    return {
        id: SetColumnFrozenCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SHEET_FROZEN_MENU_ID],
        title: 'rightClick.freezeCol',
        icon: 'FreezeColumnSingle',
    };
}

export function CancelFrozenMenuItemFactory(): IMenuButtonItem {
    return {
        id: CancelFrozenCommand.id,
        type: MenuItemType.BUTTON,
        positions: [SHEET_FROZEN_MENU_ID, SHEET_FROZEN_HEADER_MENU_ID],
        title: 'rightClick.cancelFreeze',
        icon: 'CancelFreezeSingle',
    };
}

export function HideRowMenuItemFactory(): IMenuButtonItem {
    return {
        id: HideRowConfirmCommand.id,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.ROW_HEADER_CONTEXT_MENU],
        icon: 'Hide',
        title: 'rightClick.hideSelectedRow',
    };
}

export function HideColMenuItemFactory(): IMenuButtonItem {
    return {
        id: HideColConfirmCommand.id,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.BUTTON,
        positions: [SheetMenuPosition.COL_HEADER_CONTEXT_MENU],
        icon: 'Hide',
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
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
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

        if (!colRanges || colRanges.length === 0) {
            return false;
        }

        return !!colRanges.some((range) => {
            for (let r = range.startColumn; r <= range.endColumn; r++) {
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
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
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

export function SetRowHeightMenuItemFactory(accessor: IAccessor): IMenuButtonItem<number> {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);

    return {
        id: SetRowHeightCommand.id,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.BUTTON,
        icon: 'AdjustHeight',
        positions: [SheetMenuPosition.ROW_HEADER_CONTEXT_MENU],
        label: {
            name: MENU_ITEM_INPUT_COMPONENT,
            props: {
                prefix: 'rightClick.rowHeight',
                suffix: 'px',
                min: 2,
                max: 1000,
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
                if (id === SetRangeValuesMutation.id || id === SetSelectionsOperation.id) {
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
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.BUTTON,
        icon: 'AdjustWidth',
        positions: [SheetMenuPosition.COL_HEADER_CONTEXT_MENU],
        label: {
            name: MENU_ITEM_INPUT_COMPONENT,
            props: {
                prefix: 'rightClick.columnWidth',
                suffix: 'px',
                min: 2,
                max: 1000,
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
                if (id === SetRangeValuesMutation.id || id === SetSelectionsOperation.id) {
                    return update();
                }
            });

            update();
            return disposable.dispose;
        }),
    };
}

function getFontStyleAtCursor(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const textSelectionService = accessor.get(TextSelectionManagerService);
    const editorDataModel = univerInstanceService.getUniverDocInstance(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
    const activeTextRange = textSelectionService.getActiveRange();

    if (editorDataModel == null || activeTextRange == null) {
        return;
    }

    const textRuns = editorDataModel.getBody()?.textRuns;

    if (textRuns == null) {
        return;
    }

    const { startOffset } = activeTextRange;

    const textRun = textRuns.find(({ st, ed }) => startOffset >= st && startOffset <= ed);

    return textRun;
}
