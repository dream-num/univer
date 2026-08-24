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
    /**
     * Creates a root comment on a serialized product anchor.
     * @example
     * ```ts
     * await univerAPI.createCommentAsync({
     *   unitId: 'presentation-1',
     *   subUnitId: 'slide-1',
     *   anchor: {
     *     kind: univerAPI.Enum.ThreadCommentAnchorKind.SLIDE_ELEMENT,
     *     pageId: 'slide-1',
     *     elementId: 'shape-1',
     *   },
     *   content: 'Verify this value.',
     *   id: 'review-shape-1',
     * });
     * ```
     */
    createCommentAsync(options: ThreadComment.ICreateThreadCommentOptions): Promise<boolean>;
    /**
     * Adds a reply to an existing root thread.
     * @example
     * ```ts
     * await univerAPI.replyCommentAsync({
     *   unitId: 'board-1',
     *   subUnitId: 'page-1',
     *   threadId: 'review-shape-1',
     *   id: 'review-shape-1-reply',
     *   content: 'Verified.',
     * });
     * ```
     */
    replyCommentAsync(options: ThreadComment.IReplyThreadCommentOptions): Promise<boolean>;
    /** Updates the body or attachments of an existing root comment or reply. */
    updateCommentAsync(options: ThreadComment.IUpdateThreadCommentOptions): Promise<boolean>;
    /** Deletes one comment, or the complete thread when `deleteThread` is true. */
    deleteCommentAsync(options: ThreadComment.IDeleteThreadCommentOptions): Promise<boolean>;
    /**
     * Resolves a thread. Pass `resolved: false` to reopen it.
     * @example
     * ```ts
     * await univerAPI.resolveCommentAsync({
     *   unitId: 'board-1',
     *   subUnitId: 'page-1',
     *   commentId: 'review-shape-1',
     * });
     * ```
     */
    resolveCommentAsync(options: ThreadComment.IResolveThreadCommentOptions): Promise<boolean>;
    /**
     * Queries locally loaded threads by unit, subunit, anchor kind, author, or resolution state.
     * @example
     * ```ts
     * const openAgentReviews = univerAPI.getComments({
     *   unitIds: ['presentation-1'],
     *   authorIds: ['agent-reviewer'],
     *   anchorKinds: [univerAPI.Enum.ThreadCommentAnchorKind.SLIDE_ELEMENT],
     *   resolved: false,
     * });
     * const sheetCellReviews = univerAPI.getComments({
     *   anchorKinds: [univerAPI.Enum.ThreadCommentAnchorKind.SHEET_CELL],
     * });
     * ```
     */
    getComments(query?: ThreadComment.IThreadCommentQuery): ThreadComment.IFacadeThreadCommentInfo[];
    /** Synchronizes known threads before applying the same filters as `getComments`. */
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

    /** @inheritdoc */
    override createCommentAsync(options: ThreadComment.ICreateThreadCommentOptions): Promise<boolean> {
        return this._getThreadCommentService().createCommentAsync(options);
    }

    /** @inheritdoc */
    override replyCommentAsync(options: ThreadComment.IReplyThreadCommentOptions): Promise<boolean> {
        return this._getThreadCommentService().replyCommentAsync(options);
    }

    /** @inheritdoc */
    override updateCommentAsync(options: ThreadComment.IUpdateThreadCommentOptions): Promise<boolean> {
        return this._getThreadCommentService().updateCommentAsync(options);
    }

    /** @inheritdoc */
    override deleteCommentAsync(options: ThreadComment.IDeleteThreadCommentOptions): Promise<boolean> {
        return this._getThreadCommentService().deleteCommentAsync(options);
    }

    /** @inheritdoc */
    override resolveCommentAsync(options: ThreadComment.IResolveThreadCommentOptions): Promise<boolean> {
        return this._getThreadCommentService().resolveCommentAsync(options);
    }

    /** @inheritdoc */
    override getComments(query: ThreadComment.IThreadCommentQuery = {}): ThreadComment.IFacadeThreadCommentInfo[] {
        return this._getThreadCommentService().getComments(query);
    }

    /** @inheritdoc */
    override async listCommentsAsync(query: ThreadComment.IThreadCommentQuery = {}): Promise<ThreadComment.IFacadeThreadCommentInfo[]> {
        return this._getThreadCommentService().listCommentsAsync(query);
    }
}

FUniver.extend(FUniverThreadCommentMixin);

declare module '@univerjs/core/facade' {
    interface FUniver extends IFUniverThreadCommentMixin {}
}
