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

import type { IEmbedPassiveViewportProvider } from '../../types/embed-ui';
import { describe, expect, it, vi } from 'vitest';
import { EmbedPassiveWheelHandlerRegistryService } from '../embed-passive-wheel-handler-registry.service';
import { EmbedPassiveViewportRegistryService } from '../embed-passive-viewport-registry.service';

describe('EmbedPassiveViewportRegistryService', () => {
    it('registers and disposes passive viewport providers by child type', () => {
        const service = new EmbedPassiveViewportRegistryService();
        const provider: IEmbedPassiveViewportProvider = {
            childType: 2 as never,
            handleWheel: vi.fn(),
        };

        const disposable = service.register(provider);

        expect(service.get(2 as never)).toBe(provider);
        expect(service.list()).toEqual([provider]);

        disposable.dispose();

        expect(service.get(2 as never)).toBeUndefined();
        expect(service.list()).toEqual([]);
    });

    it('filters providers by supported layout', () => {
        const service = new EmbedPassiveViewportRegistryService();
        const provider: IEmbedPassiveViewportProvider = {
            childType: 2 as never,
            supportedLayouts: ['aspect-fit'],
            handleWheel: vi.fn(),
        };

        service.register(provider);

        expect(service.get(2 as never, 'aspect-fit')).toBe(provider);
        expect(service.get(2 as never, 'doc-width-scale')).toBeUndefined();
    });
});

describe('EmbedPassiveWheelHandlerRegistryService', () => {
    it('runs matching handlers by priority until one consumes the wheel', () => {
        const service = new EmbedPassiveWheelHandlerRegistryService();
        const lowPriority = vi.fn(() => true);
        const highPriority = vi.fn(() => undefined);
        const otherType = vi.fn(() => true);
        const context = {
            childType: 2,
            layout: 'scroll-contained',
        } as never;

        service.register({
            childType: 3 as never,
            handleWheel: otherType,
            order: 100,
        });
        service.register({
            childType: 2 as never,
            handleWheel: lowPriority,
            order: 1,
        });
        service.register({
            childType: 2 as never,
            handleWheel: highPriority,
            order: 10,
        });

        expect(service.handleWheel(context)).toBe(true);
        expect(highPriority).toHaveBeenCalledTimes(1);
        expect(lowPriority).toHaveBeenCalledTimes(1);
        expect(otherType).not.toHaveBeenCalled();
    });

    it('skips handlers that do not support the current layout', () => {
        const service = new EmbedPassiveWheelHandlerRegistryService();
        const unsupported = vi.fn(() => true);
        const supported = vi.fn(() => true);

        service.register({
            childType: 2 as never,
            handleWheel: unsupported,
            supportedLayouts: ['aspect-fit'],
        });
        service.register({
            childType: 2 as never,
            handleWheel: supported,
            supportedLayouts: ['scroll-contained'],
        });

        expect(service.handleWheel({
            childType: 2,
            layout: 'scroll-contained',
        } as never)).toBe(true);
        expect(unsupported).not.toHaveBeenCalled();
        expect(supported).toHaveBeenCalledTimes(1);
    });
});
