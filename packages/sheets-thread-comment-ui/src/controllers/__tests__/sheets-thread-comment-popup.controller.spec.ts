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
import { resolveFocusedSheetComment } from '../sheets-thread-comment-popup.controller';

describe('resolveFocusedSheetComment', () => {
    const activeComment = {
        unitId: 'book-1',
        subUnitId: 'sheet-1',
        commentId: 'active-comment',
    };

    it('prefers a hovered comment from the current sheet', () => {
        const hoveredComment = {
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            commentId: 'hovered-comment',
        };

        expect(resolveFocusedSheetComment(activeComment, hoveredComment, 'book-1', 'sheet-1'))
            .toEqual(hoveredComment);
    });

    it('keeps the active highlight when hover belongs to another sheet or workbook', () => {
        expect(resolveFocusedSheetComment(activeComment, {
            unitId: 'book-1',
            subUnitId: 'sheet-2',
            commentId: 'foreign-hover',
        }, 'book-1', 'sheet-1')).toEqual(activeComment);
        expect(resolveFocusedSheetComment(activeComment, {
            unitId: 'book-2',
            subUnitId: 'sheet-1',
            commentId: 'foreign-hover',
        }, 'book-1', 'sheet-1')).toEqual(activeComment);
    });

    it('does not draw a stale highlight outside the current sheet context', () => {
        expect(resolveFocusedSheetComment(activeComment, undefined, 'book-1', 'sheet-2')).toBeUndefined();
    });
});
