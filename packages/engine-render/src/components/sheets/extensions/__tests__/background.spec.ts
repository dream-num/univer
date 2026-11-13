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
import { BooleanNumber, ObjectMatrix, Univer, UniverInstanceType } from '@univerjs/core';
import { afterEach, assert, beforeEach, describe, expect, it, vi } from 'vitest';
import { UniverRenderingContext } from '../../../../context';
import { SpreadsheetSkeleton } from '../../sheet.render-skeleton';
import { Background } from '../background';

let univer: Univer;
let injector: Injector;

function createCtx() {
    const ctx = injector.get(UniverRenderingContext);
    vi.spyOn(ctx, 'fill');
    return ctx;
}

function createCellInfo(overrides?: Partial<ReturnType<SpreadsheetSkeleton['getCellWithCoordByIndex']>>) {
    return { ...injector.get(SpreadsheetSkeleton).getCellWithCoordByIndex(0, 0), ...overrides };
}

function createBgMatrix(entries: Array<[number, number, string]>) {
    const matrix = new ObjectMatrix<string>();
    entries.forEach(([row, col, value]) => matrix.setValue(row, col, value));
    vi.spyOn(matrix, 'forValue');
    return matrix;
}

describe('background extension', () => {
    beforeEach(() => {
        univer = new Univer();
        injector = univer.__getInjector();
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'background-render',
            sheetOrder: ['sheet'],
            sheets: {
                sheet: {
                    id: 'sheet',
                    rowCount: 60,
                    columnCount: 60,
                    defaultRowHeight: 20,
                    defaultColumnWidth: 40,
                    rowHeader: { width: 46, hidden: BooleanNumber.TRUE },
                    columnHeader: { height: 20, hidden: BooleanNumber.TRUE },
                },
            },
        });
        injector.add([Background]);
        injector.add([SpreadsheetSkeleton, {
            useFactory: function createSkeleton() {
                return injector.createInstance(SpreadsheetSkeleton, workbook.getActiveSheet()!, workbook.getStyles());
            },
        }]);
        injector.add([UniverRenderingContext, {
            useFactory: function createContext() {
                return injector.createInstance(UniverRenderingContext, document.createElement('canvas').getContext('2d')!);
            },
        }]);
    });

    afterEach(() => {
        univer.dispose();
        vi.restoreAllMocks();
    });

    it('draws populated cells inside visible ranges across background colors', () => {
        const extension = injector.get(Background);
        const skeleton = injector.get(SpreadsheetSkeleton).calculate() as SpreadsheetSkeleton;
        const ctx = createCtx();
        const bgByRange = createBgMatrix([[0, 0, '1']]);
        const bgByMatrix = createBgMatrix([[0, 0, '1'], [50, 50, '1']]);
        const rendered = vi.spyOn(extension, 'renderBGByCell');
        const backgroundPositions = skeleton.stylesCache.backgroundPositions;
        assert.isDefined(backgroundPositions);
        for (const [color, matrix] of [['#ff0000', bgByRange], ['#00ff00', bgByMatrix]] as const) {
            skeleton.stylesCache.background = { [color]: matrix };
            backgroundPositions.reset();
            extension.draw(ctx, { scaleX: 1, scaleY: 1 }, skeleton, [], {
                viewportKey: 'viewMain',
                viewRanges: [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }],
                checkOutOfViewBound: true,
            });
        }
        expect(bgByRange.forValue).not.toHaveBeenCalled();
        expect(bgByMatrix.forValue).not.toHaveBeenCalled();
        expect(ctx.fill).toHaveBeenCalled();
        expect(rendered).toHaveBeenCalledTimes(2);
        expect(rendered.mock.calls.every(([, row, col]) => row === 0 && col === 0)).toBe(true);
    });

    it('reuses cached background cell positions when drawing backgrounds', () => {
        const extension = injector.get(Background);
        const skeleton = injector.get(SpreadsheetSkeleton).calculate() as SpreadsheetSkeleton;
        const ctx = createCtx();
        skeleton.stylesCache.background = { '#ff0000': createBgMatrix([[0, 0, '1']]) };
        const backgroundPositions = skeleton.stylesCache.backgroundPositions;
        assert.isDefined(backgroundPositions);
        backgroundPositions.setValue(0, 0, createCellInfo());
        const coordinates = vi.spyOn(skeleton, 'getCellWithCoordByIndex');
        extension.draw(ctx, { scaleX: 1, scaleY: 1 }, skeleton, [], {
            viewportKey: 'viewMain',
            viewRanges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
            checkOutOfViewBound: true,
        });
        expect(coordinates).not.toHaveBeenCalled();
        expect(ctx.fill).toHaveBeenCalled();
    });

    it('skips merge lookups when drawing merge-free backgrounds', () => {
        const extension = injector.get(Background);
        const skeleton = injector.get(SpreadsheetSkeleton).calculate() as SpreadsheetSkeleton;
        const worksheet = skeleton.worksheet;
        const ctx = createCtx();
        skeleton.stylesCache.background = { '#ff0000': createBgMatrix([[0, 0, '1']]) };
        const mergeDataIndex = vi.spyOn(worksheet.getSpanModel(), 'getMergeDataIndex');
        const spanModel = vi.spyOn(worksheet, 'getSpanModel');
        const mergeRanges = vi.spyOn(worksheet, 'getMergedCellRange');
        extension.draw(ctx, { scaleX: 1, scaleY: 1 }, skeleton, [], {
            viewportKey: 'viewMain',
            viewRanges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
            checkOutOfViewBound: true,
            hasMergeData: false,
        });
        expect(mergeRanges).not.toHaveBeenCalled();
        expect(spanModel).not.toHaveBeenCalled();
        expect(mergeDataIndex).not.toHaveBeenCalled();
        expect(ctx.fill).toHaveBeenCalled();
    });

    it('uses diff ranges to choose background iteration during incremental drawing', () => {
        const extension = injector.get(Background);
        const skeleton = injector.get(SpreadsheetSkeleton).calculate() as SpreadsheetSkeleton;
        const ctx = createCtx();
        const bgMatrix = createBgMatrix([[1, 1, '1']]);
        skeleton.stylesCache.background = { '#ff0000': bgMatrix };
        const coordinates = vi.spyOn(skeleton, 'getCellWithCoordByIndex');
        extension.draw(ctx, { scaleX: 1, scaleY: 1 }, skeleton, [{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }], {
            viewportKey: 'viewMain',
            viewRanges: [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }],
            checkOutOfViewBound: true,
        });
        expect(bgMatrix.forValue).not.toHaveBeenCalled();
        expect(coordinates).toHaveBeenCalledWith(1, 1, false);
    });

    it('draws merged cell backgrounds and handles early draw exits', () => {
        const extension = injector.get(Background);
        const skeleton = injector.get(SpreadsheetSkeleton).calculate() as SpreadsheetSkeleton;
        const ctx = createCtx();
        skeleton.worksheet.getSpanModel().add({ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 });
        skeleton.stylesCache.background = { '#112233': createBgMatrix([[0, 0, '1']]) };
        const coordinates = vi.spyOn(skeleton, 'getCellWithCoordByIndex');
        extension.draw(ctx, { scaleX: 1, scaleY: 1 }, skeleton, [], {
            viewportKey: 'viewMain',
            viewRanges: [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }],
            checkOutOfViewBound: true,
            hasMergeData: true,
        });
        expect(coordinates).toHaveBeenCalled();
        expect(ctx.fill).toHaveBeenCalled();
    });

    it('covers renderBGByCell visibility and merge checks', () => {
        const extension = injector.get(Background);
        const skeleton = injector.get(SpreadsheetSkeleton).calculate() as SpreadsheetSkeleton;
        const worksheet = skeleton.worksheet;
        const backgroundPaths = new Path2D();
        const rect = vi.spyOn(backgroundPaths, 'rect');
        const backgroundPositions = skeleton.stylesCache.backgroundPositions;
        assert.isDefined(backgroundPositions);
        const bgContext = {
            ctx: createCtx(),
            spreadsheetSkeleton: skeleton,
            backgroundPositions,
            checkOutOfViewBound: true,
            backgroundPaths,
            scaleX: 1,
            scaleY: 1,
            viewRanges: [{ startRow: 10, endRow: 10, startColumn: 10, endColumn: 10 }],
            diffRanges: [],
            cellInfo: createCellInfo(),
            skipRenderRangeCheck: false,
        };
        expect(extension.renderBGByCell(bgContext, 0, 0)).toBe(true);
        expect(rect).not.toHaveBeenCalled();
        bgContext.viewRanges = [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }];
        worksheet.getRowManager().getRowData()[0] = { hd: BooleanNumber.TRUE };
        expect(extension.renderBGByCell(bgContext, 0, 0)).toBe(true);
        worksheet.getRowManager().getRowData()[0] = {};
        bgContext.viewRanges = [{ startRow: 10, endRow: 10, startColumn: 10, endColumn: 10 }];
        bgContext.skipRenderRangeCheck = true;
        expect(extension.renderBGByCell(bgContext, 0, 0)).toBeUndefined();
        expect(rect).toHaveBeenCalled();
        bgContext.skipRenderRangeCheck = false;
        worksheet.getSpanModel().add({ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 });
        bgContext.cellInfo = createCellInfo();
        worksheet.getRowManager().getRowData()[0] = { hd: BooleanNumber.TRUE };
        worksheet.getRowManager().getRowData()[1] = { hd: BooleanNumber.TRUE };
        expect(extension.renderBGByCell(bgContext, 0, 0)).toBe(true);
        worksheet.getRowManager().getRowData()[0] = {};
        worksheet.getRowManager().getRowData()[1] = {};
        worksheet.getColumnManager().getColumnData()[0] = { hd: BooleanNumber.TRUE };
        worksheet.getColumnManager().getColumnData()[1] = { hd: BooleanNumber.TRUE };
        expect(extension.renderBGByCell(bgContext, 0, 0)).toBe(true);
        worksheet.getColumnManager().getColumnData()[0] = {};
        worksheet.getColumnManager().getColumnData()[1] = {};
        extension.renderBGByCell(bgContext, 0, 0);
        expect(rect).toHaveBeenCalled();
    });
});
