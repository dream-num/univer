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

import type { UniverRenderingContext } from '@univerjs/engine-render';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OleCanvasRenderer } from '../ole-canvas-renderer';

class TestPath2D {
    constructor(readonly data: string) {}
}

function context() {
    vi.stubGlobal('Path2D', TestPath2D);
    return {
        _context: { fillStyle: '', strokeStyle: '' },
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        rect: vi.fn(),
        clip: vi.fn(),
        translate: vi.fn(),
        scale: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        fillText: vi.fn(),
        fillRect: vi.fn(),
        drawImage: vi.fn(),
        measureText: vi.fn((text: string) => ({ width: Array.from(text).length * 6 })),
        fillStyle: '',
        font: '',
        textAlign: '',
        textBaseline: '',
    };
}

afterEach(() => vi.unstubAllGlobals());

describe('OLE vector canvas content', () => {
    it('paints a vector warning badge and explicit status below the filename without a bitmap or background', () => {
        const ctx = context();
        const renderer = new OleCanvasRenderer('linked.pdf', 'application/pdf', () => '#112233', undefined, { label: 'Link unavailable', color: () => '#AA6600' });
        renderer.draw(ctx as unknown as UniverRenderingContext, 192, 128);
        expect(ctx.fillText.mock.calls.map(([text]) => text)).toEqual(['linked.pdf', 'Link unavailable']);
        expect(ctx.fillStyle).toBe('#AA6600');
        expect(ctx.fill.mock.calls.some(([path]) => (path as TestPath2D).data === 'M8 1L15 14H1Z')).toBe(true);
        expect(ctx.font).toMatch(/^12px /);
        expect(ctx.rect).toHaveBeenCalledWith(0, 0, 192, 128);
        expect(ctx.fillRect).not.toHaveBeenCalled();
        expect(ctx.drawImage).not.toHaveBeenCalled();
    });

    it('prioritizes the unavailable status within small native object bounds', () => {
        const ctx = context();
        new OleCanvasRenderer('filename.pdf', 'application/pdf', () => '#112233', undefined, { label: 'Unavailable', color: () => '#AA6600' })
            .draw(ctx as unknown as UniverRenderingContext, 96, 48);
        expect(ctx.fillText).toHaveBeenCalledOnce();
        expect(ctx.fillText.mock.lastCall![0]).toBe('Unavailable');
        expect(ctx.fillStyle).toBe('#AA6600');
        expect(ctx.rect).toHaveBeenCalledWith(0, 0, 96, 48);
        expect(ctx.drawImage).not.toHaveBeenCalled();
    });

    it('reserves space for the glyph in small native Office objects', () => {
        const ctx = context();
        new OleCanvasRenderer('Microsoft_Word_Document.docx', 'application/msword', () => '#112233')
            .draw(ctx as unknown as UniverRenderingContext, 76, 48);
        expect(ctx.fillText).toHaveBeenCalledOnce();
        expect(ctx.fillText.mock.lastCall![0]).toMatch(/\.docx$/);
        expect((ctx.scale.mock.lastCall![0] as number) * 16).toBeGreaterThan(24);
    });

    it('grows the vector glyph with the object and keeps a fixed logical font size', () => {
        const ctx = context();
        const renderer = new OleCanvasRenderer('report.docx', 'application/msword', () => '#112233');
        renderer.draw(ctx as unknown as UniverRenderingContext, 96, 64);
        const firstScale = ctx.scale.mock.lastCall![0] as number;
        const firstFont = ctx.font;
        renderer.draw(ctx as unknown as UniverRenderingContext, 192, 128);
        const enlargedScale = ctx.scale.mock.lastCall![0] as number;
        expect(enlargedScale).toBeGreaterThan(firstScale);
        expect(enlargedScale * 16).toBeGreaterThan(32);
        expect(ctx.font).toBe(firstFont);
        renderer.draw(ctx as unknown as UniverRenderingContext, 76, 48);
        expect(ctx.font).toBe(firstFont);
        expect(ctx.drawImage).not.toHaveBeenCalled();
        expect(ctx.scale.mock.lastCall![0]).toBeLessThan(enlargedScale);
    });

    it('updates occurrence captions without changing artwork', () => {
        const ctx = context();
        let name = 'original.docx';
        const renderer = new OleCanvasRenderer(name, 'application/msword', () => '#112233', () => name);
        renderer.draw(ctx as unknown as UniverRenderingContext, 96, 80);
        name = '预算.docx';
        renderer.draw(ctx as unknown as UniverRenderingContext, 96, 80);
        expect(ctx.fillText).toHaveBeenLastCalledWith(name, 48, expect.any(Number));
    });

    it('draws transparent vector artwork and real text on every paint, including after zoom', () => {
        const ctx = context();
        const renderer = new OleCanvasRenderer('report.docx', 'application/msword', () => '#112233');
        renderer.draw(ctx as unknown as UniverRenderingContext, 552, 100);
        const measurements = ctx.measureText.mock.calls.length;
        renderer.draw(ctx as unknown as UniverRenderingContext, 552, 100);
        expect(ctx.fillText).toHaveBeenCalledTimes(2);
        expect(ctx.fillText.mock.calls[0][0]).toBe('report.docx');
        expect(ctx.fill).toHaveBeenCalled();
        expect(ctx.fill.mock.calls[0][0]).toBeInstanceOf(TestPath2D);
        const iconScale = ctx.scale.mock.lastCall![0] as number;
        expect(iconScale).toBeGreaterThan(2);
        expect(ctx.scale).toHaveBeenCalledWith(iconScale, iconScale);
        expect(ctx.measureText).toHaveBeenCalledTimes(measurements);
        expect(ctx.fillStyle).toBe('#112233');
        expect(ctx.fillRect).not.toHaveBeenCalled();
        expect(ctx.drawImage).not.toHaveBeenCalled();
    });

    it('remeasures resized objects, wraps Unicode filenames and keeps a complete extension', () => {
        const ctx = context();
        const renderer = new OleCanvasRenderer('季度 Budget 2026 financial report.xlsx', 'application/vnd.ms-excel', () => '#112233');
        renderer.draw(ctx as unknown as UniverRenderingContext, 96, 64);
        const lines = ctx.fillText.mock.calls.map(([text]) => text as string);
        expect(lines).toHaveLength(2);
        expect(lines[1]).toMatch(/\.xlsx$/);
        const measurements = ctx.measureText.mock.calls.length;
        renderer.draw(ctx as unknown as UniverRenderingContext, 192, 64);
        expect(ctx.measureText.mock.calls.length).toBeGreaterThan(measurements);
        expect(ctx.fillRect).not.toHaveBeenCalled();
    });

    it('clips fixed-size captions to tiny objects and does not distort the glyph', () => {
        const ctx = context();
        const renderer = new OleCanvasRenderer('report.docx', 'application/msword', () => '#112233');
        renderer.draw(ctx as unknown as UniverRenderingContext, 40, 20);
        expect(ctx.font).toMatch(/^12px /);
        expect(ctx.rect).toHaveBeenCalledWith(0, 0, 40, 20);
        expect(ctx.clip).toHaveBeenCalledOnce();
        const [x, y] = ctx.scale.mock.lastCall!;
        expect(x).toBe(y);
        expect(x).toBeGreaterThanOrEqual(0);
        expect(ctx.drawImage).not.toHaveBeenCalled();
    });

    it.each(['application/pdf', 'application/zip', 'image/png', 'application/octet-stream'])('keeps %s as vector artwork', (mimeType) => {
        const ctx = context();
        new OleCanvasRenderer('attachment.bin', mimeType, () => '#112233').draw(ctx as unknown as UniverRenderingContext, 96, 64);
        expect(ctx.fill).toHaveBeenCalled();
        expect(ctx.fillText).toHaveBeenCalled();
        expect(ctx.drawImage).not.toHaveBeenCalled();
    });
});
