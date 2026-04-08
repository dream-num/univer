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
        await new Promise((resolve) => setTimeout(resolve, 0));
        await new Promise((resolve) => setTimeout(resolve, 0));

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

        expect(threadCommentModel.getThread('unit-1', 'sheet-1', 'keep-root')).toBeDefined();
        expect(threadCommentModel.getThread('unit-1', 'sheet-2', 'remove-root')).toBeUndefined();
        expect(threadCommentModel.getUnit('unit-1').map((thread) => thread.threadId)).toEqual(['keep-root']);
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
});
