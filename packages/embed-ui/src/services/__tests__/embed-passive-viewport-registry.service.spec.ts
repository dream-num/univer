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
