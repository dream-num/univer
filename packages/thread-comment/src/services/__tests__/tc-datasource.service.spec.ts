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
import { describe, expect, it, vi } from 'vitest';
import { ThreadCommentDataSourceService } from '../tc-datasource.service';

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

describe('ThreadCommentDataSourceService', () => {
    it('falls back to local defaults when no external data source is configured', async () => {
        const service = new ThreadCommentDataSourceService();
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

    it('delegates CRUD, query and snapshot behavior to the configured data source', async () => {
        const service = new ThreadCommentDataSourceService();
        const comment = createComment({ id: 'root-1' });

        const dataSource = {
            addComment: vi.fn(async (input: IThreadComment) => ({ ...input, threadId: 'server-thread' })),
            updateComment: vi.fn(async () => false),
            resolveComment: vi.fn(async () => false),
            deleteComment: vi.fn(async () => false),
            listComments: vi.fn(async () => [{
                ...comment,
                children: [createComment({ id: 'reply-1', parentId: 'root-1', threadId: 'root-1', ref: '' })],
            }]),
            saveCommentToSnapshot: vi.fn((input: IThreadComment) => ({
                id: input.id,
                threadId: input.threadId,
                ref: input.ref,
                personId: input.personId,
            })),
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

        expect(dataSource.listComments).toHaveBeenNthCalledWith(1, 'unit-1', 'sheet-1', ['root-1']);
        expect(dataSource.listComments).toHaveBeenNthCalledWith(2, 'unit-1', 'sheet-1', ['root-1']);
        expect(dataSource.saveCommentToSnapshot).toHaveBeenCalledWith(comment, 0, [comment]);
    });
});
