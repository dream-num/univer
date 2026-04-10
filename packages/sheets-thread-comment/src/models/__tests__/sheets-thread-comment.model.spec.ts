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

import { UniverInstanceType } from '@univerjs/core';
import { Subject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { SheetsThreadCommentModel } from '../sheets-thread-comment.model';

function createComment(overrides: Record<string, unknown> = {}) {
    return {
        id: 'comment-1',
        threadId: 'thread-1',
        ref: 'A1',
        dT: '2025-01-01T00:00:00.000Z',
        personId: 'user-1',
        text: { dataStream: 'hello\r\n', textRuns: [] },
        attachments: [],
        unitId: 'unit-1',
        subUnitId: 'sheet-1',
        resolved: false,
        ...overrides,
    } as any;
}

describe('SheetsThreadCommentModel', () => {
    it('should build location indexes from existing root comments and expose thread data', () => {
        const root = createComment();
        const reply = createComment({ id: 'reply-1', parentId: root.id, ref: '', resolved: false });
        const thread = { ...root, children: [reply] };
        const updates$ = new Subject<any>();
        const threadCommentModel = {
            getAll: () => [{ threads: [{ unitId: 'unit-1', subUnitId: 'sheet-1', root }] }],
            commentUpdate$: updates$,
            getComment: (_unitId: string, _subUnitId: string, commentId: string) => {
                if (commentId === root.id) {
                    return root;
                }
                if (commentId === reply.id) {
                    return reply;
                }
                return null;
            },
            getThread: () => thread,
            getUnit: () => [{ subUnitId: 'sheet-1', root }],
        };
        const univerInstanceService = {
            getUnitType: () => UniverInstanceType.UNIVER_SHEET,
        };

        const model = new SheetsThreadCommentModel(threadCommentModel as any, univerInstanceService as any);

        expect(model.getByLocation('unit-1', 'sheet-1', 0, 0)).toBe(root.id);
        expect(model.getAllByLocation('unit-1', 'sheet-1', 0, 0)).toEqual([root]);
        expect(model.getCommentWithChildren('unit-1', 'sheet-1', 0, 0)).toEqual(thread);
        expect(model.showCommentMarker('unit-1', 'sheet-1', 0, 0)).toBe(true);
        expect(model.getSubUnitAll('unit-1', 'sheet-1')).toEqual([root]);

        model.dispose();
    });

    it('should transform thread updates into sheet-aware locations and keep indexes in sync', () => {
        const addComment = createComment();
        const movedComment = createComment({ ref: 'D4' });
        const updates$ = new Subject<any>();
        const commentStore = new Map<string, any>();

        const threadCommentModel = {
            getAll: () => [],
            commentUpdate$: updates$,
            getComment: (_unitId: string, _subUnitId: string, commentId: string) => commentStore.get(commentId),
            getThread: () => null,
            getUnit: () => [],
        };
        const univerInstanceService = {
            getUnitType: (unitId: string) => (unitId === 'doc-unit' ? UniverInstanceType.UNIVER_DOC : UniverInstanceType.UNIVER_SHEET),
        };

        const model = new SheetsThreadCommentModel(threadCommentModel as any, univerInstanceService as any);
        const received: Array<any> = [];
        const subscription = model.commentUpdate$.subscribe((update) => received.push(update));

        commentStore.set(addComment.id, addComment);
        updates$.next({ type: 'add', unitId: 'unit-1', subUnitId: 'sheet-1', payload: addComment });

        expect(model.getByLocation('unit-1', 'sheet-1', 0, 0)).toBe(addComment.id);
        expect(received.at(-1)).toEqual(expect.objectContaining({ type: 'add', row: 0, column: 0, isRoot: true }));

        updates$.next({ type: 'update', unitId: 'unit-1', subUnitId: 'sheet-1', payload: { commentId: addComment.id } });
        expect(received.at(-1)).toEqual(expect.objectContaining({ type: 'update', row: 0, column: 0 }));

        commentStore.set(addComment.id, movedComment);
        updates$.next({ type: 'updateRef', unitId: 'unit-1', subUnitId: 'sheet-1', payload: { commentId: addComment.id, ref: 'D4' } });

        expect(model.getByLocation('unit-1', 'sheet-1', 0, 0)).toBeUndefined();
        expect(model.getByLocation('unit-1', 'sheet-1', 3, 3)).toBe(addComment.id);
        expect(received.at(-1)).toEqual(expect.objectContaining({ type: 'updateRef', row: 3, column: 3 }));

        commentStore.set(addComment.id, { ...movedComment, resolved: true });
        updates$.next({ type: 'resolve', unitId: 'unit-1', subUnitId: 'sheet-1', payload: { commentId: addComment.id, resolved: true } });

        expect(received.at(-1)).toEqual(expect.objectContaining({ type: 'resolve', row: 3, column: 3 }));
        expect(model.getByLocation('unit-1', 'sheet-1', 3, 3)).toBeUndefined();
        expect(model.showCommentMarker('unit-1', 'sheet-1', 3, 3)).toBe(false);

        updates$.next({
            type: 'delete',
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            payload: { isRoot: true, comment: movedComment },
        });

        expect(model.getAllByLocation('unit-1', 'sheet-1', 3, 3)).toEqual([]);
        expect(received.at(-1)).toEqual(expect.objectContaining({ type: 'delete', row: 3, column: 3 }));

        updates$.next({ type: 'add', unitId: 'doc-unit', subUnitId: 'sheet-1', payload: createComment({ id: 'doc-comment', ref: 'B2' }) });
        expect(model.getByLocation('doc-unit', 'sheet-1', 1, 1)).toBeUndefined();

        subscription.unsubscribe();
        model.dispose();
    });
});
