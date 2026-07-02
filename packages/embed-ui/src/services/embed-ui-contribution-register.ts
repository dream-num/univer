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

import type { Injector } from '@univerjs/core';
import { EmbedHostAdapterRegistryService } from '@univerjs/embed';
import { EmbedBlockRegistryService } from './embed-block-registry.service';
import { EmbedChildViewRegistryService } from './embed-child-view-registry.service';
import { EmbedContentSizeRegistryService } from './embed-content-size-registry.service';
import { EmbedFloatPreviewService } from './embed-float-preview.service';
import { EmbedFloatingMenuRegistryService } from './embed-floating-menu-registry.service';
import { EmbedHostContainerRegistryService } from './embed-host-container-registry.service';
import { EmbedPassiveViewportRegistryService } from './embed-passive-viewport-registry.service';
import { EmbedProductMenuRegistryService } from './embed-product-menu-registry.service';
import { EmbedReadonlyPreviewRegistryService } from './embed-readonly-preview-registry.service';

type EmbedUIContributionRegister = (injector: Injector) => void;

const PENDING_UI_CONTRIBUTIONS = new WeakMap<object, Map<string, EmbedUIContributionRegister>>();

export function registerEmbedUIContribution(
    injector: Injector,
    key: string,
    register: EmbedUIContributionRegister
): void {
    if (hasEmbedUIRegistries(injector)) {
        register(injector);
        return;
    }

    const injectorKey = injector as object;
    const pending = PENDING_UI_CONTRIBUTIONS.get(injectorKey) ?? new Map<string, EmbedUIContributionRegister>();
    pending.set(key, register);
    PENDING_UI_CONTRIBUTIONS.set(injectorKey, pending);
}

export function flushPendingEmbedUIContributions(injector: Injector): void {
    if (!hasEmbedUIRegistries(injector)) {
        return;
    }

    const injectorKey = injector as object;
    const pending = PENDING_UI_CONTRIBUTIONS.get(injectorKey);
    if (!pending?.size) {
        return;
    }

    pending.forEach((register) => register(injector));
    PENDING_UI_CONTRIBUTIONS.delete(injectorKey);
}

function hasEmbedUIRegistries(injector: Pick<Injector, 'has'>): boolean {
    return (
        injector.has(EmbedHostAdapterRegistryService) &&
        injector.has(EmbedHostContainerRegistryService) &&
        injector.has(EmbedChildViewRegistryService) &&
        injector.has(EmbedBlockRegistryService) &&
        injector.has(EmbedProductMenuRegistryService) &&
        injector.has(EmbedFloatingMenuRegistryService) &&
        injector.has(EmbedFloatPreviewService) &&
        injector.has(EmbedContentSizeRegistryService) &&
        injector.has(EmbedPassiveViewportRegistryService) &&
        injector.has(EmbedReadonlyPreviewRegistryService)
    );
}
