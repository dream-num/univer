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

import type { IDisposable } from '@univerjs/core';
import { Inject, Injector } from '@univerjs/core';
import { CellPopupManagerService, SheetCanvasPopManagerService } from '@univerjs/sheets-ui';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SHEETS_THREAD_COMMENT_MODAL } from '../../types/const';
import { SheetsThreadCommentPopupService } from '../sheets-thread-comment-popup.service';

class TestSheetCanvasPopManagerService {}

class TestCellPopupManagerService extends CellPopupManagerService {
    disposed = false;
    lastLocation?: Parameters<CellPopupManagerService['showPopup']>[0];
    lastPopup?: Parameters<CellPopupManagerService['showPopup']>[1];

    constructor(
        @Inject(SheetCanvasPopManagerService) sheetCanvasPopManagerService: SheetCanvasPopManagerService
    ) {
        super(sheetCanvasPopManagerService);
    }

    override showPopup(
        location: Parameters<CellPopupManagerService['showPopup']>[0],
        popup: Parameters<CellPopupManagerService['showPopup']>[1]
    ): IDisposable {
        this.lastLocation = location;
        this.lastPopup = popup;

        return {
            dispose: () => {
                this.disposed = true;
            },
        };
    }
}

describe('SheetsThreadCommentPopupService', () => {
    let injector: Injector;
    let service: SheetsThreadCommentPopupService;
    let cellPopupManagerService: TestCellPopupManagerService;
    let hideCount: number;

    beforeEach(() => {
        hideCount = 0;
        injector = new Injector();
        injector.add([SheetCanvasPopManagerService, { useClass: TestSheetCanvasPopManagerService }]);
        injector.add([CellPopupManagerService, { useClass: TestCellPopupManagerService }]);
        injector.add([SheetsThreadCommentPopupService]);

        service = injector.get(SheetsThreadCommentPopupService);
        cellPopupManagerService = injector.get(CellPopupManagerService) as unknown as TestCellPopupManagerService;
    });

    afterEach(() => {
        service.dispose();
    });

    it('shows, persists and hides the active popup through the popup manager boundary', () => {
        service.showPopup({
            unitId: 'test',
            subUnitId: 'sheet1',
            row: 1,
            col: 2,
            commentId: 'comment-1',
            temp: true,
            trigger: 'hover',
        }, () => {
            hideCount += 1;
        });

        expect(service.activePopup).toEqual({
            unitId: 'test',
            subUnitId: 'sheet1',
            row: 1,
            col: 2,
            commentId: 'comment-1',
            temp: true,
            trigger: 'hover',
        });
        expect(cellPopupManagerService.lastLocation).toEqual({
            unitId: 'test',
            subUnitId: 'sheet1',
            row: 1,
            col: 2,
        });
        expect(cellPopupManagerService.lastPopup).toEqual(expect.objectContaining({
            componentKey: SHEETS_THREAD_COMMENT_MODAL,
            direction: 'horizontal',
        }));

        service.persistPopup();
        expect(service.activePopup).toEqual(expect.objectContaining({
            temp: false,
        }));

        service.hidePopup();
        expect(service.activePopup).toBeNull();
        expect(cellPopupManagerService.disposed).toBe(true);
        expect(hideCount).toBe(1);
    });

    it('updates the active popup in place when the same cell is targeted again', () => {
        service.showPopup({
            unitId: 'test',
            subUnitId: 'sheet1',
            row: 1,
            col: 2,
            commentId: 'comment-1',
        });
        service.showPopup({
            unitId: 'test',
            subUnitId: 'sheet1',
            row: 1,
            col: 2,
            commentId: 'comment-2',
            trigger: 'cell',
        });

        expect(service.activePopup).toEqual({
            unitId: 'test',
            subUnitId: 'sheet1',
            row: 1,
            col: 2,
            commentId: 'comment-2',
            trigger: 'cell',
        });
        expect(cellPopupManagerService.disposed).toBe(false);
    });
});
