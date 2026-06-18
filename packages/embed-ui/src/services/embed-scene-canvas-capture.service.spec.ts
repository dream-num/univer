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

/**
 * @vitest-environment jsdom
 */

import { describe, expect, it, vi } from 'vitest';
import { captureEmbedContextSceneCanvas, EmbedSceneCanvasCaptureService } from './embed-scene-canvas-capture.service';
import { EmbedScreenshotService } from './embed-screenshot.service';

describe('EmbedSceneCanvasCaptureService', () => {
    it('exports the deprecated screenshot token as the same scene canvas capture service token', () => {
        expect(EmbedScreenshotService).toBe(EmbedSceneCanvasCaptureService);
    });

    it('captures the largest canvas from the child render scope', () => {
        const smallCanvas = createCanvas(64, 64, 'data:image/png;base64,small');
        const largeCanvas = createCanvas(320, 180, 'data:image/png;base64,large');
        const canvasRoot = document.createElement('div');
        canvasRoot.append(smallCanvas, largeCanvas);

        const result = captureEmbedContextSceneCanvas({
            renderScope: {
                canvasRoot,
            },
        } as any);

        expect(result).toBe('data:image/png;base64,large');
        expect(largeCanvas.toDataURL).toHaveBeenCalledWith('image/png');
        expect(smallCanvas.toDataURL).not.toHaveBeenCalled();
    });
});

function createCanvas(width: number, height: number, dataUrl: string) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    vi.spyOn(canvas, 'toDataURL').mockReturnValue(dataUrl);
    return canvas;
}
