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

import type { IAccessor, Nullable } from '@univerjs/core';
import type { ISheetNote } from '@univerjs/sheets-note';
import type { IMenuButtonItem } from '@univerjs/ui';
import type { Observable } from 'rxjs';
import type { LocaleKey } from '../locale/types';
import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import {
    SheetsSelectionsService,
    WorkbookEditablePermission,
    WorksheetEditPermission,
} from '@univerjs/sheets';
import { SheetDeleteNoteCommand, SheetsNoteModel, SheetToggleNotePopupCommand } from '@univerjs/sheets-note';
import { deriveStateFromActiveSheet$, getCurrentRangeDisable$ } from '@univerjs/sheets-ui';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { combineLatest, distinctUntilChanged, map, merge, startWith } from 'rxjs';
import { AddNotePopupOperation } from '../commands/operations/add-note-popup.operation';

export const SHEET_NOTE_CONTEXT_MENU_ID = 'sheet.menu.note';

function getSelectedNote$(accessor: IAccessor): Observable<Nullable<ISheetNote>> {
    const sheetsSelectionsService = accessor.get(SheetsSelectionsService);
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const noteModel = accessor.get(SheetsNoteModel);

    return deriveStateFromActiveSheet$<Nullable<ISheetNote>>(univerInstanceService, null, ({ workbook, worksheet }) =>
        merge(sheetsSelectionsService.selectionChanged$, noteModel.change$).pipe(
            startWith(null),
            map(() => {
                const selection = sheetsSelectionsService.getCurrentLastSelection();
                if (!selection?.primary) {
                    return null;
                }
                const { actualColumn, actualRow } = selection.primary;
                return noteModel.getNote(workbook.getUnitId(), worksheet.getSheetId(), {
                    row: actualRow,
                    col: actualColumn,
                });
            })
        ));
}

export function sheetNoteContextMenuFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: AddNotePopupOperation.id,
        type: MenuItemType.BUTTON,
        title: 'sheets-note-ui.rightClick.addNote',
        icon: 'AddNoteIcon',
        hidden$: combineLatest([
            getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
            getSelectedNote$(accessor),
        ]).pipe(map(([hidden, note]) => hidden || !!note)),
        disabled$: getCurrentRangeDisable$(accessor, {
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [WorksheetEditPermission],
        }),
        commandId: AddNotePopupOperation.id,
    };
}

export function sheetDeleteNoteMenuFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    return {
        id: SheetDeleteNoteCommand.id,
        type: MenuItemType.BUTTON,
        title: 'sheets-note-ui.rightClick.deleteNote',
        icon: 'DeleteNoteIcon',
        hidden$: getSelectedNote$(accessor).pipe(map((note) => !note), distinctUntilChanged()),
        disabled$: getCurrentRangeDisable$(accessor, {
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [WorksheetEditPermission],
        }),
    };
}
export function sheetNoteToggleMenuFactory(accessor: IAccessor): IMenuButtonItem<LocaleKey> {
    const selectedNote$ = getSelectedNote$(accessor);

    return {
        id: SheetToggleNotePopupCommand.id,
        type: MenuItemType.BUTTON,
        title: 'sheets-note-ui.rightClick.toggleNote',
        icon: 'HideNoteIcon',
        activated$: selectedNote$.pipe(map((note) => note?.show === true), distinctUntilChanged()),
        hidden$: selectedNote$.pipe(map((note) => !note), distinctUntilChanged()),
    };
}
