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

import type { Injector } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import * as ThreadComment from '@univerjs/thread-comment';

export interface IFUniverThreadCommentMixin {
    /**
     * Creates a root comment on a serialized product anchor.
     * @param options Comment content, owner IDs, stable anchor, and optional caller-controlled IDs.
     * @returns `true` when the command succeeds; otherwise, `false`.
     * @throws {TypeError} If the content is empty or the anchor is invalid.
     * @example
     * ```ts
     * const presentation = univerAPI.getActivePresentation();
     * if (!presentation) throw new Error('No active presentation');
     * const slide = presentation.getSlideByIndex(0);
     * const element = slide?.getElements()[0];
     * if (!slide || !element) throw new Error('No commentable slide element');
     *
     * await univerAPI.createCommentAsync({
     *   unitId: presentation.getId(),
     *   subUnitId: slide.getId(),
     *   anchor: {
     *     kind: univerAPI.Enum.ThreadCommentAnchorKind.SLIDE_ELEMENT,
     *     pageId: slide.getId(),
     *     elementId: element.getId(),
     *   },
     *   content: 'Verify this value.',
     * });
     * ```
     */
    createCommentAsync(options: ThreadComment.ICreateThreadCommentOptions): Promise<boolean>;
    /**
     * Adds a reply to an existing root thread.
     * @param options Reply content and the owning unit, subunit, and thread IDs.
     * @returns `true` when the reply is created. Returns `false` when the root thread is not loaded or the command fails.
     * @throws {TypeError} If the content is empty.
     * @example
     * ```ts
     * const [thread] = univerAPI.getComments({ resolved: false });
     * if (thread) {
     *   await univerAPI.replyCommentAsync({
     *     unitId: thread.unitId,
     *     subUnitId: thread.subUnitId,
     *     threadId: thread.threadId,
     *     content: 'Verified.',
     *   });
     * }
     * ```
     */
    replyCommentAsync(options: ThreadComment.IReplyThreadCommentOptions): Promise<boolean>;
    /**
     * Updates the content or attachments of an existing root comment or reply.
     * @param options Updated content and the owning unit, subunit, and comment IDs.
     * @returns `true` when the update command succeeds; otherwise, `false`.
     * @throws {TypeError} If the content is empty.
     * @example
     * ```ts
     * const [comment] = univerAPI.getComments({ resolved: false });
     * if (comment) {
     *   await univerAPI.updateCommentAsync({
     *     unitId: comment.unitId,
     *     subUnitId: comment.subUnitId,
     *     commentId: comment.root.id,
     *     content: 'Updated review result.',
     *   });
     * }
     * ```
     */
    updateCommentAsync(options: ThreadComment.IUpdateThreadCommentOptions): Promise<boolean>;
    /**
     * Deletes one comment, or the complete root and reply tree when `deleteThread` is `true`.
     * @param options Owning IDs, target comment ID, and the optional whole-thread flag.
     * @returns `true` when the delete command succeeds; otherwise, `false`.
     * @example
     * ```ts
     * const [comment] = univerAPI.getComments({ resolved: false });
     * if (comment) {
     *   await univerAPI.deleteCommentAsync({
     *     unitId: comment.unitId,
     *     subUnitId: comment.subUnitId,
     *     commentId: comment.root.id,
     *     deleteThread: true,
     *   });
     * }
     * ```
     */
    deleteCommentAsync(options: ThreadComment.IDeleteThreadCommentOptions): Promise<boolean>;
    /**
     * Resolves a thread. Pass `resolved: false` to reopen it.
     * @param options Owning IDs, a comment ID in the thread, and the desired resolution state.
     * @returns `true` when the resolve command succeeds; otherwise, `false`.
     * @example
     * ```ts
     * const [comment] = univerAPI.getComments({ resolved: false });
     * if (comment) {
     *   await univerAPI.resolveCommentAsync({
     *     unitId: comment.unitId,
     *     subUnitId: comment.subUnitId,
     *     commentId: comment.root.id,
     *   });
     * }
     * ```
     */
    resolveCommentAsync(options: ThreadComment.IResolveThreadCommentOptions): Promise<boolean>;
    /**
     * Queries locally loaded threads by unit, subunit, anchor kind, author, or resolution state.
     * @param query Optional filters. Omit the argument to return every locally loaded thread.
     * @returns Matching root threads, their replies, anchor kinds, parsed anchors, and related user IDs.
     * @example
     * ```ts
     * const presentation = univerAPI.getActivePresentation();
     * const openAgentReviews = univerAPI.getComments({
     *   unitIds: presentation ? [presentation.getId()] : [],
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
    /**
     * Synchronizes locally known threads from the configured datasource, then applies the same filters as `getComments`.
     * This method does not discover thread IDs that have never been loaded into the model.
     * @param query Optional filters. Omit the argument to synchronize and return every known thread.
     * @returns A promise resolving to the synchronized matching threads.
     * @example
     * ```ts
     * const presentation = univerAPI.getActivePresentation();
     * const comments = await univerAPI.listCommentsAsync({
     *   unitIds: presentation ? [presentation.getId()] : [],
     *   anchorKinds: [univerAPI.Enum.ThreadCommentAnchorKind.SLIDE_ELEMENT],
     *   resolved: false,
     * });
     * comments.forEach(({ root, children, anchorKind, anchor }) => {
     *   console.log(root.id, children.length, anchorKind, anchor);
     * });
     * ```
     */
    listCommentsAsync(query?: ThreadComment.IThreadCommentQuery): Promise<ThreadComment.IFacadeThreadCommentInfo[]>;
}

export class FUniverThreadCommentMixin extends FUniver implements IFUniverThreadCommentMixin {
    declare private _threadCommentService: ThreadComment.ThreadCommentFacadeService;

    override _initialize(injector: Injector): void {
        let service: ThreadComment.ThreadCommentFacadeService | undefined;
        Object.defineProperty(this, '_threadCommentService', {
            get: () => service ??= injector.get(ThreadComment.ThreadCommentFacadeService),
        });
    }

    /** @inheritdoc */
    override createCommentAsync(options: ThreadComment.ICreateThreadCommentOptions): Promise<boolean> {
        return this._threadCommentService.createCommentAsync(options);
    }

    /** @inheritdoc */
    override replyCommentAsync(options: ThreadComment.IReplyThreadCommentOptions): Promise<boolean> {
        return this._threadCommentService.replyCommentAsync(options);
    }

    /** @inheritdoc */
    override updateCommentAsync(options: ThreadComment.IUpdateThreadCommentOptions): Promise<boolean> {
        return this._threadCommentService.updateCommentAsync(options);
    }

    /** @inheritdoc */
    override deleteCommentAsync(options: ThreadComment.IDeleteThreadCommentOptions): Promise<boolean> {
        return this._threadCommentService.deleteCommentAsync(options);
    }

    /** @inheritdoc */
    override resolveCommentAsync(options: ThreadComment.IResolveThreadCommentOptions): Promise<boolean> {
        return this._threadCommentService.resolveCommentAsync(options);
    }

    /** @inheritdoc */
    override getComments(query: ThreadComment.IThreadCommentQuery = {}): ThreadComment.IFacadeThreadCommentInfo[] {
        return this._threadCommentService.getComments(query);
    }

    /** @inheritdoc */
    override async listCommentsAsync(query: ThreadComment.IThreadCommentQuery = {}): Promise<ThreadComment.IFacadeThreadCommentInfo[]> {
        return this._threadCommentService.listCommentsAsync(query);
    }
}

FUniver.extend(FUniverThreadCommentMixin);

declare module '@univerjs/core/facade' {
    interface FUniver extends IFUniverThreadCommentMixin {}
}
