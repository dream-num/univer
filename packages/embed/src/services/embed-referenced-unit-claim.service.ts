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

import type { IDisposable, IReferencedUnitOwner } from '@univerjs/core';
import { DisposableCollection, Inject, IReferencedUnitManagerService, ReferencedUnitError, ReferencedUnitErrorCode, toDisposable } from '@univerjs/core';

interface IEmbedReferencedUnitClaimRecord {
    owner: IReferencedUnitOwner;
    unitId: string;
    disposable: IDisposable;
}

export class EmbedReferencedUnitClaimService {
    private readonly _claims = new Map<string, IEmbedReferencedUnitClaimRecord>();
    private readonly _disposables = new DisposableCollection();

    constructor(
        @Inject(IReferencedUnitManagerService) private readonly _referencedUnitManager: IReferencedUnitManagerService
    ) {
        // noop
    }

    claim(owner: IReferencedUnitOwner, unitId: string): IDisposable {
        const ownerKey = this._getOwnerKey(owner);
        const current = this._claims.get(ownerKey);
        if (current) {
            throw new ReferencedUnitError(ReferencedUnitErrorCode.OwnerConflict, {
                existingOwner: current.owner,
                nextOwner: owner,
                existingUnitId: current.unitId,
                nextUnitId: unitId,
            });
        }

        const managerDisposable = this._referencedUnitManager.claimUnit(owner, unitId);
        let disposed = false;
        const disposable = toDisposable(() => {
            if (disposed) {
                return;
            }

            disposed = true;
            if (this._claims.get(ownerKey)?.disposable === disposable) {
                this._claims.delete(ownerKey);
            }
            managerDisposable.dispose();
        });
        this._disposables.add(disposable);
        this._claims.set(ownerKey, {
            owner: { ...owner },
            unitId,
            disposable,
        });

        return disposable;
    }

    hasClaim(owner: IReferencedUnitOwner, unitId: string): boolean {
        return this._claims.get(this._getOwnerKey(owner))?.unitId === unitId;
    }

    release(owner: IReferencedUnitOwner): void {
        const ownerKey = this._getOwnerKey(owner);
        const current = this._claims.get(ownerKey);
        if (!current) {
            return;
        }

        current.disposable.dispose();
        this._claims.delete(ownerKey);
    }

    releaseHost(hostUnitId: string): void {
        for (const claim of this._claims.values()) {
            if (claim.owner.unitId === hostUnitId) {
                this.release(claim.owner);
            }
        }

        this._referencedUnitManager.releaseUnit(hostUnitId);
    }

    releaseUnit(unitId: string): void {
        for (const claim of this._claims.values()) {
            if (claim.unitId === unitId || claim.owner.unitId === unitId) {
                this.release(claim.owner);
            }
        }

        this._referencedUnitManager.releaseUnit(unitId);
    }

    dispose(): void {
        this._disposables.dispose();
        this._claims.clear();
    }

    private _getOwnerKey(owner: IReferencedUnitOwner): string {
        return JSON.stringify([owner.kind, owner.unitId, owner.ownerId]);
    }
}
