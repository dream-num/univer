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

import type { ICreateUnitOptions, IDisposable, IReferencedUnitOwner } from '@univerjs/core';
import type { IEmbedDescriptor } from '../types/embed';
import { Inject, IReferencedUnitManagerService, IUniverInstanceService, ReferencedUnitOwnerKind } from '@univerjs/core';
import { EMBED_CHILD_CREATE_OPTIONS } from '../common/const';
import { EmbedError, EmbedErrorCode } from '../common/error';
import { getResourceRefInputKey } from '../common/resource-ref-input';
import { EmbedModelService } from './embed-model.service';
import { EmbedReferencedUnitClaimService } from './embed-referenced-unit-claim.service';

export interface IEmbedDescriptorMaterializeContext {
    descriptor: IEmbedDescriptor;
    createOptions?: ICreateUnitOptions;
    signal?: AbortSignal;
}

interface ILoadedEmbedDescriptorState {
    descriptor: IEmbedDescriptor;
    stored: boolean;
}

export class EmbedReferencedUnitMaterializeService {
    private readonly _materializingDescriptors = new Map<string, Promise<IEmbedDescriptor>>();

    constructor(
        @Inject(EmbedModelService) private readonly _modelService: EmbedModelService,
        @Inject(EmbedReferencedUnitClaimService) private readonly _referencedUnitClaimService: EmbedReferencedUnitClaimService,
        @Inject(IReferencedUnitManagerService) private readonly _referencedUnitManager: IReferencedUnitManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        // noop
    }

    async materializeDescriptor(context: IEmbedDescriptorMaterializeContext): Promise<IEmbedDescriptor> {
        const loadedState = this._getLoadedDescriptorState(context.descriptor);
        if (loadedState) {
            if (loadedState.stored) {
                this._claimMaterializedDescriptor(loadedState.descriptor);
                return loadedState.descriptor;
            }

            return this._commitMaterializedDescriptor(loadedState.descriptor);
        }

        const key = this._getMaterializeKey(context.descriptor);
        const pending = this._materializingDescriptors.get(key);
        if (pending) {
            return pending;
        }

        const materializing = this._loadAndCommitDescriptor(context);
        this._materializingDescriptors.set(key, materializing);
        const cleanup = () => {
            if (this._materializingDescriptors.get(key) === materializing) {
                this._materializingDescriptors.delete(key);
            }
        };
        materializing.then(cleanup, cleanup);
        return materializing;
    }

    private async _loadAndCommitDescriptor(context: IEmbedDescriptorMaterializeContext): Promise<IEmbedDescriptor> {
        return this._commitMaterializedDescriptor(await this._loadDescriptor(context));
    }

    private async _loadDescriptor(context: IEmbedDescriptorMaterializeContext): Promise<IEmbedDescriptor> {
        const descriptor = context.descriptor;
        const materialized = await this._referencedUnitManager.ensure(descriptor.source.ref, {
            unitType: descriptor.childType,
            signal: context.signal,
            createOptions: context.createOptions ?? EMBED_CHILD_CREATE_OPTIONS,
        });

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

    private _commitMaterializedDescriptor(descriptor: IEmbedDescriptor): IEmbedDescriptor {
        let claimDisposable: IDisposable | undefined;
        try {
            claimDisposable = this._claimMaterializedDescriptor(descriptor);
            this._modelService.addDescriptor(descriptor.hostUnitId, descriptor);
            return this._modelService.getDescriptor(descriptor.hostUnitId, descriptor.embedId)!;
        } catch (error) {
            claimDisposable?.dispose();
            throw error;
        }
    }

    private _claimMaterializedDescriptor(descriptor: IEmbedDescriptor): IDisposable | undefined {
        if (!descriptor.childUnitId) {
            return undefined;
        }

        const owner = this._getDescriptorOwner(descriptor);
        if (this._referencedUnitClaimService.hasClaim(owner, descriptor.childUnitId)) {
            return undefined;
        }

        return this._referencedUnitClaimService.claim(owner, descriptor.childUnitId);
    }

    private _getLoadedDescriptorState(descriptor: IEmbedDescriptor): ILoadedEmbedDescriptorState | undefined {
        const storedDescriptor = this._modelService.getDescriptor(descriptor.hostUnitId, descriptor.embedId);
        const current = storedDescriptor ?? descriptor;
        if (!current.childUnitId || current.childType == null) {
            return undefined;
        }

        if (this._univerInstanceService.getUnitType(current.childUnitId) !== current.childType) {
            throw new EmbedError(EmbedErrorCode.MaterializedChildUnitNotLoaded, {
                hostUnitId: current.hostUnitId,
                embedId: current.embedId,
                childUnitId: current.childUnitId,
                childType: current.childType,
            });
        }

        return {
            descriptor: current,
            stored: storedDescriptor != null,
        };
    }

    private _getMaterializeKey(descriptor: IEmbedDescriptor): string {
        return JSON.stringify([
            descriptor.hostUnitId,
            descriptor.embedId,
            descriptor.childType,
            getResourceRefInputKey(descriptor.source.ref),
        ]);
    }

    private _getDescriptorOwner(descriptor: IEmbedDescriptor): IReferencedUnitOwner {
        return {
            kind: ReferencedUnitOwnerKind.Embed,
            unitId: descriptor.hostUnitId,
            ownerId: descriptor.embedId,
        };
    }
}
