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

import type { IDisposable, Nullable, UniverInstanceType } from '@univerjs/core';
import { createIdentifier, Disposable, Inject, IUniverInstanceService, UserManagerService } from '@univerjs/core';

/**
 * The subset of a comment that permission checks depend on. Callers may pass a
 * full `IThreadComment`; a location without a comment can also be checked with
 * only `unitId`, `subUnitId` and `ref`.
 */
export interface IThreadCommentAuthzTarget {
    unitId: string;
    subUnitId: string;
    ref: string;
    personId?: string;
}

export type ThreadCommentWriteAction = 'add' | 'reply' | 'update' | 'resolve' | 'delete';

/**
 * Platform-specific comment permission rules, such as worksheet permissions for
 * sheets or document permissions for docs. Implementations are registered per
 * unit type; unit types without an implementation are not restricted.
 */
export interface IThreadCommentAuthz {
    canRead(target: IThreadCommentAuthzTarget): boolean;
    canWrite(action: ThreadCommentWriteAction, target: IThreadCommentAuthzTarget): boolean;
}

export interface IThreadCommentAuthzService {
    registerAuthz(type: UniverInstanceType, authz: IThreadCommentAuthz): IDisposable;
    canRead(target: IThreadCommentAuthzTarget): boolean;
    canWrite(action: ThreadCommentWriteAction, target: IThreadCommentAuthzTarget): boolean;
}

export class ThreadCommentAuthzService extends Disposable implements IThreadCommentAuthzService {
    private readonly _authzByType = new Map<UniverInstanceType, IThreadCommentAuthz>();

    constructor(
        @IUniverInstanceService private readonly _instanceService: IUniverInstanceService,
        @Inject(UserManagerService) private readonly _userManagerService: UserManagerService
    ) {
        super();
    }

    registerAuthz(type: UniverInstanceType, authz: IThreadCommentAuthz): IDisposable {
        this._authzByType.set(type, authz);

        return {
            dispose: () => {
                if (this._authzByType.get(type) === authz) {
                    this._authzByType.delete(type);
                }
            },
        };
    }

    canRead(target: IThreadCommentAuthzTarget): boolean {
        return this._resolve(target)?.canRead(target) ?? true;
    }

    canWrite(action: ThreadCommentWriteAction, target: IThreadCommentAuthzTarget): boolean {
        const authz = this._resolve(target);
        if (authz && !authz.canWrite(action, target)) {
            return false;
        }

        // Editing and deleting are author-only. Resolving and replying stay open to
        // everyone allowed to write comments, which matches common comment products.
        if (action === 'update' || action === 'delete') {
            return this._isAuthor(target);
        }

        return true;
    }

    private _resolve(target: IThreadCommentAuthzTarget): Nullable<IThreadCommentAuthz> {
        return this._authzByType.get(this._instanceService.getUnitType(target.unitId));
    }

    private _isAuthor(target: IThreadCommentAuthzTarget): boolean {
        // Without an identified user the current user id is empty, so only comments
        // with an empty author match. Hosts that edit comments on behalf of a user
        // must set the current user.
        return this._userManagerService.getCurrentUser()?.userID === target.personId;
    }
}

export const IThreadCommentAuthzService = createIdentifier<IThreadCommentAuthzService>('univer.thread-comment.authz-service');
