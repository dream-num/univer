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
import type { IResourceRef } from '../types/resource-ref';
import { IUniverInstanceService, Optional, UniverInstanceType } from '@univerjs/core';
import { getResourceRefKey, normalizeResourceRef } from '../common/resource-ref';
import { fromResourceRefUnitType } from '../common/unit-type';
import { EmbedResourceRefProviderRegistryService } from './embed-resource-ref-provider-registry.service';

export interface IEmbedReferencedUnitEnsureInput {
    ref: IResourceRef;
    hostUnitId?: string;
    embedId?: string;
    createOptions: ICreateUnitOptions;
}

export interface IEmbedReferencedUnitEnsureResult {
    ref: IResourceRef;
    unitId: string;
    unitType: UniverInstanceType;
}

export interface IEmbedReferencedUnitUsageOwner {
    hostUnitId: string;
    embedId: string;
}

export interface IEmbedReferencedUnitRecord extends IEmbedReferencedUnitEnsureResult {
    usedBy: readonly IEmbedReferencedUnitUsageOwner[];
}

export interface IEmbedReferencedUnitListFilter {
    ref?: IResourceRef;
    hostUnitId?: string;
    embedId?: string;
}

interface IEmbedReferencedUnitStoredRecord extends IEmbedReferencedUnitEnsureResult {
    usedBy: IEmbedReferencedUnitUsageOwner[];
}

export class EmbedReferencedUnitManagerService {
    private readonly _inflight = new Map<string, Promise<IEmbedReferencedUnitEnsureResult>>();
    private readonly _records = new Map<string, IEmbedReferencedUnitStoredRecord>();

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Optional(EmbedResourceRefProviderRegistryService) private readonly _resourceRefProviderRegistry?: EmbedResourceRefProviderRegistryService
    ) {
        // noop
    }

    async ensure(input: IEmbedReferencedUnitEnsureInput): Promise<IEmbedReferencedUnitEnsureResult> {
        const ref = normalizeResourceRef(input.ref);
        const materializationKey = this._getMaterializationKey(ref, input);
        const existingRecord = this._records.get(materializationKey);
        if (existingRecord) {
            return this._toEnsureResult(existingRecord);
        }

        const inflight = this._inflight.get(materializationKey);
        if (inflight) {
            return inflight;
        }

        const promise = this._materialize(ref, input)
            .then((resolved) => this._recordResolved(materializationKey, resolved, input));

        this._inflight.set(materializationKey, promise);
        try {
            return await promise;
        } finally {
            if (this._inflight.get(materializationKey) === promise) {
                this._inflight.delete(materializationKey);
            }
        }
    }

    list(filter: IEmbedReferencedUnitListFilter = {}): IEmbedReferencedUnitRecord[] {
        const refKey = filter.ref ? getResourceRefKey(filter.ref) : undefined;
        return [...this._records.values()]
            .filter((record) => {
                if (refKey && getResourceRefKey(record.ref) !== refKey) {
                    return false;
                }

                if (filter.hostUnitId && !record.usedBy.some((owner) => owner.hostUnitId === filter.hostUnitId)) {
                    return false;
                }

                if (filter.embedId && !record.usedBy.some((owner) => owner.embedId === filter.embedId)) {
                    return false;
                }

                return true;
            })
            .map((record) => this._toRecord(record));
    }

    private async _materialize(ref: IResourceRef, input: IEmbedReferencedUnitEnsureInput): Promise<IEmbedReferencedUnitEnsureResult> {
        const expectedType = fromResourceRefUnitType(ref.unit.type);
        if (ref.file.kind === 'self') {
            return this._ensureSelfRef(ref, expectedType);
        }

        const registration = this._resourceRefProviderRegistry?.get(ref);
        if (!registration) {
            throw new Error('PROVIDER_UNSUPPORTED');
        }

        const resolved = await registration.provider.ensure({
            ref,
            hostUnitId: input.hostUnitId,
            embedId: input.embedId,
            expectedType,
            profile: 'embed-child',
            createOptions: input.createOptions,
        });
        if (resolved.unitType !== expectedType) {
            throw new Error('UNIT_TYPE_MISMATCH');
        }

        return {
            ref,
            unitId: resolved.unitId,
            unitType: resolved.unitType,
        };
    }

    private _recordResolved(materializationKey: string, resolved: IEmbedReferencedUnitEnsureResult, input: IEmbedReferencedUnitEnsureInput): IEmbedReferencedUnitEnsureResult {
        const existingRecord = this._records.get(materializationKey);
        if (existingRecord) {
            return this._toEnsureResult(existingRecord);
        }

        const record: IEmbedReferencedUnitStoredRecord = {
            ...resolved,
            usedBy: [],
        };
        const owner = this._getUsageOwner(input);
        if (owner) {
            record.usedBy.push(owner);
        }

        this._records.set(materializationKey, record);
        return this._toEnsureResult(record);
    }

    private _getUsageOwner(input: IEmbedReferencedUnitEnsureInput): IEmbedReferencedUnitUsageOwner | undefined {
        if (!input.hostUnitId || !input.embedId) {
            return undefined;
        }

        return {
            hostUnitId: input.hostUnitId,
            embedId: input.embedId,
        };
    }

    private _getMaterializationKey(ref: IResourceRef, input: IEmbedReferencedUnitEnsureInput): string {
        return JSON.stringify([
            'embed-child',
            input.hostUnitId ?? '',
            input.embedId ?? '',
            getResourceRefKey(ref),
        ]);
    }

    private _toEnsureResult(record: IEmbedReferencedUnitEnsureResult): IEmbedReferencedUnitEnsureResult {
        return {
            ref: record.ref,
            unitId: record.unitId,
            unitType: record.unitType,
        };
    }

    private _toRecord(record: IEmbedReferencedUnitStoredRecord): IEmbedReferencedUnitRecord {
        return {
            ...this._toEnsureResult(record),
            usedBy: record.usedBy.map((owner) => ({ ...owner })),
        };
    }

    private _ensureSelfRef(ref: IResourceRef, expectedType: UniverInstanceType): IEmbedReferencedUnitEnsureResult {
        const actualType = this._univerInstanceService.getUnitType(ref.unit.selector);
        if (actualType === UniverInstanceType.UNRECOGNIZED) {
            throw new Error('UNIT_NOT_FOUND');
        }

        if (actualType !== expectedType) {
            throw new Error('UNIT_TYPE_MISMATCH');
        }

        const unit = this._univerInstanceService.getUnit(ref.unit.selector, expectedType);
        if (!unit) {
            throw new Error('UNIT_NOT_FOUND');
        }

        return {
            ref,
            unitId: ref.unit.selector,
            unitType: expectedType,
        };
    }
}
