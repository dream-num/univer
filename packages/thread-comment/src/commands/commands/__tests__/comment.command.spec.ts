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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThreadCommentModel } from '../../../models/thread-comment.model';
import { UniverThreadCommentPlugin } from '../../../plugin';
import { IThreadCommentDataSourceService } from '../../../services/tc-datasource.service';
import { ThreadCommentFacadeService } from '../../../services/thread-comment-api.service';
import { ThreadCommentAnchorKind } from '../../../types/comment-anchor';
import {
    AddCommentMutation,
    DeleteCommentMutation,
    ResolveCommentMutation,
    UpdateCommentMutation,
    UpdateCommentRefMutation,
} from '../../mutations/comment.mutation';
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

        const eventSummary: Array<{ type: CommentUpdate['type']; isRoot?: boolean }> = [];
        for (const event of events) {
            eventSummary.push({ type: event.type, isRoot: event.type === 'add' ? event.isRoot : undefined });
        }

        expect(threadCommentModel.getThread('unit-1', 'sheet-1', root.id)).toEqual({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            threadId: root.id,
            root,
            children: [reply],
            relativeUsers: new Set(['owner', 'guest']),
        });
        expect(eventSummary).toEqual([
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

        const deleteComment = vi.fn(async () => true);
        get(IThreadCommentDataSourceService).dataSource = {
            addComment: async (comment) => comment,
            updateComment: async () => true,
            resolveComment: async () => true,
            deleteComment,
            listComments: async () => [],
            saveCommentToSnapshot: (comment) => comment,
        };

        await commandService.executeCommand(DeleteCommentTreeCommand.id, {
            unitId: reply.unitId,
            subUnitId: reply.subUnitId,
            commentId: reply.id,
        });

        subscription.unsubscribe();

        expect(threadCommentModel.getComment('unit-1', 'sheet-1', root.id)).toBeUndefined();
        expect(threadCommentModel.getThread('unit-1', 'sheet-1', root.id)).toBeUndefined();
        const resolveEvents: CommentUpdate[] = [];
        const deletedCommentIds: string[] = [];
        for (const event of events) {
            if (event.type === 'resolve') {
                resolveEvents.push(event);
            }
            if (event.type === 'delete') {
                deletedCommentIds.push(event.payload.commentId);
            }
        }

        expect(resolveEvents).toEqual([
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
        expect(deletedCommentIds).toEqual(['root-2', 'reply-2']);
        expect(deleteComment).toHaveBeenCalledWith('unit-1', 'sheet-1', root.threadId, root.id);
    });

    it('updates comment content and keeps the thread relationship', async () => {
        const root = createComment({ id: 'root-3', attachments: ['before.png'] });

        await commandService.executeCommand(AddCommentCommand.id, {
            unitId: root.unitId,
            subUnitId: root.subUnitId,
            comment: root,
        });

        const result = await commandService.executeCommand(UpdateCommentCommand.id, {
            unitId: root.unitId,
            subUnitId: root.subUnitId,
            payload: {
                commentId: root.id,
                text: createBody('updated text'),
                attachments: ['after.png'],
                updateT: '2024-01-02T00:00:00.000Z',
            },
        });

        const updated = threadCommentModel.getComment('unit-1', 'sheet-1', root.id);

        expect(result).toBe(true);
        expect(updated?.text).toEqual(createBody('updated text'));
        expect(updated?.attachments).toEqual(['after.png']);
        expect(updated?.updated).toBe(true);
        expect(updated?.updateT).toBe('2024-01-02T00:00:00.000Z');
        expect(threadCommentModel.getThread('unit-1', 'sheet-1', root.id)?.root.id).toBe(root.id);
    });

    it('deletes a reply without removing the root thread', async () => {
        const root = createComment({ id: 'root-4' });
        const reply = createComment({
            id: 'reply-4',
            parentId: root.id,
            threadId: root.id,
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

        const result = await commandService.executeCommand(DeleteCommentCommand.id, {
            unitId: reply.unitId,
            subUnitId: reply.subUnitId,
            commentId: reply.id,
        });
        const thread = threadCommentModel.getThread('unit-1', 'sheet-1', root.id);

        expect(result).toBe(true);
        expect(thread?.root.id).toBe(root.id);
        expect(thread?.children).toEqual([]);
        expect(threadCommentModel.getComment('unit-1', 'sheet-1', reply.id)).toBeUndefined();
    });

    it('updates a comment reference through the mutation used by integrations', async () => {
        const root = createComment({ id: 'root-5', ref: 'A1' });

        await commandService.executeCommand(AddCommentCommand.id, {
            unitId: root.unitId,
            subUnitId: root.subUnitId,
            comment: root,
        });

        const result = await commandService.executeCommand(UpdateCommentRefMutation.id, {
            unitId: root.unitId,
            subUnitId: root.subUnitId,
            payload: {
                commentId: root.id,
                ref: 'B2',
            },
        });

        expect(result).toBe(true);
        expect(threadCommentModel.getComment('unit-1', 'sheet-1', root.id)?.ref).toBe('B2');
    });

    it('runs create, update, reply, and delete through the facade', async () => {
        const facade = get(ThreadCommentFacadeService);
        const location = { unitId: 'unit-1', subUnitId: 'sheet-1' };

        await facade.createCommentAsync({
            ...location,
            id: 'facade-root',
            personId: 'owner',
            anchor: { kind: ThreadCommentAnchorKind.SLIDE_POSITION, pageId: 'sheet-1', x: 0.25, y: 0.5 },
            content: 'created',
        });
        await facade.updateCommentAsync({ ...location, commentId: 'facade-root', content: 'updated' });
        await facade.replyCommentAsync({
            ...location,
            threadId: 'facade-root',
            id: 'facade-reply',
            personId: 'guest',
            content: 'reply',
        });

        const thread = facade.getComments({ anchorKinds: [ThreadCommentAnchorKind.SLIDE_POSITION] })[0];
        expect(thread.root.text.dataStream).toBe('updated\r\n');
        expect(thread.children.map((comment) => comment.id)).toEqual(['facade-reply']);

        await facade.deleteCommentAsync({ ...location, commentId: 'facade-reply' });
        expect(facade.getComments()[0].children).toEqual([]);
        await facade.deleteCommentAsync({ ...location, commentId: 'facade-root', deleteThread: true });
        expect(facade.getComments()).toEqual([]);
    });

    it('batches facade refreshes by unit and subunit instead of issuing one request per thread', async () => {
        const facade = get(ThreadCommentFacadeService);
        const roots = [
            createComment({ id: 'batch-root-1', subUnitId: 'sheet-1' }),
            createComment({ id: 'batch-root-2', subUnitId: 'sheet-1' }),
            createComment({ id: 'batch-root-3', subUnitId: 'sheet-2' }),
        ];
        roots.forEach((root) => threadCommentModel.addComment(root.unitId, root.subUnitId, root));
        const listComments = vi.fn(async (_unitId: string, _subUnitId: string, threadIds: string[]) => (
            roots.filter((root) => threadIds.includes(root.threadId))
        ));
        get(IThreadCommentDataSourceService).dataSource = {
            addComment: async (comment) => comment,
            updateComment: async () => true,
            resolveComment: async () => true,
            deleteComment: async () => true,
            listComments,
            saveCommentToSnapshot: (comment) => comment,
        };

        await expect(facade.listCommentsAsync()).resolves.toHaveLength(3);

        expect(listComments).toHaveBeenCalledTimes(2);
        expect(listComments).toHaveBeenCalledWith('unit-1', 'sheet-1', ['batch-root-1', 'batch-root-2']);
        expect(listComments).toHaveBeenCalledWith('unit-1', 'sheet-2', ['batch-root-3']);
    });

    it.each([
        ['sheet drawing', { kind: ThreadCommentAnchorKind.SHEET_DRAWING, elementId: 'sheet-drawing-1' }],
        ['doc drawing', { kind: ThreadCommentAnchorKind.DOC_DRAWING, elementId: 'doc-drawing-1' }],
        ['slide element', { kind: ThreadCommentAnchorKind.SLIDE_ELEMENT, elementId: 'slide-element-1', pageId: 'page-1' }],
        ['slide position', { kind: ThreadCommentAnchorKind.SLIDE_POSITION, x: 0.25, y: 0.5, pageId: 'page-1' }],
        ['board element', { kind: ThreadCommentAnchorKind.BOARD_ELEMENT, elementId: 'board-element-1' }],
        ['board position', { kind: ThreadCommentAnchorKind.BOARD_POSITION, x: 120, y: 80 }],
        ['base record', { kind: ThreadCommentAnchorKind.BASE_RECORD, tableId: 'table-1', recordId: 'record-1' }],
    ] as const)('runs the complete facade CRUD chain for a %s anchor', async (_name, anchor) => {
        const facade = get(ThreadCommentFacadeService);
        const location = { unitId: 'unit-1', subUnitId: 'sheet-1' };
        const rootId = `root-${anchor.kind}`;
        const replyId = `reply-${anchor.kind}`;

        await facade.createCommentAsync({
            ...location,
            id: rootId,
            personId: 'owner',
            anchor,
            content: 'created',
        });
        await facade.updateCommentAsync({ ...location, commentId: rootId, content: 'updated' });
        await facade.replyCommentAsync({
            ...location,
            threadId: rootId,
            id: replyId,
            personId: 'guest',
            content: 'reply',
        });

        const thread = facade.getComments({ anchorKinds: [anchor.kind] })[0];
        expect(thread.anchorKind).toBe(anchor.kind);
        expect(thread.anchor).toEqual(anchor);
        expect(thread.root.text.dataStream).toBe('updated\r\n');
        expect(thread.children.map((comment) => comment.id)).toEqual([replyId]);

        await facade.resolveCommentAsync({ ...location, commentId: rootId });
        expect(facade.getComments({ anchorKinds: [anchor.kind], resolved: true })).toHaveLength(1);
        await facade.resolveCommentAsync({ ...location, commentId: rootId, resolved: false });
        expect(facade.getComments({ anchorKinds: [anchor.kind], resolved: false })).toHaveLength(1);

        await facade.deleteCommentAsync({ ...location, commentId: replyId });
        expect(facade.getComments({ anchorKinds: [anchor.kind] })[0].children).toEqual([]);
        await facade.deleteCommentAsync({ ...location, commentId: rootId, deleteThread: true });
        expect(facade.getComments({ anchorKinds: [anchor.kind] })).toEqual([]);
    });

    it('exposes a stable anchor kind for legacy sheet comments', async () => {
        const root = createComment({ id: 'legacy-sheet-comment', ref: 'A1' });
        await commandService.executeCommand(AddCommentCommand.id, {
            unitId: root.unitId,
            subUnitId: root.subUnitId,
            comment: root,
        });

        const [thread] = get(ThreadCommentFacadeService).getComments({
            anchorKinds: [ThreadCommentAnchorKind.SHEET_CELL],
        });

        expect(thread.anchorKind).toBe(ThreadCommentAnchorKind.SHEET_CELL);
        expect(thread.anchor).toBeNull();
        expect(thread.root.ref).toBe('A1');
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

    it('keeps local comments unchanged when remote writes fail', async () => {
        const root = createComment({ id: 'network-root' });
        await commandService.executeCommand(AddCommentCommand.id, {
            unitId: root.unitId,
            subUnitId: root.subUnitId,
            comment: root,
        });

        get(IThreadCommentDataSourceService).dataSource = {
            addComment: async () => { throw new Error('offline'); },
            updateComment: async () => { throw new Error('forbidden'); },
            resolveComment: async () => false,
            deleteComment: async () => false,
            listComments: async () => [],
            saveCommentToSnapshot: (comment) => comment,
        };

        await expect(commandService.executeCommand(AddCommentCommand.id, {
            unitId: root.unitId,
            subUnitId: root.subUnitId,
            comment: createComment({ id: 'offline-root' }),
        })).rejects.toThrow('offline');
        await expect(commandService.executeCommand(UpdateCommentCommand.id, {
            unitId: root.unitId,
            subUnitId: root.subUnitId,
            payload: { commentId: root.id, text: createBody('changed') },
        })).rejects.toThrow('forbidden');
        await expect(commandService.executeCommand(ResolveCommentCommand.id, {
            unitId: root.unitId,
            subUnitId: root.subUnitId,
            commentId: root.id,
            resolved: true,
        })).resolves.toBe(false);
        await expect(commandService.executeCommand(DeleteCommentTreeCommand.id, {
            unitId: root.unitId,
            subUnitId: root.subUnitId,
            commentId: root.id,
        })).resolves.toBe(false);

        expect(threadCommentModel.getComment(root.unitId, root.subUnitId, 'offline-root')).toBeUndefined();
        expect(threadCommentModel.getComment(root.unitId, root.subUnitId, root.id)).toMatchObject({
            text: createBody(root.id),
            resolved: undefined,
        });
    });

    it('keeps unit and anchor identity local while accepting the server-authoritative author', async () => {
        const root = createComment({ id: 'identity-root', ref: 'C7', personId: 'client-user' });
        get(IThreadCommentDataSourceService).dataSource = {
            addComment: async (comment) => ({
                ...comment,
                unitId: 'spoofed-unit',
                subUnitId: 'spoofed-subunit',
                ref: 'spoofed-ref',
                personId: 'server-user',
            }),
            updateComment: async () => true,
            resolveComment: async () => true,
            deleteComment: async () => true,
            listComments: async () => [],
            saveCommentToSnapshot: (comment) => comment,
        };

        await expect(commandService.executeCommand(AddCommentCommand.id, {
            unitId: root.unitId,
            subUnitId: root.subUnitId,
            comment: root,
        })).resolves.toBe(true);

        expect(threadCommentModel.getComment(root.unitId, root.subUnitId, root.id)).toMatchObject({
            unitId: root.unitId,
            subUnitId: root.subUnitId,
            ref: root.ref,
            personId: 'server-user',
        });
        expect(threadCommentModel.getUnit('spoofed-unit')).toEqual([]);
    });

    it('reports an edit as failed when the comment is deleted while the remote update is pending', async () => {
        const root = createComment({ id: 'concurrent-root' });
        await commandService.executeCommand(AddCommentCommand.id, {
            unitId: root.unitId,
            subUnitId: root.subUnitId,
            comment: root,
        });
        let finishUpdate: ((success: boolean) => void) | undefined;
        get(IThreadCommentDataSourceService).dataSource = {
            addComment: async (comment) => comment,
            updateComment: () => new Promise((resolve) => {
                finishUpdate = resolve;
            }),
            resolveComment: async () => true,
            deleteComment: async () => true,
            listComments: async () => [],
            saveCommentToSnapshot: (comment) => comment,
        };

        const update = commandService.executeCommand(UpdateCommentCommand.id, {
            unitId: root.unitId,
            subUnitId: root.subUnitId,
            payload: { commentId: root.id, text: createBody('late edit') },
        });
        await Promise.resolve();
        threadCommentModel.deleteComment(root.unitId, root.subUnitId, root.id);
        finishUpdate?.(true);

        await expect(update).resolves.toBe(false);
        expect(threadCommentModel.getComment(root.unitId, root.subUnitId, root.id)).toBeUndefined();
    });

    it('does not leave an orphan reply when its thread is deleted during the remote add', async () => {
        const root = createComment({ id: 'reply-race-root' });
        await commandService.executeCommand(AddCommentCommand.id, {
            unitId: root.unitId,
            subUnitId: root.subUnitId,
            comment: root,
        });
        const reply = createComment({
            id: 'reply-race-child',
            threadId: root.threadId,
            parentId: root.id,
            ref: '',
        });
        let finishAdd: ((comment: IThreadComment) => void) | undefined;
        const deletedIds: string[] = [];
        get(IThreadCommentDataSourceService).dataSource = {
            addComment: () => new Promise((resolve) => {
                finishAdd = resolve;
            }),
            updateComment: async () => true,
            resolveComment: async () => true,
            deleteComment: async (_unitId, _subUnitId, _threadId, commentId) => {
                if (commentId) {
                    deletedIds.push(commentId);
                }
                return true;
            },
            listComments: async () => [],
            saveCommentToSnapshot: (comment) => comment,
        };

        const addReply = commandService.executeCommand(AddCommentCommand.id, {
            unitId: reply.unitId,
            subUnitId: reply.subUnitId,
            comment: reply,
        });
        await Promise.resolve();
        threadCommentModel.deleteThread(root.unitId, root.subUnitId, root.threadId);
        finishAdd?.(reply);

        await expect(addReply).resolves.toBe(false);
        expect(threadCommentModel.getComment(reply.unitId, reply.subUnitId, reply.id)).toBeUndefined();
        expect(deletedIds).toEqual([reply.id]);
    });

    it('keeps the latest edit when overlapping remote writes finish out of order', async () => {
        const root = createComment({ id: 'overlapping-edit-root' });
        await commandService.executeCommand(AddCommentCommand.id, {
            unitId: root.unitId,
            subUnitId: root.subUnitId,
            comment: root,
        });
        const finishUpdates: Array<(success: boolean) => void> = [];
        get(IThreadCommentDataSourceService).dataSource = {
            addComment: async (comment) => comment,
            updateComment: () => new Promise((resolve) => finishUpdates.push(resolve)),
            resolveComment: async () => true,
            deleteComment: async () => true,
            listComments: async () => [],
            saveCommentToSnapshot: (comment) => comment,
        };

        const older = commandService.executeCommand(UpdateCommentCommand.id, {
            unitId: root.unitId,
            subUnitId: root.subUnitId,
            payload: { commentId: root.id, text: createBody('older edit') },
        });
        await Promise.resolve();
        const newer = commandService.executeCommand(UpdateCommentCommand.id, {
            unitId: root.unitId,
            subUnitId: root.subUnitId,
            payload: { commentId: root.id, text: createBody('newer edit') },
        });
        await Promise.resolve();

        finishUpdates[1](true);
        await expect(newer).resolves.toBe(true);
        finishUpdates[0](true);
        await expect(older).resolves.toBe(false);
        expect(threadCommentModel.getComment(root.unitId, root.subUnitId, root.id)?.text).toEqual(createBody('newer edit'));
    });

    it('keeps the latest resolve intent when responses finish out of order', async () => {
        const root = createComment({ id: 'overlapping-resolve-root' });
        await commandService.executeCommand(AddCommentCommand.id, {
            unitId: root.unitId,
            subUnitId: root.subUnitId,
            comment: root,
        });
        const finishResolves: Array<(success: boolean) => void> = [];
        get(IThreadCommentDataSourceService).dataSource = {
            addComment: async (comment) => comment,
            updateComment: async () => true,
            resolveComment: () => new Promise((resolve) => finishResolves.push(resolve)),
            deleteComment: async () => true,
            listComments: async () => [],
            saveCommentToSnapshot: (comment) => comment,
        };

        const older = commandService.executeCommand(ResolveCommentCommand.id, {
            unitId: root.unitId,
            subUnitId: root.subUnitId,
            commentId: root.id,
            resolved: true,
        });
        await Promise.resolve();
        const newer = commandService.executeCommand(ResolveCommentCommand.id, {
            unitId: root.unitId,
            subUnitId: root.subUnitId,
            commentId: root.id,
            resolved: false,
        });
        await Promise.resolve();

        finishResolves[1](true);
        await expect(newer).resolves.toBe(true);
        finishResolves[0](true);
        await expect(older).resolves.toBe(false);
        expect(threadCommentModel.getComment(root.unitId, root.subUnitId, root.id)?.resolved).toBe(false);
    });

    it('replays a collaborator add, reply, edit, resolve, and delete chain', async () => {
        const remoteRoot = createComment({ id: 'remote-root', text: createBody('remote root') });
        const remoteReply = createComment({
            id: 'remote-reply',
            threadId: remoteRoot.threadId,
            parentId: remoteRoot.id,
            text: createBody('remote reply'),
        });
        get(IThreadCommentDataSourceService).dataSource = {
            addComment: async (comment) => comment,
            updateComment: async () => true,
            resolveComment: async () => true,
            deleteComment: async () => true,
            listComments: async () => [{ ...remoteRoot, children: [remoteReply] }],
            saveCommentToSnapshot: (comment) => comment,
        };

        await commandService.executeCommand(AddCommentMutation.id, {
            unitId: remoteRoot.unitId,
            subUnitId: remoteRoot.subUnitId,
            comment: { ...remoteRoot, text: createBody('placeholder') },
        }, { fromChangeset: true });
        await Promise.resolve();
        await Promise.resolve();

        expect(threadCommentModel.getThread(remoteRoot.unitId, remoteRoot.subUnitId, remoteRoot.threadId)).toMatchObject({
            root: { text: createBody('remote root') },
            children: [{ id: remoteReply.id, text: createBody('remote reply') }],
        });
        const query = { unitIds: [remoteRoot.unitId], subUnitIds: [remoteRoot.subUnitId] };
        const facade = get(ThreadCommentFacadeService);
        await expect(facade.listCommentsAsync(query)).resolves.toEqual(facade.getComments(query));

        await commandService.executeCommand(UpdateCommentMutation.id, {
            unitId: remoteRoot.unitId,
            subUnitId: remoteRoot.subUnitId,
            payload: { commentId: remoteRoot.id, text: createBody('remote edit') },
        }, { fromChangeset: true });
        await commandService.executeCommand(ResolveCommentMutation.id, {
            unitId: remoteRoot.unitId,
            subUnitId: remoteRoot.subUnitId,
            commentId: remoteRoot.id,
            resolved: true,
        }, { fromChangeset: true });

        expect(threadCommentModel.getComment(remoteRoot.unitId, remoteRoot.subUnitId, remoteRoot.id)).toMatchObject({
            text: createBody('remote edit'),
            resolved: true,
        });

        await commandService.executeCommand(DeleteCommentMutation.id, {
            unitId: remoteRoot.unitId,
            subUnitId: remoteRoot.subUnitId,
            commentId: remoteRoot.id,
        }, { fromChangeset: true });
        expect(threadCommentModel.getThread(remoteRoot.unitId, remoteRoot.subUnitId, remoteRoot.threadId)).toBeUndefined();
    });
});
