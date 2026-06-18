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
import { Custom } from '../custom';

function createCtx() {
    return { save: vi.fn(), restore: vi.fn() } as any;
}

function createCellWithCoord(row: number, col: number, overrides?: Partial<any>) {
    return {
        startRow: row,
        endRow: row,
        startColumn: col,
        endColumn: col,
        isMerged: false,
        isMergedMainCell: false,
        mergeInfo: { startRow: row, endRow: row, startColumn: col, endColumn: col },
        ...overrides,
    };
}

function createSkeleton(options: { cells: Map<string, any>; primary?: (row: number, col: number) => any }) {
    const worksheet = {
        unitId: 'unit-1',
        getSheetId: vi.fn(() => 'sheet-1'),
        getRowVisible: vi.fn(() => true),
        getColVisible: vi.fn(() => true),
        getCell: vi.fn((row: number, col: number) => options.cells.get(`${row},${col}`)),
    };

    return {
        worksheet,
        rowColumnSegment: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
        getCellWithCoordByIndex: vi.fn((row: number, col: number) => (
            options.primary?.(row, col) ?? createCellWithCoord(row, col)
        )),
        getStyles: vi.fn(() => ({
            getStyleByCell: vi.fn((cell) => ({ fs: cell?.fs ?? 10 })),
        })),
    } as any;
}

describe('custom sheet extension', () => {
    it('returns early when worksheet is missing', () => {
        const extension = new Custom();
        const ctx = createCtx();

        extension.draw(ctx, { scaleX: 1, scaleY: 1 }, { worksheet: null } as any, undefined);

        expect(ctx.save).not.toHaveBeenCalled();
    });

    it('draws custom renderers in sorted order with real cell render info', () => {
        const extension = new Custom();
        const ctx = createCtx();
        const first = { zIndex: 20, drawWith: vi.fn() };
        const second = { zIndex: 10, drawWith: vi.fn() };
        const cells = new Map<string, any>([
            ['0,0', { v: 'custom', customRender: [first, second], fs: 12 }],
            ['0,1', { v: 'plain' }],
        ]);
        const skeleton = createSkeleton({ cells });

        extension.draw(ctx, { scaleX: 1, scaleY: 1 }, skeleton, [
            { startRow: 0, endRow: 0, startColumn: 0, endColumn: 1 },
        ]);

        expect(ctx.save).toHaveBeenCalledTimes(1);
        expect(ctx.restore).toHaveBeenCalledTimes(1);
        expect(second.drawWith).toHaveBeenCalledBefore(first.drawWith);
        expect(second.drawWith).toHaveBeenCalledWith(
            ctx,
            expect.objectContaining({
                data: cells.get('0,0'),
                style: { fs: 12 },
                primaryWithCoord: expect.objectContaining({ startRow: 0, startColumn: 0 }),
                subUnitId: 'sheet-1',
                row: 0,
                col: 0,
                worksheet: skeleton.worksheet,
                unitId: 'unit-1',
            }),
            skeleton,
            extension.parent
        );
    });

    it('uses the main merged cell renderer once and respects out-of-diff rows', () => {
        const extension = new Custom();
        const ctx = createCtx();
        const drawWith = vi.fn();
        const cells = new Map<string, any>([
            ['1,0', { customRender: [{ zIndex: 1, drawWith }] }],
            ['1,1', { customRender: [{ zIndex: 1, drawWith: vi.fn() }] }],
        ]);
        const mergeInfo = { startRow: 1, endRow: 1, startColumn: 0, endColumn: 1 };
        const skeleton = createSkeleton({
            cells,
            primary: (row, col) => row === 1 && (col === 0 || col === 1)
                ? createCellWithCoord(row, col, {
                    isMerged: col === 1,
                    isMergedMainCell: col === 0,
                    mergeInfo,
                })
                : createCellWithCoord(row, col),
        });

        extension.draw(ctx, { scaleX: 1, scaleY: 1 }, skeleton, [
            { startRow: 0, endRow: 0, startColumn: 0, endColumn: 1 },
        ]);
        expect(drawWith).not.toHaveBeenCalled();

        extension.draw(ctx, { scaleX: 1, scaleY: 1 }, skeleton, [
            { startRow: 1, endRow: 1, startColumn: 0, endColumn: 1 },
        ]);

        expect(drawWith).toHaveBeenCalledTimes(1);
        expect(skeleton.getCellWithCoordByIndex).toHaveBeenCalledWith(1, 0, false);
    });
});
