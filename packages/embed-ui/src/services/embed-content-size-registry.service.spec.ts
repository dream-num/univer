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

import type { IEmbedContentSizeProvider } from '../types/embed-ui';
import { describe, expect, it, vi } from 'vitest';
import { EmbedContentSizeRegistryService } from './embed-content-size-registry.service';

describe('EmbedContentSizeRegistryService', () => {
    it('measures content size through a child product provider', () => {
        const service = new EmbedContentSizeRegistryService();
        const provider: IEmbedContentSizeProvider = {
            childType: 2 as never,
            measureContentSize: vi.fn(() => ({ height: 480, width: 960 })),
        };

        const disposable = service.register(provider);

        expect(service.measureContentSize({ childType: 2 as never, childUnitId: 'child-1' })).toEqual({ height: 480, width: 960 });
        expect(provider.measureContentSize).toHaveBeenCalledWith({ childType: 2, childUnitId: 'child-1' });

        disposable.dispose();

        expect(service.measureContentSize({ childType: 2 as never, childUnitId: 'child-1' })).toBeUndefined();
    });

    it('keeps the newest provider for a child type until it is disposed', () => {
        const service = new EmbedContentSizeRegistryService();
        const first: IEmbedContentSizeProvider = {
            childType: 2 as never,
            measureContentSize: () => ({ height: 120 }),
        };
        const second: IEmbedContentSizeProvider = {
            childType: 2 as never,
            measureContentSize: () => ({ height: 240 }),
        };

        const firstDisposable = service.register(first);
        const secondDisposable = service.register(second);

        expect(service.measureContentSize({ childType: 2 as never, childUnitId: 'child-1' })).toEqual({ height: 240 });

        firstDisposable.dispose();
        expect(service.measureContentSize({ childType: 2 as never, childUnitId: 'child-1' })).toEqual({ height: 240 });

        secondDisposable.dispose();
        expect(service.measureContentSize({ childType: 2 as never, childUnitId: 'child-1' })).toBeUndefined();
    });
});
