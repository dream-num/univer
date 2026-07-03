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

import type { IEmbedDescriptor, IEmbedResource } from '../types/embed';
import type { ResourceRefInput } from '../types/resource-ref';
import { Optional } from '@univerjs/core';
import { cloneEmbedResource, createEmptyEmbedResource } from '../common/embed-resource';
import { EmbedError, EmbedErrorCode } from '../common/error';
import { getResourceRefInputKey, normalizeResourceRefInput } from '../common/resource-ref-input';
import { parseResourceRef } from '../common/resource-ref-uri';
import { fromResourceRefUnitType } from '../common/unit-type';
import { EmbedUnitLeaseService } from './embed-unit-lease.service';

export class EmbedModelService {
    private readonly _resources = new Map<string, IEmbedResource>();

    constructor(
        @Optional(EmbedUnitLeaseService) private readonly _unitLeaseService?: EmbedUnitLeaseService
    ) {
        // noop
    }

    addDescriptor(hostUnitId: string, descriptor: IEmbedDescriptor): void {
        const now = Date.now();
        const normalizedDescriptor = this._normalizeDescriptor(hostUnitId, descriptor);
        const resource = this._ensureResource(hostUnitId);
        resource.embeds[normalizedDescriptor.embedId] = {
            ...normalizedDescriptor,
            createdAt: normalizedDescriptor.createdAt ?? now,
            updatedAt: now,
        };
    }

    getDescriptor(hostUnitId: string, embedId: string): IEmbedDescriptor | undefined {
        return this._resources.get(hostUnitId)?.embeds[embedId];
    }

    getActiveDescriptors(hostUnitId: string): IEmbedDescriptor[] {
        return Object.values(this._resources.get(hostUnitId)?.embeds ?? {})
            .filter((descriptor) => descriptor.lifecycle !== 'soft-deleted');
    }

    getAllActiveDescriptors(): IEmbedDescriptor[] {
        return [...this._resources.values()]
            .flatMap((resource) => Object.values(resource.embeds))
            .filter((descriptor) => descriptor.lifecycle !== 'soft-deleted');
    }

    getActiveDescriptorsByChildUnit(childUnitId: string): IEmbedDescriptor[] {
        return [...this._resources.values()]
            .flatMap((resource) => Object.values(resource.embeds))
            .filter((descriptor) => descriptor.lifecycle !== 'soft-deleted' && descriptor.childUnitId === childUnitId);
    }

    getDescriptors(hostUnitId: string): IEmbedDescriptor[] {
        return Object.values(this._resources.get(hostUnitId)?.embeds ?? {});
    }

    getDescriptorsByResourceRef(hostUnitId: string, ref: ResourceRefInput): IEmbedDescriptor[] {
        const key = getResourceRefInputKey(ref);
        return Object.values(this._resources.get(hostUnitId)?.embeds ?? {})
            .filter((descriptor) => getResourceRefInputKey(this._getDescriptorResourceRef(descriptor)) === key);
    }

    getActiveDescriptorsByResourceRef(hostUnitId: string, ref: ResourceRefInput): IEmbedDescriptor[] {
        return this.getDescriptorsByResourceRef(hostUnitId, ref)
            .filter((descriptor) => descriptor.lifecycle !== 'soft-deleted');
    }

    countReferencesByResourceRef(hostUnitId: string, ref: ResourceRefInput): number {
        return this.getDescriptorsByResourceRef(hostUnitId, ref).length;
    }

    countActiveReferencesByResourceRef(hostUnitId: string, ref: ResourceRefInput): number {
        return this.getActiveDescriptorsByResourceRef(hostUnitId, ref).length;
    }

    softDeleteDescriptor(hostUnitId: string, embedId: string): void {
        const descriptor = this.getDescriptor(hostUnitId, embedId);
        if (!descriptor) {
            return;
        }

        this._unitLeaseService?.release({ hostUnitId, embedId });
        descriptor.lifecycle = 'soft-deleted';
        descriptor.updatedAt = Date.now();
    }

    restoreDescriptor(hostUnitId: string, embedId: string): void {
        const descriptor = this.getDescriptor(hostUnitId, embedId);
        if (!descriptor) {
            return;
        }

        descriptor.lifecycle = 'active';
        descriptor.updatedAt = Date.now();
    }

    serializeUnit(unitId: string): IEmbedResource {
        return this._cloneResource(this._toPersistedResource(this._resources.get(unitId) ?? this._createResource()));
    }

    loadUnit(unitId: string, resource: IEmbedResource): void {
        const normalizedResource = this._createResource();
        for (const [embedId, descriptor] of Object.entries(resource.embeds ?? {})) {
            normalizedResource.embeds[embedId] = this._normalizeDescriptor(unitId, {
                ...this._toPersistedDescriptor(descriptor),
                embedId,
            });
        }

        this._resources.set(unitId, this._cloneResource(normalizedResource));
    }

    unloadUnit(unitId: string): void {
        this._resources.delete(unitId);
    }

    parseJson(json: string): IEmbedResource {
        if (!json) {
            return this._createResource();
        }

        const parsed = JSON.parse(json) as Partial<IEmbedResource>;
        const resource = {
            ...createEmptyEmbedResource(),
            embeds: Object.fromEntries(Object.entries(parsed.embeds ?? {}).map(([embedId, descriptor]) => [
                embedId,
                this._normalizeDescriptor(descriptor.hostUnitId, {
                    ...this._toPersistedDescriptor(descriptor),
                    embedId,
                }),
            ])),
        };
        return resource;
    }

    toJson(unitId: string): string {
        return JSON.stringify(this.serializeUnit(unitId));
    }

    private _normalizeDescriptor(hostUnitId: string, descriptor: IEmbedDescriptor): IEmbedDescriptor {
        const persistableDescriptor = { ...descriptor } as IEmbedDescriptor & { hostContext?: Record<string, unknown> };
        delete persistableDescriptor.hostContext;

        const childType = descriptor.childType ?? descriptor.source.unitType;
        if (childType == null) {
            throw new EmbedError(EmbedErrorCode.DescriptorChildTypeRequired, {
                hostUnitId,
                embedId: descriptor.embedId,
            });
        }
        const ref = normalizeResourceRefInput(descriptor.source.ref);
        const parsedRef = parseResourceRef(ref);

        if (childType !== fromResourceRefUnitType(parsedRef.unit.type)) {
            throw new EmbedError(EmbedErrorCode.DescriptorChildTypeMismatch, {
                hostUnitId,
                embedId: descriptor.embedId,
                childType,
                refUnitType: parsedRef.unit.type,
            });
        }

        return {
            ...persistableDescriptor,
            hostUnitId,
            source: {
                ref,
                unitType: childType,
                ...(descriptor.source.creationConfig === undefined ? undefined : { creationConfig: descriptor.source.creationConfig }),
            },
            childUnitId: descriptor.childUnitId,
            childType,
            lifecycle: descriptor.lifecycle ?? 'active',
        };
    }

    private _getDescriptorResourceRef(descriptor: IEmbedDescriptor): ResourceRefInput {
        return descriptor.source.ref;
    }

    private _ensureResource(unitId: string): IEmbedResource {
        let resource = this._resources.get(unitId);
        if (!resource) {
            resource = this._createResource();
            this._resources.set(unitId, resource);
        }

        return resource;
    }

    private _createResource(): IEmbedResource {
        return createEmptyEmbedResource();
    }

    private _cloneResource(resource: IEmbedResource): IEmbedResource {
        return cloneEmbedResource(resource);
    }

    private _toPersistedResource(resource: IEmbedResource): IEmbedResource {
        return {
            version: resource.version,
            embeds: Object.fromEntries(Object.entries(resource.embeds).map(([embedId, descriptor]) => [
                embedId,
                this._toPersistedDescriptor(descriptor),
            ])),
        };
    }

    private _toPersistedDescriptor(descriptor: IEmbedDescriptor): IEmbedDescriptor {
        const persisted = { ...descriptor };
        delete persisted.childUnitId;
        return persisted;
    }
}
