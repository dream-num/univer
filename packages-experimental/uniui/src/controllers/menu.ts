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

import { BooleanNumber, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, EDITOR_ACTIVATED, FOCUSING_SHEET, FontItalic, FontWeight, type IAccessor, ICommandService, IContextService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { SetInlineFormatCommand, SetTextSelectionsOperation, TextSelectionManagerService } from '@univerjs/docs';
import { RangeProtectionPermissionEditPoint, SetRangeValuesMutation, SetSelectionsOperation, SetWorksheetActiveOperation, SheetsSelectionsService, WorkbookEditablePermission, WorksheetEditPermission, WorksheetSetCellStylePermission } from '@univerjs/sheets';
import { deriveStateFromActiveSheet$, FONT_FAMILY_COMPONENT, FONT_SIZE_COMPONENT, getCurrentRangeDisable$ } from '@univerjs/sheets-ui';
import { getMenuHiddenObservable, type IMenuButtonItem, type IMenuItem, type IMenuSelectorItem, MenuGroup, MenuItemType, MenuPosition } from '@univerjs/ui';
import { map, Observable } from 'rxjs';
import { DisposeUnitOperation } from '../commands/operations/uni.operation';

export const UNIT_LINE_COLOR_MENU_ID = 'UNIT_LINE_COLOR_MENU_ID';
export const DOWNLOAD_MENU_ID = 'DOWNLOAD_MENU_ID';
export const SHARE_MENU_ID = 'SHARE_MENU_ID';
export const LOCK_MENU_ID = 'LOCK_MENU_ID';
export const PRINT_MENU_ID = 'PRINT_MENU_ID';
export const ZEN_MENU_ID = 'ZEN_MENU_ID';
export const DELETE_MENU_ID = DisposeUnitOperation.id;
export const FRAME_SIZE_MENU_ID = 'FRAME_SIZE_MENU_ID';

export const FONT_GROUP_MENU_ID = 'FONT_GROUP_MENU_ID';
export const SHEET_BOLD_MUTATION_ID = 'sheet.command.uni-bold';
export const SHEET_ITALIC_MUTATION_ID = 'sheet.command.uni-italic';
export const SHEET_UNDERLINE_MUTATION_ID = 'sheet.command.uni-underline';
export const SHEET_STRIKE_MUTATION_ID = 'sheet.command.uni-strike';

export const DOC_ITALIC_MUTATION_ID = 'doc.command.uni-italic';
export const DOC_BOLD_MUTATION_ID = 'doc.command.uni-bold';
export const DOC_UNDERLINE_MUTATION_ID = 'doc.command.uni-underline';
export const DOC_STRIKE_MUTATION_ID = 'doc.command.uni-strike';

export const FAKE_FONT_FAMILY_MENU_ID = 'FAKE_FONT_FAMILY_MENU_ID';
export const FAKE_FONT_SIZE_MENU_ID = 'FAKE_FONT_SIZE_MENU_ID';
export const FAKE_FONT_COLOR_MENU_ID = 'FAKE_FONT_COLOR_MENU_ID';
export const FAKE_BG_COLOR_MENU_ID = 'FAKE_BG_COLOR_MENU_ID';
export const FAKE_IMAGE_MENU_ID = 'FAKE_IMAGE_MENU_ID';

export enum UNI_MENU_POSITIONS {
    TOOLBAR_MAIN = 'toolbar_main',
    TOOLBAR_FLOAT = 'toolbar_float',
}

export function FakeFontFamilySelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: FAKE_FONT_FAMILY_MENU_ID,
        tooltip: 'toolbar.font',
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.SELECTOR,
        label: FONT_FAMILY_COMPONENT,
        positions: [MenuPosition.TOOLBAR_START],
        selections: [],
        disabled$: new Observable((subscriber) => { subscriber.next(true); }),
    };
}

export function FakeFontSizeSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<number> {
    return {
        id: FAKE_FONT_SIZE_MENU_ID,
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.SELECTOR,
        tooltip: 'toolbar.fontSize',
        label: {
            name: FONT_SIZE_COMPONENT,
            props: {
                min: 1,
                max: 400,
            },
        },
        positions: [MenuPosition.TOOLBAR_START],
        selections: [],
        disabled$: new Observable((subscriber) => { subscriber.next(true); }),
    };
}

export function FakeTextColorSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: FAKE_FONT_COLOR_MENU_ID,
        icon: 'FontColor',
        tooltip: 'toolbar.textColor.main',

        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON_SELECTOR,
        positions: [MenuPosition.TOOLBAR_START],
        selections: [],
        disabled$: new Observable((subscriber) => { subscriber.next(true); }),
    };
}

export function FakeBackgroundColorSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: FAKE_BG_COLOR_MENU_ID,
        tooltip: 'toolbar.fillColor.main',
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON_SELECTOR,
        positions: [MenuPosition.TOOLBAR_START],
        icon: 'PaintBucket',
        selections: [],
        disabled$: new Observable((subscriber) => { subscriber.next(true); }),
    };
}

export function FakeImageMenuFactory(accessor: IAccessor): IMenuItem {
    return {
        id: FAKE_IMAGE_MENU_ID,
        type: MenuItemType.SUBITEMS,
        positions: [MenuPosition.TOOLBAR_START],
        group: MenuGroup.TOOLBAR_FORMULAS_INSERT,
        icon: 'addition-and-subtraction-single',
        tooltip: 'sheetImage.title',
        disabled$: new Observable((subscriber) => { subscriber.next(true); }),
    };
}

export function FontGroupMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    return {
        id: FONT_GROUP_MENU_ID,
        type: MenuItemType.SUBITEMS,
        title: '',
        icon: 'BoldSingle',
        positions: [MenuPosition.TOOLBAR_START],
        disabled$: univerInstanceService.focused$.pipe(map((focused) => !focused)),
    };
}

export function SheetBoldMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const contextService = accessor.get(IContextService);
    const selectionManagerService = accessor.get(SheetsSelectionsService);

    return {
        id: SHEET_BOLD_MUTATION_ID,
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON,
        icon: 'BoldSingle',
        title: 'Set bold',
        tooltip: 'toolbar.bold',
        positions: [FONT_GROUP_MENU_ID],
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
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

export function DocBoldMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);

    return {
        id: DOC_BOLD_MUTATION_ID,
        type: MenuItemType.BUTTON,
        icon: 'BoldSingle',
        title: 'Set bold',
        tooltip: 'toolbar.bold',
        positions: [FONT_GROUP_MENU_ID],
        activated$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;

                if (id === SetTextSelectionsOperation.id || id === SetInlineFormatCommand.id) {
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
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function SheetItalicMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const contextService = accessor.get(IContextService);

    return {
        id: SHEET_ITALIC_MUTATION_ID,
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON,
        icon: 'ItalicSingle',
        title: 'Set italic',
        tooltip: 'toolbar.italic',
        positions: [FONT_GROUP_MENU_ID],
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
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

export function DocItalicMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);

    return {
        id: DOC_ITALIC_MUTATION_ID,
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON,
        icon: 'ItalicSingle',
        title: 'Set italic',
        tooltip: 'toolbar.italic',
        positions: [FONT_GROUP_MENU_ID],
        activated$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;

                if (id === SetTextSelectionsOperation.id || id === SetInlineFormatCommand.id) {
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
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function SheetUnderlineMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const contextService = accessor.get(IContextService);

    return {
        id: SHEET_UNDERLINE_MUTATION_ID,
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON,
        icon: 'UnderlineSingle',
        title: 'Set underline',
        tooltip: 'toolbar.underline',
        positions: [FONT_GROUP_MENU_ID],
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
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function DocUnderlineMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);

    return {
        id: DOC_UNDERLINE_MUTATION_ID,
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON,
        icon: 'UnderlineSingle',
        title: 'Set underline',
        tooltip: 'toolbar.underline',
        positions: [FONT_GROUP_MENU_ID],
        activated$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;

                if (id === SetTextSelectionsOperation.id || id === SetInlineFormatCommand.id) {
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
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function SheetStrikeThroughMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const contextService = accessor.get(IContextService);

    return {
        id: SHEET_STRIKE_MUTATION_ID,
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON,
        icon: 'StrikethroughSingle',
        title: 'Set strike through',
        tooltip: 'toolbar.strikethrough',
        positions: [FONT_GROUP_MENU_ID],
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
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

export function DocStrikeThroughMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);

    return {
        id: DOC_STRIKE_MUTATION_ID,
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON,
        icon: 'StrikethroughSingle',
        title: 'Set strike through',
        tooltip: 'toolbar.strikethrough',
        positions: [FONT_GROUP_MENU_ID],
        activated$: new Observable<boolean>((subscriber) => {
            const disposable = commandService.onCommandExecuted((c) => {
                const id = c.id;

                if (id === SetTextSelectionsOperation.id || id === SetInlineFormatCommand.id) {
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
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC),
    };
}

export function UnitLineColorMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: UNIT_LINE_COLOR_MENU_ID,
        type: MenuItemType.BUTTON,
        title: '',
        icon: '',
        positions: [
            UNI_MENU_POSITIONS.TOOLBAR_FLOAT,
        ],

    };
}

export function DownloadMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: DOWNLOAD_MENU_ID,
        type: MenuItemType.BUTTON,
        group: MenuGroup.TOOLBAR_OTHERS,
        title: '',
        icon: 'DownloadSingle',
        positions: [
            UNI_MENU_POSITIONS.TOOLBAR_FLOAT,
        ],

    };
}

export function ShareMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: SHARE_MENU_ID,
        type: MenuItemType.BUTTON,
        group: MenuGroup.TOOLBAR_OTHERS,
        title: '',
        icon: 'ShareSingle',
        positions: [
            UNI_MENU_POSITIONS.TOOLBAR_FLOAT,
        ],

    };
}

export function LockMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: LOCK_MENU_ID,
        type: MenuItemType.BUTTON,
        group: MenuGroup.TOOLBAR_OTHERS,
        title: '',
        icon: 'LockSingle',
        positions: [
            UNI_MENU_POSITIONS.TOOLBAR_FLOAT,
        ],
    };
}

export function PrintMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: PRINT_MENU_ID,
        type: MenuItemType.BUTTON,
        group: MenuGroup.TOOLBAR_OTHERS,
        title: '',
        icon: 'PrintSingle',
        positions: [
            UNI_MENU_POSITIONS.TOOLBAR_FLOAT,
        ],

    };
}

export function ZenMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: ZEN_MENU_ID,
        type: MenuItemType.BUTTON,
        title: '',
        icon: 'ZenSingle',
        group: MenuGroup.TOOLBAR_OTHERS,
        positions: [
            UNI_MENU_POSITIONS.TOOLBAR_FLOAT,
        ],
    };
}

export function DeleteMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: DELETE_MENU_ID,
        type: MenuItemType.BUTTON,
        title: 'Delete',
        icon: 'DeleteSingle',
        group: MenuGroup.TOOLBAR_OTHERS,
        positions: [
            UNI_MENU_POSITIONS.TOOLBAR_FLOAT,
        ],
    };
}

function getFontStyleAtCursor(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const textSelectionService = accessor.get(TextSelectionManagerService);

    const editorDataModel = univerInstanceService.getUniverDocInstance(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
    const activeTextRange = textSelectionService.getActiveRange();

    if (editorDataModel == null || activeTextRange == null) return null;

    const textRuns = editorDataModel.getBody()?.textRuns;
    if (textRuns == null) return;

    const { startOffset } = activeTextRange;
    const textRun = textRuns.find(({ st, ed }) => startOffset >= st && startOffset <= ed);
    return textRun;
}

