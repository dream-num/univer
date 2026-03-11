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

/* eslint-disable ts/no-explicit-any */

import { CustomRangeType, DOCS_ZEN_EDITOR_UNIT_ID_KEY } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { HyperLinkEditSourceType } from '../../types/enums/edit-source';
import { SheetsHyperLinkPopupService } from '../popup.service';

const popupMocks = vi.hoisted(() => ({
    calcDocRangePositions: vi.fn(),
    getCustomRangePosition: vi.fn(),
    getEditingCustomRangePosition: vi.fn(),
}));

vi.mock('@univerjs/docs-ui', async () => {
    const actual = await vi.importActual<typeof import('@univerjs/docs-ui')>('@univerjs/docs-ui');
    return {
        ...actual,
        calcDocRangePositions: popupMocks.calcDocRangePositions,
    };
});

vi.mock('@univerjs/sheets-ui', async () => {
    const actual = await vi.importActual<typeof import('@univerjs/sheets-ui')>('@univerjs/sheets-ui');
    return {
        ...actual,
        getCustomRangePosition: popupMocks.getCustomRangePosition,
        getEditingCustomRangePosition: popupMocks.getEditingCustomRangePosition,
    };
});

vi.mock('../../views/CellLinkEdit', () => ({
    CellLinkEdit: { componentKey: 'cell-link-edit' },
}));

vi.mock('../../views/CellLinkPopup', () => ({
    CellLinkPopup: { componentKey: 'cell-link-popup' },
}));

function createDisposable() {
    return {
        dispose: vi.fn(),
        canDispose: vi.fn(() => true),
    };
}

describe('SheetsHyperLinkPopupService', () => {
    it('should show and hide view popups for hovered cells', () => {
        const cellDisposable = createDisposable();
        const service = new SheetsHyperLinkPopupService(
            {
                attachPopupToCell: vi.fn(() => cellDisposable),
                attachPopupByPosition: vi.fn(),
                attachPopupToAbsolutePosition: vi.fn(),
            } as any,
            { get: vi.fn() } as any,
            { getUnit: vi.fn() } as any,
            { isVisible: () => ({ visible: false }), getEditCellState: vi.fn() } as any,
            { getActiveTextRange: vi.fn(), replaceDocRanges: vi.fn(), replaceTextRanges: vi.fn() } as any,
            { attachPopupToRange: vi.fn() } as any,
            { visible: false } as any
        );

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

        expect(service.currentPopup).toEqual(expect.objectContaining({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 1,
            col: 2,
            type: HyperLinkEditSourceType.VIEWING,
            showAll: true,
        }));

        service.showPopup({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 1,
            col: 2,
            showAll: true,
            type: HyperLinkEditSourceType.VIEWING,
        });
        expect(cellDisposable.dispose).toHaveBeenCalledTimes(0);

        service.hideCurrentPopup();
        expect(cellDisposable.dispose).toHaveBeenCalledTimes(1);
        expect(service.currentPopup).toBeNull();
    });

    it('should route popup rendering by editing source and respect zen mode visibility', () => {
        const absDisposable = createDisposable();
        const posDisposable = createDisposable();
        const zenDisposable = createDisposable();
        const sheetCanvasPopManagerService = {
            attachPopupToCell: vi.fn(),
            attachPopupByPosition: vi.fn(() => posDisposable),
            attachPopupToAbsolutePosition: vi.fn(() => absDisposable),
        };
        const docCanvasPopManagerService = {
            attachPopupToRange: vi.fn(() => zenDisposable),
        };
        const zenZoneService = { visible: true };
        const service = new SheetsHyperLinkPopupService(
            sheetCanvasPopManagerService as any,
            { get: vi.fn() } as any,
            { getUnit: vi.fn() } as any,
            { isVisible: () => ({ visible: false }), getEditCellState: vi.fn() } as any,
            { getActiveTextRange: vi.fn(), replaceDocRanges: vi.fn(), replaceTextRanges: vi.fn() } as any,
            docCanvasPopManagerService as any,
            zenZoneService as any
        );

        service.showPopup({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 0,
            col: 0,
            customRange: { rangeId: 'r1', startIndex: 1, endIndex: 3, rangeType: CustomRangeType.HYPERLINK },
            customRangeRect: { left: 0, top: 0, right: 10, bottom: 10 },
            type: HyperLinkEditSourceType.VIEWING,
        });
        expect(service.currentPopup).toBeNull();

        zenZoneService.visible = false;

        service.showPopup({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 0,
            col: 0,
            customRange: { rangeId: 'r1', startIndex: 1, endIndex: 3, rangeType: CustomRangeType.HYPERLINK },
            customRangeRect: { left: 0, top: 0, right: 10, bottom: 10 },
            type: HyperLinkEditSourceType.EDITING,
        });
        expect(sheetCanvasPopManagerService.attachPopupToAbsolutePosition).toHaveBeenCalledTimes(1);

        service.showPopup({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 0,
            col: 0,
            customRange: { rangeId: 'r2', startIndex: 2, endIndex: 4, rangeType: CustomRangeType.HYPERLINK },
            customRangeRect: { left: 1, top: 1, right: 9, bottom: 9 },
            type: HyperLinkEditSourceType.VIEWING,
        });
        expect(sheetCanvasPopManagerService.attachPopupByPosition).toHaveBeenCalledTimes(1);

        service.showPopup({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 0,
            col: 0,
            customRange: { rangeId: 'r3', startIndex: 0, endIndex: 2, rangeType: CustomRangeType.HYPERLINK },
            type: HyperLinkEditSourceType.ZEN_EDITOR,
        });
        expect(docCanvasPopManagerService.attachPopupToRange).toHaveBeenCalledWith({
            startOffset: 0,
            endOffset: 3,
            collapsed: false,
        }, expect.any(Object), DOCS_ZEN_EDITOR_UNIT_ID_KEY);
    });

    it('should start add editing from sheet cells, editors and zen docs', () => {
        const viewDisposable = createDisposable();
        const editDisposable = createDisposable();
        const zenDisposable = createDisposable();
        popupMocks.calcDocRangePositions.mockReturnValue([{ left: 1, top: 1, right: 5, bottom: 5 }]);

        const renderManager = {
            getRenderById: vi.fn(() => ({ id: 'render-1' })),
        };
        const textSelectionManagerService = {
            getActiveTextRange: vi.fn(() => ({ startOffset: 1, endOffset: 3, collapsed: false })),
            replaceDocRanges: vi.fn(),
            replaceTextRanges: vi.fn(),
        };
        const service = new SheetsHyperLinkPopupService(
            {
                attachPopupToCell: vi.fn(() => viewDisposable),
                attachPopupByPosition: vi.fn(),
                attachPopupToAbsolutePosition: vi.fn(() => editDisposable),
            } as any,
            { get: vi.fn(() => renderManager) } as any,
            {
                getUnit: vi.fn((unitId: string) => {
                    if (unitId === DOCS_ZEN_EDITOR_UNIT_ID_KEY) {
                        return { getBody: () => ({ dataStream: 'abcdef', customRanges: [] }) };
                    }
                    return {
                        getSheetBySheetId: () => ({ getCellRaw: () => ({ v: 'Cell Value' }) }),
                    };
                }),
            } as any,
            {
                isVisible: () => ({ visible: true }),
                getEditCellState: () => ({
                    documentLayoutObject: {
                        documentModel: { getBody: () => ({ dataStream: 'hello\r\n', customRanges: [] }) },
                    },
                }),
            } as any,
            textSelectionManagerService as any,
            { attachPopupToRange: vi.fn(() => zenDisposable) } as any,
            { visible: false } as any
        );

        service.startAddEditing({ unitId: 'unit-1', subUnitId: 'sheet-1', row: 1, col: 1, type: HyperLinkEditSourceType.VIEWING });
        expect(service.currentEditing).toEqual(expect.objectContaining({ label: 'Cell Value', type: HyperLinkEditSourceType.VIEWING }));

        service.startAddEditing({ unitId: 'unit-1', subUnitId: 'sheet-1', row: 1, col: 1, type: HyperLinkEditSourceType.EDITING });
        expect(textSelectionManagerService.replaceDocRanges).toHaveBeenCalled();
        expect(service.currentEditing).toEqual(expect.objectContaining({ label: 'el', type: HyperLinkEditSourceType.EDITING }));

        service.startAddEditing({ unitId: 'unit-1', subUnitId: 'sheet-1', row: 1, col: 1, type: HyperLinkEditSourceType.ZEN_EDITOR });
        expect(service.currentEditing).toEqual(expect.objectContaining({ label: 'bc', type: HyperLinkEditSourceType.ZEN_EDITOR }));
    });

    it('should start editing existing links and honor keep-visible on endEditing', () => {
        const cellDisposable = createDisposable();
        const posDisposable = createDisposable();
        const zenDisposable = createDisposable();
        popupMocks.getCustomRangePosition.mockReturnValue({
            customRange: { rangeId: 'range-1', startIndex: 0, endIndex: 2, rangeType: CustomRangeType.HYPERLINK },
            label: 'abc',
            rects: [{ left: 1, top: 1, right: 5, bottom: 5 }],
        });
        popupMocks.getEditingCustomRangePosition.mockReturnValue({
            customRange: { rangeId: 'range-2', startIndex: 2, endIndex: 4, rangeType: CustomRangeType.HYPERLINK },
            label: 'cde',
            rects: [{ left: 2, top: 2, right: 6, bottom: 6 }],
        });

        const textSelectionManagerService = {
            getActiveTextRange: vi.fn(),
            replaceDocRanges: vi.fn(),
            replaceTextRanges: vi.fn(),
        };
        const service = new SheetsHyperLinkPopupService(
            {
                attachPopupToCell: vi.fn(() => cellDisposable),
                attachPopupByPosition: vi.fn(() => posDisposable),
                attachPopupToAbsolutePosition: vi.fn(() => createDisposable()),
            } as any,
            { get: vi.fn() } as any,
            {
                getUnit: vi.fn((unitId: string) => {
                    if (unitId === DOCS_ZEN_EDITOR_UNIT_ID_KEY) {
                        return {
                            getBody: () => ({
                                dataStream: 'abcdef',
                                customRanges: [{ rangeId: 'range-3', startIndex: 1, endIndex: 3 }],
                            }),
                        };
                    }
                    return {
                        getSheetBySheetId: () => ({ getCellRaw: () => ({ v: 'Link', p: undefined }) }),
                        getStyles: () => ({ getStyleByCell: () => ({ tr: undefined }) }),
                    };
                }),
            } as any,
            { isVisible: () => ({ visible: false }), getEditCellState: vi.fn() } as any,
            textSelectionManagerService as any,
            { attachPopupToRange: vi.fn(() => zenDisposable) } as any,
            { visible: false } as any
        );

        service.startEditing({ unitId: 'unit-1', subUnitId: 'sheet-1', row: 1, col: 1, customRangeId: 'range-1', type: HyperLinkEditSourceType.VIEWING });
        expect(service.currentEditing).toEqual(expect.objectContaining({ label: 'abc', type: HyperLinkEditSourceType.VIEWING }));

        service.startEditing({ unitId: 'unit-1', subUnitId: 'sheet-1', row: 1, col: 1, customRangeId: 'range-2', type: HyperLinkEditSourceType.EDITING });
        expect(textSelectionManagerService.replaceTextRanges).toHaveBeenCalled();
        expect(service.currentEditing).toEqual(expect.objectContaining({ label: 'cde', type: HyperLinkEditSourceType.EDITING }));

        service.startEditing({ unitId: 'unit-1', subUnitId: 'sheet-1', row: 1, col: 1, customRangeId: 'range-3', type: HyperLinkEditSourceType.ZEN_EDITOR });
        expect(service.currentEditing).toEqual(expect.objectContaining({ label: 'bcd', type: HyperLinkEditSourceType.ZEN_EDITOR }));

        service.setIsKeepVisible(true);
        service.endEditing();
        expect(service.currentEditing).toEqual(expect.objectContaining({ type: HyperLinkEditSourceType.ZEN_EDITOR }));

        service.setIsKeepVisible(false);
        service.endEditing(HyperLinkEditSourceType.ZEN_EDITOR);
        expect(service.currentEditing).toBeNull();
    });
});
