import type { EmbedGuestContribution } from '../types/embed';
import type { Injector } from '@univerjs/core';
import { UniverInstanceType } from '@univerjs/core';

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
