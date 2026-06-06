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

import { CustomRangeType, Injector } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { HyperLinkEditSourceType } from '../../types/enums/edit-source';
import { SheetsHyperLinkPopupService } from '../popup.service';

function createDisposable() {
    return {
        dispose: vi.fn(),
        canDispose: vi.fn(() => true),
    };
}

function createService(options?: {
    workbook?: unknown;
}) {
    const cellDisposable = createDisposable();
    const positionDisposable = createDisposable();
    const absoluteDisposable = createDisposable();

    const sheetCanvasPopManagerService = {
        attachPopupToCell: vi.fn(() => cellDisposable),
        attachPopupByPosition: vi.fn(() => positionDisposable),
        attachPopupToAbsolutePosition: vi.fn(() => absoluteDisposable),
    };
    const textSelectionManagerService = {
        getActiveTextRange: vi.fn(() => ({ startOffset: 1, endOffset: 3, collapsed: false })),
        replaceDocRanges: vi.fn(),
        replaceTextRanges: vi.fn(),
    };
    const univerInstanceService = {
        getUnit: vi.fn(() => options?.workbook ?? null),
    };

    return {
        service: new SheetsHyperLinkPopupService(
            sheetCanvasPopManagerService as never,
            new Injector(),
            univerInstanceService as never,
            { isVisible: () => ({ visible: false }), getEditCellState: vi.fn() } as never,
            textSelectionManagerService as never
        ),
        sheetCanvasPopManagerService,
        textSelectionManagerService,
        cellDisposable,
    };
}

describe('SheetsHyperLinkPopupService', () => {
    it('shows and hides cell popups without recreating the same viewing popup', () => {
        const { service, sheetCanvasPopManagerService, cellDisposable } = createService();

        service.showPopup({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 1,
            col: 2,
            showAll: true,
            editPermission: true,
            copyPermission: true,
            type: HyperLinkEditSourceType.VIEWING,
        });

        expect(sheetCanvasPopManagerService.attachPopupToCell).toHaveBeenCalledTimes(1);
        expect(service.currentPopup).toEqual(expect.objectContaining({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 1,
            col: 2,
            showAll: true,
            type: HyperLinkEditSourceType.VIEWING,
        }));

        service.showPopup({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 1,
            col: 2,
            showAll: true,
            type: HyperLinkEditSourceType.VIEWING,
        });

        expect(sheetCanvasPopManagerService.attachPopupToCell).toHaveBeenCalledTimes(1);

        service.hideCurrentPopup();
        expect(cellDisposable.dispose).toHaveBeenCalledTimes(1);
        expect(service.currentPopup).toBeNull();
    });

    it('routes popups by source type', () => {
        const active = createService();

        active.service.showPopup({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 0,
            col: 0,
            customRange: { rangeId: 'r1', startIndex: 1, endIndex: 3, rangeType: CustomRangeType.HYPERLINK },
            customRangeRect: { left: 0, top: 0, right: 10, bottom: 10 },
            type: HyperLinkEditSourceType.EDITING,
        });
        expect(active.sheetCanvasPopManagerService.attachPopupToAbsolutePosition).toHaveBeenCalledTimes(1);

        active.service.showPopup({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 0,
            col: 0,
            customRange: { rangeId: 'r2', startIndex: 2, endIndex: 4, rangeType: CustomRangeType.HYPERLINK },
            customRangeRect: { left: 1, top: 1, right: 9, bottom: 9 },
            type: HyperLinkEditSourceType.VIEWING,
        });
        expect(active.sheetCanvasPopManagerService.attachPopupByPosition).toHaveBeenCalledTimes(1);

        expect(active.sheetCanvasPopManagerService.attachPopupByPosition).toHaveBeenCalledTimes(1);
    });

    it('starts viewing edits from cell content and preserves editor state while keep-visible is enabled', () => {
        const workbook = {
            getSheetBySheetId: () => ({
                getCellRaw: () => ({ v: 'Cell Value' }),
            }),
        };
        const { service, sheetCanvasPopManagerService } = createService({ workbook });

        service.startAddEditing({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 1,
            col: 1,
            type: HyperLinkEditSourceType.VIEWING,
        });
        expect(sheetCanvasPopManagerService.attachPopupToCell).toHaveBeenCalledTimes(1);
        expect(service.currentEditing).toEqual(expect.objectContaining({
            label: 'Cell Value',
            type: HyperLinkEditSourceType.VIEWING,
        }));

        service.setIsKeepVisible(true);
        service.endEditing();
        expect(service.currentEditing).toEqual(expect.objectContaining({ type: HyperLinkEditSourceType.VIEWING }));

        service.setIsKeepVisible(false);
        service.endEditing(HyperLinkEditSourceType.VIEWING);
        expect(service.currentEditing).toBeNull();
    });
});
