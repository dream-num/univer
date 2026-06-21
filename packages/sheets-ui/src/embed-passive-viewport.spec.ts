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
import { IRenderManagerService, SHEET_VIEWPORT_KEY } from '@univerjs/engine-render';
import { createSheetsPassiveViewportProvider } from './embed-passive-viewport';

describe('createSheetsPassiveViewportProvider', () => {
    it('lets docs own dominant vertical wheel in docs-sticky layout', () => {
        const injector = {
            has: vi.fn(() => {
                throw new Error('render manager should not be requested');
            }),
            get: vi.fn(),
        };
        const provider = createSheetsPassiveViewportProvider(injector as never);

        const handled = provider.handleWheel({
            childUnitId: 'sheet-child',
            event: new WheelEvent('wheel', { deltaY: 48 }),
            layout: 'docs-sticky-sheet',
        } as never);

        expect(handled).toBe(false);
        expect(injector.get).not.toHaveBeenCalled();
    });

    it('accepts host scroll sync in docs-sticky layout', () => {
        const viewport = {
            viewportScrollY: 0,
            scrollByViewportDeltaVal: vi.fn((delta: { viewportScrollY: number }) => {
                viewport.viewportScrollY += delta.viewportScrollY;
            }),
        };
        const scene = {
            getViewport: vi.fn(() => viewport),
            makeDirty: vi.fn(),
        };
        const renderManager = {
            getRenderById: vi.fn(() => ({ scene })),
        };
        const injector = {
            has: vi.fn((token) => token === IRenderManagerService),
            get: vi.fn((token) => {
                if (token !== IRenderManagerService) {
                    throw new Error('unexpected token');
                }
                return renderManager;
            }),
        };
        const provider = createSheetsPassiveViewportProvider(injector as never);

        const handled = provider.handleWheel({
            childUnitId: 'sheet-child',
            event: new WheelEvent('wheel', { deltaY: 48 }),
            layout: 'docs-sticky-sheet',
            source: 'host-scroll-sync',
        } as never);

        expect(handled).toBe(true);
        expect(scene.getViewport).toHaveBeenCalledWith(SHEET_VIEWPORT_KEY.VIEW_MAIN);
        expect(viewport.viewportScrollY).toBe(48);
    });

    it('syncs docs-sticky host scroll by absolute viewport position when provided', () => {
        const viewport = {
            viewportScrollX: 0,
            viewportScrollY: 12,
            scrollToViewportPos: vi.fn((position: { viewportScrollX?: number; viewportScrollY?: number }) => {
                viewport.viewportScrollY = position.viewportScrollY ?? viewport.viewportScrollY;
            }),
            scrollByViewportDeltaVal: vi.fn(),
        };
        const scene = {
            getViewport: vi.fn(() => viewport),
            makeDirty: vi.fn(),
        };
        const renderManager = {
            getRenderById: vi.fn(() => ({ scene })),
        };
        const injector = {
            has: vi.fn((token) => token === IRenderManagerService),
            get: vi.fn((token) => {
                if (token !== IRenderManagerService) {
                    throw new Error('unexpected token');
                }
                return renderManager;
            }),
        };
        const provider = createSheetsPassiveViewportProvider(injector as never);

        const handled = provider.handleWheel({
            childUnitId: 'sheet-child',
            event: new WheelEvent('wheel', { deltaY: 999 }),
            layout: 'docs-sticky-sheet',
            source: 'host-scroll-sync',
            viewportScrollY: 320,
        } as never);

        expect(handled).toBe(true);
        expect(viewport.scrollToViewportPos).toHaveBeenCalledWith({ viewportScrollX: 0, viewportScrollY: 320 });
        expect(viewport.scrollByViewportDeltaVal).not.toHaveBeenCalled();
        expect(viewport.viewportScrollY).toBe(320);
    });

    it('uses the runtime injector render manager before falling back to the root injector', () => {
        const viewport = {
            viewportScrollY: 0,
            scrollByViewportDeltaVal: vi.fn((delta: { viewportScrollY: number }) => {
                viewport.viewportScrollY += delta.viewportScrollY;
            }),
        };
        const runtimeRenderManager = {
            getRenderById: vi.fn(() => ({
                scene: {
                    getViewport: vi.fn(() => viewport),
                    makeDirty: vi.fn(),
                },
            })),
        };
        const rootRenderManager = {
            getRenderById: vi.fn(),
        };
        const rootInjector = {
            has: vi.fn((token) => token === IRenderManagerService),
            get: vi.fn((token) => {
                if (token !== IRenderManagerService) {
                    throw new Error('unexpected token');
                }
                return rootRenderManager;
            }),
        };
        const runtimeInjector = {
            has: vi.fn((token) => token === IRenderManagerService),
            get: vi.fn((token) => {
                if (token !== IRenderManagerService) {
                    throw new Error('unexpected token');
                }
                return runtimeRenderManager;
            }),
        };
        const provider = createSheetsPassiveViewportProvider(rootInjector as never);

        const handled = provider.handleWheel({
            childUnitId: 'sheet-child',
            event: new WheelEvent('wheel', { deltaY: 80 }),
            layout: 'docs-sticky-sheet',
            runtimeScope: { injector: runtimeInjector },
            source: 'host-scroll-sync',
        } as never);

        expect(handled).toBe(true);
        expect(runtimeRenderManager.getRenderById).toHaveBeenCalledWith('sheet-child');
        expect(rootRenderManager.getRenderById).not.toHaveBeenCalled();
        expect(viewport.viewportScrollY).toBe(80);
    });
});
