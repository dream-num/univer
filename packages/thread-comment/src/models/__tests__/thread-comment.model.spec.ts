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
import type { IThreadComment } from '../../types/interfaces/i-thread-comment';
import type { CommentUpdate } from '../thread-comment.model';
import {
    awaitTime,
    IUniverInstanceService,
    LifecycleService,
    LifecycleStages,
    LocaleType,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UniverThreadCommentPlugin } from '../../plugin';
import { IThreadCommentDataSourceService } from '../../services/tc-datasource.service';
import { serializeThreadCommentAnchor, ThreadCommentAnchorKind } from '../../types/comment-anchor';
import { ThreadCommentModel } from '../thread-comment.model';

function createWorkbookData(): IWorkbookData {
    return {
        id: 'unit-1',
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: '',
        sheetOrder: ['sheet-1', 'sheet-2'],
        styles: {},
        sheets: {
            'sheet-1': {
                id: 'sheet-1',
                name: 'Sheet1',
                cellData: {},
            },
            'sheet-2': {
                id: 'sheet-2',
                name: 'Sheet2',
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

describe('ThreadCommentModel', () => {
    let univer: Univer;
    let get: Injector['get'];
    let lifecycleService: LifecycleService;
    let threadCommentModel: ThreadCommentModel;
    let dataSourceService: IThreadCommentDataSourceService;

    beforeEach(() => {
        univer = new Univer();
        univer.registerPlugin(UniverThreadCommentPlugin);
        univer.createUnit(UniverInstanceType.UNIVER_SHEET, createWorkbookData());

        const injector = univer.__getInjector();
        get = injector.get.bind(injector);
        get(IUniverInstanceService).focusUnit('unit-1');

        lifecycleService = get(LifecycleService);
        threadCommentModel = get(ThreadCommentModel);
        dataSourceService = get(IThreadCommentDataSourceService);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('queues sync requests before rendered and applies merged updates after lifecycle is rendered', async () => {
        const root = createComment({ id: 'root-1', ref: 'A1', text: createBody('before sync') });
        threadCommentModel.addComment('unit-1', 'sheet-1', root);

        const listComments = vi.fn(async () => [{
            ...root,
            text: createBody('after sync'),
            resolved: true,
            ref: 'SHOULD_NOT_REPLACE_EXISTING_REF',
        }]);
        dataSourceService.dataSource = {
            addComment: vi.fn(),
            updateComment: vi.fn(),
            resolveComment: vi.fn(),
            deleteComment: vi.fn(),
            listComments,
            saveCommentToSnapshot: vi.fn(),
        };

        const events: CommentUpdate[] = [];
        const subscription = threadCommentModel.commentUpdate$.subscribe((event) => events.push(event));

        await threadCommentModel.syncThreadComments('unit-1', 'sheet-1', ['root-1']);
        await threadCommentModel.syncThreadComments('unit-1', 'sheet-1', ['root-1']);

        expect(listComments).not.toHaveBeenCalled();

        lifecycleService.stage = LifecycleStages.Rendered;
        await awaitTime(0);
        await awaitTime(0);

        subscription.unsubscribe();

        expect(listComments).toHaveBeenCalledTimes(1);
        expect(listComments).toHaveBeenCalledWith('unit-1', 'sheet-1', ['root-1']);
        expect(threadCommentModel.getComment('unit-1', 'sheet-1', 'root-1')).toMatchObject({
            id: 'root-1',
            ref: 'A1',
            resolved: true,
            text: createBody('after sync'),
        });
        expect(events).toEqual([
            {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                type: 'syncUpdate',
                payload: expect.objectContaining({
                    id: 'root-1',
                    ref: 'A1',
                    resolved: true,
                }),
            },
            {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                type: 'resolve',
                payload: {
                    commentId: 'root-1',
                    resolved: true,
                },
            },
        ]);
    });

    it('removes threads that are absent from sync results', async () => {
        lifecycleService.stage = LifecycleStages.Rendered;

        const keepRoot = createComment({ id: 'keep-root' });
        const removeRoot = createComment({ id: 'remove-root', subUnitId: 'sheet-2' });

        threadCommentModel.addComment('unit-1', 'sheet-1', keepRoot);
        threadCommentModel.addComment('unit-1', 'sheet-2', removeRoot);
        const events: CommentUpdate[] = [];
        const subscription = threadCommentModel.commentUpdate$.subscribe((event) => events.push(event));

        dataSourceService.dataSource = {
            addComment: vi.fn(),
            updateComment: vi.fn(),
            resolveComment: vi.fn(),
            deleteComment: vi.fn(),
            listComments: vi.fn(async () => [keepRoot]),
            saveCommentToSnapshot: vi.fn(),
        };

        await threadCommentModel.syncThreadComments('unit-1', 'sheet-1', ['keep-root']);
        await threadCommentModel.syncThreadComments('unit-1', 'sheet-2', ['remove-root']);
        subscription.unsubscribe();

        expect(threadCommentModel.getThread('unit-1', 'sheet-1', 'keep-root')).toBeDefined();
        expect(threadCommentModel.getThread('unit-1', 'sheet-2', 'remove-root')).toBeUndefined();
        expect(threadCommentModel.getUnit('unit-1').map((thread) => thread.threadId)).toEqual(['keep-root']);
        expect(events).toContainEqual(expect.objectContaining({
            type: 'delete',
            payload: expect.objectContaining({ commentId: 'remove-root' }),
        }));
    });

    it('adds synced thread comments even when no placeholder exists locally', async () => {
        lifecycleService.stage = LifecycleStages.Rendered;

        const root = createComment({ id: 'synced-root', threadId: 'synced-thread', ref: '' });
        const reply = createComment({
            id: 'synced-reply',
            threadId: 'synced-thread',
            parentId: 'synced-root',
            ref: '',
        });

        dataSourceService.dataSource = {
            addComment: vi.fn(),
            updateComment: vi.fn(),
            resolveComment: vi.fn(),
            deleteComment: vi.fn(),
            listComments: vi.fn(async () => [{ ...root, children: [reply] }]),
            saveCommentToSnapshot: vi.fn(),
        };

        await threadCommentModel.syncThreadComments('unit-1', 'sheet-1', ['synced-thread']);

        expect(threadCommentModel.getThread('unit-1', 'sheet-1', 'synced-thread')).toEqual({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            threadId: 'synced-thread',
            root,
            children: [reply],
            relativeUsers: new Set(['user-1']),
        });
    });

    it('keeps the newest sync result when overlapping requests finish out of order', async () => {
        lifecycleService.stage = LifecycleStages.Rendered;
        const root = createComment({ id: 'racing-root', text: createBody('initial') });
        threadCommentModel.addComment('unit-1', 'sheet-1', root);

        const requests: Array<(comments: IThreadComment[]) => void> = [];
        dataSourceService.dataSource = {
            addComment: vi.fn(),
            updateComment: vi.fn(),
            resolveComment: vi.fn(),
            deleteComment: vi.fn(),
            listComments: vi.fn(() => new Promise<IThreadComment[]>((resolve) => requests.push(resolve))),
            saveCommentToSnapshot: vi.fn(),
        };

        const olderRequest = threadCommentModel.syncThreadComments('unit-1', 'sheet-1', [root.threadId]);
        const newerRequest = threadCommentModel.syncThreadComments('unit-1', 'sheet-1', [root.threadId]);
        requests[1]([{ ...root, text: createBody('newest') }]);
        await newerRequest;
        requests[0]([{ ...root, text: createBody('stale') }]);
        await olderRequest;

        expect(threadCommentModel.getComment('unit-1', 'sheet-1', root.id)?.text).toEqual(createBody('newest'));
        expect(threadCommentModel.getRootComment('unit-1', 'sheet-1', root.threadId)?.text).toEqual(createBody('newest'));
    });

    it('does not resurrect a thread deleted while an older sync request is pending', async () => {
        lifecycleService.stage = LifecycleStages.Rendered;
        const root = createComment({ id: 'deleted-during-sync' });
        threadCommentModel.addComment('unit-1', 'sheet-1', root);
        let finishSync: ((comments: IThreadComment[]) => void) | undefined;
        dataSourceService.dataSource = {
            addComment: vi.fn(),
            updateComment: vi.fn(),
            resolveComment: vi.fn(),
            deleteComment: vi.fn(),
            listComments: vi.fn(() => new Promise<IThreadComment[]>((resolve) => {
                finishSync = resolve;
            })),
            saveCommentToSnapshot: vi.fn(),
        };

        const sync = threadCommentModel.syncThreadComments('unit-1', 'sheet-1', [root.threadId]);
        threadCommentModel.deleteThread('unit-1', 'sheet-1', root.threadId);
        finishSync?.([root]);
        await sync;

        expect(threadCommentModel.getThread('unit-1', 'sheet-1', root.threadId)).toBeUndefined();
    });

    it('does not restore an unknown thread after its unit is unloaded during sync', async () => {
        lifecycleService.stage = LifecycleStages.Rendered;
        const root = createComment({ id: 'unloaded-sync-root' });
        let finishSync: ((comments: IThreadComment[]) => void) | undefined;
        dataSourceService.dataSource = {
            addComment: vi.fn(),
            updateComment: vi.fn(),
            resolveComment: vi.fn(),
            deleteComment: vi.fn(),
            listComments: vi.fn(() => new Promise<IThreadComment[]>((resolve) => {
                finishSync = resolve;
            })),
            saveCommentToSnapshot: vi.fn(),
        };

        const sync = threadCommentModel.syncThreadComments('unit-1', 'sheet-1', [root.threadId]);
        threadCommentModel.deleteUnit('unit-1');
        finishSync?.([root]);
        await sync;

        expect(threadCommentModel.getUnit('unit-1')).toEqual([]);
        expect(threadCommentModel.getAll()).toEqual([]);
    });

    it('preserves local threads across a failed sync and refreshes them after reconnect', async () => {
        lifecycleService.stage = LifecycleStages.Rendered;
        const root = createComment({ id: 'reconnect-root', text: createBody('local') });
        threadCommentModel.addComment(root.unitId, root.subUnitId, root);
        let online = false;
        dataSourceService.dataSource = {
            addComment: async (comment) => comment,
            updateComment: async () => true,
            resolveComment: async () => true,
            deleteComment: async () => true,
            listComments: async () => {
                if (!online) {
                    throw new Error('offline');
                }
                return [{ ...root, text: createBody('remote after reconnect') }];
            },
            saveCommentToSnapshot: (comment) => comment,
        };

        await expect(threadCommentModel.syncThreadComments(
            root.unitId,
            root.subUnitId,
            [root.threadId]
        )).rejects.toThrow('offline');
        expect(threadCommentModel.getComment(root.unitId, root.subUnitId, root.id)?.text).toEqual(createBody('local'));

        online = true;
        await threadCommentModel.syncThreadComments(root.unitId, root.subUnitId, [root.threadId]);
        expect(threadCommentModel.getComment(root.unitId, root.subUnitId, root.id)?.text).toEqual(
            createBody('remote after reconnect')
        );
    });

    it('ignores duplicate and cross-thread children from an external data source', async () => {
        lifecycleService.stage = LifecycleStages.Rendered;
        const root = createComment({ id: 'validated-root' });
        threadCommentModel.addComment(root.unitId, root.subUnitId, root);
        const validReply = createComment({
            id: 'valid-reply',
            threadId: root.threadId,
            parentId: root.id,
        });
        dataSourceService.dataSource = {
            addComment: async (comment) => comment,
            updateComment: async () => true,
            resolveComment: async () => true,
            deleteComment: async () => true,
            listComments: async () => [{
                ...root,
                children: [
                    { ...validReply, id: root.id },
                    { ...validReply, id: 'wrong-thread', threadId: 'other-thread' },
                    validReply,
                    { ...validReply },
                ],
            }],
            saveCommentToSnapshot: (comment) => comment,
        };

        await threadCommentModel.syncThreadComments(root.unitId, root.subUnitId, [root.threadId]);

        expect(threadCommentModel.getThread(root.unitId, root.subUnitId, root.threadId)).toMatchObject({
            root: { id: root.id },
            children: [{ id: validReply.id, parentId: root.id }],
        });
        expect(threadCommentModel.getComment(root.unitId, root.subUnitId, 'wrong-thread')).toBeUndefined();
    });

    it('builds large unit listings in one pass without rescanning every thread', () => {
        for (let index = 0; index < 1_000; index += 1) {
            const root = createComment({ id: `bulk-root-${index}` });
            threadCommentModel.addComment('unit-1', 'sheet-1', root);
            threadCommentModel.addComment('unit-1', 'sheet-1', createComment({
                id: `bulk-reply-${index}`,
                threadId: root.threadId,
                parentId: root.id,
            }));
        }
        const getThread = vi.spyOn(threadCommentModel, 'getThread');

        const threads = threadCommentModel.getUnit('unit-1');

        expect(threads).toHaveLength(1_000);
        expect(threads.every((thread) => thread.children.length === 1)).toBe(true);
        expect(getThread).not.toHaveBeenCalled();
    });

    it('removes replies that disappeared from the remote thread', async () => {
        lifecycleService.stage = LifecycleStages.Rendered;
        const root = createComment({ id: 'pruned-root' });
        const keepReply = createComment({ id: 'keep-reply', parentId: root.id, threadId: root.threadId });
        const removedReply = createComment({ id: 'removed-reply', parentId: root.id, threadId: root.threadId });
        threadCommentModel.addComment('unit-1', 'sheet-1', root);
        threadCommentModel.addComment('unit-1', 'sheet-1', keepReply);
        threadCommentModel.addComment('unit-1', 'sheet-1', removedReply);
        dataSourceService.dataSource = {
            addComment: vi.fn(),
            updateComment: vi.fn(),
            resolveComment: vi.fn(),
            deleteComment: vi.fn(),
            listComments: vi.fn(async () => [{ ...root, children: [keepReply] }]),
            saveCommentToSnapshot: vi.fn(),
        };

        await threadCommentModel.syncThreadComments('unit-1', 'sheet-1', [root.threadId]);

        expect(threadCommentModel.getThread('unit-1', 'sheet-1', root.threadId)?.children).toEqual([{ ...keepReply, ref: '' }]);
        expect(threadCommentModel.getComment('unit-1', 'sheet-1', removedReply.id)).toBeUndefined();
    });

    it('ignores a duplicate add instead of overwriting a newer edit', () => {
        const root = createComment({ id: 'duplicate-root', text: createBody('original') });
        threadCommentModel.addComment('unit-1', 'sheet-1', root);
        threadCommentModel.updateComment('unit-1', 'sheet-1', {
            commentId: root.id,
            text: createBody('edited'),
        });

        threadCommentModel.addComment('unit-1', 'sheet-1', root);

        expect(threadCommentModel.getComment('unit-1', 'sheet-1', root.id)?.text).toEqual(createBody('edited'));
    });

    it('updates refs, exposes thread lookups, and deletes all comments in a unit', () => {
        lifecycleService.stage = LifecycleStages.Rendered;

        const root = createComment({ id: 'root-2', personId: 'owner' });
        const reply = createComment({
            id: 'reply-2',
            parentId: 'root-2',
            threadId: 'root-2',
            personId: 'guest',
            ref: '',
        });
        const otherRoot = createComment({ id: 'root-3', subUnitId: 'sheet-2' });

        threadCommentModel.addComment('unit-1', 'sheet-1', root);
        threadCommentModel.addComment('unit-1', 'sheet-1', reply);
        threadCommentModel.addComment('unit-1', 'sheet-2', otherRoot);

        const events: CommentUpdate[] = [];
        const subscription = threadCommentModel.commentUpdate$.subscribe((event) => events.push(event));

        expect(threadCommentModel.updateCommentRef('unit-1', 'sheet-1', {
            commentId: 'root-2',
            ref: 'C5',
        })).toBe(true);
        expect(threadCommentModel.updateCommentRef('unit-1', 'sheet-1', {
            commentId: 'missing',
            ref: 'D6',
        })).toBe(false);

        expect(threadCommentModel.getCommentWithChildren('unit-1', 'sheet-1', 'reply-2')).toEqual({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            threadId: 'root-2',
            root: {
                ...root,
                ref: 'C5',
            },
            children: [reply],
            relativeUsers: new Set(['owner', 'guest']),
        });
        expect(threadCommentModel.getAll()).toEqual([
            {
                unitId: 'unit-1',
                threads: [
                    {
                        unitId: 'unit-1',
                        subUnitId: 'sheet-1',
                        threadId: 'root-2',
                        root: {
                            ...root,
                            ref: 'C5',
                        },
                        children: [reply],
                        relativeUsers: new Set(['owner', 'guest']),
                    },
                    {
                        unitId: 'unit-1',
                        subUnitId: 'sheet-2',
                        threadId: 'root-3',
                        root: otherRoot,
                        children: [],
                        relativeUsers: new Set(['user-1']),
                    },
                ],
            },
        ]);

        threadCommentModel.deleteUnit('unit-1');
        subscription.unsubscribe();

        expect(threadCommentModel.getUnit('unit-1')).toEqual([]);
        expect(events.filter((event) => event.type === 'updateRef')).toEqual([
            {
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                type: 'updateRef',
                payload: {
                    commentId: 'root-2',
                    ref: 'C5',
                },
                threadId: 'root-2',
                silent: undefined,
            },
        ]);
        expect(events.filter((event) => event.type === 'delete').map((event) => event.payload.commentId)).toEqual([
            'root-2',
            'reply-2',
            'root-3',
        ]);
    });

    it('queries threads by anchor kind, author, subunit, and resolved status', () => {
        const recordComment = createComment({
            id: 'record-comment',
            personId: 'owner',
            ref: serializeThreadCommentAnchor({
                kind: ThreadCommentAnchorKind.BASE_RECORD,
                tableId: 'table-1',
                recordId: 'record-1',
            }),
            resolved: false,
        });
        const reply = createComment({
            id: 'record-reply',
            parentId: recordComment.id,
            threadId: recordComment.threadId,
            personId: 'agent',
            ref: '',
        });
        const positionComment = createComment({
            id: 'position-comment',
            subUnitId: 'sheet-2',
            ref: serializeThreadCommentAnchor({
                kind: ThreadCommentAnchorKind.BOARD_POSITION,
                x: 10,
                y: 20,
            }),
            resolved: true,
        });

        threadCommentModel.addComment('unit-1', 'sheet-1', recordComment);
        threadCommentModel.addComment('unit-1', 'sheet-1', reply);
        threadCommentModel.addComment('unit-1', 'sheet-2', positionComment);

        expect(threadCommentModel.query({
            anchorKinds: [ThreadCommentAnchorKind.BASE_RECORD],
            authorIds: ['agent'],
            resolved: false,
            subUnitIds: ['sheet-1'],
        }).map((thread) => thread.threadId)).toEqual([recordComment.threadId]);
        expect(threadCommentModel.query({ authorIds: ['missing'] })).toEqual([]);
    });

    it('keeps a long reply thread complete and ordered', () => {
        const root = createComment({ id: 'long-thread' });
        threadCommentModel.addComment('unit-1', 'sheet-1', root);

        for (let index = 0; index < 100; index += 1) {
            threadCommentModel.addComment('unit-1', 'sheet-1', createComment({
                id: `reply-${index}`,
                parentId: root.id,
                threadId: root.threadId,
                ref: '',
            }));
        }

        const thread = threadCommentModel.getThread('unit-1', 'sheet-1', root.threadId);
        expect(thread?.children).toHaveLength(100);
        expect(thread?.children.map((comment) => comment.id)).toEqual(
            Array.from({ length: 100 }, (_, index) => `reply-${index}`)
        );
    });
});
