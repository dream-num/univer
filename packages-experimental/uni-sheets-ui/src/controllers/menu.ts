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

import { BooleanNumber, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, EDITOR_ACTIVATED, FOCUSING_SHEET, FontItalic, FontWeight, ICommandService, IContextService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, SetTextSelectionsOperation } from '@univerjs/docs';
import { SetInlineFormatCommand } from '@univerjs/docs-ui';
import {
    RangeProtectionPermissionEditPoint,
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SetWorksheetActiveOperation,
    SheetsSelectionsService,
    WorkbookEditablePermission,
    WorksheetEditPermission,
    WorksheetSetCellStylePermission,
} from '@univerjs/sheets';
import { deriveStateFromActiveSheet$, getCurrentRangeDisable$ } from '@univerjs/sheets-ui';
import { getMenuHiddenObservable, type IMenuButtonItem, MenuItemType } from '@univerjs/ui';
import { Observable } from 'rxjs';
import type { IAccessor } from '@univerjs/core';

export const SHEET_BOLD_MUTATION_ID = 'sheet.command.uni-bold';
export const SHEET_ITALIC_MUTATION_ID = 'sheet.command.uni-italic';
export const SHEET_UNDERLINE_MUTATION_ID = 'sheet.command.uni-underline';
export const SHEET_STRIKE_MUTATION_ID = 'sheet.command.uni-strike';

export function SheetBoldMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const contextService = accessor.get(IContextService);
    const selectionManagerService = accessor.get(SheetsSelectionsService);

    return {
        id: SHEET_BOLD_MUTATION_ID,
        type: MenuItemType.BUTTON,
        icon: 'BoldSingle',
        title: 'Set bold',
        tooltip: 'toolbar.bold',
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

export function SheetItalicMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const contextService = accessor.get(IContextService);

    return {
        id: SHEET_ITALIC_MUTATION_ID,
        type: MenuItemType.BUTTON,
        icon: 'ItalicSingle',
        title: 'Set italic',
        tooltip: 'toolbar.italic',
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

export function SheetUnderlineMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const contextService = accessor.get(IContextService);

    return {
        id: SHEET_UNDERLINE_MUTATION_ID,
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
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function SheetStrikeThroughMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const commandService = accessor.get(ICommandService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const contextService = accessor.get(IContextService);

    return {
        id: SHEET_STRIKE_MUTATION_ID,
        type: MenuItemType.BUTTON,
        icon: 'StrikethroughSingle',
        title: 'Set strike through',
        tooltip: 'toolbar.strikethrough',
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

function getFontStyleAtCursor(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const textSelectionService = accessor.get(DocSelectionManagerService);

    const editorDataModel = univerInstanceService.getUniverDocInstance(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
    const activeTextRange = textSelectionService.getActiveRectRange();

    if (editorDataModel == null || activeTextRange == null) return null;

    const textRuns = editorDataModel.getBody()?.textRuns;
    if (textRuns == null) return;

    const { startOffset } = activeTextRange;
    const textRun = textRuns.find(({ st, ed }) => startOffset! >= st && startOffset! <= ed);
    return textRun;
}
