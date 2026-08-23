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
import {
    deserializeThreadCommentAnchor,
    serializeThreadCommentAnchor,
    ThreadCommentAnchorKind,
} from '../comment-anchor';

describe('thread comment anchor', () => {
    it('round trips every supported anchor shape', () => {
        const anchors = [
            { kind: ThreadCommentAnchorKind.SHEET_DRAWING, elementId: 'drawing-1' },
            { kind: ThreadCommentAnchorKind.DOC_DRAWING, elementId: 'drawing-2' },
            { kind: ThreadCommentAnchorKind.SLIDE_ELEMENT, pageId: 'page-1', elementId: 'shape-1' },
            { kind: ThreadCommentAnchorKind.SLIDE_POSITION, pageId: 'page-1', x: 0.25, y: 0.75 },
            { kind: ThreadCommentAnchorKind.BOARD_ELEMENT, elementId: 'shape-2' },
            { kind: ThreadCommentAnchorKind.BOARD_POSITION, x: 120, y: -30 },
            { kind: ThreadCommentAnchorKind.BASE_RECORD, tableId: 'table-1', recordId: 'record-1' },
        ] as const;

        anchors.forEach((anchor) => {
            expect(deserializeThreadCommentAnchor(serializeThreadCommentAnchor(anchor))).toEqual(anchor);
        });
    });

    it('rejects legacy and malformed refs without throwing', () => {
        expect(deserializeThreadCommentAnchor('A1')).toBeNull();
        expect(deserializeThreadCommentAnchor('univer-comment-anchor:{bad')).toBeNull();
        expect(deserializeThreadCommentAnchor('univer-comment-anchor:{"v":1,"anchor":{"kind":"base-record"}}')).toBeNull();
    });
});
