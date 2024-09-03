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

import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import type { IMenuItem, IShortcutItem } from '@univerjs/ui';
import { getMenuHiddenObservable, KeyCode, MenuGroup, MenuItemType, MenuPosition, MetaKeys } from '@univerjs/ui';
import type { IAccessor, Workbook } from '@univerjs/core';
import { getCurrentRangeDisable$, whenSheetEditorFocused } from '@univerjs/sheets-ui';
import { RangeProtectionPermissionEditPoint, SheetsSelectionsService, WorkbookEditablePermission, WorksheetEditPermission, WorksheetInsertHyperlinkPermission, WorksheetSetCellValuePermission } from '@univerjs/sheets';
import { map, mergeMap, Observable } from 'rxjs';
import { InsertHyperLinkOperation, InsertHyperLinkToolbarOperation } from '../commands/operations/sidebar.operations';

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
            const row = selections[0].range.startRow;
            const col = selections[0].range.startColumn;
            const cell = sheet.getCellRaw(row, col);
            if (cell?.f || cell?.si) {
                return true;
            }

            return false;
        })
    );

    return disableRange$.pipe(mergeMap(((disableRange) => disableCell$.pipe(map((disableCell) => disableRange || disableCell)))));
};

export const insertLinkMenuFactory = (accessor: IAccessor) => {
    return {
        id: InsertHyperLinkOperation.id,
        type: MenuItemType.BUTTON,
        positions: [MenuPosition.CONTEXT_MENU],
        title: 'hyperLink.menu.add',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        icon: 'LinkSingle',
        disabled$: getLinkDisable$(accessor),
    } as IMenuItem;
};

export const insertLinkMenuToolbarFactory = (accessor: IAccessor) => {
    return {
        tooltip: 'hyperLink.form.addTitle',
        positions: MenuPosition.TOOLBAR_START,
        group: MenuGroup.TOOLBAR_OTHERS,
        id: InsertHyperLinkToolbarOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'LinkSingle',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getLinkDisable$(accessor),

    };
};

export const InsertLinkShortcut: IShortcutItem = {
    id: InsertHyperLinkToolbarOperation.id,
    binding: KeyCode.K | MetaKeys.CTRL_COMMAND,
    preconditions: whenSheetEditorFocused,
};
