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
import type { IThreadCommentAnchor } from '../types/comment-anchor';
import { generateRandomId, ICommandService, Inject, UserManagerService } from '@univerjs/core';
import {
    AddCommentCommand,
    DeleteCommentCommand,
    DeleteCommentTreeCommand,
    UpdateCommentCommand,
} from '../commands/commands/comment.command';
import { getDT } from '../common/utils';
import { ThreadCommentModel } from '../models/thread-comment.model';
import { deserializeThreadCommentAnchor, serializeThreadCommentAnchor } from '../types/comment-anchor';

export interface ICreateThreadCommentOptions {
    unitId: string;
    subUnitId: string;
    anchor: IThreadCommentAnchor;
    content: ThreadCommentContent;
    attachments?: string[];
    id?: string;
    threadId?: string;
    personId?: string;
    dateTime?: Date;
}

export interface IReplyThreadCommentOptions {
    unitId: string;
    subUnitId: string;
    threadId: string;
    content: ThreadCommentContent;
    attachments?: string[];
    id?: string;
    personId?: string;
    dateTime?: Date;
}

export interface IUpdateThreadCommentOptions {
    unitId: string;
    subUnitId: string;
    commentId: string;
    content: ThreadCommentContent;
    attachments?: string[];
    dateTime?: Date;
}

export interface IDeleteThreadCommentOptions {
    unitId: string;
    subUnitId: string;
    commentId: string;
    deleteThread?: boolean;
}

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
    const body = value as Record<string, unknown>;
    if (typeof body.dataStream !== 'string') {
        return false;
    }
    if (DOCUMENT_BODY_ARRAY_FIELDS.some((field) => body[field] !== undefined && !Array.isArray(body[field]))) {
        return false;
    }
    return body.payloads === undefined || (
        body.payloads !== null
        && typeof body.payloads === 'object'
        && !Array.isArray(body.payloads)
        && Object.values(body.payloads).every((item) => typeof item === 'string')
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
    anchor: IThreadCommentAnchor | null;
    relativeUserIds: string[];
}

function toFacadeInfo(thread: IThreadInfo): IFacadeThreadCommentInfo {
    return {
        unitId: thread.unitId,
        subUnitId: thread.subUnitId,
        threadId: thread.threadId,
        root: thread.root,
        children: thread.children,
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

    getComments(query: IThreadCommentQuery = {}): IFacadeThreadCommentInfo[] {
        return this._model.query(query).map(toFacadeInfo);
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
        return this._model.query(query).map(toFacadeInfo);
    }
}
