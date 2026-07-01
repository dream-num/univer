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

import type {
    IReferencedUnitEnsureInput,
    IReferencedUnitHandle,
    IReferencedUnitManagerService,
    IReferencedUnitOwner,
    IReferencedUnitRecord,
} from '../types/referenced-unit';
import type { ResourceRefInput } from '../types/resource-ref';
import type { IEmbedResourceRefProvider } from './embed-resource-ref-provider-registry.service';
import { IUniverInstanceService, Optional, UniverInstanceType } from '@univerjs/core';
import { EMBED_CHILD_CREATE_OPTIONS } from '../common/const';
import { getResourceRefInputKey, normalizeResourceRefInput } from '../common/resource-ref-input';
import { fromResourceRefUnitType, toResourceRefUnitType } from '../common/unit-type';
import { EmbedResourceRefProviderRegistryService } from './embed-resource-ref-provider-registry.service';

interface IReferencedUnitStoredRecord extends IReferencedUnitRecord {
    usedBy: IReferencedUnitOwner[];
    usageCounts: Map<string, number>;
}

interface IPreparedReferencedUnitEnsureInput extends IReferencedUnitEnsureInput {
    unitType: UniverInstanceType;
    createOptions: NonNullable<IReferencedUnitEnsureInput['createOptions']>;
}

export class EmbedReferencedUnitManagerService implements IReferencedUnitManagerService {
    private readonly _records = new Map<string, IReferencedUnitStoredRecord>();

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Optional(EmbedResourceRefProviderRegistryService) private readonly _resourceRefProviderRegistry?: EmbedResourceRefProviderRegistryService
    ) {
        // noop
    }

    ensure(input: IReferencedUnitEnsureInput): IReferencedUnitHandle {
        const ref = normalizeResourceRefInput(input.ref);
        const unitType = this._resolveUnitType(ref, input.unitType);
        const owner = this._normalizeOwner(input.owner);
        const createOptions = input.createOptions ?? EMBED_CHILD_CREATE_OPTIONS;
        const provider = this._getProvider(ref, unitType);
        const loaded = this._ensureProviderRef(ref, provider, {
            ...input,
            ref,
            unitType,
            owner,
            createOptions,
        }).then((record) => this._recordLoaded(record, owner));
        return this._createHandle(owner, loaded, input.signal);
    }

    private _getProvider(
        ref: ResourceRefInput,
        unitType: UniverInstanceType
    ): IEmbedResourceRefProvider {
        const registration = this._resourceRefProviderRegistry?.get(ref, toResourceRefUnitType(unitType));
        if (!registration) {
            throw new Error('REFERENCED_UNIT_PROVIDER_NOT_FOUND');
        }

        return registration.provider;
    }

    private async _ensureProviderRef(
        ref: ResourceRefInput,
        provider: IEmbedResourceRefProvider,
        input: IPreparedReferencedUnitEnsureInput
    ): Promise<IReferencedUnitRecord> {
        const resolved = await provider.ensure({
            ref,
            refKey: getResourceRefInputKey(ref),
            owner: input.owner,
            unitType: input.unitType,
            createOptions: input.createOptions,
            signal: input.signal,
        });
        this._assertProviderResultUnitType(resolved.unitId, input.unitType);

        return {
            ref,
            unitId: resolved.unitId,
            unitType: input.unitType,
        };
    }

    private _recordLoaded(record: IReferencedUnitRecord, owner: IReferencedUnitOwner | undefined): IReferencedUnitRecord {
        if (!owner) {
            return this._toReferencedUnitRecord(record);
        }

        const loadedKey = this._getLoadedKey(record);
        let stored = this._records.get(loadedKey);
        if (!stored) {
            stored = {
                ...record,
                usedBy: [],
                usageCounts: new Map(),
            };
            this._records.set(loadedKey, stored);
        }
        this._addUsageOwner(stored, owner);
        return this._toReferencedUnitRecord(stored);
    }

    private _getLoadedKey(record: IReferencedUnitRecord): string {
        return JSON.stringify([
            getResourceRefInputKey(record.ref),
            record.unitType,
            record.unitId,
        ]);
    }

    private _createHandle(owner: IReferencedUnitOwner | undefined, loadedRecord: Promise<IReferencedUnitRecord>, signal: AbortSignal | undefined): IReferencedUnitHandle {
        let disposed = false;
        let loadedKey: string | undefined;
        const tracked = loadedRecord.then((record) => {
            loadedKey = this._getLoadedKey(record);
            if (disposed) {
                this._removeUsageOwner(loadedKey, owner);
            }

            return record;
        });

        const dispose = () => {
            if (disposed) {
                return;
            }

            disposed = true;
            if (loadedKey) {
                this._removeUsageOwner(loadedKey, owner);
            }
        };

        const loaded = signal
            ? this._withAbort(tracked, signal).catch((error) => {
                dispose();
                throw error;
            })
            : tracked;

        return {
            loaded,
            dispose,
        };
    }

    private _withAbort<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
        if (signal.aborted) {
            return Promise.reject(new Error('REFERENCED_UNIT_LOAD_ABORTED'));
        }

        return new Promise<T>((resolve, reject) => {
            const onAbort = () => {
                signal.removeEventListener('abort', onAbort);
                reject(new Error('REFERENCED_UNIT_LOAD_ABORTED'));
            };

            signal.addEventListener('abort', onAbort, { once: true });
            promise.then(
                (value) => {
                    signal.removeEventListener('abort', onAbort);
                    resolve(value);
                },
                (error) => {
                    signal.removeEventListener('abort', onAbort);
                    reject(error);
                }
            );
        });
    }

    private _addUsageOwner(record: IReferencedUnitStoredRecord, owner: IReferencedUnitOwner | undefined): void {
        if (!owner) {
            return;
        }

        const ownerKey = this._getOwnerKey(owner);
        record.usageCounts.set(ownerKey, (record.usageCounts.get(ownerKey) ?? 0) + 1);
        if (!record.usedBy.some((item) => this._isSameOwner(item, owner))) {
            record.usedBy.push(owner);
        }
    }

    private _removeUsageOwner(loadedKey: string, owner: IReferencedUnitOwner | undefined): void {
        if (!owner) {
            return;
        }

        const record = this._records.get(loadedKey);
        if (!record) {
            return;
        }

        const ownerKey = this._getOwnerKey(owner);
        const count = record.usageCounts.get(ownerKey) ?? 0;
        if (count > 1) {
            record.usageCounts.set(ownerKey, count - 1);
            return;
        }

        record.usageCounts.delete(ownerKey);
        record.usedBy = record.usedBy.filter((item) => !this._isSameOwner(item, owner));
        if (record.usedBy.length === 0) {
            this._records.delete(loadedKey);
        }
    }

    private _toReferencedUnitRecord(record: IReferencedUnitRecord): IReferencedUnitRecord {
        return {
            ref: record.ref,
            unitId: record.unitId,
            unitType: record.unitType,
        };
    }

    private _normalizeOwner(owner: IReferencedUnitOwner | undefined): IReferencedUnitOwner | undefined {
        return owner ? { ...owner } : undefined;
    }

    private _isSameOwner(left: IReferencedUnitOwner, right: IReferencedUnitOwner): boolean {
        return left.kind === right.kind && left.unitId === right.unitId && left.ownerId === right.ownerId;
    }

    private _getOwnerKey(owner: IReferencedUnitOwner): string {
        return JSON.stringify([owner.kind, owner.unitId ?? '', owner.ownerId ?? '']);
    }

    private _resolveUnitType(ref: ResourceRefInput, declaredUnitType: UniverInstanceType | undefined): UniverInstanceType {
        if (typeof ref === 'string') {
            if (declaredUnitType === undefined || declaredUnitType === UniverInstanceType.UNRECOGNIZED) {
                throw new Error('RESOURCE_REF_UNIT_TYPE_REQUIRED');
            }

            return declaredUnitType;
        }

        const refUnitType = fromResourceRefUnitType(ref.unit.type);
        if (declaredUnitType !== undefined && declaredUnitType !== refUnitType) {
            throw new Error('REFERENCED_UNIT_UNIT_TYPE_MISMATCH');
        }

        return refUnitType;
    }

    private _assertProviderResultUnitType(unitId: string, unitType: UniverInstanceType): void {
        if (this._univerInstanceService.getUnitType(unitId) !== unitType) {
            throw new Error('REFERENCED_UNIT_UNIT_TYPE_MISMATCH');
        }
    }
}
