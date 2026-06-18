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

import { afterEach, describe, expect, it, vi } from 'vitest';
import { Canvas, CanvasRenderMode, HitCanvas, SceneCanvas } from '../canvas';

describe('canvas wrapper', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('initializes rendering and printing contexts with sizing and ids', () => {
        const canvas = new Canvas({
            id: 'ignored-by-constructor',
            width: 120,
            height: 80,
            pixelRatio: 2,
            colorService: { getRenderColor: (color: string) => color } as any,
        });

        canvas.setId('render-canvas');
        expect(canvas.getCanvasEle().id).toBe('render-canvas');
        expect(canvas.getCanvasEle().dataset.uComp).toBe('render-canvas');
        expect(canvas.getCanvasEle().tabIndex).toBe(1);
        expect(canvas.getPixelRatio()).toBe(2);
        expect(canvas.getWidth()).toBe(120);
        expect(canvas.getHeight()).toBe(80);
        expect(canvas.getCanvasEle().width).toBe(240);
        expect(canvas.getCanvasEle().style.width).toBe('120px');

        canvas.setPixelRatio(0.5);
        expect(canvas.getPixelRatio()).toBe(1);

        canvas.clear();
        canvas.dispose();
        expect(canvas.getCanvasEle()).toBeNull();

        const printing = new Canvas({ mode: CanvasRenderMode.Printing, width: 20, height: 10 });
        expect(printing.getContext().__mode).toBe('printing');
        printing.dispose();
    });

    it('keeps zero-sized canvases from changing pixel ratio and supports scene/hit subclasses', () => {
        const canvas = new Canvas();
        canvas.setPixelRatio(3);
        expect(canvas.getPixelRatio()).toBeGreaterThan(0);

        const sceneCanvas = new SceneCanvas({ width: 30, height: 40, pixelRatio: 2 });
        expect(sceneCanvas.getWidth()).toBe(30);
        expect(sceneCanvas.getHeight()).toBe(40);

        const hitCanvas = new HitCanvas({ width: 10, height: 20, pixelRatio: 2 });
        expect(hitCanvas.hitCanvas).toBe(true);
        expect(hitCanvas.getWidth()).toBe(10);

        canvas.dispose();
        sceneCanvas.dispose();
        hitCanvas.dispose();
    });

    it('falls back when exporting data URLs fails', () => {
        const canvas = new Canvas({ width: 10, height: 10 });
        const nativeCanvas = canvas.getCanvasEle();
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const toDataURL = vi.fn()
            .mockImplementationOnce(() => {
                throw new Error('typed export failed');
            })
            .mockReturnValueOnce('data:image/png;base64,fallback');
        nativeCanvas.toDataURL = toDataURL;

        expect(canvas.toDataURL('image/jpeg', 0.8)).toBe('data:image/png;base64,fallback');

        toDataURL
            .mockImplementationOnce(() => {
                throw new Error('typed export failed');
            })
            .mockImplementationOnce(() => {
                throw new Error('fallback failed');
            });
        expect(canvas.toDataURL('image/jpeg', 0.8)).toBe('');
        expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Unable to get data URL. fallback failed'));

        canvas.dispose();
    });
});
