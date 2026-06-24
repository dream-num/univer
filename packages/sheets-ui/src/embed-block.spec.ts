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

// @vitest-environment jsdom

import type { IEmbedChildContainerContext } from '@univerjs/embed-ui';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./views/editor-container/EditorContainer', () => ({
    EditorContainer: () => null,
}));
vi.mock('./views/auto-fill-popup-menu/AutoFillPopupMenu', () => ({
    AutoFillPopupMenu: () => null,
}));
vi.mock('@univerjs/ui', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@univerjs/ui')>();
    return {
        ...actual,
        useConfigValue: vi.fn(() => ({})),
        useDependency: vi.fn(() => ({ get: vi.fn(() => null) })),
    };
});

const mountEmbedRenderChildUnit = vi.fn((_context: unknown, _renderManagerService: unknown, target: HTMLElement, _options?: unknown) => {
    const wrapper = document.createElement('div');
    const canvas = document.createElement('canvas');
    wrapper.appendChild(canvas);
    target.appendChild(wrapper);
    return { dispose: vi.fn() };
});
const scopedInjector = {};
const reactRoot = { render: vi.fn() };
const disposeEmbedReactRoot = vi.fn();

vi.mock('@univerjs/embed-ui', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@univerjs/embed-ui')>();
    return {
        ...actual,
        mountEmbedRenderChildUnit,
        createEmbedReactRoot: vi.fn(() => reactRoot),
        disposeEmbedReactRoot,
        EmbedRuntimeProviders: ({ children }: { children?: unknown }) => children,
    };
});

describe('createSheetsEmbedChildViewContribution', () => {
    it('mounts the embedded render once without RAF remount loops', async () => {
        const requestAnimationFrame = vi.spyOn(window, 'requestAnimationFrame');
        const cancelAnimationFrame = vi.spyOn(window, 'cancelAnimationFrame');
        requestAnimationFrame.mockImplementation(() => 1);
        cancelAnimationFrame.mockImplementation(() => {});

        try {
            const { createSheetsEmbedChildViewContribution } = await import('./EmbedBlock');
            const rootElement = document.createElement('div');
            const contribution = createSheetsEmbedChildViewContribution();
            const disposable = contribution.mount?.({
                childUnitId: 'sheet-1',
                runtimeScope: { injector: scopedInjector, roots: { canvas: rootElement } },
                renderScope: { mode: 'float', canvasRoot: rootElement, contentRoot: rootElement, rootElement },
            } as unknown as IEmbedChildContainerContext);

            expect(mountEmbedRenderChildUnit).toHaveBeenCalledTimes(1);
            expect(mountEmbedRenderChildUnit.mock.calls[0]).toHaveLength(4);
            expect(mountEmbedRenderChildUnit.mock.calls[0][2]).toBe(rootElement);
            expect(mountEmbedRenderChildUnit.mock.calls[0][3]).toEqual({ scopedRenderInjector: true });
            expect(rootElement.querySelector('canvas')).not.toBeNull();
            expect(requestAnimationFrame).not.toHaveBeenCalled();
            expect(mountEmbedRenderChildUnit).toHaveBeenCalledTimes(1);

            disposable?.dispose();
            expect(disposeEmbedReactRoot).toHaveBeenCalledWith(reactRoot);
            expect(cancelAnimationFrame).not.toHaveBeenCalled();
        } finally {
            requestAnimationFrame.mockRestore();
            cancelAnimationFrame.mockRestore();
        }
    }, 15000);
});
