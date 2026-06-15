import type { ICreateUnitOptions, IUniverInstanceService } from '@univerjs/core';
import type { EmbedResolvedSource, EmbedSource } from '../types/embed';
import { generateRandomId, IUniverInstanceService as IUniverInstanceServiceToken, Optional, PluginService, UniverInstanceType } from '@univerjs/core';
import { normalizeResourceRef } from '../common/resource-ref';
import { fromResourceRefUnitType, toResourceRefUnitType } from '../common/unit-type';
import { EmbedGuestContributionRegistryService } from './embed-guest-contribution-registry.service';
import { EmbedResourceRefProviderRegistryService } from './embed-resource-ref-provider-registry.service';

export const EMBED_CHILD_CREATE_OPTIONS: ICreateUnitOptions = {
    makeCurrent: false,
    skipAutoRender: true,
    embeddedRender: true,
};

export class EmbedSourceResolverService {
    constructor(
        @IUniverInstanceServiceToken private readonly _univerInstanceService: IUniverInstanceService,
        @Optional(EmbedGuestContributionRegistryService) private readonly _guestContributionRegistry?: EmbedGuestContributionRegistryService,
        @Optional(EmbedResourceRefProviderRegistryService) private readonly _resourceRefProviderRegistry?: EmbedResourceRefProviderRegistryService,
        @Optional(PluginService) private readonly _pluginService?: PluginService
    ) {
        // noop
    }

    async resolve(source: EmbedSource): Promise<EmbedResolvedSource> {
        if (source.kind === 'ref') {
            return this._resolveResourceRef(source);
        }

        const creationConfig = this._normalizeEmptyCreationConfig(source.creationConfig);
        const guestContribution = this._getGuestContribution(source.unitType);
        const created = guestContribution?.createEmptyUnit?.(creationConfig, EMBED_CHILD_CREATE_OPTIONS);
        const child = created
            ? null
            : this._univerInstanceService.createUnit(source.unitType, creationConfig, EMBED_CHILD_CREATE_OPTIONS);
        const childUnitId = created?.unitId ?? child!.getUnitId();
        const childType = created?.unitType ?? source.unitType;
        if (childType !== source.unitType) {
            throw new Error('EMPTY_SOURCE_TYPE_MISMATCH');
        }

        return {
            childUnitId,
            childType,
            source: {
                kind: 'ref',
                ref: {
                    file: { kind: 'self' },
                    unit: {
                        selector: childUnitId,
                        type: toResourceRefUnitType(childType),
                    },
                },
            },
        };
    }

    private _getGuestContribution(unitType: UniverInstanceType) {
        let guestContribution = this._guestContributionRegistry?.get(unitType);
        if (!guestContribution) {
            this._pluginService?.startPluginsForType(unitType);
            guestContribution = this._guestContributionRegistry?.get(unitType);
        }

        return guestContribution;
    }

    private async _resolveResourceRef(source: Extract<EmbedSource, { kind: 'ref' }>): Promise<EmbedResolvedSource> {
        const ref = normalizeResourceRef(source.ref);
        const expectedType = fromResourceRefUnitType(ref.unit.type);
        if (ref.file.kind !== 'self') {
            const provider = this._resourceRefProviderRegistry?.get(ref.file.kind);
            if (!provider) {
                throw new Error('PROVIDER_UNSUPPORTED');
            }

            const resolved = await provider.resolve(ref);
            if (resolved.unitType !== expectedType) {
                throw new Error('UNIT_TYPE_MISMATCH');
            }

            return {
                childUnitId: resolved.unitId,
                childType: resolved.unitType,
                source: {
                    kind: 'ref',
                    ref: normalizeResourceRef(resolved.ref ?? ref),
                },
            };
        }

        const actualType = this._univerInstanceService.getUnitType(ref.unit.selector);
        if (actualType === UniverInstanceType.UNRECOGNIZED) {
            throw new Error('UNIT_NOT_FOUND');
        }

        if (actualType !== expectedType) {
            throw new Error('UNIT_TYPE_MISMATCH');
        }

        const unit = this._univerInstanceService.getUnit(ref.unit.selector, expectedType);
        if (!unit) {
            throw new Error('UNIT_NOT_FOUND');
        }

        return {
            childUnitId: ref.unit.selector,
            childType: expectedType,
            source: {
                kind: 'ref',
                ref,
            },
        };
    }

    private _normalizeEmptyCreationConfig(config?: Record<string, unknown>): Record<string, unknown> {
        return {
            ...config,
            id: typeof config?.id === 'string' ? config.id : `embed_${generateRandomId(10)}`,
        };
    }
}
