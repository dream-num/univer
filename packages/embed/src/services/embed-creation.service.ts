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

import type { EmbedCreateContext, EmbedCreateResult, EmbedDescriptor } from '../types/embed';
import { Inject } from '@univerjs/core';
import { createDefaultEmbedSourceMeta, EmbedCapabilityRegistryService } from './embed-capability-registry.service';
import { EmbedModelService } from './embed-model.service';
import { EmbedNestedGuardService } from './embed-nested-guard.service';
import { EmbedSourceResolverService } from './embed-source-resolver.service';

export class EmbedCreationService {
    constructor(
        @Inject(EmbedModelService)
        private readonly _model: EmbedModelService,
        @Inject(EmbedCapabilityRegistryService)
        private readonly _capabilityRegistry: EmbedCapabilityRegistryService,
        @Inject(EmbedSourceResolverService)
        private readonly _sourceResolver: EmbedSourceResolverService,
        @Inject(EmbedNestedGuardService)
        private readonly _nestedGuard: EmbedNestedGuardService
    ) {
        // noop
    }

    async prepareCreateEmbed(context: EmbedCreateContext): Promise<EmbedCreateResult> {
        this._nestedGuard.assertCanCreate(context);

        const resolvedSource = await this._sourceResolver.resolve(context.source);
        const capability = this._capabilityRegistry.getCapability({
            hostType: context.hostType,
            childType: resolvedSource.childType,
            entry: context.entry,
        });
        if (!capability) {
            throw new Error('EMBED_CAPABILITY_NOT_SUPPORTED');
        }

        const descriptor: EmbedDescriptor = {
            embedId: context.embedId,
            hostUnitId: context.hostUnitId,
            hostType: context.hostType,
            hostAnchorId: context.hostAnchorId,
            entry: context.entry,
            source: resolvedSource.source,
            childUnitId: resolvedSource.childUnitId,
            childType: resolvedSource.childType,
            mode: context.mode ?? 'interactive',
            sourceMeta: context.sourceMeta ?? createDefaultEmbedSourceMeta(capability),
        };
        this._assertChildUnitAvailable(context.hostUnitId, descriptor);

        return {
            descriptor,
            resolvedSource,
        };
    }

    async createEmbed(context: EmbedCreateContext): Promise<EmbedCreateResult> {
        const result = await this.prepareCreateEmbed(context);
        const { descriptor, resolvedSource } = result;
        this._model.addDescriptor(context.hostUnitId, descriptor);
        return {
            descriptor: this._model.getDescriptor(context.hostUnitId, context.embedId)!,
            resolvedSource,
        };
    }

    prepareCopyEmbed(params: {
        hostUnitId: string;
        sourceEmbedId: string;
        nextEmbedId: string;
        nextHostAnchorId: string;
    }): EmbedDescriptor {
        const sourceDescriptor = this._model.getDescriptor(params.hostUnitId, params.sourceEmbedId);
        if (!sourceDescriptor) {
            throw new Error('EMBED_DESCRIPTOR_NOT_FOUND');
        }

        const descriptor: EmbedDescriptor = {
            ...sourceDescriptor,
            embedId: params.nextEmbedId,
            hostAnchorId: params.nextHostAnchorId,
            lifecycle: 'active',
            createdAt: undefined,
            updatedAt: undefined,
        };
        this._assertChildUnitAvailable(params.hostUnitId, descriptor);

        return descriptor;
    }

    copyEmbed(params: {
        hostUnitId: string;
        sourceEmbedId: string;
        nextEmbedId: string;
        nextHostAnchorId: string;
    }): EmbedDescriptor {
        const descriptor = this.prepareCopyEmbed(params);
        this._model.addDescriptor(params.hostUnitId, descriptor);
        return this._model.getDescriptor(params.hostUnitId, params.nextEmbedId)!;
    }

    removeEmbed(params: { hostUnitId: string; embedId: string }): void {
        this._model.softDeleteDescriptor(params.hostUnitId, params.embedId);
    }

    private _assertChildUnitAvailable(hostUnitId: string, descriptor: EmbedDescriptor): void {
        if (!descriptor.childUnitId) {
            return;
        }

        const duplicated = this._model.getActiveDescriptorsByChildUnit(descriptor.childUnitId).find((item) =>
            (item.hostUnitId !== hostUnitId || item.embedId !== descriptor.embedId)
        );
        if (duplicated) {
            throw new Error('EMBED_CHILD_UNIT_ALREADY_EMBEDDED');
        }
    }
}
