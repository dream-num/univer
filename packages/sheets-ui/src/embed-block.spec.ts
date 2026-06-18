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

import type { IEmbedChildContainerContext } from '@univerjs/embed-ui';
import { describe, expect, it, vi } from 'vitest';

const mountEmbedRenderChildUnit = vi.fn((_context: unknown, _renderManagerService: unknown, target: HTMLElement) => {
    const wrapper = document.createElement('div');
    const canvas = document.createElement('canvas');
    wrapper.appendChild(canvas);
    target.appendChild(wrapper);
    return { dispose: vi.fn() };
});

vi.mock('@univerjs/embed-ui', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@univerjs/embed-ui')>();
    return {
        ...actual,
        mountEmbedRenderChildUnit,
    };
});

describe('createSheetsEmbedChildViewContribution', () => {
    it('stops retrying once the embedded render canvas is mounted', async () => {
        const requestAnimationFrame = vi.spyOn(window, 'requestAnimationFrame');
        const cancelAnimationFrame = vi.spyOn(window, 'cancelAnimationFrame');
        const callbacks: FrameRequestCallback[] = [];
        requestAnimationFrame.mockImplementation((callback) => {
            callbacks.push(callback);
            return callbacks.length;
        });
        cancelAnimationFrame.mockImplementation(() => {});

        const { createSheetsEmbedChildViewContribution } = await import('./EmbedBlock');
        const rootElement = document.createElement('div');
        const contribution = createSheetsEmbedChildViewContribution();
        const disposable = contribution.mount?.({
            childUnitId: 'sheet-1',
            runtimeScope: { roots: { canvas: rootElement } },
            renderScope: { mode: 'float', canvasRoot: rootElement, contentRoot: rootElement, rootElement },
        } as unknown as IEmbedChildContainerContext);

        expect(callbacks).toHaveLength(1);
        callbacks[0](0);

        expect(mountEmbedRenderChildUnit).toHaveBeenCalledTimes(1);
        expect(rootElement.querySelector('canvas')).not.toBeNull();
        expect(callbacks).toHaveLength(1);

        disposable?.dispose();
        requestAnimationFrame.mockRestore();
        cancelAnimationFrame.mockRestore();
    });
});
