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

import { ICommandService } from '@univerjs/core';

import { IThreadCommentDataSourceService } from '@univerjs/thread-comment';
import { describe, expect, it, vi } from 'vitest';
import { AddDocCommentComment } from '../add-doc-comment.command';

vi.mock('@univerjs/core', async () => {
    const actual = await vi.importActual<typeof import('@univerjs/core')>('@univerjs/core');
    return {
        ...actual,
        sequenceExecute: vi.fn(async () => ({ result: true })),
    };
});

vi.mock('@univerjs/docs-ui', () => ({
    addCustomDecorationBySelectionFactory: vi.fn(() => ({ id: 'do-mutation' })),
}));

describe('AddDocCommentComment', () => {
    it('should add comment and attach decoration via sequenceExecute', async () => {
        const dataSource = {
            addComment: vi.fn(async (c) => ({ ...c, id: 'comment-1', threadId: 'thread-1' })),
        };
        const commandService = {};
        const accessor = {
            get: (token: any) => {
                if (token === IThreadCommentDataSourceService) return dataSource;
                if (token === ICommandService) return commandService;
                return null;
            },
        };

        const ok = await AddDocCommentComment.handler(accessor as any, {
            unitId: 'doc-1',
            range: { startOffset: 1, endOffset: 2, collapsed: false },
            comment: { id: '', threadId: '', unitId: 'doc-1', subUnitId: 'default_doc', ref: '' } as any,
        });

        expect(ok).toBe(true);
        expect(dataSource.addComment).toHaveBeenCalled();
    });

    it('should return false when missing params', async () => {
        const ok = await AddDocCommentComment.handler({ get: vi.fn() } as any, undefined as any);
        expect(ok).toBe(false);
    });
});
