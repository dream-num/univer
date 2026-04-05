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
import { RowHeaderLayout } from '../row-header-layout';

function createCtx() {
    return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        moveToByPrecision: vi.fn(),
        lineToByPrecision: vi.fn(),
        stroke: vi.fn(),
        clip: vi.fn(),
        rectByPrecision: vi.fn(),
        fillRectByPrecision: vi.fn(),
        setLineWidthByPrecision: vi.fn(),
        translateWithPrecisionRatio: vi.fn(),
        fillText: vi.fn(),
        fillStyle: '',
        strokeStyle: '',
        textAlign: 'center',
        textBaseline: 'middle',
        font: '',
    } as any;
}

describe('row header layout extension', () => {
    it('supports config getters and style setter', () => {
        const layout = new RowHeaderLayout({
            rowsCfg: {
                0: 'R1',
            },
            headerStyle: {
                fontColor: '#123',
            },
        });

        layout.configHeaderRow(
            {
                rowsCfg: {
                    1: { text: 'SheetRow', backgroundColor: '#eee' },
                },
                headerStyle: {
                    backgroundColor: '#ddd',
                },
            },
            'sheet-1'
        );

        const rowsCfg = layout.getRowsCfg('sheet-1');
        expect(rowsCfg[0]).toBe('R1');
        expect((rowsCfg[1] as any).text).toBe('SheetRow');

        const headerStyle = layout.getHeaderStyle('sheet-1');
        expect(headerStyle.fontColor).toBe('#123');
        expect(headerStyle.backgroundColor).toBe('#ddd');

        const [cfg, specStyle] = layout.getCfgOfCurrentRow(rowsCfg, headerStyle, 0);
        expect(cfg.text).toBe('R1');
        expect(specStyle).toBe(false);

        const ctx = createCtx();
        layout.setStyleToCtx(ctx, { textAlign: 'right', textBaseline: 'alphabetic', fontColor: '#456', borderColor: '#789', fontSize: 12 });
        expect(ctx.textAlign).toBe('right');
        expect(ctx.textBaseline).toBe('alphabetic');
        expect(ctx.fillStyle).toBe('#456');
        expect(ctx.strokeStyle).toBe('#789');
        expect(ctx.font).toContain('12px');
    });

    it('draws row headers and handles early returns/hidden rows', () => {
        const layout = new RowHeaderLayout({
            rowsCfg: {
                0: { text: 'Top', textAlign: 'right', backgroundColor: '#f6f6f6' },
            },
        });
        const ctx = createCtx();

        layout.draw(ctx, { scaleX: 1, scaleY: 1 } as any, {
            rowColumnSegment: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 0 },
            rowHeaderWidth: 0,
        } as any);
        expect(ctx.fillRectByPrecision).not.toHaveBeenCalled();

        const skeleton = {
            rowColumnSegment: { startRow: 0, endRow: 2, startColumn: 0, endColumn: 0 },
            rowHeaderWidth: 30,
            rowHeightAccumulation: [20, 20, 40],
            columnWidthAccumulation: [50],
            columnTotalWidth: 50,
            rowTotalHeight: 40,
            worksheet: {
                getSheetId: vi.fn(() => 'sheet-main'),
            },
        } as any;

        layout.draw(ctx, { scaleX: 1, scaleY: 1 } as any, skeleton);

        expect(ctx.fillRectByPrecision).toHaveBeenCalled();
        expect(ctx.translateWithPrecisionRatio).toHaveBeenCalled();
        expect(ctx.stroke).toHaveBeenCalled();
        expect(ctx.fillText).toHaveBeenCalled();
    });

    it('uses gapConfig default colors when drawing row gaps', () => {
        const layout = new RowHeaderLayout();
        const ctx = createCtx();
        const fillStyles: string[] = [];
        const strokeStyles: string[] = [];

        ctx.fillRectByPrecision = vi.fn(() => {
            fillStyles.push(ctx.fillStyle);
        });
        ctx.stroke = vi.fn(() => {
            strokeStyles.push(ctx.strokeStyle);
        });

        const skeleton = {
            rowColumnSegment: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
            rowHeaderWidth: 30,
            rowHeightAccumulation: [40],
            columnWidthAccumulation: [30],
            columnTotalWidth: 30,
            rowTotalHeight: 40,
            gapConfig: {
                defaultBackgroundColor: 'rgba(10, 20, 30, 0.08)',
                defaultStripeColor: 'rgba(10, 20, 30, 0.25)',
                rowGaps: {
                    0: { size: 8 },
                },
            },
            worksheet: {
                getSheetId: vi.fn(() => 'sheet-main'),
            },
        } as any;

        layout.draw(ctx, { scaleX: 1, scaleY: 1 } as any, skeleton);

        expect(fillStyles).toContain('rgba(10, 20, 30, 0.08)');
        expect(strokeStyles).toContain('rgba(10, 20, 30, 0.25)');
    });

    it('uses gap item custom colors before default colors in row gaps', () => {
        const layout = new RowHeaderLayout();
        const ctx = createCtx();
        const fillStyles: string[] = [];
        const strokeStyles: string[] = [];

        ctx.fillRectByPrecision = vi.fn(() => {
            fillStyles.push(ctx.fillStyle);
        });
        ctx.stroke = vi.fn(() => {
            strokeStyles.push(ctx.strokeStyle);
        });

        const skeleton = {
            rowColumnSegment: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
            rowHeaderWidth: 30,
            rowHeightAccumulation: [40],
            columnWidthAccumulation: [30],
            columnTotalWidth: 30,
            rowTotalHeight: 40,
            gapConfig: {
                defaultBackgroundColor: 'rgba(10, 20, 30, 0.08)',
                defaultStripeColor: 'rgba(10, 20, 30, 0.25)',
                rowGaps: {
                    0: { size: 8, color: '#223344', stripeColor: '#556677' },
                },
            },
            worksheet: {
                getSheetId: vi.fn(() => 'sheet-main'),
            },
        } as any;

        layout.draw(ctx, { scaleX: 1, scaleY: 1 } as any, skeleton);

        expect(fillStyles).toContain('#223344');
        expect(strokeStyles).toContain('#556677');
    });
});
