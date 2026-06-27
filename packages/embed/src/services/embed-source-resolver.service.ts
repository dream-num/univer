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
import { generateRandomId, IUniverInstanceService, Optional, PluginService } from '@univerjs/core';
import { EMBED_CHILD_CREATE_OPTIONS } from '../common/const';
import { normalizeResourceRefInput } from '../common/resource-ref-input';
import { fromResourceRefUnitType, toResourceRefUnitType } from '../common/unit-type';
import { EmbedGuestContributionRegistryService } from './embed-guest-contribution-registry.service';

export { EMBED_CHILD_CREATE_OPTIONS };

export interface IEmbedSourceResolveContext {
    hostUnitId?: string;
    embedId?: string;
    createOptions?: ICreateUnitOptions;
}

export class EmbedSourceResolverService {
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Optional(EmbedGuestContributionRegistryService) private readonly _guestContributionRegistry?: EmbedGuestContributionRegistryService,
        @Optional(PluginService) private readonly _pluginService?: PluginService
    ) {
        // noop
    }

    resolve(source: EmbedSource, context: IEmbedSourceResolveContext = {}): IEmbedResolvedSource {
        if (source.kind === 'ref') {
            const ref = normalizeResourceRefInput(source.ref);
            if (typeof ref !== 'string' && fromResourceRefUnitType(ref.unit.type) !== source.unitType) {
                throw new Error('EMBED_SOURCE_TYPE_MISMATCH');
            }

            return {
                childType: source.unitType,
                source: {
                    kind: 'ref',
                    ref,
                    unitType: source.unitType,
                },
            };
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
                unitType: childType,
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

    private _normalizeEmptyCreationConfig(config?: Record<string, unknown>): Record<string, unknown> {
        return {
            ...config,
            id: typeof config?.id === 'string' ? config.id : `embed_${generateRandomId(10)}`,
        };
    }
}
