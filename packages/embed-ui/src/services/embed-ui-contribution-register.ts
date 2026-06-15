import type { Injector } from '@univerjs/core';
import { EmbedBlockRegistryService } from './embed-block-registry.service';
import { EmbedChildViewRegistryService } from './embed-child-view-registry.service';
import { EmbedHostAdapterRegistryService } from './embed-host-adapter-registry.service';
import { EmbedHostContainerRegistryService } from './embed-host-container-registry.service';
import { EmbedProductMenuRegistryService } from './embed-product-menu-registry.service';

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
        injector.has(EmbedProductMenuRegistryService)
    );
}
