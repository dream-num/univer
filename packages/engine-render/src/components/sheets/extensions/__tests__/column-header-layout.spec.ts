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
import { ColumnHeaderLayout } from '../column-header-layout';

function createCtx() {
    return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
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

describe('column header layout extension', () => {
    it('supports config getters and style setter', () => {
        const layout = new ColumnHeaderLayout({
            columnsCfg: {
                0: 'A-Col',
            },
            headerStyle: {
                fontColor: '#135',
            },
        });

        layout.configHeaderColumn(
            {
                columnsCfg: {
                    1: { text: 'B-Col', textAlign: 'left' },
                },
                headerStyle: {
                    backgroundColor: '#eee',
                },
            },
            'sheet-1'
        );

        const columnsCfg = layout.getColumnsCfg('sheet-1');
        expect(columnsCfg[0]).toBe('A-Col');
        expect((columnsCfg[1] as any).text).toBe('B-Col');

        const headerStyle = layout.getHeaderStyle('sheet-1');
        expect(headerStyle.fontColor).toBe('#135');
        expect(headerStyle.backgroundColor).toBe('#eee');

        const [cfg, specStyle] = layout.getCfgOfCurrentColumn(columnsCfg, headerStyle, 0);
        expect(cfg.text).toBe('A-Col');
        expect(specStyle).toBe(false);

        const ctx = createCtx();
        layout.setStyleToCtx(ctx, { textAlign: 'right', textBaseline: 'alphabetic', fontColor: '#222', borderColor: '#333', fontSize: 12 });
        expect(ctx.textAlign).toBe('right');
        expect(ctx.textBaseline).toBe('alphabetic');
        expect(ctx.fillStyle).toBe('#222');
        expect(ctx.strokeStyle).toBe('#333');
        expect(ctx.font).toContain('12px');
    });

    it('draws column headers and handles early returns/hidden columns', () => {
        const layout = new ColumnHeaderLayout({
            columnsCfg: {
                0: { text: 'X', textAlign: 'right', backgroundColor: '#f0f0f0' },
            },
        });
        const ctx = createCtx();

        layout.draw(ctx, { scaleX: 1, scaleY: 1 } as any, {
            rowColumnSegment: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 1 },
            columnHeaderHeight: 0,
        } as any);
        expect(ctx.fillRectByPrecision).not.toHaveBeenCalled();

        const skeleton = {
            rowColumnSegment: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 2 },
            columnHeaderHeight: 22,
            rowHeightAccumulation: [20],
            columnWidthAccumulation: [40, 40, 90],
            columnTotalWidth: 90,
            rowTotalHeight: 20,
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
});
