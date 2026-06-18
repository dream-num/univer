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
import type { IResourceRef } from '../types/resource-ref';
import { cloneEmbedResource, createEmptyEmbedResource } from '../common/embed-resource';
import { getResourceRefKey, normalizeResourceRef } from '../common/resource-ref';
import { fromResourceRefUnitType } from '../common/unit-type';

export class EmbedModelService {
    private readonly _resources = new Map<string, IEmbedResource>();

    addDescriptor(hostUnitId: string, descriptor: IEmbedDescriptor): void {
        const now = Date.now();
        const normalizedDescriptor = this._normalizeDescriptor(hostUnitId, descriptor);
        this._assertActiveChildUnitAvailable(normalizedDescriptor);
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

    getActiveDescriptorsByChildUnit(childUnitId: string): IEmbedDescriptor[] {
        return [...this._resources.values()]
            .flatMap((resource) => Object.values(resource.embeds))
            .filter((descriptor) => descriptor.lifecycle !== 'soft-deleted' && descriptor.childUnitId === childUnitId);
    }

    getDescriptors(hostUnitId: string): IEmbedDescriptor[] {
        return Object.values(this._resources.get(hostUnitId)?.embeds ?? {});
    }

    getDescriptorsByResourceRef(hostUnitId: string, ref: IResourceRef): IEmbedDescriptor[] {
        const key = getResourceRefKey(ref);
        return Object.values(this._resources.get(hostUnitId)?.embeds ?? {})
            .filter((descriptor) => getResourceRefKey(this._getDescriptorResourceRef(descriptor)) === key);
    }

    getActiveDescriptorsByResourceRef(hostUnitId: string, ref: IResourceRef): IEmbedDescriptor[] {
        return this.getDescriptorsByResourceRef(hostUnitId, ref)
            .filter((descriptor) => descriptor.lifecycle !== 'soft-deleted');
    }

    countReferencesByResourceRef(hostUnitId: string, ref: IResourceRef): number {
        return this.getDescriptorsByResourceRef(hostUnitId, ref).length;
    }

    countActiveReferencesByResourceRef(hostUnitId: string, ref: IResourceRef): number {
        return this.getActiveDescriptorsByResourceRef(hostUnitId, ref).length;
    }

    softDeleteDescriptor(hostUnitId: string, embedId: string): void {
        const descriptor = this.getDescriptor(hostUnitId, embedId);
        if (!descriptor) {
            return;
        }

        descriptor.lifecycle = 'soft-deleted';
        descriptor.updatedAt = Date.now();
    }

    restoreDescriptor(hostUnitId: string, embedId: string): void {
        const descriptor = this.getDescriptor(hostUnitId, embedId);
        if (!descriptor) {
            return;
        }

        this._assertActiveChildUnitAvailable({
            ...descriptor,
            lifecycle: 'active',
        });
        descriptor.lifecycle = 'active';
        descriptor.updatedAt = Date.now();
    }

    serializeUnit(unitId: string): IEmbedResource {
        return this._cloneResource(this._resources.get(unitId) ?? this._createResource());
    }

    loadUnit(unitId: string, resource: IEmbedResource): void {
        const normalizedResource = this._createResource();
        for (const [embedId, descriptor] of Object.entries(resource.embeds ?? {})) {
            normalizedResource.embeds[embedId] = this._normalizeDescriptor(unitId, {
                ...descriptor,
                embedId,
            });
        }
        this._assertResourceHasNoDuplicateActiveChildUnits(normalizedResource);
        for (const descriptor of Object.values(normalizedResource.embeds)) {
            this._assertActiveChildUnitAvailable(descriptor, unitId);
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
                    ...descriptor,
                    embedId,
                }),
            ])),
        };
        this._assertResourceHasNoDuplicateActiveChildUnits(resource);
        return resource;
    }

    toJson(unitId: string): string {
        return JSON.stringify(this.serializeUnit(unitId));
    }

    private _normalizeDescriptor(hostUnitId: string, descriptor: IEmbedDescriptor): IEmbedDescriptor {
        if (descriptor.source.kind !== 'ref') {
            throw new Error('EMBED_DESCRIPTOR_SOURCE_NOT_CANONICAL');
        }
        const persistableDescriptor = { ...descriptor } as IEmbedDescriptor & { hostContext?: Record<string, unknown> };
        delete persistableDescriptor.hostContext;

        const ref = normalizeResourceRef(descriptor.source.ref);
        if (descriptor.childUnitId && descriptor.childUnitId !== ref.unit.selector) {
            throw new Error('EMBED_DESCRIPTOR_CHILD_REF_MISMATCH');
        }

        const refUnitType = fromResourceRefUnitType(ref.unit.type);
        if (descriptor.childType != null && descriptor.childType !== refUnitType) {
            throw new Error('EMBED_DESCRIPTOR_CHILD_TYPE_MISMATCH');
        }

        return {
            ...persistableDescriptor,
            hostUnitId,
            source: {
                kind: 'ref',
                ref,
            },
            childUnitId: descriptor.childUnitId ?? ref.unit.selector,
            childType: descriptor.childType ?? refUnitType,
            lifecycle: descriptor.lifecycle ?? 'active',
        };
    }

    private _getDescriptorResourceRef(descriptor: IEmbedDescriptor): IResourceRef {
        if (descriptor.source.kind !== 'ref') {
            throw new Error('EMBED_DESCRIPTOR_SOURCE_NOT_CANONICAL');
        }

        return descriptor.source.ref;
    }

    private _assertActiveChildUnitAvailable(descriptor: IEmbedDescriptor, replacingUnitId?: string): void {
        if (descriptor.lifecycle === 'soft-deleted' || !descriptor.childUnitId) {
            return;
        }

        for (const [unitId, resource] of this._resources.entries()) {
            if (unitId === replacingUnitId) {
                continue;
            }

            const duplicated = Object.values(resource.embeds).find((item) =>
                item.lifecycle !== 'soft-deleted' &&
                item.childUnitId === descriptor.childUnitId &&
                (item.hostUnitId !== descriptor.hostUnitId || item.embedId !== descriptor.embedId)
            );
            if (duplicated) {
                throw new Error('EMBED_CHILD_UNIT_ALREADY_EMBEDDED');
            }
        }
    }

    private _assertResourceHasNoDuplicateActiveChildUnits(resource: IEmbedResource): void {
        const activeByChildUnit = new Map<string, IEmbedDescriptor>();
        for (const descriptor of Object.values(resource.embeds)) {
            if (descriptor.lifecycle === 'soft-deleted' || !descriptor.childUnitId) {
                continue;
            }

            const duplicated = activeByChildUnit.get(descriptor.childUnitId);
            if (duplicated && duplicated.embedId !== descriptor.embedId) {
                throw new Error('EMBED_CHILD_UNIT_ALREADY_EMBEDDED');
            }

            activeByChildUnit.set(descriptor.childUnitId, descriptor);
        }
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
}
