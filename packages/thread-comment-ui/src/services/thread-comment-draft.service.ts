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
import type { IThreadCommentAnchor } from '@univerjs/thread-comment';
import { Disposable, Inject, IUniverInstanceService, toDisposable, UserManagerService } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';

export interface IThreadCommentDraft {
    unitId: string;
    subUnitId: string;
    anchor: IThreadCommentAnchor;
}

export class ThreadCommentDraftService extends Disposable {
    private readonly _placementType$ = new BehaviorSubject<UniverInstanceType | null>(null);
    private readonly _draft$ = new BehaviorSubject<IThreadCommentDraft | null>(null);
    private _placementUnitId: string | undefined;
    private _ownerUserId: string | undefined;

    readonly placementType$ = this._placementType$.asObservable();
    readonly draft$ = this._draft$.asObservable();

    constructor(
        @IUniverInstanceService instanceService: IUniverInstanceService,
        @Inject(UserManagerService) private readonly _userManagerService: UserManagerService
    ) {
        super();
        this.disposeWithMe(instanceService.unitDisposed$.subscribe((unit) => {
            if (this.draft?.unitId === unit.getUnitId() || this._placementUnitId === unit.getUnitId()) {
                this.cancel();
            }
        }));
        this.disposeWithMe(instanceService.focused$.subscribe((unitId) => {
            if (unitId && this._placementUnitId && unitId !== this._placementUnitId) {
                this.cancel();
            }
        }));
        this.disposeWithMe(this._userManagerService.currentUser$.subscribe((user) => {
            if (this._ownerUserId && user?.userID !== this._ownerUserId) {
                this.cancel();
            }
        }));
        if (typeof window !== 'undefined') {
            const cancelPlacement = (event: KeyboardEvent) => {
                if (event.key === 'Escape' && (this.placementType || this.draft)) {
                    this.cancel();
                }
            };
            window.addEventListener('keydown', cancelPlacement);
            this.disposeWithMe(toDisposable(() => window.removeEventListener('keydown', cancelPlacement)));
        }
    }

    get placementType(): UniverInstanceType | null {
        return this._placementType$.value;
    }

    get draft(): IThreadCommentDraft | null {
        return this._draft$.value;
    }

    startPlacement(type: UniverInstanceType, unitId: string): void {
        if (this.placementType === type && this._placementUnitId === unitId) {
            this.cancel();
            return;
        }
        this._ownerUserId = this._userManagerService.getCurrentUser().userID;
        this._placementUnitId = unitId;
        this._draft$.next(null);
        this._placementType$.next(type);
    }

    place(draft: IThreadCommentDraft): void {
        this._ownerUserId = this._userManagerService.getCurrentUser().userID;
        this._placementUnitId = undefined;
        this._placementType$.next(null);
        this._draft$.next(draft);
    }

    cancel(): void {
        this._ownerUserId = undefined;
        this._placementUnitId = undefined;
        this._placementType$.next(null);
        this._draft$.next(null);
    }

    override dispose(): void {
        this._placementType$.complete();
        this._draft$.complete();
        super.dispose();
    }
}
