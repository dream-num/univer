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

import type { IThreadComment } from '@univerjs/thread-comment';
import { describe, expect, it } from 'vitest';
import { getThreadCommentPanelItemKey, isSameThreadCommentTarget, shouldClearThreadCommentTarget } from '../util';

describe('getThreadCommentPanelItemKey', () => {
    it('returns unique keys for comments with empty ids', () => {
        const comments = [
            {
                id: '',
                unitId: 'unit-1',
                subUnitId: 'sub-unit-1',
                threadId: '',
                ref: 'A1',
                dT: '',
            },
            {
                id: '',
                unitId: 'unit-1',
                subUnitId: 'sub-unit-1',
                threadId: '',
                ref: 'A1',
                dT: '',
            },
        ] as IThreadComment[];

        const keys = comments.map((comment, index) => getThreadCommentPanelItemKey(comment, index, 'unsolved'));

        expect(new Set(keys).size).toBe(keys.length);
        expect(keys).not.toContain('');
    });

    it('keeps persisted comment ids as keys', () => {
        const comment = {
            id: 'comment-1',
            unitId: 'unit-1',
            subUnitId: 'sub-unit-1',
        } as IThreadComment;

        expect(getThreadCommentPanelItemKey(comment, 0, 'unsolved')).toBe('comment-1');
    });
});

describe('isSameThreadCommentTarget', () => {
    const comment = { id: 'comment-1', unitId: 'unit-1', subUnitId: 'sub-unit-1' } as IThreadComment;

    it('requires the unit, subunit, and comment ids to match', () => {
        expect(isSameThreadCommentTarget({ unitId: 'unit-1', subUnitId: 'sub-unit-1', commentId: 'comment-1' }, comment)).toBe(true);
        expect(isSameThreadCommentTarget({ unitId: 'unit-2', subUnitId: 'sub-unit-1', commentId: 'comment-1' }, comment)).toBe(false);
        expect(isSameThreadCommentTarget({ unitId: 'unit-1', subUnitId: 'sub-unit-2', commentId: 'comment-1' }, comment)).toBe(false);
    });
});

describe('shouldClearThreadCommentTarget', () => {
    it('clears deleted targets and targets from a previously active unit', () => {
        expect(shouldClearThreadCommentTarget({ unitId: 'unit-1' }, 'unit-1', true)).toBe(false);
        expect(shouldClearThreadCommentTarget({ unitId: 'unit-1' }, 'unit-1', false)).toBe(true);
        expect(shouldClearThreadCommentTarget({ unitId: 'unit-1' }, 'unit-2', true)).toBe(true);
        expect(shouldClearThreadCommentTarget(undefined, 'unit-1', false)).toBe(false);
    });
});
