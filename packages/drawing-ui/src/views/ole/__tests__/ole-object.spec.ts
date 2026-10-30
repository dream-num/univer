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
import { OleObject } from '../ole-object';

function context() {
    vi.stubGlobal('Path2D', class {});
    return {
        _context: { fillStyle: '', strokeStyle: '' },
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        rect: vi.fn(),
        clip: vi.fn(),
        translate: vi.fn(),
        scale: vi.fn(),
        transform: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        fillText: vi.fn(),
        drawImage: vi.fn(),
        measureText: (text: string) => ({ width: text.length * 6 }),
        font: '',
        fillStyle: '',
        textAlign: '',
        textBaseline: '',
        globalAlpha: 1,
    };
}

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

describe('OLE canvas object', () => {
    it('redraws vector content and sharp captions at the current size without loading a bitmap', () => {
        const ctx = context();
        const createElement = vi.spyOn(document, 'createElement');
        const object = new OleObject('ole', { width: 96, height: 64, url: 'https://example.test/unused.png' });
        object.setRenderer(new OleCanvasRenderer('report.docx', 'application/msword', () => '#112233'));
        expect(object.getNative()).toBeUndefined();
        expect(createElement).not.toHaveBeenCalled();
        object.render(ctx as unknown as UniverRenderingContext);
        const firstScale = ctx.scale.mock.lastCall![0];
        object.transformByState({ width: 192, height: 128 });
        object.render(ctx as unknown as UniverRenderingContext);
        expect(ctx.scale.mock.lastCall![0]).toBeGreaterThan(firstScale);
        expect(ctx.fillText).toHaveBeenCalledWith('report.docx', 96, expect.any(Number));
        expect(ctx.font).toMatch(/^12px /);
        expect(ctx.drawImage).not.toHaveBeenCalled();
        expect(object.transformerConfig?.rotateEnabled).toBe(false);
        object.dispose();
    });

    it('retains native bounds, opacity and viewport clipping for document pages', () => {
        const ctx = context();
        const object = new OleObject('clipped', { left: 20, top: 30, width: 96, height: 64, opacity: 0.5, clipBounds: { left: 10, top: 20, width: 80, height: 60 } });
        object.setRenderer(new OleCanvasRenderer('file.pdf', 'application/pdf', () => '#112233'));
        object.render(ctx as unknown as UniverRenderingContext);
        expect(ctx.rect).toHaveBeenCalledWith(10, 20, 80, 60);
        expect(ctx.transform).toHaveBeenCalledWith(1, 0, 0, 1, 68, 62);
        expect(ctx.globalAlpha).toBe(0.5);
        expect(object.getRealBound()).toMatchObject({ left: 20, top: 30, width: 96, height: 64 });
        expect(ctx.drawImage).not.toHaveBeenCalled();
        object.dispose();
    });
});
