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

import type { IWorkbookData } from '@univerjs/core';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import { ICommandService, IUniverInstanceService, LocaleType, toDisposable, Univer, UniverInstanceType } from '@univerjs/core';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { CellPopupManagerService } from '@univerjs/sheets-ui';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SheetsNotePopupService } from '../../../services/sheets-note-popup.service';
import { AddNotePopupOperation } from '../add-note-popup.operation';

const workbookData: IWorkbookData = {
    id: 'note-workbook',
    appVersion: '3.0.0-alpha',
    name: 'note workbook',
    locale: LocaleType.EN_US,
    sheetOrder: ['sheet-1'],
    styles: {},
    sheets: {
        'sheet-1': {
            id: 'sheet-1',
            name: 'Sheet 1',
            cellData: {},
        },
    },
};

class TestCellPopupManagerService {
    showPopup() {
        return toDisposable(() => {});
    }
}

function createSelection(row: number, col: number): ISelectionWithStyle {
    return {
        range: {
            startRow: row,
            endRow: row,
            startColumn: col,
            endColumn: col,
        },
        primary: {
            startRow: row,
            endRow: row,
            startColumn: col,
            endColumn: col,
            actualRow: row,
            actualColumn: col,
            isMerged: false,
            isMergedMainCell: false,
        },
        style: null,
    };
}

describe('AddNotePopupOperation', () => {
    let univer: Univer;
    let commandService: ICommandService;
    let selectionsService: SheetsSelectionsService;
    let notePopupService: SheetsNotePopupService;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([SheetsSelectionsService]);
        injector.add([CellPopupManagerService, { useClass: TestCellPopupManagerService as never }]);
        injector.add([SheetsNotePopupService]);

        univer.createUnit(UniverInstanceType.UNIVER_SHEET, workbookData);
        injector.get(IUniverInstanceService).focusUnit('note-workbook');
        commandService = injector.get(ICommandService);
        commandService.registerCommand(AddNotePopupOperation);
        selectionsService = injector.get(SheetsSelectionsService);
        notePopupService = injector.get(SheetsNotePopupService);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('opens a note popup at the active cell in the current worksheet', async () => {
        selectionsService.setSelections('note-workbook', 'sheet-1', [createSelection(2, 3)]);

        const result = await commandService.executeCommand(AddNotePopupOperation.id, { trigger: 'context-menu' });

        expect(result).toBe(true);
        expect(notePopupService.activePopup).toEqual({
            unitId: 'note-workbook',
            subUnitId: 'sheet-1',
            row: 2,
            col: 3,
            temp: false,
            trigger: 'context-menu',
        });
    });

    it('does not open a note popup when there is no active cell selection', async () => {
        const result = await commandService.executeCommand(AddNotePopupOperation.id);

        expect(result).toBe(false);
        expect(notePopupService.activePopup).toBeUndefined();
    });
});
