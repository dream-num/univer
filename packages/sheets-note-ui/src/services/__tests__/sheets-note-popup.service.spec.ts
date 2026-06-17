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

import { Injector } from '@univerjs/core';
import { CellPopupManagerService } from '@univerjs/sheets-ui';
import { beforeEach, describe, expect, it } from 'vitest';
import { SheetsNotePopupService } from '../sheets-note-popup.service';

class TestCellPopupManagerService {
    static disposedCount = 0;

    static reset() {
        this.disposedCount = 0;
    }

    showPopup() {
        return {
            dispose: () => {
                TestCellPopupManagerService.disposedCount += 1;
            },
        };
    }
}

describe('SheetsNotePopupService', () => {
    let service: SheetsNotePopupService;

    beforeEach(() => {
        TestCellPopupManagerService.reset();
        const injector = new Injector();
        injector.add([CellPopupManagerService, { useClass: TestCellPopupManagerService as never }]);
        injector.add([SheetsNotePopupService]);
        service = injector.get(SheetsNotePopupService);
    });

    it('shows a temporary note popup and hides it when requested', () => {
        const active: unknown[] = [];
        service.activePopup$.subscribe((popup) => active.push(popup));

        service.showPopup({ unitId: 'book-1', subUnitId: 'sheet-1', row: 1, col: 2, noteId: 'note-1', temp: true });
        service.hidePopup();

        expect(service.activePopup).toBeNull();
        expect(active.at(-2)).toEqual({ unitId: 'book-1', subUnitId: 'sheet-1', row: 1, col: 2, noteId: 'note-1', temp: true });
        expect(active.at(-1)).toBeNull();
        expect(TestCellPopupManagerService.disposedCount).toBe(1);
    });

    it('persists an opened temporary note popup', () => {
        service.showPopup({ unitId: 'book-1', subUnitId: 'sheet-1', row: 1, col: 2, temp: true });

        service.persistPopup();

        expect(service.activePopup?.temp).toBe(false);
    });
});
