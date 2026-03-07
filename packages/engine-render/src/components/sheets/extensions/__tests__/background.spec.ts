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

import { ObjectMatrix } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { Background } from '../background';

function createCtx() {
    return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        closePath: vi.fn(),
        fill: vi.fn(),
        getScale: vi.fn(() => ({ scaleX: 1, scaleY: 1 })),
        fillStyle: '',
    } as any;
}

function createCellInfo(overrides?: Partial<any>) {
    return {
        row: 0,
        column: 0,
        startX: 0,
        startY: 0,
        endX: 10,
        endY: 20,
        isMerged: false,
        isMergedMainCell: false,
        mergeInfo: {
            startX: 0,
            startY: 0,
            endX: 10,
            endY: 20,
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 0,
        },
        ...overrides,
    };
}

function createBgMatrix(entries: Array<[number, number, string]>, size = entries.length) {
    const valueMap = new Map(entries.map((item) => [`${item[0]}-${item[1]}`, item[2]]));
    return {
        getValue: vi.fn((row: number, col: number) => valueMap.get(`${row}-${col}`)),
        forValue: vi.fn((cb: (row: number, col: number, value: string) => void) => {
            entries.forEach(([row, col, value]) => cb(row, col, value));
        }),
        getSizeOf: vi.fn(() => size),
    };
}

describe('background extension', () => {
    it('draws by view ranges and by matrix iteration', () => {
        const extension = new Background();
        const ctx = createCtx();
        const bgByRange = createBgMatrix([[0, 0, '1']], 99);
        const bgByMatrix = createBgMatrix([[0, 0, '1']], 1);

        const worksheet = {
            getMergedCellRange: vi.fn(() => []),
            getRowVisible: vi.fn(() => true),
            getColVisible: vi.fn(() => true),
            getSpanModel: vi.fn(() => ({
                getMergeDataIndex: vi.fn(() => -1),
            })),
        } as any;

        const skeletonBase = {
            worksheet,
            rowHeightAccumulation: [20],
            columnWidthAccumulation: [40],
            columnTotalWidth: 40,
            rowTotalHeight: 20,
            getCellByIndexWithNoHeader: vi.fn(() => createCellInfo()),
            getCellWithCoordByIndex: vi.fn(() => createCellInfo()),
        };

        extension.draw(
            ctx,
            { scaleX: 1, scaleY: 1 } as any,
            {
                ...skeletonBase,
                stylesCache: {
                    background: { '#ff0000': bgByRange },
                    backgroundPositions: new ObjectMatrix(),
                },
            } as any,
            [],
            {
                viewRanges: [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }],
                checkOutOfViewBound: true,
            } as any
        );
        expect(bgByRange.forValue).not.toHaveBeenCalled();
        expect(ctx.fill).toHaveBeenCalled();

        extension.draw(
            ctx,
            { scaleX: 1, scaleY: 1 } as any,
            {
                ...skeletonBase,
                stylesCache: {
                    background: { '#00ff00': bgByMatrix },
                    backgroundPositions: new ObjectMatrix(),
                },
            } as any,
            [],
            {
                viewRanges: [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }],
                checkOutOfViewBound: true,
            } as any
        );
        expect(bgByMatrix.forValue).toHaveBeenCalled();
    });

    it('draws merged cell backgrounds and handles early draw exits', () => {
        const extension = new Background();
        const ctx = createCtx();
        const bgMatrix = createBgMatrix([[0, 0, '1']], 2);
        const mergedRange = { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 };

        const skeleton = {
            worksheet: {
                getMergedCellRange: vi.fn(() => [mergedRange]),
                getRowVisible: vi.fn(() => true),
                getColVisible: vi.fn(() => true),
                getSpanModel: vi.fn(() => ({
                    getMergeDataIndex: vi.fn(() => -1),
                })),
            },
            stylesCache: {
                background: { '#112233': bgMatrix },
                backgroundPositions: new ObjectMatrix(),
            },
            rowHeightAccumulation: [20],
            columnWidthAccumulation: [40],
            columnTotalWidth: 40,
            rowTotalHeight: 20,
            getCellByIndexWithNoHeader: vi.fn(() => createCellInfo()),
            getCellWithCoordByIndex: vi.fn(() => createCellInfo({ isMergedMainCell: true })),
        } as any;

        extension.draw(
            ctx,
            { scaleX: 1, scaleY: 1 } as any,
            skeleton,
            [],
            {
                viewRanges: [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }],
                checkOutOfViewBound: true,
            } as any
        );

        expect(skeleton.getCellWithCoordByIndex).toHaveBeenCalled();
        expect(ctx.fill).toHaveBeenCalled();
    });

    it('covers renderBGByCell visibility and merge checks', () => {
        const extension = new Background();
        const rect = vi.fn();

        const skeleton = {
            worksheet: {
                getRowVisible: vi.fn(() => true),
                getColVisible: vi.fn(() => true),
            },
        } as any;

        const bgContext = {
            spreadsheetSkeleton: skeleton,
            backgroundPaths: { rect },
            scaleX: 1,
            scaleY: 1,
            viewRanges: [{ startRow: 10, endRow: 10, startColumn: 10, endColumn: 10 }],
            diffRanges: [],
            cellInfo: createCellInfo(),
        } as any;

        const outOfView = extension.renderBGByCell(bgContext, 0, 0);
        expect(outOfView).toBe(true);
        expect(rect).not.toHaveBeenCalled();

        bgContext.viewRanges = [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }];
        skeleton.worksheet.getRowVisible = vi.fn(() => false);
        const rowHidden = extension.renderBGByCell(bgContext, 0, 0);
        expect(rowHidden).toBe(true);

        bgContext.cellInfo = createCellInfo({
            isMergedMainCell: true,
            mergeInfo: {
                startX: 0,
                startY: 0,
                endX: 10,
                endY: 20,
                startRow: 0,
                endRow: 1,
                startColumn: 0,
                endColumn: 1,
            },
        });

        skeleton.worksheet.getRowVisible = vi.fn(() => false);
        const mergedRowHidden = extension.renderBGByCell(bgContext, 0, 0);
        expect(mergedRowHidden).toBe(true);

        skeleton.worksheet.getRowVisible = vi.fn(() => true);
        skeleton.worksheet.getColVisible = vi.fn(() => false);
        const mergedColHidden = extension.renderBGByCell(bgContext, 0, 0);
        expect(mergedColHidden).toBe(true);

        skeleton.worksheet.getColVisible = vi.fn(() => true);
        extension.renderBGByCell(bgContext, 0, 0);
        expect(rect).toHaveBeenCalled();
    });
});
