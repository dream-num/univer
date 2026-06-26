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

import type { ICreateUnitOptions, UniverInstanceType } from '@univerjs/core';
import type { EmbedSource, IEmbedResolvedSource } from '../types/embed';
import { generateRandomId, Inject, IUniverInstanceService, Optional, PluginService } from '@univerjs/core';
import { toResourceRefUnitType } from '../common/unit-type';
import { EmbedGuestContributionRegistryService } from './embed-guest-contribution-registry.service';
import { EmbedReferencedUnitManagerService } from './embed-referenced-unit-manager.service';

export const EMBED_CHILD_CREATE_OPTIONS: ICreateUnitOptions = {
    makeCurrent: false,
    skipAutoRender: true,
    embeddedRender: true,
};

export interface IEmbedSourceResolveContext {
    hostUnitId?: string;
    embedId?: string;
    createOptions?: ICreateUnitOptions;
}

export class EmbedSourceResolverService {
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Optional(EmbedGuestContributionRegistryService) private readonly _guestContributionRegistry?: EmbedGuestContributionRegistryService,
        @Inject(EmbedReferencedUnitManagerService) private readonly _referencedUnitManager?: EmbedReferencedUnitManagerService,
        @Optional(PluginService) private readonly _pluginService?: PluginService
    ) {
        // noop
    }

    async resolve(source: EmbedSource, context: IEmbedSourceResolveContext = {}): Promise<IEmbedResolvedSource> {
        if (source.kind === 'ref') {
            return this._resolveResourceRef(source, context);
        }

        const createOptions = context.createOptions ?? EMBED_CHILD_CREATE_OPTIONS;
        const creationConfig = this._normalizeEmptyCreationConfig(source.creationConfig);
        const guestContribution = this._getGuestContribution(source.unitType);
        const created = guestContribution?.createEmptyUnit?.(creationConfig, createOptions);
        const child = created
            ? null
            : this._univerInstanceService.createUnit(source.unitType, creationConfig, createOptions);
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

    private async _resolveResourceRef(source: Extract<EmbedSource, { kind: 'ref' }>, context: IEmbedSourceResolveContext): Promise<IEmbedResolvedSource> {
        if (!this._referencedUnitManager) {
            throw new Error('REFERENCED_UNIT_MANAGER_UNAVAILABLE');
        }

        const resolved = await this._referencedUnitManager.ensure({
            ref: source.ref,
            hostUnitId: context.hostUnitId,
            embedId: context.embedId,
            createOptions: context.createOptions ?? EMBED_CHILD_CREATE_OPTIONS,
        });

        return {
            childUnitId: resolved.unitId,
            childType: resolved.unitType,
            source: {
                kind: 'ref',
                ref: resolved.ref,
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
