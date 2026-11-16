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

import { describe, expect, it } from 'vitest';
import type { IThreadComment } from '../../types/interfaces/i-thread-comment';
import { isThreadCommentPermissionAllowed } from '../comment-permission';

function createComment(id: string): IThreadComment {
    return {
        id,
        threadId: id,
        ref: 'A1',
        dT: '2024-01-01T00:00:00.000Z',
        personId: 'user-1',
        text: { dataStream: `${id}\r\n` },
        unitId: 'unit-1',
        subUnitId: 'sheet-1',
    };
}

describe('isThreadCommentPermissionAllowed', () => {
    const comment = createComment('comment-1');

    it('allows the action when the rule is omitted or true', () => {
        expect(isThreadCommentPermissionAllowed(undefined, comment)).toBe(true);
        expect(isThreadCommentPermissionAllowed(true, comment)).toBe(true);
    });

    it('refuses the action when the rule is false', () => {
        expect(isThreadCommentPermissionAllowed(false, comment)).toBe(false);
    });

    it('evaluates a per-comment function', () => {
        const allowOnlyComment1 = (item: IThreadComment) => item.id === 'comment-1';

        expect(isThreadCommentPermissionAllowed(allowOnlyComment1, comment)).toBe(true);
        expect(isThreadCommentPermissionAllowed(allowOnlyComment1, createComment('comment-2'))).toBe(false);
    });
});
