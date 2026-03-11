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

import { describe, expect, it, vi } from 'vitest';

import { DeleteDocCommentComment } from '../delete-doc-comment.command';

vi.mock('@univerjs/core', async () => {
    const actual = await vi.importActual<typeof import('@univerjs/core')>('@univerjs/core');
    return {
        ...actual,
        sequenceExecute: vi.fn(async () => ({ result: true })),
    };
});

vi.mock('@univerjs/docs-ui', () => ({
    deleteCustomDecorationFactory: vi.fn(() => ({ id: 'do-mutation' })),
}));

describe('DeleteDocCommentComment', () => {
    it('should delete decoration via sequenceExecute', async () => {
        const commandService = {};
        const accessor = {
            get: vi.fn(() => commandService),
        } as any;

        const ok = await DeleteDocCommentComment.handler(accessor, { unitId: 'doc-1', commentId: 'c1' });
        expect(ok).toBe(true);
    });

    it('should return false when missing params', async () => {
        const ok = await DeleteDocCommentComment.handler({ get: vi.fn() } as any, undefined as any);
        expect(ok).toBe(false);
    });
});
