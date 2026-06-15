import type { ResourceRef, ResourceRefFile } from '../types/resource-ref';
import type { UniverInstanceType } from '@univerjs/core';

export interface EmbedResourceRefResolveResult {
    unitId: string;
    unitType: UniverInstanceType;
    ref?: ResourceRef;
}

export interface EmbedResourceRefProvider {
    fileKind: ResourceRefFile['kind'];
    resolve: (ref: ResourceRef) => EmbedResourceRefResolveResult | Promise<EmbedResourceRefResolveResult>;
}

export class EmbedResourceRefProviderRegistryService {
    private readonly _providers = new Map<ResourceRefFile['kind'], EmbedResourceRefProvider>();

    register(provider: EmbedResourceRefProvider): void {
        if (this._providers.has(provider.fileKind)) {
            throw new Error(`Embed ResourceRef provider already registered: ${provider.fileKind}`);
        }

        this._providers.set(provider.fileKind, provider);
    }

    get(fileKind: ResourceRefFile['kind']): EmbedResourceRefProvider | undefined {
        return this._providers.get(fileKind);
    }

    list(): EmbedResourceRefProvider[] {
        return [...this._providers.values()];
    }
}
