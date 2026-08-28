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

import type { IDocumentBody } from '@univerjs/core';
import type { IThreadCommentQuery, IThreadInfo } from '../models/thread-comment.model';
import type { IThreadCommentAnchor, ThreadCommentAnchorKind } from '../types/comment-anchor';
import { generateRandomId, ICommandService, Inject, UserManagerService } from '@univerjs/core';
import {
    AddCommentCommand,
    DeleteCommentCommand,
    DeleteCommentTreeCommand,
    ResolveCommentCommand,
    UpdateCommentCommand,
} from '../commands/commands/comment.command';
import { getDT } from '../common/utils';
import { ThreadCommentModel } from '../models/thread-comment.model';
import { deserializeThreadCommentAnchor, serializeThreadCommentAnchor } from '../types/comment-anchor';

export interface ICreateThreadCommentOptions {
    /** Univer unit that owns the comment. */
    unitId: string;
    /** Sheet, page, table, or product subunit that owns the comment. */
    subUnitId: string;
    /** Stable, serializable product anchor. */
    anchor: IThreadCommentAnchor;
    /** Plain text or a Univer document body for rich comment content. */
    content: ThreadCommentContent;
    /** Attachment resource IDs. */
    attachments?: string[];
    /** Caller-supplied stable comment ID, useful for idempotent agent workflows. */
    id?: string;
    /** Caller-supplied thread ID. Defaults to the root comment ID. */
    threadId?: string;
    /** Author user ID. Defaults to the current user managed by `UserManagerService`. */
    personId?: string;
    /** Creation time. Defaults to the current time. */
    dateTime?: Date;
}

export interface IReplyThreadCommentOptions {
    /** Univer unit that owns the thread. */
    unitId: string;
    /** Sheet, page, table, or product subunit that owns the thread. */
    subUnitId: string;
    /** Stable ID of the root thread being replied to. */
    threadId: string;
    /** Plain text or a Univer document body for rich reply content. */
    content: ThreadCommentContent;
    /** Attachment resource IDs. */
    attachments?: string[];
    /** Caller-supplied stable reply ID, useful for idempotent agent workflows. */
    id?: string;
    /** Author user ID. Defaults to the current user managed by `UserManagerService`. */
    personId?: string;
    /** Creation time. Defaults to the current time. */
    dateTime?: Date;
}

export interface IUpdateThreadCommentOptions {
    /** Univer unit that owns the comment. */
    unitId: string;
    /** Sheet, page, table, or product subunit that owns the comment. */
    subUnitId: string;
    /** Stable ID of the root comment or reply to update. */
    commentId: string;
    /** Replacement plain text or Univer document body. */
    content: ThreadCommentContent;
    /** Replacement attachment resource IDs. Omit to preserve the current attachments. */
    attachments?: string[];
    /** Update time. Defaults to the current time. */
    dateTime?: Date;
}

export interface IDeleteThreadCommentOptions {
    /** Univer unit that owns the comment. */
    unitId: string;
    /** Sheet, page, table, or product subunit that owns the comment. */
    subUnitId: string;
    /** Stable ID of the root comment or reply to delete. */
    commentId: string;
    /** Deletes the complete root and reply tree when true. */
    deleteThread?: boolean;
}

export interface IResolveThreadCommentOptions {
    /** Univer unit that owns the thread. */
    unitId: string;
    /** Sheet, page, table, or product subunit that owns the thread. */
    subUnitId: string;
    /** Stable ID of the root comment or a reply in the target thread. */
    commentId: string;
    /** Defaults to `true`. Pass `false` to reopen the thread. */
    resolved?: boolean;
}

/** Plain text or a Univer document body used as comment content. */
export type ThreadCommentContent = string | IDocumentBody;

const DOCUMENT_BODY_ARRAY_FIELDS = [
    'renderedPageBreaks',
    'textRuns',
    'paragraphs',
    'sectionBreaks',
    'customBlocks',
    'tables',
    'columnGroups',
    'blockRanges',
    'customRanges',
    'customDecorations',
] as const;

export function isThreadCommentDocumentBody(value: unknown): value is IDocumentBody {
    if (!value || typeof value !== 'object') {
        return false;
    }
    if (typeof Reflect.get(value, 'dataStream') !== 'string') {
        return false;
    }
    if (DOCUMENT_BODY_ARRAY_FIELDS.some((field) => {
        const fieldValue = Reflect.get(value, field);
        return fieldValue !== undefined && !Array.isArray(fieldValue);
    })) {
        return false;
    }
    const payloads = Reflect.get(value, 'payloads');
    return payloads === undefined || (
        payloads !== null
        && typeof payloads === 'object'
        && !Array.isArray(payloads)
        && Object.values(payloads).every((item) => typeof item === 'string')
    );
}

export function normalizeThreadCommentContent(content: ThreadCommentContent): IDocumentBody {
    if (typeof content !== 'string') {
        if (!isThreadCommentDocumentBody(content)) {
            throw new TypeError('Invalid thread comment content');
        }
        if (!content.dataStream.replace(/[\r\n]/g, '').trim()) {
            throw new TypeError('Thread comment content cannot be empty');
        }
        return content;
    }

    if (!content.trim()) {
        throw new TypeError('Thread comment content cannot be empty');
    }

    const dataStream = content.replace(/\r\n?|\n/g, '\r').replace(/\r*$/, '\r\n');
    return { dataStream };
}

export interface IFacadeThreadCommentInfo extends Omit<IThreadInfo, 'relativeUsers'> {
    /**
     * Product anchor category. Facade query results always populate this field, including for legacy
     * Sheet cell and Document range comments. It remains optional for source compatibility with
     * existing `IFacadeThreadCommentInfo` implementations.
     */
    anchorKind?: ThreadCommentAnchorKind | null;
    /** Parsed stable product anchor, or `null` for a legacy comment reference. */
    anchor: IThreadCommentAnchor | null;
    /** Unique IDs of authors participating in the root and reply tree. */
    relativeUserIds: string[];
}

function toFacadeInfo(thread: IThreadInfo, anchorKind: ThreadCommentAnchorKind | null): IFacadeThreadCommentInfo {
    return {
        unitId: thread.unitId,
        subUnitId: thread.subUnitId,
        threadId: thread.threadId,
        root: thread.root,
        children: thread.children,
        anchorKind,
        anchor: deserializeThreadCommentAnchor(thread.root.ref),
        relativeUserIds: Array.from(thread.relativeUsers),
    };
}

export class ThreadCommentFacadeService {
    constructor(
        @Inject(ICommandService) private readonly _commandService: ICommandService,
        @Inject(ThreadCommentModel) private readonly _model: ThreadCommentModel,
        @Inject(UserManagerService) private readonly _userManagerService: UserManagerService
    ) {}

    createCommentAsync(options: ICreateThreadCommentOptions): Promise<boolean> {
        const id = options.id ?? generateRandomId();
        const threadId = options.threadId ?? id;
        const personId = options.personId ?? this._userManagerService.getCurrentUser().userID;

        return this._commandService.executeCommand(AddCommentCommand.id, {
            unitId: options.unitId,
            subUnitId: options.subUnitId,
            comment: {
                id,
                threadId,
                unitId: options.unitId,
                subUnitId: options.subUnitId,
                ref: serializeThreadCommentAnchor(options.anchor),
                text: normalizeThreadCommentContent(options.content),
                attachments: options.attachments ?? [],
                dT: getDT(options.dateTime),
                personId,
            },
        });
    }

    replyCommentAsync(options: IReplyThreadCommentOptions): Promise<boolean> {
        const root = this._model.getRootComment(options.unitId, options.subUnitId, options.threadId);
        if (!root) {
            return Promise.resolve(false);
        }

        return this._commandService.executeCommand(AddCommentCommand.id, {
            unitId: options.unitId,
            subUnitId: options.subUnitId,
            comment: {
                id: options.id ?? generateRandomId(),
                threadId: options.threadId,
                parentId: root.id,
                unitId: options.unitId,
                subUnitId: options.subUnitId,
                ref: root.ref,
                text: normalizeThreadCommentContent(options.content),
                attachments: options.attachments ?? [],
                dT: getDT(options.dateTime),
                personId: options.personId ?? this._userManagerService.getCurrentUser().userID,
            },
        });
    }

    updateCommentAsync(options: IUpdateThreadCommentOptions): Promise<boolean> {
        return this._commandService.executeCommand(UpdateCommentCommand.id, {
            unitId: options.unitId,
            subUnitId: options.subUnitId,
            payload: {
                commentId: options.commentId,
                text: normalizeThreadCommentContent(options.content),
                attachments: options.attachments,
                updateT: getDT(options.dateTime),
            },
        });
    }

    deleteCommentAsync(options: IDeleteThreadCommentOptions): Promise<boolean> {
        return this._commandService.executeCommand(
            options.deleteThread ? DeleteCommentTreeCommand.id : DeleteCommentCommand.id,
            {
                unitId: options.unitId,
                subUnitId: options.subUnitId,
                commentId: options.commentId,
            }
        );
    }

    resolveCommentAsync(options: IResolveThreadCommentOptions): Promise<boolean> {
        return this._commandService.executeCommand(ResolveCommentCommand.id, {
            unitId: options.unitId,
            subUnitId: options.subUnitId,
            commentId: options.commentId,
            resolved: options.resolved ?? true,
        });
    }

    getComments(query: IThreadCommentQuery = {}): IFacadeThreadCommentInfo[] {
        return this._model.query(query).map((thread) => toFacadeInfo(
            thread,
            this._model.getAnchorKind(thread.unitId, thread.root.ref)
        ));
    }

    async listCommentsAsync(query: IThreadCommentQuery = {}): Promise<IFacadeThreadCommentInfo[]> {
        const knownThreads = this._model.query({ unitIds: query.unitIds, subUnitIds: query.subUnitIds });
        const groups = new Map<string, { unitId: string; subUnitId: string; threadIds: string[] }>();
        knownThreads.forEach((thread) => {
            const key = `${thread.unitId}\0${thread.subUnitId}`;
            const group = groups.get(key) ?? { unitId: thread.unitId, subUnitId: thread.subUnitId, threadIds: [] };
            group.threadIds.push(thread.threadId);
            groups.set(key, group);
        });
        await Promise.all(Array.from(groups.values()).map((group) => this._model.syncThreadComments(
            group.unitId,
            group.subUnitId,
            group.threadIds
        )));
        return this._model.query(query).map((thread) => toFacadeInfo(
            thread,
            this._model.getAnchorKind(thread.unitId, thread.root.ref)
        ));
    }
}
