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

import type { IEmbedDescriptor } from '@univerjs/embed';
import type { IEmbedChildContainerContext } from '../types/embed-ui';
import { UniverInstanceType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { captureEmbedContextSceneCanvas, EmbedSceneCanvasCaptureService } from './embed-scene-canvas-capture.service';

describe('EmbedSceneCanvasCaptureService', () => {
    it('registers providers and captures contexts by embed, host anchor, and child unit', async () => {
        const service = new EmbedSceneCanvasCaptureService();
        const childContainer = createChildContainer();
        const provider = {
            childType: UniverInstanceType.UNIVER_SHEET,
            capture: vi.fn(() => 'provider-image'),
        };

        const providerDisposable = service.register(provider);
        const contextDisposable = service.registerContext(childContainer);

        expect(service.get(UniverInstanceType.UNIVER_SHEET)).toBe(provider);
        expect(service.getContextByEmbedId('embed-1')).toBe(childContainer);
        expect(service.getContextByHostAnchorId('anchor-1')).toBe(childContainer);
        expect(service.getContextByChildUnitId('child-sheet')).toBe(childContainer);
        await expect(service.capture(childContainer)).resolves.toBe('provider-image');
        await expect(service.captureByEmbedId('embed-1')).resolves.toBe('provider-image');
        await expect(service.captureByHostAnchorId('anchor-1')).resolves.toBe('provider-image');
        await expect(service.captureByChildUnitId('child-sheet')).resolves.toBe('provider-image');
        await expect(service.captureByEmbedId('missing')).resolves.toBeUndefined();

        contextDisposable.dispose();
        providerDisposable.dispose();
        expect(service.get(UniverInstanceType.UNIVER_SHEET)).toBeUndefined();
        expect(service.getContextByEmbedId('embed-1')).toBeUndefined();
    });

    it('falls back to the largest readable scene canvas', () => {
        const root = document.createElement('div');
        const small = createCanvas(2, 2, 'small');
        const tainted = createCanvas(20, 20, 'tainted', true);
        const large = createCanvas(10, 10, 'large');
        const ignored = createCanvas(1, 100, 'ignored');
        root.append(small, tainted, large, ignored);

        expect(captureEmbedContextSceneCanvas(createChildContainer({ canvasRoot: root }))).toBe('large');
        expect(captureEmbedContextSceneCanvas(createChildContainer({ canvasRoot: document.createElement('div') }))).toBeUndefined();
        expect(captureEmbedContextSceneCanvas({ ...createChildContainer(), renderScope: undefined as never })).toBeUndefined();
    });
});

function createCanvas(width: number, height: number, dataUrl: string, throws = false): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    Object.defineProperty(canvas, 'width', { value: width });
    Object.defineProperty(canvas, 'height', { value: height });
    canvas.toDataURL = vi.fn(() => {
        if (throws) {
            throw new Error('tainted');
        }

        return dataUrl;
    });
    return canvas;
}

function createChildContainer(overrides: Partial<IEmbedChildContainerContext['renderScope']> = {}): IEmbedChildContainerContext {
    const descriptor = createDescriptor();
    const root = document.createElement('div');
    return {
        descriptor,
        layout: 'doc-width-scale',
        injector: {} as never,
        hostElement: root,
        container: root,
        hostUnitId: descriptor.hostUnitId,
        embedId: descriptor.embedId,
        childUnitId: descriptor.childUnitId!,
        childType: descriptor.childType!,
        renderScope: {
            hostUnitId: descriptor.hostUnitId,
            hostAnchorId: descriptor.hostAnchorId,
            embedId: descriptor.embedId,
            childUnitId: descriptor.childUnitId!,
            childType: descriptor.childType!,
            layout: 'doc-width-scale',
            mode: 'float',
            rootElement: root,
            active$: {} as never,
            ...overrides,
        },
        runtimeScope: {} as never,
    };
}

function createDescriptor(overrides: Partial<IEmbedDescriptor> = {}): IEmbedDescriptor {
    return {
        embedId: overrides.embedId ?? 'embed-1',
        hostUnitId: overrides.hostUnitId ?? 'host-1',
        hostType: overrides.hostType ?? UniverInstanceType.UNIVER_DOC,
        hostAnchorId: overrides.hostAnchorId ?? 'anchor-1',
        entry: overrides.entry ?? 'docs-custom-block',
        source: overrides.source ?? {
            kind: 'ref',
            ref: {
                file: { kind: 'self' },
                unit: { selector: 'child-sheet', type: 'sheet' },
            },
        },
        childUnitId: overrides.childUnitId ?? 'child-sheet',
        childType: overrides.childType ?? UniverInstanceType.UNIVER_SHEET,
        mode: overrides.mode ?? 'interactive',
        sourceMeta: overrides.sourceMeta ?? {
            floating: {
                enabled: true,
                layout: 'doc-width-scale',
                fullscreen: true,
            },
            tab: false,
        },
        lifecycle: overrides.lifecycle ?? 'active',
        createdAt: overrides.createdAt,
        updatedAt: overrides.updatedAt,
    };
}
