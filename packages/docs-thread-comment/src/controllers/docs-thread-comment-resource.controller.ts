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

import { Disposable, Inject, IResourceManagerService, UniverInstanceType } from '@univerjs/core';
import {
    createThreadCommentResourceHook,
    IThreadCommentDataSourceService,
    TC_PLUGIN_NAME,
    ThreadCommentModel,
} from '@univerjs/thread-comment';

export const DOC_UNIVER_THREAD_COMMENT_PLUGIN = `DOC_${TC_PLUGIN_NAME}`;

export class DocsThreadCommentResourceController extends Disposable {
    constructor(
        @IResourceManagerService private readonly _resourceManagerService: IResourceManagerService,
        @Inject(ThreadCommentModel) private readonly _threadCommentModel: ThreadCommentModel,
        @IThreadCommentDataSourceService private readonly _threadCommentDataSourceService: IThreadCommentDataSourceService
    ) {
        super();
        this.disposeWithMe(this._resourceManagerService.registerPluginResource(createThreadCommentResourceHook(
            this._threadCommentModel,
            this._threadCommentDataSourceService,
            DOC_UNIVER_THREAD_COMMENT_PLUGIN,
            [UniverInstanceType.UNIVER_DOC]
        )));
    }
}
