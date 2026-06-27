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

import type { ICreateUnitOptions } from '@univerjs/core';
import type { IEmbedDescriptor } from '@univerjs/embed';
import type { IEmbedHostAnchorRecord } from '../types/host-anchor';
import { Inject } from '@univerjs/core';
import { EMBED_CHILD_CREATE_OPTIONS, EmbedModelService, EmbedReferencedUnitManagerService } from '@univerjs/embed';
import { EmbedHostAdapterRegistryService } from './embed-host-adapter-registry.service';
import { EmbedHostAnchorModelService } from './embed-host-anchor-model.service';

export interface IEmbedHostRestoreContext {
    descriptor: IEmbedDescriptor;
    hostAnchorRecord?: IEmbedHostAnchorRecord;
    hostContext?: Record<string, unknown>;
    createOptions?: ICreateUnitOptions;
}

export interface IEmbedDescriptorMaterializeContext {
    descriptor: IEmbedDescriptor;
    createOptions?: ICreateUnitOptions;
}

export class EmbedHostRestoreService {
    constructor(
        @Inject(EmbedModelService) private readonly _modelService: EmbedModelService,
        @Inject(EmbedHostAdapterRegistryService) private readonly _hostAdapterRegistry: EmbedHostAdapterRegistryService,
        @Inject(EmbedHostAnchorModelService) private readonly _anchorModelService: EmbedHostAnchorModelService,
        @Inject(EmbedReferencedUnitManagerService) private readonly _referencedUnitManager: EmbedReferencedUnitManagerService
    ) {
        // noop
    }

    async materializeDescriptor(context: IEmbedDescriptorMaterializeContext): Promise<IEmbedDescriptor> {
        const descriptor = await this._materializeDescriptor(context);
        this._modelService.addDescriptor(descriptor.hostUnitId, descriptor);
        return this._modelService.getDescriptor(descriptor.hostUnitId, descriptor.embedId)!;
    }

    async restoreEmbed(context: IEmbedHostRestoreContext): Promise<IEmbedDescriptor> {
        const descriptor = await this._materializeDescriptor(context);
        const record = context.hostAnchorRecord ?? this._hostAdapterRegistry.restoreAnchor({
            embedId: descriptor.embedId,
            hostUnitId: descriptor.hostUnitId,
            hostType: descriptor.hostType,
            entry: descriptor.entry,
            hostAnchorId: descriptor.hostAnchorId,
            hostContext: context.hostContext,
            descriptor,
        });

        this._modelService.addDescriptor(descriptor.hostUnitId, descriptor);
        this._anchorModelService.setAnchor(record);

        return this._modelService.getDescriptor(descriptor.hostUnitId, descriptor.embedId)!;
    }

    private async _materializeDescriptor(context: IEmbedDescriptorMaterializeContext): Promise<IEmbedDescriptor> {
        const descriptor = context.descriptor;
        if (descriptor.source.kind !== 'ref') {
            throw new Error('EMBED_RESTORE_SOURCE_NOT_CANONICAL');
        }

        const materialized = await this._referencedUnitManager.ensure({
            ref: descriptor.source.ref,
            hostUnitId: descriptor.hostUnitId,
            embedId: descriptor.embedId,
            createOptions: context.createOptions ?? EMBED_CHILD_CREATE_OPTIONS,
        });

        return {
            ...descriptor,
            source: {
                kind: 'ref',
                ref: materialized.ref,
            },
            childUnitId: materialized.unitId,
            childType: materialized.unitType,
        };
    }
}
