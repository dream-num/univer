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

import type { Injector, UniverInstanceType } from '@univerjs/core';
import type { EmbedGuestContribution } from '../types/embed';

const PENDING_GUEST_CONTRIBUTIONS = new WeakMap<object, EmbedGuestContribution[]>();

export function registerEmbedGuestContribution(
    injector: Pick<Injector, 'get' | 'has'>,
    contribution: EmbedGuestContribution
): void {
    if (injector.has(EmbedGuestContributionRegistryService)) {
        registerGuestContributionIfMissing(injector.get(EmbedGuestContributionRegistryService), contribution);
        return;
    }

    const key = injector as object;
    const pending = PENDING_GUEST_CONTRIBUTIONS.get(key) ?? [];
    if (!pending.some((item) => item.childType === contribution.childType)) {
        pending.push(contribution);
        PENDING_GUEST_CONTRIBUTIONS.set(key, pending);
    }
}

export function flushPendingEmbedGuestContributions(injector: Pick<Injector, 'get' | 'has'>): void {
    if (!injector.has(EmbedGuestContributionRegistryService)) {
        return;
    }

    const key = injector as object;
    const pending = PENDING_GUEST_CONTRIBUTIONS.get(key) ?? [];
    if (!pending.length) {
        return;
    }

    const registry = injector.get(EmbedGuestContributionRegistryService);
    pending.forEach((contribution) => registerGuestContributionIfMissing(registry, contribution));
    PENDING_GUEST_CONTRIBUTIONS.delete(key);
}

export class EmbedGuestContributionRegistryService {
    private readonly _contributions = new Map<UniverInstanceType, EmbedGuestContribution>();

    register(contribution: EmbedGuestContribution): void {
        if (this._contributions.has(contribution.childType)) {
            throw new Error(`Embed guest contribution already registered: ${contribution.childType}`);
        }

        this._contributions.set(contribution.childType, contribution);
    }

    get(childType: UniverInstanceType): EmbedGuestContribution | undefined {
        return this._contributions.get(childType);
    }

    list(): EmbedGuestContribution[] {
        return [...this._contributions.values()];
    }
}

function registerGuestContributionIfMissing(
    registry: EmbedGuestContributionRegistryService,
    contribution: EmbedGuestContribution
): void {
    if (!registry.get(contribution.childType)) {
        registry.register(contribution);
    }
}
