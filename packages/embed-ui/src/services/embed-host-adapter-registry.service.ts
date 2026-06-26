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

import type { UniverInstanceType } from '@univerjs/core';
import type { EmbedHostEntry, IEmbedDescriptor } from '@univerjs/embed';
import type {
    IEmbedHostAdapterContribution,
    IEmbedHostAnchorMutationPlan,
    IEmbedHostAnchorRemoveMutationPlan,
} from '../types/embed-ui';
import type { IEmbedHostAnchorRecord } from '../types/host-anchor';
import { CREATE_EMBED_HOST_ANCHOR_MUTATION_ID, REMOVE_EMBED_HOST_ANCHOR_MUTATION_ID } from '../common/const';

export class EmbedHostAdapterRegistryService {
    private readonly _contributions = new Map<string, IEmbedHostAdapterContribution>();

    register(contribution: IEmbedHostAdapterContribution): void {
        const key = this._key(contribution.hostType, contribution.entry);
        if (this._contributions.has(key)) {
            throw new Error(`Embed host adapter contribution already registered: ${key}`);
        }

        this._contributions.set(key, contribution);
    }

    get(hostType: UniverInstanceType, entry: EmbedHostEntry): IEmbedHostAdapterContribution | undefined {
        return this._contributions.get(this._key(hostType, entry));
    }

    list(): IEmbedHostAdapterContribution[] {
        return [...this._contributions.values()];
    }

    createAnchor(params: {
        embedId: string;
        hostUnitId: string;
        hostType: UniverInstanceType;
        entry: EmbedHostEntry;
        requestedAnchorId?: string;
        hostContext?: Record<string, unknown>;
    }): string {
        const contribution = this.get(params.hostType, params.entry);
        if (!contribution) {
            throw new Error(`EMBED_HOST_ADAPTER_NOT_REGISTERED:${params.hostType}:${params.entry}`);
        }

        if (!contribution.createAnchor) {
            throw new Error(`EMBED_HOST_ADAPTER_CREATE_ANCHOR_NOT_IMPLEMENTED:${params.hostType}:${params.entry}`);
        }

        return contribution.createAnchor(params);
    }

    createAnchorPlan(params: {
        embedId: string;
        hostUnitId: string;
        hostType: UniverInstanceType;
        entry: EmbedHostEntry;
        requestedAnchorId?: string;
        hostContext?: Record<string, unknown>;
        descriptor?: IEmbedDescriptor;
    }): IEmbedHostAnchorMutationPlan {
        const contribution = this.get(params.hostType, params.entry);
        if (!contribution) {
            throw new Error(`EMBED_HOST_ADAPTER_NOT_REGISTERED:${params.hostType}:${params.entry}`);
        }

        if (contribution?.createAnchorPlan) {
            return contribution.createAnchorPlan(params);
        }
        if (!contribution.createAnchor) {
            throw new Error(`EMBED_HOST_ADAPTER_CREATE_ANCHOR_NOT_IMPLEMENTED:${params.hostType}:${params.entry}`);
        }

        const hostAnchorId = params.requestedAnchorId ?? `${params.embedId}-anchor`;
        const mutationParams = {
            embedId: params.embedId,
            hostUnitId: params.hostUnitId,
            hostType: params.hostType,
            entry: params.entry,
            hostAnchorId,
        };

        return {
            hostAnchorId,
            redoMutations: [{ id: CREATE_EMBED_HOST_ANCHOR_MUTATION_ID, params: mutationParams }],
            undoMutations: [{ id: REMOVE_EMBED_HOST_ANCHOR_MUTATION_ID, params: mutationParams }],
        };
    }

    removeAnchor(params: {
        embedId: string;
        hostUnitId: string;
        hostType: UniverInstanceType;
        entry: EmbedHostEntry;
        hostAnchorId: string;
    }): void {
        this.get(params.hostType, params.entry)?.removeAnchor?.(params);
    }

    afterCreateAnchor(params: {
        embedId: string;
        hostUnitId: string;
        hostType: UniverInstanceType;
        entry: EmbedHostEntry;
        hostAnchorId: string;
        hostContext?: Record<string, unknown>;
        descriptor: IEmbedDescriptor;
    }): void {
        this.get(params.hostType, params.entry)?.afterCreateAnchor?.(params);
    }

    afterRemoveAnchor(params: {
        embedId: string;
        hostUnitId: string;
        hostType: UniverInstanceType;
        entry: EmbedHostEntry;
        hostAnchorId: string;
        hostContext?: Record<string, unknown>;
        descriptor?: IEmbedDescriptor;
    }): void {
        this.get(params.hostType, params.entry)?.afterRemoveAnchor?.(params);
    }

    activateAnchor(params: {
        embedId: string;
        hostUnitId: string;
        hostType: UniverInstanceType;
        entry: EmbedHostEntry;
        hostAnchorId: string;
        hostContext?: Record<string, unknown>;
        descriptor: IEmbedDescriptor;
    }): void {
        this.get(params.hostType, params.entry)?.activateAnchor?.(params);
    }

    restoreAnchor(params: {
        embedId: string;
        hostUnitId: string;
        hostType: UniverInstanceType;
        entry: EmbedHostEntry;
        hostAnchorId: string;
        hostContext?: Record<string, unknown>;
        descriptor: IEmbedDescriptor;
    }): IEmbedHostAnchorRecord {
        const contribution = this.get(params.hostType, params.entry);
        if (!contribution) {
            throw new Error(`EMBED_HOST_ADAPTER_NOT_REGISTERED:${params.hostType}:${params.entry}`);
        }
        if (!contribution.restoreAnchor) {
            throw new Error(`EMBED_HOST_ADAPTER_RESTORE_ANCHOR_NOT_IMPLEMENTED:${params.hostType}:${params.entry}`);
        }

        return contribution.restoreAnchor(params);
    }

    removeAnchorPlan(params: {
        embedId: string;
        hostUnitId: string;
        hostType: UniverInstanceType;
        entry: EmbedHostEntry;
        hostAnchorId: string;
        descriptor?: IEmbedDescriptor;
    }): IEmbedHostAnchorRemoveMutationPlan {
        const contribution = this.get(params.hostType, params.entry);
        if (contribution?.removeAnchorPlan) {
            return contribution.removeAnchorPlan(params);
        }

        const mutationParams = {
            embedId: params.embedId,
            hostUnitId: params.hostUnitId,
            hostType: params.hostType,
            entry: params.entry,
            hostAnchorId: params.hostAnchorId,
        };

        return {
            redoMutations: [{ id: REMOVE_EMBED_HOST_ANCHOR_MUTATION_ID, params: mutationParams }],
            undoMutations: [{ id: CREATE_EMBED_HOST_ANCHOR_MUTATION_ID, params: mutationParams }],
        };
    }

    private _key(hostType: UniverInstanceType, entry: EmbedHostEntry): string {
        return `${hostType}:${entry}`;
    }
}
