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
    IReferencedUnitListFilter,
    IReferencedUnitManagerService,
    IReferencedUnitOwner,
    IReferencedUnitRecord,
    IReferencedUnitUsageRecord,
} from '../types/referenced-unit';
import type { ResourceRefInput } from '../types/resource-ref';
import type { IReferencedUnitMaterializationPlan, IReferencedUnitMaterializationProvider } from './embed-resource-ref-provider-registry.service';
import { Optional, UniverInstanceType } from '@univerjs/core';
import { EMBED_CHILD_CREATE_OPTIONS } from '../common/const';
import { getResourceRefInputKey, normalizeResourceRefInput } from '../common/resource-ref-input';
import { fromResourceRefUnitType, toResourceRefUnitType } from '../common/unit-type';
import { EmbedResourceRefProviderRegistryService } from './embed-resource-ref-provider-registry.service';

interface IReferencedUnitStoredRecord extends IReferencedUnitRecord {
    state: 'pending' | 'loaded';
    usedBy: IReferencedUnitOwner[];
    usageCounts: Map<string, number>;
}

interface IPreparedReferencedUnitEnsureInput extends IReferencedUnitEnsureInput {
    unitType: UniverInstanceType;
    createOptions: NonNullable<IReferencedUnitEnsureInput['createOptions']>;
}

interface IPlannedReferencedUnitEnsureInput extends IPreparedReferencedUnitEnsureInput {
    plan: IReferencedUnitMaterializationPlan;
}

export class EmbedReferencedUnitManagerService implements IReferencedUnitManagerService {
    private readonly _inflight = new Map<string, Promise<IReferencedUnitRecord>>();
    private readonly _records = new Map<string, IReferencedUnitStoredRecord>();

    constructor(
        @Optional(EmbedResourceRefProviderRegistryService) private readonly _resourceRefProviderRegistry?: EmbedResourceRefProviderRegistryService
    ) {
        // noop
    }

    ensure(input: IReferencedUnitEnsureInput): IReferencedUnitHandle {
        const ref = normalizeResourceRefInput(input.ref);
        const unitType = this._resolveUnitType(ref, input.unitType);
        const owner = this._normalizeOwner(input.owner);
        const createOptions = input.createOptions ?? EMBED_CHILD_CREATE_OPTIONS;
        const { plan, provider } = this._prepareMaterializationPlan(ref, {
            ...input,
            ref,
            unitType,
            owner,
            createOptions,
        });
        const existingRecord = this._records.get(plan.materializationKey);
        if (existingRecord?.state === 'loaded') {
            const loaded = Promise.resolve(this._recordExisting(existingRecord, owner));
            return this._createHandle(plan.materializationKey, owner, loaded, input.signal);
        }

        const materialization = this._ensureMaterialization(plan.materializationKey, ref, provider, {
            ...input,
            ref,
            unitType,
            owner,
            createOptions,
            plan,
        });
        const loaded = this._recordUsageAfterMaterialization(plan.materializationKey, materialization, owner);
        return this._createHandle(plan.materializationKey, owner, loaded, input.signal);
    }

    list(filter: IReferencedUnitListFilter = {}): IReferencedUnitUsageRecord[] {
        const refKey = filter.ref ? getResourceRefInputKey(filter.ref) : undefined;
        const owner = this._normalizeOwner(filter.owner);
        return [...this._records.values()]
            .filter((record) => {
                if (refKey && getResourceRefInputKey(record.ref) !== refKey) {
                    return false;
                }

                if (owner && !record.usedBy.some((item) => this._isSameOwner(item, owner))) {
                    return false;
                }

                return true;
            })
            .map((record) => this._toRecord(record));
    }

    getByUnitId(unitId: string): IReferencedUnitUsageRecord | null {
        const record = [...this._records.values()].find((item) => item.unitId === unitId);
        return record ? this._toRecord(record) : null;
    }

    findByRef(ref: ResourceRefInput): IReferencedUnitUsageRecord[] {
        const refKey = getResourceRefInputKey(ref);
        return [...this._records.values()]
            .filter((record) => getResourceRefInputKey(record.ref) === refKey)
            .map((record) => this._toRecord(record));
    }

    private _prepareMaterializationPlan(
        ref: ResourceRefInput,
        input: IPreparedReferencedUnitEnsureInput
    ): { plan: IReferencedUnitMaterializationPlan; provider: IReferencedUnitMaterializationProvider } {
        const registration = this._resourceRefProviderRegistry?.get(ref, toResourceRefUnitType(input.unitType));
        if (!registration) {
            throw new Error('REFERENCED_UNIT_PROVIDER_NOT_FOUND');
        }

        const plan = registration.provider.prepare({
            ref,
            refKey: getResourceRefInputKey(ref),
            owner: input.owner,
            unitType: input.unitType,
            createOptions: input.createOptions,
        });

        this._assertMaterializationPlan(plan, input.unitType);
        return {
            plan,
            provider: registration.provider,
        };
    }

    private _ensureMaterialization(
        materializationKey: string,
        ref: ResourceRefInput,
        provider: IReferencedUnitMaterializationProvider,
        input: IPlannedReferencedUnitEnsureInput
    ): Promise<IReferencedUnitRecord> {
        const inflight = this._inflight.get(materializationKey);
        if (inflight) {
            return inflight;
        }

        this._recordPending(materializationKey, {
            ref,
            unitId: input.plan.unitId,
            unitType: input.plan.unitType,
        });
        const promise = this._materialize(ref, provider, input)
            .then((resolved) => this._recordResolved(materializationKey, resolved))
            .catch((error) => {
                this._removePendingRecord(materializationKey);
                throw error;
            });

        this._inflight.set(materializationKey, promise);
        promise.then(
            () => {
                if (this._inflight.get(materializationKey) === promise) {
                    this._inflight.delete(materializationKey);
                }
            },
            () => {
                if (this._inflight.get(materializationKey) === promise) {
                    this._inflight.delete(materializationKey);
                }
            }
        );

        return promise;
    }

    private async _materialize(
        ref: ResourceRefInput,
        provider: IReferencedUnitMaterializationProvider,
        input: IPlannedReferencedUnitEnsureInput
    ): Promise<IReferencedUnitRecord> {
        return this._ensureProviderRef(ref, provider, input);
    }

    private async _ensureProviderRef(
        ref: ResourceRefInput,
        provider: IReferencedUnitMaterializationProvider,
        input: IPlannedReferencedUnitEnsureInput
    ): Promise<IReferencedUnitRecord> {
        const resolved = await provider.ensure({
            ref,
            refKey: getResourceRefInputKey(ref),
            owner: input.owner,
            unitType: input.unitType,
            createOptions: input.createOptions,
            plan: input.plan,
        });
        if (resolved.unitType !== input.plan.unitType) {
            throw new Error('REFERENCED_UNIT_MATERIALIZATION_PLAN_MISMATCH');
        }
        if (resolved.unitId !== input.plan.unitId) {
            throw new Error('REFERENCED_UNIT_MATERIALIZATION_PLAN_MISMATCH');
        }

        return {
            ref,
            unitId: resolved.unitId,
            unitType: input.plan.unitType,
        };
    }

    private async _recordUsageAfterMaterialization(materializationKey: string, materialization: Promise<IReferencedUnitRecord>, owner: IReferencedUnitOwner | undefined): Promise<IReferencedUnitRecord> {
        await materialization;
        const record = this._records.get(materializationKey);
        if (!record) {
            throw new Error('REFERENCED_UNIT_RECORD_NOT_FOUND');
        }

        this._addUsageOwner(record, owner);
        return this._toReferencedUnitRecord(record);
    }

    private _recordExisting(record: IReferencedUnitStoredRecord, owner: IReferencedUnitOwner | undefined): IReferencedUnitRecord {
        this._addUsageOwner(record, owner);
        return this._toReferencedUnitRecord(record);
    }

    private _recordResolved(materializationKey: string, resolved: IReferencedUnitRecord): IReferencedUnitRecord {
        const existingRecord = this._records.get(materializationKey);
        if (existingRecord) {
            if (existingRecord.unitId !== resolved.unitId || existingRecord.unitType !== resolved.unitType) {
                throw new Error('REFERENCED_UNIT_MATERIALIZATION_PLAN_MISMATCH');
            }

            existingRecord.state = 'loaded';
            return this._toReferencedUnitRecord(existingRecord);
        }

        this._assertUnitIdAvailable(materializationKey, resolved.unitId);
        const record: IReferencedUnitStoredRecord = {
            ...resolved,
            state: 'loaded',
            usedBy: [],
            usageCounts: new Map(),
        };
        this._records.set(materializationKey, record);
        return this._toReferencedUnitRecord(record);
    }

    private _recordPending(materializationKey: string, record: IReferencedUnitRecord): IReferencedUnitRecord {
        const existingRecord = this._records.get(materializationKey);
        if (existingRecord) {
            return this._toReferencedUnitRecord(existingRecord);
        }

        this._assertUnitIdAvailable(materializationKey, record.unitId);
        this._records.set(materializationKey, {
            ...record,
            state: 'pending',
            usedBy: [],
            usageCounts: new Map(),
        });

        return this._toReferencedUnitRecord(record);
    }

    private _removePendingRecord(materializationKey: string): void {
        const record = this._records.get(materializationKey);
        if (record?.state === 'pending') {
            this._records.delete(materializationKey);
        }
    }

    private _assertUnitIdAvailable(materializationKey: string, unitId: string): void {
        const existingUnitRecord = [...this._records.entries()].find(([recordKey, record]) => recordKey !== materializationKey && record.unitId === unitId);
        if (existingUnitRecord) {
            throw new Error('REFERENCED_UNIT_MATERIALIZATION_UNIT_CONFLICT');
        }
    }

    private _createHandle(materializationKey: string, owner: IReferencedUnitOwner | undefined, materialization: Promise<IReferencedUnitRecord>, signal: AbortSignal | undefined): IReferencedUnitHandle {
        let disposed = false;
        const dispose = () => {
            if (disposed) {
                return;
            }

            disposed = true;
            this._removeUsageOwner(materializationKey, owner);
        };

        materialization.then(
            () => {
                if (disposed) {
                    this._removeUsageOwner(materializationKey, owner);
                }
            },
            () => {
                // Materialization failures have no usage edge to release.
            }
        );

        const loaded = signal
            ? this._withAbort(materialization, signal).catch((error) => {
                dispose();
                throw error;
            })
            : materialization;

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

    private _removeUsageOwner(materializationKey: string, owner: IReferencedUnitOwner | undefined): void {
        if (!owner) {
            return;
        }

        const record = this._records.get(materializationKey);
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
    }

    private _toReferencedUnitRecord(record: IReferencedUnitRecord): IReferencedUnitRecord {
        return {
            ref: record.ref,
            unitId: record.unitId,
            unitType: record.unitType,
        };
    }

    private _toRecord(record: IReferencedUnitStoredRecord): IReferencedUnitUsageRecord {
        return {
            ...this._toReferencedUnitRecord(record),
            usedBy: record.usedBy.map((owner) => ({ ...owner })),
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

    private _assertMaterializationPlan(plan: IReferencedUnitMaterializationPlan, unitType: UniverInstanceType): void {
        if (!plan || !plan.materializationKey || !plan.unitId) {
            throw new Error('REFERENCED_UNIT_MATERIALIZATION_PLAN_INVALID');
        }

        if (plan.unitType !== unitType) {
            throw new Error('REFERENCED_UNIT_MATERIALIZATION_PLAN_MISMATCH');
        }
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
}
