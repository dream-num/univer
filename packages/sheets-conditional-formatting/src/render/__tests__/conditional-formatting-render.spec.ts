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
import { IIconSetType } from '../../models/icon-map';
import { DataBar } from '../data-bar.render';
import { ConditionalFormattingIcon } from '../icon.render';

function createCtx() {
    const gradient = { addColorStop: vi.fn() };
    return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        arcTo: vi.fn(),
        closePath: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        drawImage: vi.fn(),
        createLinearGradient: vi.fn(() => gradient),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        gradient,
    } as any;
}

function createCellBounds(row: number, col: number, overrides?: Record<string, unknown>) {
    const startX = col * 80;
    const startY = row * 24;
    return {
        startRow: row,
        endRow: row,
        startColumn: col,
        endColumn: col,
        startX,
        endX: startX + 80,
        startY,
        endY: startY + 24,
        isMerged: false,
        isMergedMainCell: false,
        mergeInfo: {
            startRow: row,
            endRow: row,
            startColumn: col,
            endColumn: col,
            startX,
            endX: startX + 80,
            startY,
            endY: startY + 24,
        },
        ...overrides,
    };
}

function createSkeleton(cells: Record<string, unknown>, hiddenRows = new Set<number>(), hiddenCols = new Set<number>()) {
    return {
        rowColumnSegment: { startRow: 0, endRow: 2, startColumn: 0, endColumn: 2 },
        worksheet: {
            getRowVisible: (row: number) => !hiddenRows.has(row),
            getColVisible: (col: number) => !hiddenCols.has(col),
            getCell: (row: number, col: number) => cells[`${row},${col}`],
        },
        getCellWithCoordByIndex: (row: number, col: number) => createCellBounds(row, col),
    } as any;
}

describe('conditional formatting render extensions', () => {
    it('draws data bars for positive and negative cell values in visible cells', () => {
        const ctx = createCtx();
        const skeleton = createSkeleton({
            '0,0': {
                dataBar: {
                    color: '#2f56ef',
                    value: 75,
                    startPoint: 25,
                    isGradient: false,
                    isShowValue: true,
                },
            },
            '0,1': {
                dataBar: {
                    color: '#f45531',
                    value: -50,
                    startPoint: 60,
                    isGradient: true,
                    isShowValue: true,
                },
            },
            '1,0': {
                dataBar: {
                    color: '#111111',
                    value: 100,
                    startPoint: 0,
                    isGradient: false,
                    isShowValue: true,
                },
            },
        }, new Set([1]));

        new DataBar().draw(ctx, { scaleX: 1, scaleY: 1 }, skeleton, [
            { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
        ]);

        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.fill).toHaveBeenCalledTimes(2);
        expect(ctx.createLinearGradient).toHaveBeenCalledTimes(1);
        expect(ctx.gradient.addColorStop).toHaveBeenCalledWith(0, 'rgb(255 255 255)');
        expect(ctx.gradient.addColorStop).toHaveBeenCalledWith(1, '#f45531');
        expect(ctx.stroke).toHaveBeenCalledTimes(1);
        expect(ctx.restore).toHaveBeenCalled();
    });

    it('skips data bar drawing when worksheet is missing or bar dimensions collapse', () => {
        const ctx = createCtx();
        const dataBar = new DataBar();
        expect(dataBar.draw(ctx, { scaleX: 1, scaleY: 1 }, { worksheet: undefined } as any, [])).toBe(false);

        (dataBar as any)._drawRectWithRoundedCorner(ctx, 0, 0, 0, 10, true, true, true, true);
        (dataBar as any)._drawRectWithRoundedCorner(ctx, 0, 0, 10, 0, true, true, true, true);
        expect(ctx.beginPath).not.toHaveBeenCalled();
    });

    it('draws configured conditional-formatting icons and skips unavailable icons', () => {
        const ctx = createCtx();
        const icon = new ConditionalFormattingIcon();
        const nativeImage = document.createElement('img');
        (icon as any)._imageMap.set(`${IIconSetType.threeArrows}_0`, nativeImage);

        const skeleton = createSkeleton({
            '0,0': {
                iconSet: {
                    iconType: IIconSetType.threeArrows,
                    iconId: '0',
                    isShowValue: true,
                },
            },
            '0,1': {
                iconSet: {
                    iconType: IIconSetType.empty,
                    iconId: '0',
                    isShowValue: true,
                },
            },
            '0,2': {
                iconSet: {
                    iconType: IIconSetType.threeArrows,
                    iconId: '99',
                    isShowValue: true,
                },
            },
        });

        icon.draw(ctx, { scaleX: 1, scaleY: 1 }, skeleton, [
            { startRow: 0, endRow: 0, startColumn: 0, endColumn: 2 },
        ]);

        expect(ctx.drawImage).toHaveBeenCalledTimes(1);
        expect(ctx.drawImage).toHaveBeenCalledWith(nativeImage, 2, 4.5, 15, 15);
    });

    it('skips icon drawing for missing worksheet and cells too small for the icon', () => {
        const ctx = createCtx();
        const icon = new ConditionalFormattingIcon();
        const nativeImage = document.createElement('img');
        (icon as any)._imageMap.set(`${IIconSetType.threeArrows}_0`, nativeImage);

        expect(icon.draw(ctx, { scaleX: 1, scaleY: 1 }, { worksheet: undefined } as any, [])).toBe(false);

        const skeleton = createSkeleton({
            '0,0': {
                iconSet: {
                    iconType: IIconSetType.threeArrows,
                    iconId: '0',
                    isShowValue: true,
                },
            },
        });
        skeleton.getCellWithCoordByIndex = () => createCellBounds(0, 0, {
            endX: 10,
            endY: 10,
            mergeInfo: {
                startRow: 0,
                endRow: 0,
                startColumn: 0,
                endColumn: 0,
                startX: 0,
                endX: 10,
                startY: 0,
                endY: 10,
            },
        }) as any;

        icon.draw(ctx, { scaleX: 1, scaleY: 1 }, skeleton, [
            { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
        ]);
        expect(ctx.drawImage).not.toHaveBeenCalled();
    });
});
