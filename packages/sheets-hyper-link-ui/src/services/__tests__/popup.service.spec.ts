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

import { CustomRangeType, DOCS_ZEN_EDITOR_UNIT_ID_KEY, Injector } from '@univerjs/core';
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
    document?: unknown;
    zenVisible?: boolean;
}) {
    const cellDisposable = createDisposable();
    const positionDisposable = createDisposable();
    const absoluteDisposable = createDisposable();
    const docDisposable = createDisposable();

    const sheetCanvasPopManagerService = {
        attachPopupToCell: vi.fn(() => cellDisposable),
        attachPopupByPosition: vi.fn(() => positionDisposable),
        attachPopupToAbsolutePosition: vi.fn(() => absoluteDisposable),
    };
    const docCanvasPopManagerService = {
        attachPopupToRange: vi.fn(() => docDisposable),
    };
    const textSelectionManagerService = {
        getActiveTextRange: vi.fn(() => ({ startOffset: 1, endOffset: 3, collapsed: false })),
        replaceDocRanges: vi.fn(),
        replaceTextRanges: vi.fn(),
    };
    const univerInstanceService = {
        getUnit: vi.fn((unitId: string) => {
            if (unitId === DOCS_ZEN_EDITOR_UNIT_ID_KEY) {
                return options?.document ?? null;
            }
            return options?.workbook ?? null;
        }),
    };

    return {
        service: new SheetsHyperLinkPopupService(
            sheetCanvasPopManagerService as never,
            new Injector(),
            univerInstanceService as never,
            { isVisible: () => ({ visible: false }), getEditCellState: vi.fn() } as never,
            textSelectionManagerService as never,
            docCanvasPopManagerService as never,
            { visible: options?.zenVisible ?? false } as never
        ),
        sheetCanvasPopManagerService,
        docCanvasPopManagerService,
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

    it('routes popups by source type and blocks sheet popups while zen mode is visible', () => {
        const blocked = createService({ zenVisible: true });

        blocked.service.showPopup({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 0,
            col: 0,
            customRange: { rangeId: 'r1', startIndex: 1, endIndex: 3, rangeType: CustomRangeType.HYPERLINK },
            customRangeRect: { left: 0, top: 0, right: 10, bottom: 10 },
            type: HyperLinkEditSourceType.VIEWING,
        });
        expect(blocked.service.currentPopup).toBeNull();

        const active = createService({ zenVisible: false });

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

        active.service.showPopup({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 0,
            col: 0,
            customRange: { rangeId: 'r3', startIndex: 0, endIndex: 2, rangeType: CustomRangeType.HYPERLINK },
            type: HyperLinkEditSourceType.ZEN_EDITOR,
        });
        expect(active.docCanvasPopManagerService.attachPopupToRange).toHaveBeenCalledWith({
            startOffset: 0,
            endOffset: 3,
            collapsed: false,
        }, expect.any(Object), DOCS_ZEN_EDITOR_UNIT_ID_KEY);
        expect(blocked.sheetCanvasPopManagerService.attachPopupByPosition).not.toHaveBeenCalled();
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

    it('starts zen editor editing from the real custom range in the zen document', () => {
        const document = {
            getBody: () => ({
                dataStream: 'abcdef',
                customRanges: [{ rangeId: 'range-3', startIndex: 1, endIndex: 3, rangeType: CustomRangeType.HYPERLINK }],
            }),
        };
        const { service, docCanvasPopManagerService, textSelectionManagerService } = createService({ document });

        service.startEditing({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 1,
            col: 1,
            customRangeId: 'range-3',
            type: HyperLinkEditSourceType.ZEN_EDITOR,
        });

        expect(textSelectionManagerService.replaceTextRanges).toHaveBeenCalledWith([
            {
                startOffset: 1,
                endOffset: 4,
            },
        ]);
        expect(docCanvasPopManagerService.attachPopupToRange).toHaveBeenCalledWith({
            startOffset: 1,
            endOffset: 3,
            collapsed: false,
        }, expect.any(Object), DOCS_ZEN_EDITOR_UNIT_ID_KEY);
        expect(service.currentEditing).toEqual(expect.objectContaining({
            label: 'bcd',
            type: HyperLinkEditSourceType.ZEN_EDITOR,
        }));
    });
});
