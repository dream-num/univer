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

import { FUniver } from '@univerjs/core/facade';
import * as ThreadComment from '@univerjs/thread-comment';

const SERVICE_CACHE = new WeakMap<FUniver, ThreadComment.ThreadCommentFacadeService>();

export interface IFUniverThreadCommentMixin {
    createCommentAsync(options: ThreadComment.ICreateThreadCommentOptions): Promise<boolean>;
    replyCommentAsync(options: ThreadComment.IReplyThreadCommentOptions): Promise<boolean>;
    updateCommentAsync(options: ThreadComment.IUpdateThreadCommentOptions): Promise<boolean>;
    deleteCommentAsync(options: ThreadComment.IDeleteThreadCommentOptions): Promise<boolean>;
    getComments(query?: ThreadComment.IThreadCommentQuery): ThreadComment.IFacadeThreadCommentInfo[];
    listCommentsAsync(query?: ThreadComment.IThreadCommentQuery): Promise<ThreadComment.IFacadeThreadCommentInfo[]>;
}

export class FUniverThreadCommentMixin extends FUniver implements IFUniverThreadCommentMixin {
    private _getThreadCommentService(): ThreadComment.ThreadCommentFacadeService {
        const cached = SERVICE_CACHE.get(this);
        if (cached) {
            return cached;
        }
        const service = this._injector.get(ThreadComment.ThreadCommentFacadeService);
        SERVICE_CACHE.set(this, service);
        return service;
    }

    override createCommentAsync(options: ThreadComment.ICreateThreadCommentOptions): Promise<boolean> {
        return this._getThreadCommentService().createCommentAsync(options);
    }

    override replyCommentAsync(options: ThreadComment.IReplyThreadCommentOptions): Promise<boolean> {
        return this._getThreadCommentService().replyCommentAsync(options);
    }

    override updateCommentAsync(options: ThreadComment.IUpdateThreadCommentOptions): Promise<boolean> {
        return this._getThreadCommentService().updateCommentAsync(options);
    }

    override deleteCommentAsync(options: ThreadComment.IDeleteThreadCommentOptions): Promise<boolean> {
        return this._getThreadCommentService().deleteCommentAsync(options);
    }

    override getComments(query: ThreadComment.IThreadCommentQuery = {}): ThreadComment.IFacadeThreadCommentInfo[] {
        return this._getThreadCommentService().getComments(query);
    }

    override async listCommentsAsync(query: ThreadComment.IThreadCommentQuery = {}): Promise<ThreadComment.IFacadeThreadCommentInfo[]> {
        return this._getThreadCommentService().listCommentsAsync(query);
    }
}

FUniver.extend(FUniverThreadCommentMixin);

declare module '@univerjs/core/facade' {
    interface FUniver extends IFUniverThreadCommentMixin {}
}
