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

import { CustomRangeType, Injector, IUniverInstanceService } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { IRenderManagerService } from '@univerjs/engine-render';
import { IEditorBridgeService, SheetCanvasPopManagerService } from '@univerjs/sheets-ui';
import { describe, expect, it } from 'vitest';
import { HyperLinkEditSourceType } from '../../types/enums/edit-source';
import { SheetsHyperLinkPopupService } from '../popup.service';

class TestDisposable {
    disposeCount = 0;
    canDisposeResult = true;

    dispose(): void {
        this.disposeCount += 1;
    }

    canDispose(): boolean {
        return this.canDisposeResult;
    }
}

class TestSheetCanvasPopManagerService {
    readonly cellDisposable = new TestDisposable();
    readonly positionDisposable = new TestDisposable();
    readonly absoluteDisposable = new TestDisposable();
    readonly cellPopups: Array<{ row: number; col: number; popup: any; unitId?: string; subUnitId?: string }> = [];
    readonly positionPopups: Array<{ rect: any; popup: any; location: any }> = [];
    readonly absolutePopups: Array<{ rect: any; popup: any; unitId?: string; subUnitId?: string }> = [];

    attachPopupToCell(row: number, col: number, popup: any, unitId?: string, subUnitId?: string): TestDisposable {
        this.cellPopups.push({ row, col, popup, unitId, subUnitId });
        return this.cellDisposable;
    }

    attachPopupByPosition(rect: any, popup: any, location: any): TestDisposable {
        this.positionPopups.push({ rect, popup, location });
        return this.positionDisposable;
    }

    attachPopupToAbsolutePosition(rect: any, popup: any, unitId?: string, subUnitId?: string): TestDisposable {
        this.absolutePopups.push({ rect, popup, unitId, subUnitId });
        return this.absoluteDisposable;
    }
}

class TestUniverInstanceService {
    workbook: any = null;

    getUnit(): any {
        return this.workbook;
    }
}

class TestEditorBridgeService {
    visible = false;
    editCellState: any = null;

    isVisible(): { visible: boolean } {
        return { visible: this.visible };
    }

    getEditCellState(): any {
        return this.editCellState;
    }
}

class TestDocSelectionManagerService {
    activeTextRange: any = { startOffset: 1, endOffset: 3, collapsed: false };
    readonly replacedDocRanges: any[] = [];
    readonly replacedTextRanges: any[] = [];

    getActiveTextRange(): any {
        return this.activeTextRange;
    }

    replaceDocRanges(ranges: any, unitRange: any): void {
        this.replacedDocRanges.push({ ranges, unitRange });
    }

    replaceTextRanges(ranges: any): void {
        this.replacedTextRanges.push(ranges);
    }
}

class TestRenderManagerService {
    render: any = null;

    getRenderById(): any {
        return this.render;
    }
}

function createService() {
    const injector = new Injector();

    injector.add([SheetCanvasPopManagerService, { useClass: TestSheetCanvasPopManagerService as never }]);
    injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
    injector.add([IEditorBridgeService, { useClass: TestEditorBridgeService as never }]);
    injector.add([DocSelectionManagerService, { useClass: TestDocSelectionManagerService as never }]);
    injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
    injector.add([SheetsHyperLinkPopupService]);

    return {
        service: injector.get(SheetsHyperLinkPopupService),
        sheetCanvasPopManagerService: injector.get(SheetCanvasPopManagerService) as unknown as TestSheetCanvasPopManagerService,
        editorBridgeService: injector.get(IEditorBridgeService) as unknown as TestEditorBridgeService,
        textSelectionManagerService: injector.get(DocSelectionManagerService) as unknown as TestDocSelectionManagerService,
        univerInstanceService: injector.get(IUniverInstanceService) as unknown as TestUniverInstanceService,
    };
}

describe('SheetsHyperLinkPopupService', () => {
    it('shows and hides cell popups without recreating the same viewing popup', () => {
        const { service, sheetCanvasPopManagerService } = createService();

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

        expect(sheetCanvasPopManagerService.cellPopups).toHaveLength(1);
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

        expect(sheetCanvasPopManagerService.cellPopups).toHaveLength(1);

        service.hideCurrentPopup();
        expect(sheetCanvasPopManagerService.cellDisposable.disposeCount).toBe(1);
        expect(service.currentPopup).toBeNull();
    });

    it('routes popups by source type and popup callbacks close the active popup', () => {
        const { service, sheetCanvasPopManagerService } = createService();

        service.showPopup({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 0,
            col: 0,
            customRange: { rangeId: 'r1', startIndex: 1, endIndex: 3, rangeType: CustomRangeType.HYPERLINK },
            customRangeRect: { left: 0, top: 0, right: 10, bottom: 10 },
            type: HyperLinkEditSourceType.EDITING,
        });
        expect(sheetCanvasPopManagerService.absolutePopups).toHaveLength(1);

        sheetCanvasPopManagerService.absolutePopups[0].popup.onClickOutside();
        expect(sheetCanvasPopManagerService.absoluteDisposable.disposeCount).toBe(1);
        expect(service.currentPopup).toBeNull();

        service.showPopup({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 0,
            col: 0,
            customRange: { rangeId: 'r2', startIndex: 2, endIndex: 4, rangeType: CustomRangeType.HYPERLINK },
            customRangeRect: { left: 1, top: 1, right: 9, bottom: 9 },
            type: HyperLinkEditSourceType.VIEWING,
        });

        expect(sheetCanvasPopManagerService.positionPopups).toHaveLength(1);
        sheetCanvasPopManagerService.positionPopups[0].popup.onClick();
        expect(sheetCanvasPopManagerService.positionDisposable.disposeCount).toBe(1);
        expect(service.currentPopup).toBeNull();
    });

    it('does not open incomplete popups and replaces an older visible popup', () => {
        const { service, sheetCanvasPopManagerService } = createService();

        service.showPopup({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 0,
            col: 0,
            customRangeRect: { left: 0, top: 0, right: 10, bottom: 10 },
            type: HyperLinkEditSourceType.EDITING,
        });
        service.showPopup({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 0,
            col: 0,
            customRangeRect: { left: 0, top: 0, right: 10, bottom: 10 },
            type: HyperLinkEditSourceType.VIEWING,
        });
        expect(sheetCanvasPopManagerService.absolutePopups).toHaveLength(0);
        expect(sheetCanvasPopManagerService.positionPopups).toHaveLength(0);

        service.showPopup({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 0,
            col: 0,
            showAll: true,
            type: HyperLinkEditSourceType.VIEWING,
        });
        service.showPopup({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 2,
            col: 3,
            showAll: true,
            type: HyperLinkEditSourceType.VIEWING,
        });

        expect(sheetCanvasPopManagerService.cellPopups).toHaveLength(2);
        expect(sheetCanvasPopManagerService.cellDisposable.disposeCount).toBe(1);
        expect(service.currentPopup).toEqual(expect.objectContaining({ row: 2, col: 3 }));
    });

    it('starts viewing edits from cell content and preserves editor state while keep-visible is enabled', () => {
        const { service, sheetCanvasPopManagerService, univerInstanceService } = createService();
        univerInstanceService.workbook = {
            getSheetBySheetId: () => ({
                getCellRaw: () => ({ v: 'Cell Value' }),
            }),
        };

        service.startAddEditing({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 1,
            col: 1,
            type: HyperLinkEditSourceType.VIEWING,
        });
        expect(sheetCanvasPopManagerService.cellPopups).toHaveLength(1);
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

    it('uses rich text cell content as the default label when starting a viewing edit', () => {
        const { service, univerInstanceService } = createService();
        univerInstanceService.workbook = {
            getSheetBySheetId: () => ({
                getCellRaw: () => ({ p: { body: { dataStream: 'Rich Text\r\n' } } }),
            }),
        };

        service.startAddEditing({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 1,
            col: 1,
            type: HyperLinkEditSourceType.VIEWING,
        });

        expect(service.currentEditing).toEqual(expect.objectContaining({ label: 'Rich Text' }));
    });

    it('keeps a popup hidden when the same link is already being edited', () => {
        const { service, sheetCanvasPopManagerService } = createService();

        service.startAddEditing({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 1,
            col: 1,
            type: HyperLinkEditSourceType.VIEWING,
        });
        service.showPopup({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 1,
            col: 1,
            showAll: true,
            type: HyperLinkEditSourceType.VIEWING,
        });

        expect(sheetCanvasPopManagerService.cellPopups).toHaveLength(1);
        expect(service.currentPopup).toBeNull();
    });

    it('does not start document-editing flow when editor state has no document body', () => {
        const { service, editorBridgeService, textSelectionManagerService } = createService();
        editorBridgeService.visible = true;
        editorBridgeService.editCellState = {
            documentLayoutObject: {
                documentModel: {
                    getBody: () => null,
                },
            },
        };

        service.startAddEditing({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 1,
            col: 1,
            type: HyperLinkEditSourceType.EDITING,
        });

        expect(textSelectionManagerService.replacedDocRanges).toHaveLength(0);
        expect(service.currentEditing).toBeNull();
    });

    it('does not start document-editing flow when the editor is hidden', () => {
        const { service, textSelectionManagerService } = createService();

        service.startAddEditing({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 1,
            col: 1,
            type: HyperLinkEditSourceType.EDITING,
        });

        expect(textSelectionManagerService.replacedDocRanges).toHaveLength(0);
        expect(service.currentEditing).toBeNull();
    });

    it('selects the full editor text when adding a link from a collapsed editing selection', () => {
        const { service, editorBridgeService, textSelectionManagerService, sheetCanvasPopManagerService } = createService();
        editorBridgeService.visible = true;
        editorBridgeService.editCellState = {
            documentLayoutObject: {
                documentModel: {
                    getBody: () => ({ dataStream: 'Full Label\r\n', customRanges: [] }),
                },
            },
        };
        textSelectionManagerService.activeTextRange = { startOffset: 2, endOffset: 2, collapsed: true };

        service.startAddEditing({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 1,
            col: 1,
            type: HyperLinkEditSourceType.EDITING,
        });

        expect(textSelectionManagerService.replacedDocRanges[0].ranges).toEqual([{
            startOffset: 0,
            endOffset: 10,
            collapsed: false,
            label: 'Full Label',
        }]);
        expect(sheetCanvasPopManagerService.absolutePopups).toHaveLength(0);
        expect(service.currentEditing).toBeNull();
    });

    it('expands an editor selection to the full overlapping hyperlink range', () => {
        const { service, editorBridgeService, textSelectionManagerService } = createService();
        editorBridgeService.visible = true;
        editorBridgeService.editCellState = {
            documentLayoutObject: {
                documentModel: {
                    getBody: () => ({
                        dataStream: 'abcdef\r\n',
                        customRanges: [{ rangeId: 'link-1', startIndex: 1, endIndex: 4, rangeType: CustomRangeType.HYPERLINK }],
                    }),
                },
            },
        };
        textSelectionManagerService.activeTextRange = { startOffset: 2, endOffset: 3, collapsed: false };

        service.startAddEditing({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 1,
            col: 1,
            type: HyperLinkEditSourceType.EDITING,
        });

        expect(textSelectionManagerService.replacedDocRanges[0].ranges).toEqual([{
            startOffset: 1,
            endOffset: 5,
            collapsed: false,
            label: 'bcde',
        }]);
        expect(service.currentEditing).toBeNull();
    });

    it('ends viewing edit sessions from edit popup click handlers', () => {
        const { service, sheetCanvasPopManagerService } = createService();

        service.startAddEditing({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 1,
            col: 1,
            type: HyperLinkEditSourceType.VIEWING,
        });
        sheetCanvasPopManagerService.cellPopups[0].popup.onClickOutside();
        expect(service.currentEditing).toBeNull();

        service.startAddEditing({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 1,
            col: 1,
            type: HyperLinkEditSourceType.VIEWING,
        });
        sheetCanvasPopManagerService.cellPopups[1].popup.onContextMenu();
        expect(service.currentEditing).toBeNull();
    });
});
