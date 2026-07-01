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
import { EMBED_CHILD_CREATE_OPTIONS, EmbedModelService, EmbedReferencedUnitManagerService, ReferencedUnitOwnerKind } from '@univerjs/embed';
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
    private readonly _materializeTasks = new Map<string, Promise<IEmbedDescriptor>>();

    constructor(
        @Inject(EmbedModelService) private readonly _modelService: EmbedModelService,
        @Inject(EmbedHostAdapterRegistryService) private readonly _hostAdapterRegistry: EmbedHostAdapterRegistryService,
        @Inject(EmbedHostAnchorModelService) private readonly _anchorModelService: EmbedHostAnchorModelService,
        @Inject(EmbedReferencedUnitManagerService) private readonly _referencedUnitManager: EmbedReferencedUnitManagerService
    ) {
        // noop
    }

    async materializeDescriptor(context: IEmbedDescriptorMaterializeContext): Promise<IEmbedDescriptor> {
        const readyDescriptor = this._getMaterializedDescriptor(context.descriptor);
        if (readyDescriptor) {
            this._modelService.addDescriptor(readyDescriptor.hostUnitId, readyDescriptor);
            return this._modelService.getDescriptor(readyDescriptor.hostUnitId, readyDescriptor.embedId)!;
        }

        const key = this._getMaterializeTaskKey(context.descriptor);
        const pending = this._materializeTasks.get(key);
        if (pending) {
            return pending;
        }

        let task: Promise<IEmbedDescriptor>;
        task = this._materializeDescriptor(context).then((descriptor) => {
            this._modelService.addDescriptor(descriptor.hostUnitId, descriptor);
            return this._modelService.getDescriptor(descriptor.hostUnitId, descriptor.embedId)!;
        }).finally(() => {
            if (this._materializeTasks.get(key) === task) {
                this._materializeTasks.delete(key);
            }
        });

        this._materializeTasks.set(key, task);
        return task;
    }

    restoreEmbed(context: IEmbedHostRestoreContext): IEmbedDescriptor {
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
        const handle = this._referencedUnitManager.ensure({
            ref: descriptor.ref,
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
            ref: materialized.ref,
            childUnitId: materialized.unitId,
            childType: materialized.unitType,
        };
    }

    private _getMaterializedDescriptor(descriptor: IEmbedDescriptor): IEmbedDescriptor | undefined {
        const stored = this._modelService.getDescriptor(descriptor.hostUnitId, descriptor.embedId);
        if (stored?.childUnitId && stored.childType != null) {
            return stored;
        }

        if (descriptor.childUnitId && descriptor.childType != null) {
            return descriptor;
        }

        return undefined;
    }

    private _getMaterializeTaskKey(descriptor: IEmbedDescriptor): string {
        return JSON.stringify([descriptor.hostUnitId, descriptor.embedId]);
    }
}
