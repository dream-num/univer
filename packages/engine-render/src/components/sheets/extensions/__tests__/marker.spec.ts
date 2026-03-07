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
import { Marker } from '../marker';

function createCtx() {
    return {
        __mode: 'normal',
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        closePath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        fill: vi.fn(),
        fillStyle: '',
    } as any;
}

function createCellInfo(overrides?: Partial<any>) {
    return {
        startX: 0,
        startY: 0,
        endX: 10,
        endY: 20,
        isMerged: false,
        isMergedMainCell: false,
        mergeInfo: {
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 0,
            startX: 0,
            startY: 0,
            endX: 10,
            endY: 20,
        },
        ...overrides,
    };
}

describe('marker extension', () => {
    it('returns early in printing mode or missing worksheet', () => {
        const marker = new Marker();
        const ctx = createCtx();
        ctx.__mode = 'printing';

        marker.draw(ctx, { scaleX: 1, scaleY: 1 } as any, {} as any, []);
        expect(ctx.fill).not.toHaveBeenCalled();

        ctx.__mode = 'normal';
        marker.draw(ctx, { scaleX: 1, scaleY: 1 } as any, { rowColumnSegment: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 } } as any, []);
        expect(ctx.fill).not.toHaveBeenCalled();
    });

    it('renders all four corner markers and skips hidden rows/cols', () => {
        const marker = new Marker();
        const ctx = createCtx();

        const worksheet = {
            getRowVisible: vi.fn(() => true),
            getColVisible: vi.fn(() => true),
            getCell: vi.fn(() => ({
                markers: {
                    tr: { size: 2, color: '#f00' },
                    tl: { size: 2, color: '#0f0' },
                    br: { size: 2, color: '#00f' },
                    bl: { size: 2, color: '#333' },
                },
            })),
        };
        const skeleton = {
            worksheet,
            rowColumnSegment: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
            getCellWithCoordByIndex: vi.fn(() => createCellInfo()),
        } as any;

        marker.draw(ctx, { scaleX: 1, scaleY: 1 } as any, skeleton, [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }]);
        expect(ctx.fill).toHaveBeenCalledTimes(4);

        worksheet.getRowVisible.mockReturnValue(false);
        marker.draw(ctx, { scaleX: 1, scaleY: 1 } as any, skeleton, [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }]);
        expect(ctx.fill).toHaveBeenCalledTimes(4);
    });

    it('deduplicates merged cell marker drawing and respects diff ranges', () => {
        const marker = new Marker();
        const ctx = createCtx();

        const mergeInfo = {
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 1,
            startX: 0,
            startY: 0,
            endX: 20,
            endY: 20,
        };

        const worksheet = {
            getRowVisible: vi.fn(() => true),
            getColVisible: vi.fn(() => true),
            getCell: vi.fn(() => ({
                markers: {
                    tr: { size: 3, color: '#f00' },
                },
            })),
        };
        const skeleton = {
            worksheet,
            rowColumnSegment: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 1 },
            getCellWithCoordByIndex: vi.fn((row: number, col: number) => {
                if (col === 0) {
                    return createCellInfo({ isMergedMainCell: true, mergeInfo });
                }
                return createCellInfo({ isMerged: true, mergeInfo });
            }),
        } as any;

        marker.draw(ctx, { scaleX: 1, scaleY: 1 } as any, skeleton, [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 1 }]);
        expect(ctx.fill).toHaveBeenCalledTimes(1);

        marker.draw(ctx, { scaleX: 1, scaleY: 1 } as any, skeleton, [{ startRow: 2, endRow: 2, startColumn: 2, endColumn: 2 }]);
        expect(ctx.fill).toHaveBeenCalledTimes(1);
    });
});
