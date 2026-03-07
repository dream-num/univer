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

import type { IDocumentBody, Injector, IWorkbookData } from '@univerjs/core';
import type { CommentUpdate } from '../../../models/thread-comment.model';
import type { IThreadComment } from '../../../types/interfaces/i-thread-comment';
import {
    ICommandService,
    IUniverInstanceService,
    LifecycleService,
    LifecycleStages,
    LocaleType,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ThreadCommentModel } from '../../../models/thread-comment.model';
import { UniverThreadCommentPlugin } from '../../../plugin';
import {
    AddCommentCommand,
    DeleteCommentCommand,
    DeleteCommentTreeCommand,
    ResolveCommentCommand,
    UpdateCommentCommand,
} from '../comment.command';

function createWorkbookData(): IWorkbookData {
    return {
        id: 'unit-1',
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: '',
        sheetOrder: ['sheet-1'],
        styles: {},
        sheets: {
            'sheet-1': {
                id: 'sheet-1',
                name: 'Sheet1',
                cellData: {},
            },
        },
    };
}

function createBody(text: string): IDocumentBody {
    return {
        dataStream: `${text}\r\n`,
    };
}

function createComment(overrides: Partial<IThreadComment> = {}): IThreadComment {
    const id = overrides.id ?? 'comment-1';

    return {
        id,
        threadId: overrides.threadId ?? overrides.parentId ?? id,
        ref: overrides.ref ?? 'A1',
        dT: overrides.dT ?? '2024-01-01T00:00:00.000Z',
        personId: overrides.personId ?? 'user-1',
        text: overrides.text ?? createBody(id),
        unitId: overrides.unitId ?? 'unit-1',
        subUnitId: overrides.subUnitId ?? 'sheet-1',
        attachments: overrides.attachments,
        children: overrides.children,
        mentions: overrides.mentions,
        parentId: overrides.parentId,
        resolved: overrides.resolved,
        updateT: overrides.updateT,
        updated: overrides.updated,
    };
}

describe('Thread comment commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let threadCommentModel: ThreadCommentModel;

    beforeEach(() => {
        univer = new Univer();
        univer.registerPlugin(UniverThreadCommentPlugin);
        univer.createUnit(UniverInstanceType.UNIVER_SHEET, createWorkbookData());

        const injector = univer.__getInjector();
        get = injector.get.bind(injector);
        get(IUniverInstanceService).focusUnit('unit-1');
        get(LifecycleService).stage = LifecycleStages.Rendered;

        commandService = get(ICommandService);
        threadCommentModel = get(ThreadCommentModel);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('adds root comments and replies through real commands', async () => {
        const events: CommentUpdate[] = [];
        const subscription = threadCommentModel.commentUpdate$.subscribe((event) => events.push(event));

        const root = createComment({ id: 'root-1', personId: 'owner' });
        const reply = createComment({
            id: 'reply-1',
            parentId: root.id,
            threadId: root.id,
            personId: 'guest',
            ref: '',
        });

        await commandService.executeCommand(AddCommentCommand.id, {
            unitId: root.unitId,
            subUnitId: root.subUnitId,
            comment: root,
        });
        await commandService.executeCommand(AddCommentCommand.id, {
            unitId: reply.unitId,
            subUnitId: reply.subUnitId,
            comment: reply,
        });

        subscription.unsubscribe();

        expect(threadCommentModel.getThread('unit-1', 'sheet-1', root.id)).toEqual({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            threadId: root.id,
            root,
            children: [reply],
            relativeUsers: new Set(['owner', 'guest']),
        });
        expect(events.map((event) => ({ type: event.type, isRoot: event.type === 'add' ? event.isRoot : undefined }))).toEqual([
            { type: 'add', isRoot: true },
            { type: 'add', isRoot: false },
        ]);
    });

    it('resolves a thread and deletes the whole tree when deleting by reply id', async () => {
        const root = createComment({ id: 'root-2' });
        const reply = createComment({
            id: 'reply-2',
            parentId: root.id,
            threadId: root.id,
            ref: '',
        });
        const events: CommentUpdate[] = [];
        const subscription = threadCommentModel.commentUpdate$.subscribe((event) => events.push(event));

        await commandService.executeCommand(AddCommentCommand.id, {
            unitId: root.unitId,
            subUnitId: root.subUnitId,
            comment: root,
        });
        await commandService.executeCommand(AddCommentCommand.id, {
            unitId: reply.unitId,
            subUnitId: reply.subUnitId,
            comment: reply,
        });

        await commandService.executeCommand(ResolveCommentCommand.id, {
            unitId: root.unitId,
            subUnitId: root.subUnitId,
            commentId: root.id,
            resolved: true,
        });

        await commandService.executeCommand(DeleteCommentTreeCommand.id, {
            unitId: reply.unitId,
            subUnitId: reply.subUnitId,
            commentId: reply.id,
        });

        subscription.unsubscribe();

        expect(threadCommentModel.getComment('unit-1', 'sheet-1', root.id)).toBeUndefined();
        expect(threadCommentModel.getThread('unit-1', 'sheet-1', root.id)).toBeUndefined();
        expect(events.filter((event) => event.type === 'resolve')).toEqual([
            {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                type: 'resolve',
                payload: {
                    commentId: root.id,
                    resolved: true,
                },
            },
        ]);
        expect(events.filter((event) => event.type === 'delete').map((event) => event.payload.commentId)).toEqual(['root-2', 'reply-2']);
    });

    it('returns false when updating or deleting a missing comment', async () => {
        await expect(commandService.executeCommand(UpdateCommentCommand.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            payload: {
                commentId: 'missing-comment',
                text: createBody('updated'),
                updateT: '2024-01-02T00:00:00.000Z',
            },
        })).resolves.toBe(false);

        await expect(commandService.executeCommand(DeleteCommentCommand.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            commentId: 'missing-comment',
        })).resolves.toBe(false);
    });
});
