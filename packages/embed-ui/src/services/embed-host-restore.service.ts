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
import { IUniverInstanceService, Inject } from '@univerjs/core';
import { EMBED_CHILD_CREATE_OPTIONS, EmbedModelService, EmbedReferencedUnitManagerService, getResourceRefInputKey, ReferencedUnitOwnerKind } from '@univerjs/embed';
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
    private readonly _materializingDescriptors = new Map<string, Promise<IEmbedDescriptor>>();

    constructor(
        @Inject(EmbedModelService) private readonly _modelService: EmbedModelService,
        @Inject(EmbedHostAdapterRegistryService) private readonly _hostAdapterRegistry: EmbedHostAdapterRegistryService,
        @Inject(EmbedHostAnchorModelService) private readonly _anchorModelService: EmbedHostAnchorModelService,
        @Inject(EmbedReferencedUnitManagerService) private readonly _referencedUnitManager: EmbedReferencedUnitManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        // noop
    }

    async materializeDescriptor(context: IEmbedDescriptorMaterializeContext): Promise<IEmbedDescriptor> {
        const descriptor = await this._materializeDescriptor(context);
        this._modelService.addDescriptor(descriptor.hostUnitId, descriptor);
        return this._modelService.getDescriptor(descriptor.hostUnitId, descriptor.embedId)!;
    }

    async restoreEmbed(context: IEmbedHostRestoreContext): Promise<IEmbedDescriptor> {
        const descriptor = context.descriptor;
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
        const loadedDescriptor = this._getLoadedDescriptor(descriptor);
        if (loadedDescriptor) {
            return loadedDescriptor;
        }

        const key = this._getMaterializeKey(descriptor);
        const pending = this._materializingDescriptors.get(key);
        if (pending) {
            return pending;
        }

        const materializing = this._loadDescriptor(context);
        this._materializingDescriptors.set(key, materializing);
        const cleanup = () => {
            if (this._materializingDescriptors.get(key) === materializing) {
                this._materializingDescriptors.delete(key);
            }
        };
        materializing.then(cleanup, cleanup);
        return materializing;
    }

    private async _loadDescriptor(context: IEmbedDescriptorMaterializeContext): Promise<IEmbedDescriptor> {
        const descriptor = context.descriptor;
        const handle = this._referencedUnitManager.ensure({
            ref: descriptor.source.ref,
            unitType: descriptor.childType,
            owner: {
                kind: ReferencedUnitOwnerKind.Embed,
                unitId: descriptor.hostUnitId,
                ownerId: descriptor.embedId,
            },
            createOptions: context.createOptions ?? EMBED_CHILD_CREATE_OPTIONS,
        });
        const materialized = await handle.loaded;

        return {
            ...descriptor,
            source: {
                unitType: descriptor.childType,
                ref: materialized.ref,
                ...(descriptor.source.creationConfig === undefined ? undefined : { creationConfig: descriptor.source.creationConfig }),
            },
            childUnitId: materialized.unitId,
            childType: materialized.unitType,
        };
    }

    private _getLoadedDescriptor(descriptor: IEmbedDescriptor): IEmbedDescriptor | undefined {
        const current = this._modelService.getDescriptor(descriptor.hostUnitId, descriptor.embedId) ?? descriptor;
        if (!current.childUnitId || current.childType == null) {
            return undefined;
        }

        // childUnitId is a runtime materialization result. It is loaded only
        // after that unit exists in the current runtime.
        if (this._univerInstanceService.getUnitType(current.childUnitId) !== current.childType) {
            throw new Error('EMBED_MATERIALIZED_CHILD_UNIT_NOT_LOADED');
        }

        return current;
    }

    private _getMaterializeKey(descriptor: IEmbedDescriptor): string {
        return JSON.stringify([
            descriptor.hostUnitId,
            descriptor.embedId,
            descriptor.childType,
            getResourceRefInputKey(descriptor.source.ref),
        ]);
    }
}
