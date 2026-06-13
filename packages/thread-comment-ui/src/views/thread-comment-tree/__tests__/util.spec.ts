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

import { DOCS_COMMENT_EDITOR_UNIT_ID_KEY } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { ThreadCommentTreeLocation } from '../../ThreadCommentTree';
import { getThreadCommentEditorId } from '../util';

describe('getThreadCommentEditorId', () => {
    it('returns different editor ids for different comments in the same location', () => {
        const first = getThreadCommentEditorId({
            location: ThreadCommentTreeLocation.PANEL,
            unitId: 'unit-1',
            subUnitId: 'sub-unit-1',
            commentId: 'comment-1',
            fallbackId: 'fallback',
        });
        const second = getThreadCommentEditorId({
            location: ThreadCommentTreeLocation.PANEL,
            unitId: 'unit-1',
            subUnitId: 'sub-unit-1',
            commentId: 'comment-2',
            fallbackId: 'fallback',
        });

        expect(first).not.toBe(second);
        expect(first.startsWith(DOCS_COMMENT_EDITOR_UNIT_ID_KEY)).toBe(true);
    });

    it('uses the fallback id when the comment id is empty', () => {
        expect(getThreadCommentEditorId({
            location: ThreadCommentTreeLocation.PANEL,
            unitId: 'unit-1',
            subUnitId: 'sub-unit-1',
            commentId: '',
            fallbackId: 'fallback-1',
        })).toBe(`${DOCS_COMMENT_EDITOR_UNIT_ID_KEY}_PANEL_unit-1_sub-unit-1_fallback-1`);
    });
});
