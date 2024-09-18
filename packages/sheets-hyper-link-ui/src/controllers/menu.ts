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

import { DOCS_ZEN_EDITOR_UNIT_ID_KEY, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { getSheetCommandTarget, RangeProtectionPermissionEditPoint, SheetsSelectionsService, WorkbookEditablePermission, WorksheetEditPermission, WorksheetInsertHyperlinkPermission, WorksheetSetCellValuePermission } from '@univerjs/sheets';
import { getCurrentRangeDisable$, IEditorBridgeService, whenSheetEditorFocused } from '@univerjs/sheets-ui';
import { getMenuHiddenObservable, KeyCode, MenuGroup, MenuItemType, MenuPosition, MetaKeys } from '@univerjs/ui';
import { map, mergeMap, Observable } from 'rxjs';
import type { IAccessor, Workbook } from '@univerjs/core';
import type { IMenuItem, IShortcutItem } from '@univerjs/ui';
import { InsertHyperLinkOperation, InsertHyperLinkToolbarOperation } from '../commands/operations/popup.operations';
import { getShouldDisableCellLink, shouldDisableAddLink } from '../utils';

const getLinkDisable$ = (accessor: IAccessor) => {
    const disableRange$ = getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellValuePermission, WorksheetInsertHyperlinkPermission], rangeTypes: [RangeProtectionPermissionEditPoint] });
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const sheetSelectionService = accessor.get(SheetsSelectionsService);
    const disableCell$ = univerInstanceService.focused$.pipe(
        map((focused) => {
            if (!focused) {
                return null;
            }
            const unit = univerInstanceService.getUnit<Workbook>(focused, UniverInstanceType.UNIVER_SHEET);
            return unit;
        }),
        mergeMap((unit) => {
            if (!unit) {
                return new Observable<null>((sub) => {
                    sub.next(null);
                });
            }
            return unit.activeSheet$;
        }),
        mergeMap((sheet) => sheetSelectionService.selectionMoveEnd$.pipe(map((selections) => sheet && { selections, sheet }))),
        map((sheetWithSelection) => {
            if (!sheetWithSelection) {
                return true;
            }
            const { selections, sheet } = sheetWithSelection;
            if (!selections.length) {
                return true;
            }
            const row = selections[0].range.startRow;
            const col = selections[0].range.startColumn;
            return getShouldDisableCellLink(sheet, row, col);
        })
    );

    return disableRange$.pipe(mergeMap(((disableRange) => disableCell$.pipe(map((disableCell) => disableRange || disableCell)))));
};

const getZenLinkDisable$ = (accessor: IAccessor) => {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    return univerInstanceService.focused$.pipe(
        mergeMap((focused) => {
            if (!focused || focused !== DOCS_ZEN_EDITOR_UNIT_ID_KEY) {
                return new Observable<null>((sub) => sub.next(null));
            }
            const textSelectionManagerService = accessor.get(DocSelectionManagerService);
            return textSelectionManagerService.textSelection$;
        }),
        map((selection) => {
            if (!selection || selection.unitId !== DOCS_ZEN_EDITOR_UNIT_ID_KEY) {
                return true;
            }
            const editorBridgeService = accessor.get(IEditorBridgeService);
            const state = editorBridgeService.getEditCellState();
            if (!state) {
                return true;
            }
            const target = getSheetCommandTarget(univerInstanceService, { unitId: state.unitId, subUnitId: state.sheetId });
            if (!target?.worksheet) {
                return true;
            }

            if (getShouldDisableCellLink(target.worksheet, state.row, state.column)) {
                return true;
            }

            return shouldDisableAddLink(accessor);
        })
    );
};

const linkMenu = {
    commandId: InsertHyperLinkOperation.id,
    type: MenuItemType.BUTTON,
    positions: [MenuPosition.CONTEXT_MENU],
    title: 'hyperLink.menu.add',
    icon: 'LinkSingle',
};

export const genZenEditorMenuId = (id: string) => `${id}-zen-editor`;

export const insertLinkMenuFactory = (accessor: IAccessor) => {
    return {
        ...linkMenu,
        id: linkMenu.commandId,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getLinkDisable$(accessor),
        // disabled$: getObservableWithExclusiveRange$(accessor, getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellValuePermission, WorksheetInsertHyperlinkPermission], rangeTypes: [RangeProtectionPermissionEditPoint] })),
    } as IMenuItem;
};

export const zenEditorInsertLinkMenuFactory = (accessor: IAccessor) => {
    return {
        ...linkMenu,
        id: genZenEditorMenuId(linkMenu.commandId),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC, DOCS_ZEN_EDITOR_UNIT_ID_KEY),
        disabled$: getZenLinkDisable$(accessor),
    } as IMenuItem;
};

const linkToolbarMenu = {
    tooltip: 'hyperLink.form.addTitle',
    positions: MenuPosition.TOOLBAR_START,
    group: MenuGroup.TOOLBAR_OTHERS,
    commandId: InsertHyperLinkToolbarOperation.id,
    type: MenuItemType.BUTTON,
    icon: 'LinkSingle',
};

export const insertLinkMenuToolbarFactory = (accessor: IAccessor) => {
    return {
        ...linkToolbarMenu,
        id: linkToolbarMenu.commandId,
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getLinkDisable$(accessor),
    };
};

export const zenEditorInsertLinkMenuToolbarFactory = (accessor: IAccessor) => {
    return {
        ...linkToolbarMenu,
        id: genZenEditorMenuId(linkToolbarMenu.commandId),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_DOC, DOCS_ZEN_EDITOR_UNIT_ID_KEY),
        disabled$: getZenLinkDisable$(accessor),
    };
};

export const InsertLinkShortcut: IShortcutItem = {
    id: InsertHyperLinkToolbarOperation.id,
    binding: KeyCode.K | MetaKeys.CTRL_COMMAND,
    preconditions: whenSheetEditorFocused,
};
