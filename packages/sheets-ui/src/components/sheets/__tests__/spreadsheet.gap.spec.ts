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
import { Spreadsheet } from '../spreadsheet';

interface IGapMockContext {
    clearRectByPrecision: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    restore: ReturnType<typeof vi.fn>;
    beginPath: ReturnType<typeof vi.fn>;
    rectByPrecision: ReturnType<typeof vi.fn>;
    clip: ReturnType<typeof vi.fn>;
    moveTo: ReturnType<typeof vi.fn>;
    lineTo: ReturnType<typeof vi.fn>;
    stroke: ReturnType<typeof vi.fn>;
    fillRectByPrecision: ReturnType<typeof vi.fn>;
    fillStyle: string;
    strokeStyle: string;
    lineWidth: number;
}

interface IGapConfigShape {
    defaultBackgroundColor?: string;
    defaultStripeColor?: string;
    rowGaps?: Record<number, { size: number; color?: string; stripeColor?: string }>;
    colGaps?: Record<number, { size: number; color?: string; stripeColor?: string }>;
}

interface IGapSkeletonShape {
    gapConfig?: IGapConfigShape;
    rowHeightAccumulation: number[];
    columnWidthAccumulation: number[];
}

interface ISpreadsheetPrivateMethods {
    _drawSingleGapRect: (
        ctx: IGapMockContext,
        gapItem: { size: number; color?: string; stripeColor?: string },
        x: number,
        y: number,
        w: number,
        h: number,
        defaultBg: string,
        defaultStripe: string
    ) => void;
    _drawGapAreas: (
        ctx: IGapMockContext,
        spreadsheetSkeleton: IGapSkeletonShape,
        rowStart: number,
        rowEnd: number,
        columnStart: number,
        columnEnd: number,
        viewStartX: number,
        viewEndX: number,
        viewStartY: number,
        viewEndY: number
    ) => void;
}

function createCtx() {
    return {
        clearRectByPrecision: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        rectByPrecision: vi.fn(),
        clip: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        fillRectByPrecision: vi.fn(),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
    } as IGapMockContext;
}

describe('spreadsheet gap drawing', () => {
    it('draws a single gap with item colors', () => {
        const spreadsheet = new Spreadsheet('sheet-gap-test');
        const spreadsheetPrivate = spreadsheet as unknown as ISpreadsheetPrivateMethods;
        const ctx = createCtx();
        const fillStyles: string[] = [];
        const strokeStyles: string[] = [];

        ctx.fillRectByPrecision = vi.fn(() => {
            fillStyles.push(ctx.fillStyle);
        });
        ctx.stroke = vi.fn(() => {
            strokeStyles.push(ctx.strokeStyle);
        });

        spreadsheetPrivate._drawSingleGapRect(
            ctx,
            { size: 6, color: 'rgba(1,2,3,0.2)', stripeColor: 'rgba(4,5,6,0.4)' },
            10,
            20,
            30,
            40,
            'rgba(100,100,100,0.08)',
            'rgba(100,100,100,0.25)'
        );

        expect(ctx.clearRectByPrecision).toHaveBeenCalledWith(10, 20, 30, 40);
        expect(fillStyles).toContain('rgba(1,2,3,0.2)');
        expect(strokeStyles).toContain('rgba(4,5,6,0.4)');
        expect(ctx.moveTo).toHaveBeenCalled();
        expect(ctx.lineTo).toHaveBeenCalled();

        spreadsheet.dispose();
    });

    it('draws a single gap with default colors when item colors are missing', () => {
        const spreadsheet = new Spreadsheet('sheet-gap-test-default');
        const spreadsheetPrivate = spreadsheet as unknown as ISpreadsheetPrivateMethods;
        const ctx = createCtx();
        const fillStyles: string[] = [];
        const strokeStyles: string[] = [];

        ctx.fillRectByPrecision = vi.fn(() => {
            fillStyles.push(ctx.fillStyle);
        });
        ctx.stroke = vi.fn(() => {
            strokeStyles.push(ctx.strokeStyle);
        });

        spreadsheetPrivate._drawSingleGapRect(
            ctx,
            { size: 4 },
            0,
            0,
            20,
            10,
            'rgba(11,22,33,0.08)',
            'rgba(11,22,33,0.25)'
        );

        expect(fillStyles).toContain('rgba(11,22,33,0.08)');
        expect(strokeStyles).toContain('rgba(11,22,33,0.25)');

        spreadsheet.dispose();
    });

    it('draws row and column gaps and skips non-positive gaps', () => {
        const spreadsheet = new Spreadsheet('sheet-gap-area-test');
        const spreadsheetPrivate = spreadsheet as unknown as ISpreadsheetPrivateMethods;
        const ctx = createCtx();
        const drawSpy = vi.spyOn(spreadsheetPrivate, '_drawSingleGapRect').mockImplementation(() => {});

        const skeleton: IGapSkeletonShape = {
            gapConfig: {
                defaultBackgroundColor: 'rgba(11,22,33,0.08)',
                defaultStripeColor: 'rgba(11,22,33,0.25)',
                rowGaps: {
                    0: { size: 0 },
                    1: { size: 6 },
                },
                colGaps: {
                    1: { size: 0 },
                    2: { size: 5 },
                },
            },
            rowHeightAccumulation: [20, 46, 70],
            columnWidthAccumulation: [30, 60, 95],
        };

        spreadsheetPrivate._drawGapAreas(
            ctx,
            skeleton,
            0,
            2,
            0,
            2,
            0,
            200,
            0,
            120
        );

        // row gap r=1 and col gap c=2 should be drawn; size=0 entries should be skipped.
        expect(drawSpy).toHaveBeenCalledTimes(2);
        expect(drawSpy).toHaveBeenCalledWith(
            ctx,
            { size: 6 },
            0,
            20,
            200,
            6,
            'rgba(11,22,33,0.08)',
            'rgba(11,22,33,0.25)'
        );
        expect(drawSpy).toHaveBeenCalledWith(
            ctx,
            { size: 5 },
            60,
            0,
            5,
            120,
            'rgba(11,22,33,0.08)',
            'rgba(11,22,33,0.25)'
        );

        spreadsheet.dispose();
    });

    it('does nothing when gap config has no row/column gaps', () => {
        const spreadsheet = new Spreadsheet('sheet-gap-empty-test');
        const spreadsheetPrivate = spreadsheet as unknown as ISpreadsheetPrivateMethods;
        const ctx = createCtx();
        const drawSpy = vi.spyOn(spreadsheetPrivate, '_drawSingleGapRect').mockImplementation(() => {});

        spreadsheetPrivate._drawGapAreas(
            ctx,
            {
                gapConfig: {
                    defaultBackgroundColor: 'rgba(11,22,33,0.08)',
                    defaultStripeColor: 'rgba(11,22,33,0.25)',
                },
                rowHeightAccumulation: [20],
                columnWidthAccumulation: [30],
            },
            0,
            0,
            0,
            0,
            0,
            100,
            0,
            100
        );

        expect(drawSpy).not.toHaveBeenCalled();

        spreadsheet.dispose();
    });
});
