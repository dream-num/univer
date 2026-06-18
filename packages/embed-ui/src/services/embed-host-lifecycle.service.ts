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

import type { IMutationInfo } from '@univerjs/core';
import type { IEmbedCreateContext, IEmbedDescriptor } from '@univerjs/embed';
import { ICommandService, Inject, IUndoRedoService, sequenceExecute } from '@univerjs/core';
import { EmbedCreationService, EmbedModelService, SetEmbedDescriptorMutation, SoftDeleteEmbedDescriptorMutation } from '@univerjs/embed';
import { EmbedHostAdapterRegistryService } from './embed-host-adapter-registry.service';

export interface IEmbedHostCreateContext extends Omit<IEmbedCreateContext, 'hostAnchorId'> {
    requestedHostAnchorId?: string;
    hostContext?: Record<string, unknown>;
}

export interface IEmbedHostCopyContext {
    hostUnitId: string;
    sourceEmbedId: string;
    nextEmbedId: string;
    requestedHostAnchorId?: string;
    hostContext?: Record<string, unknown>;
}

export interface IEmbedHostRemoveContext {
    hostUnitId: string;
    embedId: string;
}

export class EmbedHostLifecycleService {
    constructor(
        @Inject(EmbedCreationService)
        private readonly _creationService: EmbedCreationService,
        @Inject(EmbedModelService)
        private readonly _modelService: EmbedModelService,
        @Inject(EmbedHostAdapterRegistryService)
        private readonly _hostAdapterRegistry: EmbedHostAdapterRegistryService,
        @ICommandService
        private readonly _commandService: ICommandService,
        @IUndoRedoService
        private readonly _undoRedoService: IUndoRedoService
    ) {
        // noop
    }

    async createEmbed(context: IEmbedHostCreateContext): Promise<IEmbedDescriptor> {
        const initialHostAnchorPlan = this._hostAdapterRegistry.createAnchorPlan({
            embedId: context.embedId,
            hostUnitId: context.hostUnitId,
            hostType: context.hostType,
            entry: context.entry,
            requestedAnchorId: context.requestedHostAnchorId,
            hostContext: context.hostContext,
        });

        const result = await this._creationService.prepareCreateEmbed({
            ...context,
            hostAnchorId: initialHostAnchorPlan.hostAnchorId,
        });
        const hostAnchorPlan = this._hostAdapterRegistry.createAnchorPlan({
            embedId: context.embedId,
            hostUnitId: context.hostUnitId,
            hostType: context.hostType,
            entry: context.entry,
            requestedAnchorId: result.descriptor.hostAnchorId,
            hostContext: context.hostContext,
            descriptor: result.descriptor,
        });
        const redoMutations: IMutationInfo[] = [
            ...hostAnchorPlan.redoMutations,
            this._toSetDescriptorMutation(result.descriptor),
        ];
        const undoMutations: IMutationInfo[] = [
            this._toSoftDeleteDescriptorMutation(result.descriptor),
            ...hostAnchorPlan.undoMutations,
        ];

        this._executeAndPushUndoRedo(result.descriptor.hostUnitId, redoMutations, undoMutations);
        const descriptor = this._getDescriptor(result.descriptor.hostUnitId, result.descriptor.embedId);
        this._afterCreateAnchor(descriptor, context.hostContext);
        return descriptor;
    }

    copyEmbed(context: IEmbedHostCopyContext): IEmbedDescriptor {
        const sourceDescriptor = this._getDescriptor(context.hostUnitId, context.sourceEmbedId);
        const initialHostAnchorPlan = this._hostAdapterRegistry.createAnchorPlan({
            embedId: context.nextEmbedId,
            hostUnitId: context.hostUnitId,
            hostType: sourceDescriptor.hostType,
            entry: sourceDescriptor.entry,
            requestedAnchorId: context.requestedHostAnchorId,
            hostContext: context.hostContext,
        });

        const descriptor = this._creationService.prepareCopyEmbed({
            hostUnitId: context.hostUnitId,
            sourceEmbedId: context.sourceEmbedId,
            nextEmbedId: context.nextEmbedId,
            nextHostAnchorId: initialHostAnchorPlan.hostAnchorId,
        });
        const hostAnchorPlan = this._hostAdapterRegistry.createAnchorPlan({
            embedId: context.nextEmbedId,
            hostUnitId: context.hostUnitId,
            hostType: sourceDescriptor.hostType,
            entry: sourceDescriptor.entry,
            requestedAnchorId: descriptor.hostAnchorId,
            hostContext: context.hostContext,
            descriptor,
        });
        const redoMutations: IMutationInfo[] = [
            ...hostAnchorPlan.redoMutations,
            this._toSetDescriptorMutation(descriptor),
        ];
        const undoMutations: IMutationInfo[] = [
            this._toSoftDeleteDescriptorMutation(descriptor),
            ...hostAnchorPlan.undoMutations,
        ];

        this._executeAndPushUndoRedo(descriptor.hostUnitId, redoMutations, undoMutations);
        const copied = this._getDescriptor(descriptor.hostUnitId, descriptor.embedId);
        this._afterCreateAnchor(copied, context.hostContext);
        return copied;
    }

    removeEmbed(context: IEmbedHostRemoveContext): boolean {
        const descriptor = this._modelService.getDescriptor(context.hostUnitId, context.embedId);
        if (!descriptor) {
            return false;
        }

        const hostAnchorPlan = this._hostAdapterRegistry.removeAnchorPlan({
            embedId: descriptor.embedId,
            hostUnitId: descriptor.hostUnitId,
            hostType: descriptor.hostType,
            entry: descriptor.entry,
            hostAnchorId: descriptor.hostAnchorId,
            descriptor,
        });
        const redoMutations: IMutationInfo[] = [
            this._toSoftDeleteDescriptorMutation(descriptor),
            ...hostAnchorPlan.redoMutations,
        ];
        const undoMutations: IMutationInfo[] = [
            ...hostAnchorPlan.undoMutations,
            this._toSetDescriptorMutation({
                ...descriptor,
                lifecycle: 'active',
            }),
        ];

        this._executeAndPushUndoRedo(descriptor.hostUnitId, redoMutations, undoMutations);
        this._afterRemoveAnchor(descriptor);

        return true;
    }

    private _executeAndPushUndoRedo(unitId: string, redoMutations: IMutationInfo[], undoMutations: IMutationInfo[]): void {
        const result = sequenceExecute(redoMutations, this._commandService);
        if (!result.result) {
            const failedMutation = redoMutations[result.index];
            const reason = result.error instanceof Error ? result.error.message : String(result.error ?? '');
            throw new Error(`EMBED_HOST_LIFECYCLE_MUTATION_FAILED:${failedMutation?.id ?? result.index}:${reason}`);
        }

        this._undoRedoService.pushUndoRedo({
            unitID: unitId,
            undoMutations,
            redoMutations,
        });
    }

    private _getDescriptor(hostUnitId: string, embedId: string): IEmbedDescriptor {
        const descriptor = this._modelService.getDescriptor(hostUnitId, embedId);
        if (!descriptor) {
            throw new Error('EMBED_DESCRIPTOR_NOT_FOUND');
        }

        return descriptor;
    }

    private _toSetDescriptorMutation(descriptor: IEmbedDescriptor): IMutationInfo {
        return {
            id: SetEmbedDescriptorMutation.id,
            params: {
                hostUnitId: descriptor.hostUnitId,
                descriptor,
            },
        };
    }

    private _toSoftDeleteDescriptorMutation(descriptor: IEmbedDescriptor): IMutationInfo {
        return {
            id: SoftDeleteEmbedDescriptorMutation.id,
            params: {
                hostUnitId: descriptor.hostUnitId,
                embedId: descriptor.embedId,
            },
        };
    }

    private _afterCreateAnchor(descriptor: IEmbedDescriptor, hostContext?: Record<string, unknown>): void {
        try {
            this._hostAdapterRegistry.afterCreateAnchor({
                embedId: descriptor.embedId,
                hostUnitId: descriptor.hostUnitId,
                hostType: descriptor.hostType,
                entry: descriptor.entry,
                hostAnchorId: descriptor.hostAnchorId,
                hostContext,
                descriptor,
            });
        } catch {
            // Render refresh hooks must not invalidate the committed data mutation.
        }
    }

    private _afterRemoveAnchor(descriptor: IEmbedDescriptor): void {
        try {
            this._hostAdapterRegistry.afterRemoveAnchor({
                embedId: descriptor.embedId,
                hostUnitId: descriptor.hostUnitId,
                hostType: descriptor.hostType,
                entry: descriptor.entry,
                hostAnchorId: descriptor.hostAnchorId,
                descriptor,
            });
        } catch {
            // Render refresh hooks must not invalidate the committed data mutation.
        }
    }
}
