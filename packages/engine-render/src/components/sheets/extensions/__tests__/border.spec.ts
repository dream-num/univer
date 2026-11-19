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

import type { Injector, IWorkbookData, Workbook } from '@univerjs/core';
import { BooleanNumber, BorderStyleTypes, ObjectMatrix, Univer, UniverInstanceType } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BORDER_TYPE } from '../../../../basics/const';
import { UniverRenderingContext } from '../../../../context';
import { SpreadsheetSkeleton } from '../../sheet.render-skeleton';
import { Border } from '../border';

let injector: Injector;
let univer: Univer;

function createCtx() {
    const native = document.createElement('canvas').getContext('2d')!;
    const ctx = injector.createChild([[UniverRenderingContext, {
        useFactory: function createTestInstance() {
            return injector.createInstance(UniverRenderingContext, native);
        },
    }]]).get(UniverRenderingContext);
    for (const method of ['save', 'restore', 'beginPath', 'closePath', 'translateWithPrecisionRatio', 'setLineWidthByPrecision', 'setLineDash', 'stroke', 'moveToByPrecision', 'lineToByPrecision'] as const) {
        vi.spyOn(ctx, method);
    }
    ctx.lineCap = 'round';
    return ctx;
}

function createCellInfo(overrides?: Partial<any>) {
    return {
        startX: 0,
        startY: 0,
        endX: 20,
        endY: 10,
        isMerged: false,
        isMergedMainCell: false,
        mergeInfo: {
            startX: 0,
            startY: 0,
            endX: 20,
            endY: 10,
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 0,
        },
        ...overrides,
    };
}

describe('border extension', () => {
    beforeEach(() => {
        univer = new Univer();
        injector = univer.__getInjector();
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'border-render',
            sheetOrder: ['sheet'],
            sheets: { sheet: {
                id: 'sheet',
                rowCount: 10,
                columnCount: 10,
                defaultRowHeight: 10,
                defaultColumnWidth: 20,
                rowHeader: { width: 46, hidden: BooleanNumber.TRUE },
                columnHeader: { height: 20, hidden: BooleanNumber.TRUE },
                cellData: { 0: { 0: { s: { bd: { t: { s: BorderStyleTypes.THIN, cl: { rgb: '#111111' } } } } } } },
            } },
        });
        injector.add([Border]);
        injector.add([SpreadsheetSkeleton, {
            useFactory: function createSkeleton() {
                return injector.createInstance(SpreadsheetSkeleton, workbook.getActiveSheet()!, workbook.getStyles());
            },
        }]);
        vi.clearAllMocks();
    });

    afterEach(() => univer.dispose());

    it('reuses a consecutive brush without omitting edges and reapplies dash transitions', () => {
        const extension = injector.get(Border);
        const ctx = createCtx();
        const skeleton = injector.get(SpreadsheetSkeleton).calculate() as SpreadsheetSkeleton;
        const context: Parameters<Border['renderBorderByCell']>[0] = {
            ctx,
            precisionScale: 1,
            overflowCache: skeleton.overflowCache,
            spreadsheetSkeleton: skeleton,
            diffRanges: [],
            viewRanges: [],
        };
        const solid = Object.fromEntries([BORDER_TYPE.TOP, BORDER_TYPE.RIGHT, BORDER_TYPE.BOTTOM, BORDER_TYPE.LEFT]
            .map((type) => [type, { type, style: BorderStyleTypes.THIN, color: '#111' }]));
        for (let col = 0; col < 4; col++) {
            extension.renderBorderByCell(context, 0, col, solid);
        }
        expect(ctx.stroke).toHaveBeenCalledTimes(16);
        expect(ctx.setLineDash).toHaveBeenCalledExactlyOnceWith([]);
        expect(ctx.setLineWidthByPrecision).toHaveBeenCalledTimes(1);
        extension.renderBorderByCell(context, 0, 4, {
            [BORDER_TYPE.TOP]: { type: BORDER_TYPE.TOP, style: BorderStyleTypes.DASHED, color: '#222' },
            [BORDER_TYPE.BOTTOM]: { type: BORDER_TYPE.BOTTOM, style: BorderStyleTypes.THIN, color: '#111' },
        });
        expect(vi.mocked(ctx.setLineDash).mock.calls.map(([dash]) => dash)).toEqual([[], [3], []]);
        expect(ctx.stroke).toHaveBeenCalledTimes(18);
        expect(ctx.strokeStyle).toBe('#111111');
    });

    it('checks only the border row for overflow exclusions', () => {
        const extension = injector.get(Border) as any;
        const overflow = new ObjectMatrix({
            3: { 1: { startRow: 3, endRow: 3, startColumn: 1, endColumn: 4 } },
            999: new Proxy({}, { ownKeys: () => { throw new Error('Unrelated overflow row enumerated'); } }),
        });
        expect(extension._getOverflowExclusion(overflow, BORDER_TYPE.LEFT, 3, 2)).toBe(true);
        expect(extension._getOverflowExclusion(overflow, BORDER_TYPE.RIGHT, 3, 4)).toBe(false);
        expect(extension._getOverflowExclusion(overflow, BORDER_TYPE.LEFT, 5, 2)).toBe(false);
        expect(extension._getOverflowExclusion(overflow, BORDER_TYPE.TOP, 3, 2)).toBe(false);
    });

    it('returns early on invalid draw preconditions and iterates valid range', () => {
        const extension = injector.get(Border);
        const ctx = createCtx();

        extension.draw(ctx, { scaleX: 1, scaleY: 1 } as any, { stylesCache: {} } as any, [], { viewRanges: [] } as any);

        const borderMatrix = new ObjectMatrix<any>();
        borderMatrix.setValue(0, 0, {
            [BORDER_TYPE.TOP]: { type: BORDER_TYPE.TOP, style: BorderStyleTypes.THIN, color: '#111' },
        });
        const skeleton = {
            worksheet: {
                getRowVisible: vi.fn(() => true),
                getColVisible: vi.fn(() => true),
            },
            rowHeightAccumulation: [10],
            columnWidthAccumulation: [20],
            columnTotalWidth: 20,
            rowTotalHeight: 10,
            stylesCache: { border: borderMatrix },
            overflowCache: new ObjectMatrix(),
            getCellWithCoordByIndex: vi.fn(() => createCellInfo()),
        } as any;

        const spy = vi.spyOn(extension, 'renderBorderByCell');
        extension.draw(
            ctx,
            { scaleX: 1, scaleY: 1 } as any,
            skeleton,
            [],
            { viewRanges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }] } as any
        );
        expect(spy).toHaveBeenCalled();
        expect(ctx.translateWithPrecisionRatio).toHaveBeenCalled();
    });

    it('keeps live native transforms for custom border renderers', () => {
        const scales: { scaleX: number; scaleY: number }[] = [];
        class CustomBorder extends Border {
            override renderBorderByCell({ ctx }: Parameters<Border['renderBorderByCell']>[0]) {
                ctx.getScale();
                ctx._context.scale(2, 3);
                scales.push(ctx.getScale());
                return undefined;
            }
        }
        const extension = injector.createChild([[CustomBorder, { useFactory: function createTestInstance() {
            return injector.createInstance(CustomBorder);
        } }]]).get(CustomBorder);
        const native = document.createElement('canvas').getContext('2d')!;
        native.scale(1.25, 1.5);
        const ctx = injector.createChild([[UniverRenderingContext, { useFactory: function createTestInstance() {
            return injector.createInstance(UniverRenderingContext, native);
        } }]]).get(UniverRenderingContext);
        const skeleton = injector.get(SpreadsheetSkeleton).calculate() as SpreadsheetSkeleton;
        skeleton._setBorderStylesCache(0, 0, skeleton.worksheet.getComposedCellStyle(0, 0), undefined);
        extension.draw(ctx, { scaleX: 1.25, scaleY: 1.5 }, skeleton, [], {
            viewportKey: 'viewMain',
            viewRanges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
        });
        expect(scales).toEqual([{ scaleX: 2.5, scaleY: 4.5 }]);
        expect(ctx.getScale()).toEqual({ scaleX: 1.25, scaleY: 1.5 });
    });

    it('handles renderBorderByCell hidden/diff branches', () => {
        const extension = injector.get(Border);
        const ctx = createCtx();
        const overflowCache = new ObjectMatrix<any>();

        const skeleton = {
            worksheet: {
                getRowVisible: vi.fn(() => false),
                getColVisible: vi.fn(() => true),
            },
            stylesCache: { border: new ObjectMatrix() },
            getCellWithCoordByIndex: vi.fn(() => createCellInfo()),
        } as any;

        const renderBorderContext = {
            ctx,
            precisionScale: 1,
            overflowCache,
            spreadsheetSkeleton: skeleton,
            diffRanges: [{ startRow: 2, endRow: 2, startColumn: 2, endColumn: 2 }],
            viewRanges: [],
        } as any;

        const borderConfig = {
            [BORDER_TYPE.TOP]: { type: BORDER_TYPE.TOP, style: BorderStyleTypes.THIN, color: '#111' },
        } as any;

        const hiddenResult = extension.renderBorderByCell(renderBorderContext, 0, 0, borderConfig);
        expect(hiddenResult).toBe(true);

        skeleton.worksheet.getRowVisible = vi.fn(() => true);
        skeleton.worksheet.getColVisible = vi.fn(() => true);
        const outOfDiff = extension.renderBorderByCell(renderBorderContext, 0, 0, borderConfig);
        expect(outOfDiff).toBe(true);
    });

    it.each([BORDER_TYPE.TL_BR, BORDER_TYPE.BL_TR])('keeps outer borders after skipping a merged child diagonal %s', (diagonalType) => {
        const extension = injector.get(Border);
        const ctx = createCtx();
        const renderBorderContext = {
            ctx,
            precisionScale: 1,
            overflowCache: new ObjectMatrix(),
            spreadsheetSkeleton: {
                getCellWithCoordByIndex: () => createCellInfo({
                    isMerged: true,
                    mergeInfo: {
                        startRow: 7,
                        endRow: 8,
                        startColumn: 0,
                        endColumn: 3,
                    },
                }),
            },
            diffRanges: [{ startRow: 7, endRow: 8, startColumn: 0, endColumn: 3 }],
            viewRanges: [],
        } as any;

        extension.renderBorderByCell(renderBorderContext, 8, 0, {
            [diagonalType]: { type: diagonalType, style: BorderStyleTypes.THIN, color: '#000000' },
            [BORDER_TYPE.LEFT]: { type: BORDER_TYPE.LEFT, style: BorderStyleTypes.MEDIUM, color: '#000000' },
            [BORDER_TYPE.BOTTOM]: { type: BORDER_TYPE.BOTTOM, style: BorderStyleTypes.THIN, color: '#000000' },
        });

        expect(ctx.stroke).toHaveBeenCalledTimes(2);
        expect(vi.mocked(ctx.moveToByPrecision).mock.calls).toEqual([[0, -0.5], [0, 10]]);
        expect(vi.mocked(ctx.lineToByPrecision).mock.calls).toEqual([[0, 10.5], [20, 10]]);
    });

    it('renders regular/diagonal/double borders and internal helpers', () => {
        const extension = injector.get(Border) as any;
        const ctx = createCtx();
        const overflowCache = new ObjectMatrix<any>();
        const borderMatrix = new ObjectMatrix<any>();

        const borderConfig = {
            [BORDER_TYPE.TOP]: { type: BORDER_TYPE.TOP, style: BorderStyleTypes.DOUBLE, color: '#111' },
            [BORDER_TYPE.LEFT]: { type: BORDER_TYPE.LEFT, style: BorderStyleTypes.THIN, color: '#222' },
            [BORDER_TYPE.TL_BR]: { type: BORDER_TYPE.TL_BR, style: BorderStyleTypes.THIN, color: '#333' },
        } as any;

        const skeleton = {
            worksheet: {
                getRowVisible: vi.fn(() => true),
                getColVisible: vi.fn(() => true),
            },
            stylesCache: { border: borderMatrix },
            getCellWithCoordByIndex: vi.fn(() => createCellInfo()),
        } as any;

        const renderBorderContext = {
            ctx,
            precisionScale: 1,
            overflowCache,
            spreadsheetSkeleton: skeleton,
            diffRanges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
            viewRanges: [],
        } as any;

        const doubleSpy = vi.spyOn(extension, '_renderDoubleBorder');
        extension.renderBorderByCell(renderBorderContext, 0, 0, borderConfig);

        expect(ctx.setLineWidthByPrecision).toHaveBeenCalledWith(1);
        expect(ctx.setLineDash).toHaveBeenCalledWith([]);
        expect(ctx.lineToByPrecision).toHaveBeenCalledWith(20, 10);
        expect(ctx.lineToByPrecision).toHaveBeenCalledWith(20, 0);
        expect(ctx.lineToByPrecision).toHaveBeenCalledWith(0, 10);
        expect(doubleSpy).toHaveBeenCalled();

        overflowCache.setValue(1, 3, {
            startRow: 1,
            endRow: 1,
            startColumn: 2,
            endColumn: 4,
        });
        expect(extension._getOverflowExclusion(overflowCache, BORDER_TYPE.TOP, 1, 3)).toBe(false);
        expect(extension._getOverflowExclusion(overflowCache, BORDER_TYPE.LEFT, 1, 3)).toBe(true);
        expect(extension._getOverflowExclusion(overflowCache, BORDER_TYPE.RIGHT, 1, 3)).toBe(true);

        const specificCache = new ObjectMatrix<any>();
        specificCache.setValue(2, 2, {
            [BORDER_TYPE.LEFT]: { type: BORDER_TYPE.LEFT, style: BorderStyleTypes.THIN, color: '#111' },
            [BORDER_TYPE.RIGHT]: { style: BorderStyleTypes.THIN, color: '#111' },
        });
        const specific = extension._getSpecificCellBorder(specificCache, 2, 2);
        expect(specific.left?.type).toBe(BORDER_TYPE.LEFT);
        expect(specific.right).toBeNull();
        expect(specific.top).toBeNull();
    });

    it('covers detailed double-border offset branches for vertical and horizontal lines', () => {
        const extension = injector.get(Border) as any;
        const ctx = createCtx();
        const borderCache = new ObjectMatrix<any>();

        borderCache.setValue(0, -1, {
            [BORDER_TYPE.TOP]: { type: BORDER_TYPE.TOP, style: BorderStyleTypes.DOUBLE, color: '#111' },
            [BORDER_TYPE.BOTTOM]: { type: BORDER_TYPE.BOTTOM, style: BorderStyleTypes.DOUBLE, color: '#111' },
            [BORDER_TYPE.RIGHT]: { type: BORDER_TYPE.RIGHT, style: BorderStyleTypes.THIN, color: '#111' },
        });
        borderCache.setValue(0, 1, {
            [BORDER_TYPE.TOP]: { type: BORDER_TYPE.TOP, style: BorderStyleTypes.DOUBLE, color: '#111' },
            [BORDER_TYPE.BOTTOM]: { type: BORDER_TYPE.BOTTOM, style: BorderStyleTypes.DOUBLE, color: '#111' },
            [BORDER_TYPE.LEFT]: { type: BORDER_TYPE.LEFT, style: BorderStyleTypes.THIN, color: '#111' },
        });
        borderCache.setValue(-1, 0, {
            [BORDER_TYPE.BOTTOM]: { type: BORDER_TYPE.BOTTOM, style: BorderStyleTypes.THIN, color: '#111' },
            [BORDER_TYPE.LEFT]: { type: BORDER_TYPE.LEFT, style: BorderStyleTypes.DOUBLE, color: '#111' },
            [BORDER_TYPE.RIGHT]: { type: BORDER_TYPE.RIGHT, style: BorderStyleTypes.DOUBLE, color: '#111' },
        });
        borderCache.setValue(1, 0, {
            [BORDER_TYPE.TOP]: { type: BORDER_TYPE.TOP, style: BorderStyleTypes.THIN, color: '#111' },
            [BORDER_TYPE.LEFT]: { type: BORDER_TYPE.LEFT, style: BorderStyleTypes.DOUBLE, color: '#111' },
            [BORDER_TYPE.RIGHT]: { type: BORDER_TYPE.RIGHT, style: BorderStyleTypes.DOUBLE, color: '#111' },
        });
        borderCache.setValue(-1, -1, {
            [BORDER_TYPE.BOTTOM]: { type: BORDER_TYPE.BOTTOM, style: BorderStyleTypes.DOUBLE, color: '#111' },
            [BORDER_TYPE.RIGHT]: { type: BORDER_TYPE.RIGHT, style: BorderStyleTypes.DOUBLE, color: '#111' },
        });
        borderCache.setValue(-1, 1, {
            [BORDER_TYPE.BOTTOM]: { type: BORDER_TYPE.BOTTOM, style: BorderStyleTypes.DOUBLE, color: '#111' },
            [BORDER_TYPE.LEFT]: { type: BORDER_TYPE.LEFT, style: BorderStyleTypes.DOUBLE, color: '#111' },
        });
        borderCache.setValue(1, -1, {
            [BORDER_TYPE.TOP]: { type: BORDER_TYPE.TOP, style: BorderStyleTypes.DOUBLE, color: '#111' },
            [BORDER_TYPE.RIGHT]: { type: BORDER_TYPE.RIGHT, style: BorderStyleTypes.DOUBLE, color: '#111' },
        });
        borderCache.setValue(1, 1, {
            [BORDER_TYPE.TOP]: { type: BORDER_TYPE.TOP, style: BorderStyleTypes.DOUBLE, color: '#111' },
            [BORDER_TYPE.LEFT]: { type: BORDER_TYPE.LEFT, style: BorderStyleTypes.DOUBLE, color: '#111' },
        });

        const renderBorderContext = {
            ctx,
            precisionScale: 1,
            spreadsheetSkeleton: {
                stylesCache: {
                    border: borderCache,
                },
            },
        } as any;

        extension._renderDoubleBorder({
            renderBorderContext,
            row: 0,
            col: 0,
            type: BORDER_TYPE.LEFT,
            lineWidth: 2,
            startX: 0,
            startY: 0,
            endX: 0,
            endY: 20,
        });

        extension._renderDoubleBorder({
            renderBorderContext,
            row: 0,
            col: 0,
            type: BORDER_TYPE.TOP,
            lineWidth: 2,
            startX: 0,
            startY: 0,
            endX: 20,
            endY: 0,
        });

        expect(ctx.stroke).toHaveBeenCalled();
        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.restore).toHaveBeenCalled();
    });
});
