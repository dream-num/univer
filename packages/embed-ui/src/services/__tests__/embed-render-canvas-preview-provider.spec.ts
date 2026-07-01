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

import { Injector, UniverInstanceType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { createEmbedRenderCanvasPreviewProvider } from '../embed-render-canvas-preview-provider';

describe('createEmbedRenderCanvasPreviewProvider', () => {
    it('captures the mounted child scene canvas before using render manager fallback', () => {
        const canvas = createCanvas('data:image/png;base64,context-canvas');
        const canvasRoot = document.createElement('div');
        canvasRoot.appendChild(canvas);
        const createRender = vi.fn();
        const provider = createProvider({ createRender });

        const result = provider.renderPreview({
            descriptor: createDescriptor(),
            childUnitId: 'child-1',
            childType: UniverInstanceType.UNIVER_DOC,
            width: 320,
            height: 180,
            dpr: 1,
            reason: 'stage-exit',
            context: {
                renderScope: { canvasRoot },
            } as any,
        });

        expect(result).toBe('data:image/png;base64,context-canvas');
        expect(createRender).not.toHaveBeenCalled();
    });

    it('creates an embedded render in a temporary container for initial preview', () => {
        const canvas = createCanvas('data:image/png;base64,initial-render');
        canvas.width = 0;
        canvas.height = 0;
        const scopedInjector = new Injector();
        const render = {
            engine: {
                mount: vi.fn(() => {
                    canvas.width = 320;
                    canvas.height = 180;
                }),
                unmount: vi.fn(),
                resize: vi.fn(),
                getCanvasElement: () => canvas,
            },
            components: {
                forEach: vi.fn(),
            },
            scene: {
                makeDirty: vi.fn(),
                render: vi.fn(),
            },
        };
        const createRender = vi.fn(() => render);
        const provider = createProvider({ createRender });

        const result = provider.renderPreview({
            descriptor: createDescriptor(),
            childUnitId: 'child-1',
            childType: UniverInstanceType.UNIVER_DOC,
            width: 320,
            height: 180,
            dpr: 1,
            reason: 'initial',
            context: {
                runtimeScope: { injector: scopedInjector },
            } as any,
        });

        expect(result).toBe('data:image/png;base64,initial-render');
        expect(createRender).toHaveBeenCalledWith('child-1', {
            embeddedRender: true,
            makeCurrent: false,
            renderParentInjector: scopedInjector,
            skipAutoRender: true,
        });
        expect(render.engine.mount).toHaveBeenCalled();
        expect(render.engine.resize).toHaveBeenCalled();
        expect(render.scene.makeDirty).toHaveBeenCalled();
        expect(render.scene.render).toHaveBeenCalled();
        expect(render.engine.unmount).toHaveBeenCalled();
    });
});

function createProvider(options: { createRender?: ReturnType<typeof vi.fn>; getRenderById?: ReturnType<typeof vi.fn> } = {}) {
    const injector = new Injector();
    const renderManagerToken = Symbol('render-manager') as any;
    injector.add([renderManagerToken, {
        useValue: {
            getRenderById: options.getRenderById ?? vi.fn(() => undefined),
            createRender: options.createRender ?? vi.fn(),
        },
    }]);

    return createEmbedRenderCanvasPreviewProvider(injector, {
        childType: UniverInstanceType.UNIVER_DOC,
        renderManagerService: renderManagerToken,
    });
}

function createCanvas(dataUrl: string) {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 180;
    vi.spyOn(canvas, 'toDataURL').mockReturnValue(dataUrl);
    return canvas;
}

function createDescriptor() {
    return {
        embedId: 'embed-1',
        hostUnitId: 'host-1',
        hostAnchorId: 'anchor-1',
        childUnitId: 'child-1',
        childType: UniverInstanceType.UNIVER_DOC,
        ref: { file: { kind: 'self' }, unit: { selector: 'child-1', type: 'doc' } },
    } as any;
}
