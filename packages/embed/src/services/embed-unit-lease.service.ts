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

import type { IDisposable, UniverInstanceType } from '@univerjs/core';
import { toDisposable } from '@univerjs/core';
import { EmbedError, EmbedErrorCode } from '../common/error';

export interface IEmbedUnitLeaseOwner {
    hostUnitId: string;
    embedId: string;
}

export interface IEmbedUnitLeaseRecord extends IEmbedUnitLeaseOwner {
    childUnitId: string;
    childType: UniverInstanceType;
}

interface IEmbedUnitLeaseState {
    readonly ownerKey: string;
    readonly token: symbol;
    readonly record: IEmbedUnitLeaseRecord;
}

export class EmbedUnitLeaseService {
    private readonly _leasesByOwner = new Map<string, IEmbedUnitLeaseState>();
    private readonly _leasesByChildUnit = new Map<string, IEmbedUnitLeaseState>();

    acquire(recordInput: IEmbedUnitLeaseRecord): IDisposable {
        const record = { ...recordInput };
        const ownerKey = this._getOwnerKey(record);
        const existingOwnerLease = this._leasesByOwner.get(ownerKey);
        if (existingOwnerLease) {
            if (existingOwnerLease.record.childUnitId === record.childUnitId && existingOwnerLease.record.childType === record.childType) {
                return toDisposable(() => {});
            }

            throw this._createConflictError(record, existingOwnerLease.record);
        }

        const existingUnitLease = this._leasesByChildUnit.get(record.childUnitId);
        if (existingUnitLease) {
            throw this._createConflictError(record, existingUnitLease.record);
        }

        const state: IEmbedUnitLeaseState = {
            ownerKey,
            token: Symbol(ownerKey),
            record,
        };
        this._leasesByOwner.set(ownerKey, state);
        this._leasesByChildUnit.set(record.childUnitId, state);

        let disposed = false;
        return toDisposable(() => {
            if (disposed) {
                return;
            }

            disposed = true;
            this._releaseState(state);
        });
    }

    hasLease(owner: IEmbedUnitLeaseOwner, childUnitId: string): boolean {
        return this._leasesByOwner.get(this._getOwnerKey(owner))?.record.childUnitId === childUnitId;
    }

    getLease(childUnitId: string): IEmbedUnitLeaseRecord | undefined {
        const record = this._leasesByChildUnit.get(childUnitId)?.record;
        return record ? { ...record } : undefined;
    }

    release(owner: IEmbedUnitLeaseOwner): void {
        const state = this._leasesByOwner.get(this._getOwnerKey(owner));
        if (!state) {
            return;
        }

        this._releaseState(state);
    }

    releaseHost(hostUnitId: string): void {
        for (const state of [...this._leasesByOwner.values()]) {
            if (state.record.hostUnitId === hostUnitId) {
                this._releaseState(state);
            }
        }
    }

    releaseUnit(unitId: string): void {
        for (const state of [...this._leasesByOwner.values()]) {
            if (state.record.hostUnitId === unitId || state.record.childUnitId === unitId) {
                this._releaseState(state);
            }
        }
    }

    dispose(): void {
        this._leasesByOwner.clear();
        this._leasesByChildUnit.clear();
    }

    private _releaseState(state: IEmbedUnitLeaseState): void {
        if (this._leasesByOwner.get(state.ownerKey)?.token === state.token) {
            this._leasesByOwner.delete(state.ownerKey);
        }

        if (this._leasesByChildUnit.get(state.record.childUnitId)?.token === state.token) {
            this._leasesByChildUnit.delete(state.record.childUnitId);
        }
    }

    private _createConflictError(next: IEmbedUnitLeaseRecord, existing: IEmbedUnitLeaseRecord): EmbedError {
        return new EmbedError(EmbedErrorCode.ChildUnitAlreadyEmbedded, {
            hostUnitId: next.hostUnitId,
            embedId: next.embedId,
            childUnitId: next.childUnitId,
            duplicatedHostUnitId: existing.hostUnitId,
            duplicatedEmbedId: existing.embedId,
        });
    }

    private _getOwnerKey(owner: IEmbedUnitLeaseOwner): string {
        return JSON.stringify([owner.hostUnitId, owner.embedId]);
    }
}
