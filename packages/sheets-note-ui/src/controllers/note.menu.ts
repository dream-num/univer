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
import type { IMenuItem } from '@univerjs/ui';
import type { Observable } from 'rxjs';
import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { getSheetCommandTarget, SheetsSelectionsService, WorkbookEditablePermission, WorksheetEditPermission } from '@univerjs/sheets';
import { SheetDeleteNoteCommand, SheetsNoteModel, SheetToggleNotePopupCommand } from '@univerjs/sheets-note';
import { getCurrentRangeDisable$ } from '@univerjs/sheets-ui';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { combineLatest, map } from 'rxjs';
import { AddNotePopupOperation } from '../commands/operations/add-note-popup.operation';

export const SHEET_NOTE_CONTEXT_MENU_ID = 'sheet.menu.note';

function getHasNote$(accessor: IAccessor): Observable<boolean> {
    const sheetsSelectionsService = accessor.get(SheetsSelectionsService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    return sheetsSelectionsService.selectionMoveEnd$.pipe(map(() => {
        const selection = sheetsSelectionsService.getCurrentLastSelection();
        if (!selection?.primary) return false;
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;
        const { actualColumn, actualRow } = selection.primary;
        const noteModel = accessor.get(SheetsNoteModel);
        return Boolean(noteModel.getNote(target.unitId, target.subUnitId, actualRow, actualColumn));
    }));
}

export function sheetNoteContextMenuFactory(accessor: IAccessor): IMenuItem {
    return {
        id: AddNotePopupOperation.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.addNote',
        icon: 'AddNoteSingle',
        hidden$: combineLatest([getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET), getHasNote$(accessor)])
            .pipe(map(([hidden, hasNote]) => hidden || hasNote)),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission] }),
        commandId: AddNotePopupOperation.id,
    };
}

export function sheetDeleteNoteMenuFactory(accessor: IAccessor): IMenuItem {
    return {
        id: SheetDeleteNoteCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.deleteNote',
        icon: 'DeleteNoteSingle',
        hidden$: getHasNote$(accessor).pipe(map((hasNote) => !hasNote)),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission] }),
    };
}
export function sheetNoteToggleMenuFactory(accessor: IAccessor): IMenuItem {
    return {
        id: SheetToggleNotePopupCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.toggleNote',
        icon: 'HideNoteSingle',
        hidden$: getHasNote$(accessor).pipe(map((hasNote) => !hasNote)),
    };
}
