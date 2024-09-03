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
    univerInstanceService.focused$.pipe(
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
        })
    ).subscribe((v) => {});

    const sheetSelectionService = accessor.get(SheetsSelectionsService);
    sheetSelectionService.selectionMoveEnd$.subscribe((seleciton) => {
        if (seleciton.length !== 1) {
            const range = seleciton[0].range;
            if (range.endRow > range.startRow || range.endColumn > range.startColumn) {
                return null;
            }
            return null;
        }
        // const cell =
    });
};

export const insertLinkMenuFactory = (accessor: IAccessor) => {
    return {
        id: InsertHyperLinkOperation.id,
        type: MenuItemType.BUTTON,
        positions: [MenuPosition.CONTEXT_MENU],
        title: 'hyperLink.menu.add',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        icon: 'LinkSingle',
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellValuePermission, WorksheetInsertHyperlinkPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
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
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellValuePermission, WorksheetInsertHyperlinkPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),

    };
};

export const InsertLinkShortcut: IShortcutItem = {
    id: InsertHyperLinkToolbarOperation.id,
    binding: KeyCode.K | MetaKeys.CTRL_COMMAND,
    preconditions: whenSheetEditorFocused,
};
