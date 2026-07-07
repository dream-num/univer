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

import { EmbedHostAdapterRegistryService } from '@univerjs/embed';
import { describe, expect, it, vi } from 'vitest';
import { EmbedBlockRegistryService } from '../embed-block-registry.service';
import { EmbedChildViewRegistryService } from '../embed-child-view-registry.service';
import { EmbedContentSizeRegistryService } from '../embed-content-size-registry.service';
import { EmbedFloatPreviewService } from '../embed-float-preview.service';
import { EmbedFloatingMenuRegistryService } from '../embed-floating-menu-registry.service';
import { EmbedHostContainerRegistryService } from '../embed-host-container-registry.service';
import { EmbedPassiveViewportRegistryService } from '../embed-passive-viewport-registry.service';
import { EmbedProductMenuRegistryService } from '../embed-product-menu-registry.service';
import { EmbedReadonlyPreviewRegistryService } from '../embed-readonly-preview-registry.service';
import { flushPendingEmbedUIContributions, registerEmbedUIContribution } from '../embed-ui-contribution-register';

describe('embed-ui contribution register', () => {
    it('waits for preview registries before flushing pending contributions', () => {
        const services = new Set<unknown>([
            EmbedHostAdapterRegistryService,
            EmbedHostContainerRegistryService,
            EmbedChildViewRegistryService,
            EmbedBlockRegistryService,
            EmbedProductMenuRegistryService,
            EmbedFloatingMenuRegistryService,
        ]);
        const injector = createInjector(services);
        const register = vi.fn();

        registerEmbedUIContribution(injector, 'preview-provider', register);
        flushPendingEmbedUIContributions(injector);

        expect(register).not.toHaveBeenCalled();

        services.add(EmbedFloatPreviewService);
        flushPendingEmbedUIContributions(injector);

        expect(register).not.toHaveBeenCalled();

        services.add(EmbedReadonlyPreviewRegistryService);
        flushPendingEmbedUIContributions(injector);

        expect(register).not.toHaveBeenCalled();

        services.add(EmbedPassiveViewportRegistryService);
        flushPendingEmbedUIContributions(injector);

        expect(register).not.toHaveBeenCalled();

        services.add(EmbedContentSizeRegistryService);
        flushPendingEmbedUIContributions(injector);

        expect(register).toHaveBeenCalledTimes(1);
    });

    it('registers each contribution key once per injector', () => {
        const services = createCompleteRegistryServiceSet();
        const injector = createInjector(services);
        const register = vi.fn();

        registerEmbedUIContribution(injector, 'product-ui.embed', register);
        registerEmbedUIContribution(injector, 'product-ui.embed', register);

        expect(register).toHaveBeenCalledTimes(1);
    });

    it('does not replay flushed contribution keys', () => {
        const services = createCompleteRegistryServiceSet();
        services.delete(EmbedContentSizeRegistryService);
        const injector = createInjector(services);
        const register = vi.fn();

        registerEmbedUIContribution(injector, 'product-ui.embed', register);
        services.add(EmbedContentSizeRegistryService);
        flushPendingEmbedUIContributions(injector);
        registerEmbedUIContribution(injector, 'product-ui.embed', register);

        expect(register).toHaveBeenCalledTimes(1);
    });
});

function createCompleteRegistryServiceSet(): Set<unknown> {
    return new Set<unknown>([
        EmbedHostAdapterRegistryService,
        EmbedHostContainerRegistryService,
        EmbedChildViewRegistryService,
        EmbedBlockRegistryService,
        EmbedProductMenuRegistryService,
        EmbedFloatingMenuRegistryService,
        EmbedFloatPreviewService,
        EmbedReadonlyPreviewRegistryService,
        EmbedPassiveViewportRegistryService,
        EmbedContentSizeRegistryService,
    ]);
}

function createInjector(services: Set<unknown>) {
    return {
        has: (token: unknown) => services.has(token),
    } as any;
}
