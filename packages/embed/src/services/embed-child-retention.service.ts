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

import type { IEmbedDescriptor } from '../types/embed';
import type { ResourceRefInput } from '../types/resource-ref';
import { Inject } from '@univerjs/core';
import { getResourceRefInputKey } from '../common/resource-ref-input';
import { EmbedModelService } from './embed-model.service';

export interface IEmbedChildRetentionState {
    hostUnitId: string;
    ref: ResourceRefInput;
    childUnitIds: readonly string[];
    totalReferences: number;
    activeReferences: number;
    softDeletedReferences: number;
    shouldDisposeNow: false;
    eligibleForCleanup: boolean;
}

export class EmbedChildRetentionService {
    constructor(
        @Inject(EmbedModelService)
        private readonly _modelService: EmbedModelService
    ) {
        // noop
    }

    getRetentionState(hostUnitId: string, ref: ResourceRefInput): IEmbedChildRetentionState {
        const descriptors = this._modelService.getDescriptorsByResourceRef(hostUnitId, ref);
        return this._toState(hostUnitId, ref, descriptors);
    }

    listCleanupCandidates(hostUnitId: string): IEmbedChildRetentionState[] {
        const grouped = new Map<string, { ref: ResourceRefInput; descriptors: IEmbedDescriptor[] }>();
        for (const descriptor of this._modelService.getDescriptors(hostUnitId)) {
            const ref = this._getDescriptorResourceRef(descriptor);
            const key = getResourceRefInputKey(ref);
            const group = grouped.get(key);
            if (group) {
                group.descriptors.push(descriptor);
            } else {
                grouped.set(key, { ref, descriptors: [descriptor] });
            }
        }

        return [...grouped.values()]
            .map(({ ref, descriptors }) => this._toState(hostUnitId, ref, descriptors))
            .filter((state) => state.eligibleForCleanup);
    }

    private _toState(hostUnitId: string, ref: ResourceRefInput, descriptors: IEmbedDescriptor[]): IEmbedChildRetentionState {
        const activeReferences = descriptors.filter((descriptor) => descriptor.lifecycle !== 'soft-deleted').length;
        const childUnitIds = [...new Set(
            descriptors
                .map((descriptor) => descriptor.childUnitId)
                .filter((childUnitId): childUnitId is string => typeof childUnitId === 'string')
        )];
        return {
            hostUnitId,
            ref,
            childUnitIds,
            totalReferences: descriptors.length,
            activeReferences,
            softDeletedReferences: descriptors.length - activeReferences,
            shouldDisposeNow: false,
            eligibleForCleanup: descriptors.length > 0 && activeReferences === 0,
        };
    }

    private _getDescriptorResourceRef(descriptor: IEmbedDescriptor): ResourceRefInput {
        return descriptor.ref;
    }
}
