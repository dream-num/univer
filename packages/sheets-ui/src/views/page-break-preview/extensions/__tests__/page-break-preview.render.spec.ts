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

import { describe, expect, it, vi } from 'vitest';
import {
    PageBreakPreviewBackgroundExtension,
    PageBreakPreviewOverlayExtension,
    resolvePageBreakPreviewRange,
} from '../page-break-preview.render';

function createWorksheet(sheetViews: string) {
    return {
        getSnapshot: () => ({ _xlsx: { raw: { sheetViews } } }),
        getUnitId: () => 'unit-1',
        getSheetId: () => 'sheet-1',
        getMaxRows: () => 100,
        getMaxColumns: () => 26,
    };
}

function createDefinedNamesService(formulaOrRefString = "'Sheet 1'!$A$1:$F$5") {
    return {
        getValueByName: vi.fn(() => ({
            id: 'print-area',
            name: '_xlnm.Print_Area',
            localSheetId: 'sheet-1',
            formulaOrRefString,
        })),
    };
}

function createRenderFixture() {
    const worksheet = createWorksheet('<sheetView view="pageBreakPreview"/>');
    const definedNamesService = createDefinedNamesService();
    const cell = (row: number, column: number) => ({
        startX: column * 50,
        endX: (column + 1) * 50,
        startY: row * 20,
        endY: (row + 1) * 20,
    });
    const skeleton = {
        worksheet,
        rowColumnSegment: { startRow: 0, startColumn: 0, endRow: 9, endColumn: 9 },
        getCellWithCoordByIndex: vi.fn(cell),
    };
    const ctx = {
        save: vi.fn(),
        restore: vi.fn(),
        fillRect: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        setLineWidthByPrecision: vi.fn(),
        stroke: vi.fn(),
        strokeRect: vi.fn(),
        fillText: vi.fn(),
        fillStyle: '',
        strokeStyle: '',
        font: '',
        textAlign: '',
        textBaseline: '',
    };
    return { ctx, definedNamesService, skeleton };
}

describe('page break preview rendering', () => {
    it('resolves the local print area only for page break preview sheets', () => {
        const definedNamesService = createDefinedNamesService();
        const worksheet = createWorksheet("<sheetView view='pageBreakPreview'/>");

        expect(resolvePageBreakPreviewRange(worksheet as never, definedNamesService as never)).toEqual({
            startRow: 0,
            startColumn: 0,
            endRow: 4,
            endColumn: 5,
        });
        expect(definedNamesService.getValueByName).toHaveBeenCalledWith(
            'unit-1',
            '_xlnm.Print_Area',
            'sheet-1'
        );

        const normalWorksheet = createWorksheet('<sheetView view="normal"/>');
        expect(resolvePageBreakPreviewRange(normalWorksheet as never, definedNamesService as never)).toBeNull();
    });

    it('paints the non-print area, printable page, printable grid, boundary, and watermark', () => {
        const { ctx, definedNamesService, skeleton } = createRenderFixture();

        new PageBreakPreviewBackgroundExtension(definedNamesService as never)
            .draw(ctx as never, { scaleX: 1, scaleY: 1 }, skeleton as never);
        new PageBreakPreviewOverlayExtension(definedNamesService as never)
            .draw(ctx as never, { scaleX: 1, scaleY: 1 }, skeleton as never);

        expect(ctx.fillRect).toHaveBeenNthCalledWith(1, 0, 0, 500, 200);
        expect(ctx.fillRect).toHaveBeenNthCalledWith(2, 0, 0, 300, 100);
        expect(ctx.stroke).toHaveBeenCalledOnce();
        expect(ctx.strokeRect).toHaveBeenCalledWith(0, 0, 300, 100);
        expect(ctx.fillText).toHaveBeenCalledWith('Page 1', 150, 50);
    });
});
