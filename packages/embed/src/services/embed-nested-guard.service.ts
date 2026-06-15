import type { EmbedCreateContext } from '../types/embed';
import { Inject } from '@univerjs/core';
import { EmbedCapabilityRegistryService } from './embed-capability-registry.service';

export class EmbedNestedGuardService {
    constructor(
        @Inject(EmbedCapabilityRegistryService)
        private readonly _capabilityRegistry: EmbedCapabilityRegistryService
    ) {
        // noop
    }

    assertCanCreate(context: EmbedCreateContext): void {
        if (context.parentEmbedId) {
            throw new Error('NESTED_EMBED_NOT_SUPPORTED');
        }

        const childType = context.source.kind === 'empty'
            ? context.source.unitType
            : undefined;

        if (childType && !this._capabilityRegistry.getCapability({
            hostType: context.hostType,
            childType,
            entry: context.entry,
        })) {
            throw new Error('EMBED_CAPABILITY_NOT_SUPPORTED');
        }
    }
}
