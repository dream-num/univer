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

import { BorderStyleTypes, ObjectMatrix } from '@univerjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BORDER_TYPE } from '../../../../basics/const';
import { Border } from '../border';

const drawDiagonalLineByBorderTypeMock = vi.fn((..._args: any[]) => undefined);
const drawLineByBorderTypeMock = vi.fn((..._args: any[]) => undefined);
const getLineWidthMock = vi.fn((..._args: any[]) => 1);
const setLineTypeMock = vi.fn((..._args: any[]) => undefined);

vi.mock('../../../../basics/draw', () => ({
    drawDiagonalLineByBorderType: (...args: any[]) => drawDiagonalLineByBorderTypeMock(...args),
    drawLineByBorderType: (...args: any[]) => drawLineByBorderTypeMock(...args),
    getLineWidth: (...args: any[]) => getLineWidthMock(...args),
    setLineType: (...args: any[]) => setLineTypeMock(...args),
}));

function createCtx() {
    return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        closePath: vi.fn(),
        translateWithPrecisionRatio: vi.fn(),
        setLineWidthByPrecision: vi.fn(),
        getScale: vi.fn(() => ({ scaleX: 1, scaleY: 1 })),
        strokeStyle: '',
        lineCap: 'round',
        globalCompositeOperation: 'source-over',
    } as any;
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
        vi.clearAllMocks();
    });

    it('returns early on invalid draw preconditions and iterates valid range', () => {
        const extension = new Border();
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

    it('handles renderBorderByCell hidden/diff branches', () => {
        const extension = new Border();
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

    it('renders regular/diagonal/double borders and internal helpers', () => {
        const extension = new Border() as any;
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

        const doubleSpy = vi.spyOn(extension, '_renderDoubleBorder').mockImplementation(() => {});
        extension.renderBorderByCell(renderBorderContext, 0, 0, borderConfig);

        expect(getLineWidthMock).toHaveBeenCalled();
        expect(setLineTypeMock).toHaveBeenCalled();
        expect(drawDiagonalLineByBorderTypeMock).toHaveBeenCalled();
        expect(drawLineByBorderTypeMock).toHaveBeenCalled();
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
        const extension = new Border() as any;
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

        expect(drawLineByBorderTypeMock).toHaveBeenCalled();
        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.restore).toHaveBeenCalled();
    });
});
