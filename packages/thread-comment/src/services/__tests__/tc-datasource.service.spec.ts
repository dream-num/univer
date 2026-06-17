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
import type { IThreadComment } from '../../types/interfaces/i-thread-comment';
import type { IThreadCommentDataSource } from '../tc-datasource.service';
import { Injector } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { IThreadCommentDataSourceService, ThreadCommentDataSourceService } from '../tc-datasource.service';

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

function createService(): IThreadCommentDataSourceService {
    const injector = new Injector();
    injector.add([IThreadCommentDataSourceService, { useClass: ThreadCommentDataSourceService }]);
    return injector.get(IThreadCommentDataSourceService);
}

describe('ThreadCommentDataSourceService', () => {
    it('falls back to local defaults when no external data source is configured', async () => {
        const service = createService();
        const comment = createComment({ threadId: undefined });

        await expect(service.addComment({ ...comment, threadId: undefined as unknown as string })).resolves.toEqual({
            ...comment,
            threadId: comment.id,
        });
        await expect(service.updateComment(comment)).resolves.toBe(true);
        await expect(service.resolveComment(comment)).resolves.toBe(true);
        await expect(service.deleteComment('unit-1', 'sheet-1', 'thread-1', 'comment-1')).resolves.toBe(true);
        await expect(service.getThreadComment('unit-1', 'sheet-1', 'thread-1')).resolves.toBeNull();
        await expect(service.listThreadComments('unit-1', 'sheet-1', ['thread-1'])).resolves.toBe(false);

        const snapshot = service.saveToSnapshot({
            'sheet-1': [comment],
        }, 'unit-1');

        expect(snapshot).toEqual({
            'sheet-1': [comment],
        });
    });

    it('normalizes an empty threadId to the comment id when no external data source is configured', async () => {
        const service = createService();
        const comment = createComment({ id: 'root-1', threadId: '' });

        await expect(service.addComment(comment)).resolves.toEqual({
            ...comment,
            threadId: 'root-1',
        });
    });

    it('delegates CRUD, query and snapshot behavior to the configured data source', async () => {
        const service = createService();
        const comment = createComment({ id: 'root-1' });
        const listRequests: Array<{ unitId: string; subUnitId: string; threadIds: string[] }> = [];
        const savedSnapshots: IThreadComment[] = [];
        const dataSource: IThreadCommentDataSource = {
            async addComment(input) {
                return { ...input, threadId: 'server-thread' };
            },
            async updateComment() {
                return false;
            },
            async resolveComment() {
                return false;
            },
            async deleteComment() {
                return false;
            },
            async listComments(unitId, subUnitId, threadIds) {
                listRequests.push({ unitId, subUnitId, threadIds });
                return [{
                    ...comment,
                    children: [createComment({ id: 'reply-1', parentId: 'root-1', threadId: 'root-1', ref: '' })],
                }];
            },
            saveCommentToSnapshot(input) {
                savedSnapshots.push(input);
                return {
                    id: input.id,
                    threadId: input.threadId,
                    ref: input.ref,
                    personId: input.personId,
                };
            },
        };
        service.dataSource = dataSource;

        await expect(service.addComment(comment)).resolves.toEqual({
            ...comment,
            threadId: 'server-thread',
        });
        await expect(service.updateComment(comment)).resolves.toBe(false);
        await expect(service.resolveComment(comment)).resolves.toBe(false);
        await expect(service.deleteComment('unit-1', 'sheet-1', 'root-1', 'root-1')).resolves.toBe(false);
        await expect(service.getThreadComment('unit-1', 'sheet-1', 'root-1')).resolves.toEqual({
            ...comment,
            children: [createComment({ id: 'reply-1', parentId: 'root-1', threadId: 'root-1', ref: '' })],
        });
        await expect(service.listThreadComments('unit-1', 'sheet-1', ['root-1'])).resolves.toEqual([
            {
                ...comment,
                children: [createComment({ id: 'reply-1', parentId: 'root-1', threadId: 'root-1', ref: '' })],
            },
        ]);
        expect(service.saveToSnapshot({
            'sheet-1': [comment],
        }, 'unit-1')).toEqual({
            'sheet-1': [
                {
                    id: 'root-1',
                    threadId: 'root-1',
                    ref: 'A1',
                    personId: 'user-1',
                },
            ],
        });

        expect(listRequests).toEqual([
            { unitId: 'unit-1', subUnitId: 'sheet-1', threadIds: ['root-1'] },
            { unitId: 'unit-1', subUnitId: 'sheet-1', threadIds: ['root-1'] },
        ]);
        expect(savedSnapshots).toEqual([comment]);
    });

    it('normalizes an empty threadId returned from an external data source to the returned comment id', async () => {
        const service = createService();
        const comment = createComment({ id: 'client-id', threadId: '' });
        const dataSource: IThreadCommentDataSource = {
            async addComment(input) {
                return { ...input, id: 'server-id', threadId: '' };
            },
            async updateComment() {
                return true;
            },
            async resolveComment() {
                return true;
            },
            async deleteComment() {
                return true;
            },
            async listComments() {
                return [];
            },
            saveCommentToSnapshot(input) {
                return {
                    id: input.id,
                    threadId: input.threadId,
                    ref: input.ref,
                };
            },
        };
        service.dataSource = dataSource;

        await expect(service.addComment(comment)).resolves.toEqual({
            ...comment,
            id: 'server-id',
            threadId: 'server-id',
        });
    });
});
