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

import type { ICreateDocTextRangeCommentParams } from '@univerjs/docs-thread-comment';
import type { IFDocumentTextRange } from '@univerjs/docs/facade';
import type { IFacadeThreadCommentInfo, ThreadCommentContent } from '@univerjs/thread-comment';
import { CustomDecorationType, ICommandService } from '@univerjs/core';
import {
    CreateDocTextRangeCommentCommand,
    DEFAULT_DOC_SUBUNIT_ID,

} from '@univerjs/docs-thread-comment';
import { FDocumentTextRange } from '@univerjs/docs/facade';
import {

    ThreadCommentAnchorKind,

    ThreadCommentFacadeService,
} from '@univerjs/thread-comment';

const COMMAND_SERVICE_CACHE = new WeakMap<FDocumentTextRange, ICommandService>();
const COMMENT_SERVICE_CACHE = new WeakMap<FDocumentTextRange, ThreadCommentFacadeService>();

export type IDocumentTextRangeCommentCreateOptions = Omit<
    ICreateDocTextRangeCommentParams,
    'unitId' | 'range' | 'content'
>;

/** Comment methods added to a fixed document text range. */
export interface IFDocumentTextRangeThreadCommentMixin {
    /**
     * Creates a comment on this text range.
     * @example
     * ```ts
     * const range = univerAPI.getActiveDocument()?.getTextRange(0, 12);
     * await range?.createCommentAsync('Verify this introduction.', { id: 'review-intro' });
     * ```
     */
    createCommentAsync(
        content: ThreadCommentContent,
        options?: IDocumentTextRangeCommentCreateOptions
    ): Promise<boolean>;
    /** Returns locally loaded comments whose decorations overlap this text range. */
    getComments(): IFacadeThreadCommentInfo[];
    /** Synchronizes document threads and returns comments whose decorations overlap this text range. */
    listCommentsAsync(): Promise<IFacadeThreadCommentInfo[]>;
}

export class FDocumentTextRangeThreadCommentMixin extends FDocumentTextRange implements IFDocumentTextRangeThreadCommentMixin {
    private _getCommandService(): ICommandService {
        const cached = COMMAND_SERVICE_CACHE.get(this);
        if (cached) {
            return cached;
        }
        const service = this._injector.get(ICommandService);
        COMMAND_SERVICE_CACHE.set(this, service);
        return service;
    }

    private _getCommentService(): ThreadCommentFacadeService {
        const cached = COMMENT_SERVICE_CACHE.get(this);
        if (cached) {
            return cached;
        }
        const service = this._injector.get(ThreadCommentFacadeService);
        COMMENT_SERVICE_CACHE.set(this, service);
        return service;
    }

    /** @inheritdoc */
    override createCommentAsync(
        content: ThreadCommentContent,
        options: IDocumentTextRangeCommentCreateOptions = {}
    ): Promise<boolean> {
        return this._getCommandService().executeCommand(CreateDocTextRangeCommentCommand.id, {
            ...options,
            unitId: this._document.getId(),
            range: { ...this.getRange(), collapsed: false },
            content,
        });
    }

    /** @inheritdoc */
    override getComments(): IFacadeThreadCommentInfo[] {
        const range = this.getRange();
        const commentIds = this._getOverlappingCommentIds(range);
        return this._getCommentService().getComments({
            unitIds: [this._document.getId()],
            subUnitIds: [DEFAULT_DOC_SUBUNIT_ID],
            anchorKinds: [ThreadCommentAnchorKind.DOC_TEXT_RANGE],
        }).filter((comment) => commentIds.has(comment.root.id));
    }

    /** @inheritdoc */
    override async listCommentsAsync(): Promise<IFacadeThreadCommentInfo[]> {
        const range = this.getRange();
        const commentIds = this._getOverlappingCommentIds(range);
        const comments = await this._getCommentService().listCommentsAsync({
            unitIds: [this._document.getId()],
            subUnitIds: [DEFAULT_DOC_SUBUNIT_ID],
            anchorKinds: [ThreadCommentAnchorKind.DOC_TEXT_RANGE],
        });
        return comments.filter((comment) => commentIds.has(comment.root.id));
    }

    private _getOverlappingCommentIds(range: IFDocumentTextRange): Set<string> {
        const decorations = this._document.getBody(range.segmentId).customDecorations ?? [];
        return new Set(decorations.filter((decoration) => decoration.type === CustomDecorationType.COMMENT
            && decoration.startIndex < range.endOffset
            && decoration.endIndex >= range.startOffset).map((decoration) => decoration.id));
    }
}

FDocumentTextRange.extend(FDocumentTextRangeThreadCommentMixin);

declare module '@univerjs/docs/facade' {
    interface FDocumentTextRange extends IFDocumentTextRangeThreadCommentMixin {}
}
