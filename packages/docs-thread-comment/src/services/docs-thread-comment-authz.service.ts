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

import type { IThreadCommentAuthz, IThreadCommentAuthzTarget, ThreadCommentWriteAction } from '@univerjs/thread-comment';
import { Disposable, Inject, IPermissionService, UniverInstanceType } from '@univerjs/core';
import { getDocumentCommentPermission } from '@univerjs/docs';
import { IThreadCommentAuthzService } from '@univerjs/thread-comment';

/**
 * Docs comment permissions: opening a document already grants read access, while
 * writing requires the document comment permission.
 */
export class DocsThreadCommentAuthz extends Disposable implements IThreadCommentAuthz {
    constructor(
        @IPermissionService private readonly _permissionService: IPermissionService,
        @Inject(IThreadCommentAuthzService) private readonly _authzService: IThreadCommentAuthzService
    ) {
        super();

        this.disposeWithMe(this._authzService.registerAuthz(UniverInstanceType.UNIVER_DOC, this));
    }

    canRead(): boolean {
        return true;
    }

    canWrite(_action: ThreadCommentWriteAction, target: IThreadCommentAuthzTarget): boolean {
        return getDocumentCommentPermission(this._permissionService, target.unitId);
    }
}
