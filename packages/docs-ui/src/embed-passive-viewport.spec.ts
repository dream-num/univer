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

import { UniverInstanceType } from '@univerjs/core';
import { EmbedPassiveWheelHandlerRegistryService } from '@univerjs/embed-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { describe, expect, it, vi } from 'vitest';
import { createDocsPassiveViewportProvider } from './embed-passive-viewport';

describe('createDocsPassiveViewportProvider', () => {
    it('lets passive wheel handlers consume wheel before scrolling the doc viewport', () => {
        const handlerRegistry = new EmbedPassiveWheelHandlerRegistryService();
        const handler = vi.fn(() => true);
        handlerRegistry.register({
            childType: UniverInstanceType.UNIVER_DOC,
            handleWheel: handler,
        });
        const viewport = {
            viewportScrollX: 0,
            viewportScrollY: 0,
            scrollByViewportDeltaVal: vi.fn((delta) => {
                viewport.viewportScrollX += delta.viewportScrollX;
                viewport.viewportScrollY += delta.viewportScrollY;
            }),
        };
        const injector = createInjectorMock(new Map<unknown, unknown>([
            [EmbedPassiveWheelHandlerRegistryService, handlerRegistry],
            [IRenderManagerService, {
                getRenderById: () => ({
                    scene: {
                        getViewport: () => viewport,
                        makeDirty: vi.fn(),
                    },
                }),
            }],
        ]));

        const handled = createDocsPassiveViewportProvider(injector as never).handleWheel({
            childType: UniverInstanceType.UNIVER_DOC,
            childUnitId: 'doc-1',
            event: new WheelEvent('wheel', { deltaY: 100 }),
            layout: 'scroll-contained',
        } as never);

        expect(handled).toBe(true);
        expect(handler).toHaveBeenCalledTimes(1);
        expect(viewport.scrollByViewportDeltaVal).not.toHaveBeenCalled();
    });

    it('falls back to the doc viewport when no handler consumes the wheel', () => {
        const handlerRegistry = new EmbedPassiveWheelHandlerRegistryService();
        handlerRegistry.register({
            childType: UniverInstanceType.UNIVER_DOC,
            handleWheel: vi.fn(() => false),
        });
        const viewport = {
            viewportScrollX: 0,
            viewportScrollY: 0,
            scrollByViewportDeltaVal: vi.fn((delta) => {
                viewport.viewportScrollX += delta.viewportScrollX;
                viewport.viewportScrollY += delta.viewportScrollY;
            }),
        };
        const makeDirty = vi.fn();
        const injector = createInjectorMock(new Map<unknown, unknown>([
            [EmbedPassiveWheelHandlerRegistryService, handlerRegistry],
            [IRenderManagerService, {
                getRenderById: () => ({
                    scene: {
                        getViewport: () => viewport,
                        makeDirty,
                    },
                }),
            }],
        ]));

        const handled = createDocsPassiveViewportProvider(injector as never).handleWheel({
            childType: UniverInstanceType.UNIVER_DOC,
            childUnitId: 'doc-1',
            event: new WheelEvent('wheel', { deltaY: 100 }),
            layout: 'scroll-contained',
        } as never);

        expect(handled).toBe(true);
        expect(viewport.viewportScrollY).toBe(100);
        expect(makeDirty).toHaveBeenCalledWith(true);
    });
});

function createInjectorMock(values: Map<unknown, unknown>) {
    return {
        get: (token: unknown) => values.get(token),
        has: (token: unknown) => values.has(token),
    };
}
