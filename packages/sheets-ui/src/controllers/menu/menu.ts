/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { IAccessor } from '@univerjs/core';
import type { IMenuButtonItem, IMenuSelectorItem } from '@univerjs/ui';
import {
    BooleanNumber,
    composeStyles,
    DEFAULT_STYLES,
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
import { DocSelectionManagerService, SetTextSelectionsOperation } from '@univerjs/docs';
import { SetInlineFormatCommand } from '@univerjs/docs-ui';
import {
    CancelFrozenCommand,
    RangeProtectionPermissionEditPoint,
    RangeProtectionPermissionViewPoint,
    ResetBackgroundColorCommand,
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
    SetWorksheetActiveOperation,
    SetWorksheetColWidthMutation,
    SetWorksheetRowIsAutoHeightCommand,
    SetWorksheetRowIsAutoHeightMutation,
    SheetsSelectionsService,
    WorkbookCopyPermission,
    WorkbookEditablePermission,
    WorksheetCopyPermission,
    WorksheetEditPermission,
    WorksheetSetCellStylePermission,
    WorksheetSetCellValuePermission,
    WorksheetSetColumnStylePermission,
    WorksheetSetRowStylePermission,
} from '@univerjs/sheets';
import {
    CutCommand,
    FONT_FAMILY_LIST,
    FONT_SIZE_LIST,
    getMenuHiddenObservable,
    IClipboardInterfaceService,
    MenuItemType,
} from '@univerjs/ui';
import { combineLatestWith, map, Observable } from 'rxjs';
import {
    SheetCopyCommand,
    SheetCutCommand,
    SheetPasteBesidesBorderCommand,
    SheetPasteColWidthCommand,
    SheetPasteCommand,
    SheetPasteFormatCommand,
    SheetPasteValueCommand,
} from '../../commands/commands/clipboard.command';
import { HideColConfirmCommand, HideRowConfirmCommand } from '../../commands/commands/hide-row-col-confirm.command';
import {
    ResetRangeTextColorCommand,
    SetRangeBoldCommand,
    SetRangeFontFamilyCommand,
    SetRangeFontSizeCommand,
    SetRangeItalicCommand,
    SetRangeStrickThroughCommand,
    SetRangeTextColorCommand,
    SetRangeUnderlineCommand,
} from '../../commands/commands/inline-format.command';
import { SetInfiniteFormatPainterCommand, SetOnceFormatPainterCommand } from '../../commands/commands/set-format-painter.command';
import { SetColumnFrozenCommand, SetRowFrozenCommand, SetSelectionFrozenCommand } from '../../commands/commands/set-frozen.command';
import { SetWorksheetColAutoWidthCommand } from '../../commands/commands/set-worksheet-auto-col-width.command';
import { COLOR_PICKER_COMPONENT } from '../../components/color-picker';
import { FONT_FAMILY_COMPONENT, FONT_FAMILY_ITEM_COMPONENT } from '../../components/font-family';
import { FONT_SIZE_COMPONENT } from '../../components/font-size';
import { MENU_ITEM_INPUT_COMPONENT } from '../../components/menu-item-input';
import { FormatPainterStatus, IFormatPainterService } from '../../services/format-painter/format-painter.service';
import { deriveStateFromActiveSheet$, getCurrentRangeDisable$, getObservableWithExclusiveRange$ } from './menu-util';

export enum SheetMenuPosition {
    ROW_HEADER_CONTEXT_MENU = 'ROW_HEADER_CONTEXT_MENU',
    COL_HEADER_CONTEXT_MENU = 'COL_HEADER_CONTEXT_MENU',
    SHEET_BAR = 'SHEET_BAR',
    SHEET_FOOTER = 'SHEET_FOOTER',
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
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetCopyPermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }, true),
    };
}

export function BoldMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const contextService = accessor.get(IContextService);
    const selectionManagerService = accessor.get(SheetsSelectionsService);

    return {
        id: SetRangeBoldCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'BoldSingle',
        title: 'Set bold',
        tooltip: 'toolbar.bold',
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }, true),
        activated$: deriveStateFromActiveSheet$(univerInstanceService, false, ({ worksheet }) => new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id === SetRangeValuesMutation.id || id === SetSelectionsOperation.id || id === SetWorksheetActiveOperation.id) {
                    const primary = selectionManagerService.getCurrentLastSelection()?.primary;
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

            const primary = selectionManagerService.getCurrentLastSelection()?.primary;
            if (!worksheet) {
                subscriber.next(false);
                return;
            }

            let isBold = FontWeight.NORMAL;
            if (primary != null) {
                const range = worksheet.getRange(primary.startRow, primary.startColumn);
                isBold = range?.getFontWeight();
            }
            subscriber.next(isBold === FontWeight.BOLD);

            return disposable.dispose;
        })),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function ItalicMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const contextService = accessor.get(IContextService);

    return {
        id: SetRangeItalicCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'ItalicSingle',
        title: 'Set italic',
        tooltip: 'toolbar.italic',
        disabled$: getCurrentRangeDisable$(
            accessor,
            {
                workbookTypes: [WorkbookEditablePermission],
                worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission],
                rangeTypes: [RangeProtectionPermissionEditPoint],
            },
            true
        ),
        activated$: deriveStateFromActiveSheet$(univerInstanceService, false, ({ worksheet }) => new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id === SetRangeValuesMutation.id || id === SetSelectionsOperation.id || id === SetWorksheetActiveOperation.id) {
                    const primary = selectionManagerService.getCurrentLastSelection()?.primary;
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
                    if (textRun == null) return;

                    const it = textRun.ts?.it;
                    subscriber.next(it === BooleanNumber.TRUE);
                }
            });

            const primary = selectionManagerService.getCurrentLastSelection()?.primary;
            let isItalic = FontItalic.NORMAL;
            if (primary != null) {
                const range = worksheet.getRange(primary.startRow, primary.startColumn);
                isItalic = range?.getFontStyle();
            }

            subscriber.next(isItalic === FontItalic.ITALIC);
            return disposable.dispose;
        })),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function UnderlineMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const contextService = accessor.get(IContextService);

    return {
        id: SetRangeUnderlineCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'UnderlineSingle',
        title: 'Set underline',
        tooltip: 'toolbar.underline',
        activated$: deriveStateFromActiveSheet$(univerInstanceService, false, ({ worksheet }) => new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id === SetRangeValuesMutation.id || id === SetSelectionsOperation.id || id === SetWorksheetActiveOperation.id) {
                    const primary = selectionManagerService.getCurrentLastSelection()?.primary;
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
                    if (textRun == null) return;

                    const ul = textRun.ts?.ul;
                    subscriber.next(ul?.s === BooleanNumber.TRUE);
                }
            });

            const primary = selectionManagerService.getCurrentLastSelection()?.primary;
            let isUnderline;
            if (primary != null) {
                const range = worksheet.getRange(primary.startRow, primary.startColumn);
                isUnderline = range?.getUnderline();
            }

            subscriber.next(!!(isUnderline && isUnderline.s));
            return disposable.dispose;
        })),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }, true),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function StrikeThroughMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const contextService = accessor.get(IContextService);

    return {
        id: SetRangeStrickThroughCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'StrikethroughSingle',
        title: 'Set strike through',
        tooltip: 'toolbar.strikethrough',
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }, true),
        activated$: deriveStateFromActiveSheet$(univerInstanceService, false, ({ worksheet }) => new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id === SetRangeValuesMutation.id || id === SetSelectionsOperation.id || id === SetWorksheetActiveOperation.id) {
                    const primary = selectionManagerService.getCurrentLastSelection()?.primary;
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

            const primary = selectionManagerService.getCurrentLastSelection()?.primary;
            let st;
            if (primary != null) {
                const range = worksheet.getRange(primary.startRow, primary.startColumn);
                st = range?.getStrikeThrough();
            }

            subscriber.next(!!(st && st.s));
            return disposable.dispose;
        })),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function FontFamilySelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SheetsSelectionsService);

    const defaultValue = DEFAULT_STYLES.ff;

    return {
        id: SetRangeFontFamilyCommand.id,
        tooltip: 'toolbar.font',
        type: MenuItemType.SELECTOR,
        label: FONT_FAMILY_COMPONENT,
        selections: FONT_FAMILY_LIST.map((item) => ({
            label: {
                name: FONT_FAMILY_ITEM_COMPONENT,
            },
            value: item.value,
        })),

        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }, true),
        value$: deriveStateFromActiveSheet$(univerInstanceService, defaultValue, ({ worksheet }) => new Observable((subscriber) => {
            const updateSheet = () => {
                let ff = defaultValue;

                const primary = selectionManagerService.getCurrentLastSelection()?.primary;
                if (primary != null) {
                    const cell = worksheet.getCellStyle(primary.startRow, primary.startColumn);
                    const defaultStyle = worksheet.getDefaultCellStyleInternal();
                    const rowStyle = worksheet.getRowStyle(primary.startRow);
                    const colStyle = worksheet.getColumnStyle(primary.startColumn);
                    const style = composeStyles(defaultStyle, rowStyle, colStyle, cell);
                    if (style.ff) {
                        ff = style.ff;
                    }
                }

                subscriber.next(ff);
            };

            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id === SetRangeValuesMutation.id || id === SetSelectionsOperation.id || id === SetWorksheetActiveOperation.id) {
                    updateSheet();
                }
            });

            updateSheet();
            return disposable.dispose;
        })),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function FontSizeSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<number> {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const contextService = accessor.get(IContextService);

    const defaultValue = DEFAULT_STYLES.fs;
    const disabled$ = getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }, true);

    return {
        id: SetRangeFontSizeCommand.id,
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
        selections: FONT_SIZE_LIST,
        disabled$,
        value$: deriveStateFromActiveSheet$(univerInstanceService, defaultValue, ({ worksheet }) => new Observable((subscriber) => {
            const updateSheet = () => {
                let fs = defaultValue;
                const primary = selectionManagerService.getCurrentLastSelection()?.primary;
                if (primary != null) {
                    const style = worksheet.getComposedCellStyle(primary.startRow, primary.startColumn);
                    if (style.fs) {
                        fs = style.fs;
                    }
                }
                subscriber.next(fs);
            };

            const updateSheetEditor = () => {
                const textRun = getFontStyleAtCursor(accessor);
                if (textRun != null) {
                    const fs = textRun.ts?.fs ?? defaultValue;
                    subscriber.next(fs);
                }
            };

            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id === SetRangeValuesMutation.id || id === SetSelectionsOperation.id || id === SetWorksheetActiveOperation.id) {
                    updateSheet();
                }

                if (
                    (id === SetTextSelectionsOperation.id || id === SetInlineFormatCommand.id) &&
                    contextService.getContextValue(EDITOR_ACTIVATED) &&
                    contextService.getContextValue(FOCUSING_SHEET)
                ) {
                    updateSheetEditor();
                }
            });

            updateSheet();
            return disposable.dispose;
        })),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function ResetTextColorMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: ResetRangeTextColorCommand.id,
        type: MenuItemType.BUTTON,
        title: 'toolbar.resetColor',
        icon: 'NoColor',
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }, true),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function TextColorSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const commandService = accessor.get(ICommandService);
    const themeService = accessor.get(ThemeService);

    return {
        id: SetRangeTextColorCommand.id,
        icon: 'FontColor',
        tooltip: 'toolbar.textColor.main',
        type: MenuItemType.BUTTON_SELECTOR,
        selections: [
            {
                label: {
                    name: COLOR_PICKER_COMPONENT,
                    hoverable: false,
                    selectable: false,
                },
            },
        ],
        value$: new Observable<string>((subscriber) => {
            const defaultValue = themeService.getColorFromTheme('gray.900');
            const disposable = commandService.onCommandExecuted((c) => {
                if (c.id === SetRangeTextColorCommand.id) {
                    const color = (c.params as { value: string }).value;
                    subscriber.next(color ?? defaultValue);
                }
            });

            subscriber.next(defaultValue);
            return disposable.dispose;
        }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }, true),
    };
}

export function ResetBackgroundColorMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: ResetBackgroundColorCommand.id,
        type: MenuItemType.BUTTON,
        title: 'toolbar.resetColor',
        icon: 'NoColor',
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
    };
}

export function BackgroundColorSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const commandService = accessor.get(ICommandService);
    const themeService = accessor.get(ThemeService);

    return {
        id: SetBackgroundColorCommand.id,
        tooltip: 'toolbar.fillColor.main',
        type: MenuItemType.BUTTON_SELECTOR,
        icon: 'PaintBucket',
        selections: [
            {
                label: {
                    name: COLOR_PICKER_COMPONENT,
                    hoverable: false,
                    selectable: false,
                },
            },
        ],
        value$: new Observable<string>((subscriber) => {
            const defaultValue = themeService.getColorFromTheme('primary.600');
            const disposable = commandService.onCommandExecuted((c) => {
                if (c.id === SetBackgroundColorCommand.id) {
                    const color = (c.params as { value: string }).value;
                    subscriber.next(color ?? defaultValue);
                }
            });

            subscriber.next(defaultValue);
            return disposable.dispose;
        }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
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
    const selectionManagerService = accessor.get(SheetsSelectionsService);

    const defaultValue = HorizontalAlign.LEFT;

    return {
        id: SetHorizontalTextAlignCommand.id,
        icon: HORIZONTAL_ALIGN_CHILDREN[0].icon,
        tooltip: 'toolbar.horizontalAlignMode.main',
        type: MenuItemType.SELECTOR,
        selections: HORIZONTAL_ALIGN_CHILDREN,
        value$: deriveStateFromActiveSheet$(univerInstanceService, defaultValue, ({ worksheet }) => new Observable<HorizontalAlign>((subscriber) => {
            const disposable = accessor.get(ICommandService).onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetHorizontalTextAlignCommand.id && id !== SetSelectionsOperation.id && id !== SetWorksheetActiveOperation.id) {
                    return;
                }

                const primary = selectionManagerService.getCurrentLastSelection()?.primary;
                let ha;
                if (primary != null) {
                    const range = worksheet.getRange(primary.startRow, primary.startColumn);
                    ha = range?.getHorizontalAlignment();
                }

                subscriber.next(ha ?? defaultValue);
            });

            const primary = selectionManagerService.getCurrentLastSelection()?.primary;
            let ha;
            if (primary != null) {
                const range = worksheet.getRange(primary.startRow, primary.startColumn);
                ha = range?.getHorizontalAlignment();
            }

            subscriber.next(ha ?? defaultValue);

            return disposable.dispose;
        })),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
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
    const selectionManagerService = accessor.get(SheetsSelectionsService);

    const defaultValue = VerticalAlign.BOTTOM;

    return {
        id: SetVerticalTextAlignCommand.id,
        icon: VERTICAL_ALIGN_CHILDREN[2].icon,
        tooltip: 'toolbar.verticalAlignMode.main',
        type: MenuItemType.SELECTOR,
        selections: VERTICAL_ALIGN_CHILDREN,
        value$: deriveStateFromActiveSheet$(univerInstanceService, defaultValue, ({ worksheet }) => new Observable<VerticalAlign>((subscriber) => {
            const disposable = accessor.get(ICommandService).onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetVerticalTextAlignCommand.id && id !== SetSelectionsOperation.id && id !== SetWorksheetActiveOperation.id) {
                    return;
                }

                const primary = selectionManagerService.getCurrentLastSelection()?.primary;
                let va;
                if (primary != null) {
                    const range = worksheet.getRange(primary.startRow, primary.startColumn);
                    va = range?.getVerticalAlignment();
                }

                subscriber.next(va ?? defaultValue);
            });

            const primary = selectionManagerService.getCurrentLastSelection()?.primary;
            let va;
            if (primary != null) {
                const range = worksheet.getRange(primary.startRow, primary.startColumn);
                va = range?.getVerticalAlignment();
            }

            subscriber.next(va ?? defaultValue);

            return disposable.dispose;
        })),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
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
    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const univerInstanceService = accessor.get(IUniverInstanceService);

    const defaultValue = WrapStrategy.OVERFLOW;

    return {
        id: SetTextWrapCommand.id,
        tooltip: 'toolbar.textWrapMode.main',
        icon: TEXT_WRAP_CHILDREN[0].icon,
        type: MenuItemType.SELECTOR,
        selections: TEXT_WRAP_CHILDREN,
        value$: deriveStateFromActiveSheet$<WrapStrategy>(univerInstanceService, defaultValue, ({ worksheet }) => new Observable((subscriber) => {
            const disposable = accessor.get(ICommandService).onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetTextWrapCommand.id && id !== SetSelectionsOperation.id && id !== SetWorksheetActiveOperation.id) {
                    return;
                }

                const primary = selectionManagerService.getCurrentLastSelection()?.primary;
                let ws;
                if (primary != null) {
                    const range = worksheet.getRange(primary.startRow, primary.startColumn);
                    ws = range?.getWrapStrategy();
                }

                subscriber.next(ws ?? defaultValue);
            });

            const primary = selectionManagerService.getCurrentLastSelection()?.primary;
            let ws;
            if (primary != null) {
                const range = worksheet.getRange(primary.startRow, primary.startColumn);
                ws = range?.getWrapStrategy();
            }

            subscriber.next(ws ?? defaultValue);

            return disposable.dispose;
        })),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
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
    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const univerInstanceService = accessor.get(IUniverInstanceService);

    const defaultValue = 0;

    return {
        id: SetTextRotationCommand.id,
        tooltip: 'toolbar.textRotateMode.main',
        icon: TEXT_ROTATE_CHILDREN[0].icon,
        type: MenuItemType.SELECTOR,
        selections: TEXT_ROTATE_CHILDREN,
        value$: deriveStateFromActiveSheet$(univerInstanceService, defaultValue, ({ worksheet }) => new Observable<number | string>((subscriber) => {
            const disposable = accessor.get(ICommandService).onCommandExecuted((c) => {
                const id = c.id;
                if (id !== SetTextRotationCommand.id && id !== SetSelectionsOperation.id && id !== SetWorksheetActiveOperation.id) {
                    return;
                }

                const primary = selectionManagerService.getCurrentLastSelection()?.primary;
                let tr;
                if (primary != null) {
                    const range = worksheet.getRange(primary.startRow, primary.startColumn);
                    tr = range?.getTextRotation();
                }

                if (tr?.v === BooleanNumber.TRUE) {
                    subscriber.next('v');
                } else {
                    subscriber.next((tr && tr.a) ?? defaultValue);
                }
            });

            const primary = selectionManagerService.getCurrentLastSelection()?.primary;
            let tr;
            if (primary != null) {
                const range = worksheet.getRange(primary.startRow, primary.startColumn);
                tr = range?.getTextRotation();
            }

            if (tr?.v === BooleanNumber.TRUE) {
                subscriber.next('v');
            } else {
                subscriber.next((tr && tr.a) ?? defaultValue);
            }

            return disposable.dispose;
        })),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
    };
}

// #region - copy cut paste
// TODO@wzhudev: maybe we should move these menu factory to @univerjs/ui

function menuClipboardDisabledObservable(injector: IAccessor): Observable<boolean> {
    const clipboardDisabled$: Observable<boolean> = new Observable((subscriber) => subscriber.next(!injector.get(IClipboardInterfaceService).supportClipboard));
    return clipboardDisabled$;
}

export function CopyMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: SheetCopyCommand.name,
        commandId: SheetCopyCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.copy',
        icon: 'Copy',
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookCopyPermission], worksheetTypes: [WorksheetCopyPermission], rangeTypes: [RangeProtectionPermissionViewPoint] }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function CutMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: SheetCutCommand.name,
        commandId: CutCommand.id,
        type: MenuItemType.BUTTON,
        title: 'contextMenu.cut',
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], rangeTypes: [RangeProtectionPermissionEditPoint], worksheetTypes: [WorksheetCopyPermission, WorksheetEditPermission] }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function PasteMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: SheetPasteCommand.name,
        commandId: SheetPasteCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.paste',
        icon: 'PasteSpecial',
        disabled$: menuClipboardDisabledObservable(accessor).pipe(
            combineLatestWith(getCurrentRangeDisable$(accessor, { rangeTypes: [RangeProtectionPermissionEditPoint], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission, WorksheetSetCellValuePermission], workbookTypes: [WorkbookEditablePermission] })),
            map(([d1, d2]) => d1 || d2)
        ),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export const PASTE_SPECIAL_MENU_ID = 'sheet.menu.paste-special';
export function PasteSpacialMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    return {
        id: PASTE_SPECIAL_MENU_ID,
        type: MenuItemType.SUBITEMS,
        icon: 'PasteSpecial',
        title: 'rightClick.pasteSpecial',
        hidden$: getObservableWithExclusiveRange$(accessor, getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET)),
    };
}

export function PasteValueMenuItemFactory(accessor: IAccessor): IMenuButtonItem<string> {
    return {
        id: SheetPasteValueCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.pasteValue',
        disabled$: menuClipboardDisabledObservable(accessor).pipe(
            combineLatestWith(getCurrentRangeDisable$(accessor, { rangeTypes: [RangeProtectionPermissionEditPoint], worksheetTypes: [WorksheetSetCellValuePermission, WorksheetEditPermission], workbookTypes: [WorkbookEditablePermission] })),
            map(([d1, d2]) => d1 || d2)
        ),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function PasteFormatMenuItemFactory(accessor: IAccessor): IMenuButtonItem<string> {
    return {
        id: SheetPasteFormatCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.pasteFormat',
        disabled$: menuClipboardDisabledObservable(accessor).pipe(
            combineLatestWith(getCurrentRangeDisable$(accessor, { rangeTypes: [RangeProtectionPermissionEditPoint], worksheetTypes: [WorksheetSetCellStylePermission, WorksheetEditPermission], workbookTypes: [WorkbookEditablePermission] })),
            map(([d1, d2]) => d1 || d2)
        ),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function PasteColWidthMenuItemFactory(accessor: IAccessor): IMenuButtonItem<string> {
    return {
        id: SheetPasteColWidthCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.pasteColWidth',
        disabled$: menuClipboardDisabledObservable(accessor).pipe(
            combineLatestWith(getCurrentRangeDisable$(accessor, { rangeTypes: [RangeProtectionPermissionEditPoint], worksheetTypes: [WorksheetSetColumnStylePermission, WorksheetEditPermission], workbookTypes: [WorkbookEditablePermission] })),
            map(([d1, d2]) => d1 || d2)
        ),
    };
}

export function PasteBesidesBorderMenuItemFactory(accessor: IAccessor): IMenuButtonItem<string> {
    return {
        id: SheetPasteBesidesBorderCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.pasteBesidesBorder',
        disabled$: menuClipboardDisabledObservable(accessor).pipe(
            combineLatestWith(getCurrentRangeDisable$(accessor, { rangeTypes: [RangeProtectionPermissionEditPoint], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission, WorksheetSetCellValuePermission, WorksheetSetRowStylePermission, WorksheetSetColumnStylePermission], workbookTypes: [WorkbookEditablePermission] })),
            map(([d1, d2]) => d1 || d2)
        ),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function FitContentMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: SetWorksheetRowIsAutoHeightCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'AutoHeight',
        title: 'rightClick.fitContent',
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetSetRowStylePermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function ColAutoWidthMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: SetWorksheetColAutoWidthCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'AutoWidth',
        title: 'rightClick.fitContent',
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetSetRowStylePermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export const SHEET_FROZEN_MENU_ID = 'sheet.menu.sheet-frozen';

export function SheetFrozenMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: SHEET_FROZEN_MENU_ID,
        type: MenuItemType.SUBITEMS,
        title: 'rightClick.freeze',
        icon: 'FreezeToSelectedSingle',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export const SHEET_FROZEN_HEADER_MENU_ID = 'sheet.header-menu.sheet-frozen';

export function SheetFrozenHeaderMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: SHEET_FROZEN_HEADER_MENU_ID,
        type: MenuItemType.SUBITEMS,
        title: 'rightClick.freeze',
        icon: 'FreezeToSelectedSingle',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function FrozenMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: SetSelectionFrozenCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.freeze',
        icon: 'FreezeToSelectedSingle',
        // disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function FrozenRowMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: SetRowFrozenCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.freezeRow',
        icon: 'FreezeRowSingle',
        // disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function FrozenColMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: SetColumnFrozenCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.freezeCol',
        icon: 'FreezeColumnSingle',
        // disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function CancelFrozenMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: CancelFrozenCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.cancelFreeze',
        icon: 'CancelFreezeSingle',
        // disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function HideRowMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: HideRowConfirmCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'Hide',
        title: 'rightClick.hideSelectedRow',
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetSetRowStylePermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function HideColMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: HideColConfirmCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'Hide',
        title: 'rightClick.hideSelectedColumn',
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetColumnStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function ShowRowMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SheetsSelectionsService);

    const commandService = accessor.get(ICommandService);

    const affectedCommands = [SetSelectionsOperation, SetRowHiddenMutation, SetRowVisibleMutation].map((c) => c.id);

    return {
        id: SetSelectedRowsVisibleCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'EyeOutlineSingle',
        title: 'rightClick.showHideRow',
        hidden$: deriveStateFromActiveSheet$(univerInstanceService, true, ({ worksheet }) => new Observable((subscriber) => {
            function hasHiddenRowsInSelections(): boolean {
                const rowRanges = selectionManagerService.getCurrentSelections()?.map((s) => s.range).filter((r) => r.rangeType === RANGE_TYPE.ROW);
                return !!rowRanges?.some((range) => {
                    for (let r = range.startRow; r <= range.endRow; r++) {
                        if (!worksheet.getRowRawVisible(r)) return true; // should not take filtered out rows into account
                    }

                    return false;
                });
            }

            const disposable = commandService.onCommandExecuted((command) => {
                if (affectedCommands.findIndex((c) => c === command.id) !== -1) subscriber.next(!hasHiddenRowsInSelections());
            });

            // it only shows when selected area has hidden rows
            subscriber.next(!hasHiddenRowsInSelections());
            return () => disposable.dispose();
        })),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetRowStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
    };
}

export function ShowColMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const commandService = accessor.get(ICommandService);
    const affectedCommands = [SetSelectionsOperation, SetColHiddenMutation, SetColVisibleMutation].map((c) => c.id);

    return {
        id: SetSelectedColsVisibleCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'EyeOutlineSingle',
        title: 'rightClick.showHideColumn',
        hidden$: deriveStateFromActiveSheet$(univerInstanceService, true, ({ worksheet }) => new Observable((subscriber) => {
            function hasHiddenColsInSelections(): boolean {
                const colRanges = selectionManagerService.getCurrentSelections()?.map((s) => s.range).filter((r) => r.rangeType === RANGE_TYPE.COLUMN);
                if (!colRanges || colRanges.length === 0) return false;

                return !!colRanges.some((range) => {
                    for (let r = range.startColumn; r <= range.endColumn; r++) {
                        if (!worksheet.getColVisible(r)) return true;
                    }

                    return false;
                });
            }

            const disposable = commandService.onCommandExecuted((commandInfo) => {
                if (affectedCommands.findIndex((c) => c === commandInfo.id) !== -1) subscriber.next(!hasHiddenColsInSelections());
            });

            subscriber.next(!hasHiddenColsInSelections());
            return () => disposable.dispose();
        })),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetSetColumnStylePermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
    };
}

export function SetRowHeightMenuItemFactory(accessor: IAccessor): IMenuButtonItem<number> {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SheetsSelectionsService);

    const defaultValue = 0;

    return {
        id: SetRowHeightCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'AdjustHeight',
        label: {
            name: MENU_ITEM_INPUT_COMPONENT,
            props: {
                prefix: 'rightClick.rowHeight',
                suffix: 'px',
                min: 2,
                max: 1000,
            },
        },
        value$: deriveStateFromActiveSheet$(univerInstanceService, defaultValue, ({ worksheet }) => new Observable((subscriber) => {
            function update() {
                const primary = selectionManagerService.getCurrentLastSelection()?.primary;
                const rowHeight = primary ? worksheet.getRowHeight(primary.startRow) : defaultValue;
                subscriber.next(rowHeight);
            }

            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id === SetRangeValuesMutation.id || id === SetSelectionsOperation.id || id === SetWorksheetRowIsAutoHeightMutation.id) {
                    return update();
                }
            });

            update();
            return disposable.dispose;
        })),
        hidden$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetRowStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
    };
}

export function SetColWidthMenuItemFactory(accessor: IAccessor): IMenuButtonItem<number> {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SheetsSelectionsService);

    const defaultValue = 0;

    return {
        id: SetColWidthCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'AdjustWidth',
        label: {
            name: MENU_ITEM_INPUT_COMPONENT,
            props: {
                prefix: 'rightClick.columnWidth',
                suffix: 'px',
                min: 2,
                max: 1000,
            },
        },
        value$: deriveStateFromActiveSheet$(univerInstanceService, defaultValue, ({ worksheet }) => new Observable((subscriber) => {
            function update() {
                const primary = selectionManagerService.getCurrentLastSelection()?.primary;
                let colWidth: number = defaultValue;
                if (primary != null) {
                    colWidth = worksheet.getColumnWidth(primary.startColumn);
                }

                subscriber.next(colWidth);
            }

            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;
                if (id === SetRangeValuesMutation.id || id === SetSelectionsOperation.id || id === SetWorksheetColWidthMutation.id) {
                    return update();
                }
            });

            update();
            return disposable.dispose;
        })),
        hidden$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetColumnStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
    };
}

function getFontStyleAtCursor(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const textSelectionService = accessor.get(DocSelectionManagerService);

    const editorDataModel = univerInstanceService.getUniverDocInstance(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
    const activeTextRange = textSelectionService.getActiveTextRange();

    if (editorDataModel == null || activeTextRange == null) return null;

    const textRuns = editorDataModel.getBody()?.textRuns;
    if (textRuns == null) return;

    const { startOffset } = activeTextRange;
    const textRun = textRuns.find(({ st, ed }) => startOffset >= st && startOffset <= ed);
    return textRun;
}
