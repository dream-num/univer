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
import { IUniverInstanceService, LocaleType, toDisposable, Univer, UniverInstanceType } from '@univerjs/core';
import { SheetsNoteModel } from '@univerjs/sheets-note';
import { CellPopupManagerService } from '@univerjs/sheets-ui';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SheetsNotePopupService } from '../../services/sheets-note-popup.service';
import { SheetsNoteAttachmentController } from '../sheets-note-attachment.controller';

const WORKBOOK_DATA: IWorkbookData = {
    id: 'note-host',
    appVersion: '3.0.0-alpha',
    name: 'Note host',
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

class RecordingCellPopupManagerService {
    static activeCount = 0;

    showPopup() {
        RecordingCellPopupManagerService.activeCount += 1;
        return toDisposable(() => {
            RecordingCellPopupManagerService.activeCount -= 1;
        });
    }
}

describe('SheetsNoteAttachmentController', () => {
    let univer: Univer;

    beforeEach(() => {
        RecordingCellPopupManagerService.activeCount = 0;
        univer = new Univer();
    });

    afterEach(() => {
        univer.dispose();
    });

    it('hides persistent Notes while a host is suppressed and restores current model state afterwards', () => {
        const injector = univer.__getInjector();
        injector.add([SheetsNoteModel]);
        injector.add([CellPopupManagerService, { useClass: RecordingCellPopupManagerService as never }]);
        injector.add([SheetsNotePopupService]);
        injector.add([SheetsNoteAttachmentController]);
        univer.createUnit(UniverInstanceType.UNIVER_SHEET, WORKBOOK_DATA);
        injector.get(IUniverInstanceService).focusUnit(WORKBOOK_DATA.id);

        const noteModel = injector.get(SheetsNoteModel);
        noteModel.updateNote(WORKBOOK_DATA.id, 'sheet-1', 1, 2, {
            id: 'note-1',
            width: 160,
            height: 60,
            note: 'First note',
            show: true,
        });
        const controller = injector.get(SheetsNoteAttachmentController);
        expect(RecordingCellPopupManagerService.activeCount).toBe(1);

        controller.setPopupSuppressed(WORKBOOK_DATA.id, true);
        expect(RecordingCellPopupManagerService.activeCount).toBe(0);

        noteModel.updateNote(WORKBOOK_DATA.id, 'sheet-1', 3, 4, {
            id: 'note-2',
            width: 160,
            height: 60,
            note: 'Second note',
            show: true,
        });
        expect(RecordingCellPopupManagerService.activeCount).toBe(0);

        controller.setPopupSuppressed(WORKBOOK_DATA.id, false);
        expect(RecordingCellPopupManagerService.activeCount).toBe(2);
    });
});
