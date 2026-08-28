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
import { CustomDecorationType, ICommandService } from '@univerjs/core';
import * as DocsThreadComment from '@univerjs/docs-thread-comment';
import * as DocsFacade from '@univerjs/docs/facade';
import * as ThreadComment from '@univerjs/thread-comment';

export type IDocumentTextRangeCommentCreateOptions = Omit<
    DocsThreadComment.ICreateDocTextRangeCommentParams,
    'unitId' | 'range' | 'content'
>;

/** Comment methods added to a fixed document text range. */
export interface IFDocumentTextRangeThreadCommentMixin {
    /**
     * Creates a comment on this text range.
     * @param content Plain text or a Univer document body for rich comment content.
     * @param options Optional stable IDs, author, attachments, and creation time.
     * @returns `true` when the create command succeeds; otherwise, `false`.
     * @throws {TypeError} If the content is empty.
     * @example
     * ```ts
     * const range = univerAPI.getActiveDocument()?.getTextRange(0, 12);
     * await range?.createCommentAsync('Verify this introduction.', { id: 'review-intro' });
     * ```
     */
    createCommentAsync(
        content: ThreadComment.ThreadCommentContent,
        options?: IDocumentTextRangeCommentCreateOptions
    ): Promise<boolean>;
    /**
     * Returns locally loaded comments whose comment decorations overlap this text range.
     * @returns Matching comment threads. The returned anchors use `DOC_TEXT_RANGE`.
     * @example
     * ```ts
     * const range = univerAPI.getActiveDocument()?.getTextRange(0, 12);
     * const comments = range?.getComments() ?? [];
     * comments.forEach(({ root, children }) => console.log(root.id, children.length));
     * ```
     */
    getComments(): ThreadComment.IFacadeThreadCommentInfo[];
    /**
     * Synchronizes known document threads and returns comments whose decorations overlap this text range.
     * @returns A promise resolving to the synchronized matching comment threads.
     * @example
     * ```ts
     * const range = univerAPI.getActiveDocument()?.getTextRange(0, 12);
     * const comments = range ? await range.listCommentsAsync() : [];
     * console.log(comments.length);
     * ```
     */
    listCommentsAsync(): Promise<ThreadComment.IFacadeThreadCommentInfo[]>;
}

export class FDocumentTextRangeThreadCommentMixin extends DocsFacade.FDocumentTextRange implements IFDocumentTextRangeThreadCommentMixin {
    declare private _threadCommentCommandService: ICommandService;
    declare private _threadCommentFacadeService: ThreadComment.ThreadCommentFacadeService;

    override _initialize(injector: Injector): void {
        this._threadCommentCommandService = injector.get(ICommandService);
        let commentService: ThreadComment.ThreadCommentFacadeService | undefined;
        Object.defineProperty(this, '_threadCommentFacadeService', {
            get: () => commentService ??= injector.get(ThreadComment.ThreadCommentFacadeService),
        });
    }

    /** @inheritdoc */
    override createCommentAsync(
        content: ThreadComment.ThreadCommentContent,
        options: IDocumentTextRangeCommentCreateOptions = {}
    ): Promise<boolean> {
        return this._threadCommentCommandService.executeCommand(DocsThreadComment.CreateDocTextRangeCommentCommand.id, {
            ...options,
            unitId: this._document.getId(),
            range: { ...this.getRange(), collapsed: false },
            content,
        });
    }

    /** @inheritdoc */
    override getComments(): ThreadComment.IFacadeThreadCommentInfo[] {
        const range = this.getRange();
        const commentIds = this._getOverlappingCommentIds(range);
        return this._threadCommentFacadeService.getComments({
            unitIds: [this._document.getId()],
            subUnitIds: [DocsThreadComment.DEFAULT_DOC_SUBUNIT_ID],
            anchorKinds: [ThreadComment.ThreadCommentAnchorKind.DOC_TEXT_RANGE],
        }).filter((comment) => commentIds.has(comment.root.id));
    }

    /** @inheritdoc */
    override async listCommentsAsync(): Promise<ThreadComment.IFacadeThreadCommentInfo[]> {
        const range = this.getRange();
        const commentIds = this._getOverlappingCommentIds(range);
        const comments = await this._threadCommentFacadeService.listCommentsAsync({
            unitIds: [this._document.getId()],
            subUnitIds: [DocsThreadComment.DEFAULT_DOC_SUBUNIT_ID],
            anchorKinds: [ThreadComment.ThreadCommentAnchorKind.DOC_TEXT_RANGE],
        });
        return comments.filter((comment) => commentIds.has(comment.root.id));
    }

    private _getOverlappingCommentIds(range: DocsFacade.IFDocumentTextRange): Set<string> {
        const decorations = this._document.getBody(range.segmentId).customDecorations ?? [];
        return new Set(decorations.filter((decoration) => decoration.type === CustomDecorationType.COMMENT
            && decoration.startIndex < range.endOffset
            && decoration.endIndex >= range.startOffset).map((decoration) => decoration.id));
    }
}

DocsFacade.FDocumentTextRange.extend(FDocumentTextRangeThreadCommentMixin);

declare module '@univerjs/docs/facade' {
    interface FDocumentTextRange extends IFDocumentTextRangeThreadCommentMixin {}
}
