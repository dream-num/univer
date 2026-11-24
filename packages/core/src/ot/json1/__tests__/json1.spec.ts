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

import { type as upstream } from 'ot-json1';
import { describe, expect, it } from 'vitest';
import { JSON1 } from '../json1';

describe('JSON1 changesets', () => {
    it('rebases a peer edit onto a moved record and tracks its selection', () => {
        const before = { rows: [{ name: 'A' }, { name: 'B' }] };
        const move = JSON1.moveOp(['rows', 0], ['rows', 1]);
        const edit = JSON1.replaceOp(['rows', 0, 'name'], 'A', 'edited');
        const afterMove = JSON1.transform(edit, move, 'right');
        const afterEdit = JSON1.transform(move, edit, 'left');
        const expected = { rows: [{ name: 'B' }, { name: 'edited' }] };

        // Either peer may still produce or consume changesets with the upstream engine.
        expect(afterMove).toEqual(upstream.transform(edit, move, 'right'));
        expect(upstream.apply(upstream.apply(before, move), afterMove)).toEqual(expected);
        expect(JSON1.apply(before, JSON1.compose(edit, afterEdit))).toEqual(expected);
        expect(JSON1.transformPosition(['rows', 0, 'name'], move)).toEqual(['rows', 1, 'name']);
        expect(JSON1.transformPosition(['rows', 0, 'name'], JSON1.removeOp(['rows', 0]))).toBeNull();
    });

    it('replays a stored multi-path changeset and restores falsy values on undo', () => {
        const before = { active: false, count: 0, note: null, title: '' };
        const stored = [['active', { r: false }], ['count', { r: 0 }], ['note', { r: null }], ['title', { r: '' }]];
        const writer = JSON1.writeCursor();
        const reader = JSON1.readCursor(stored);
        reader.traverse(null, (component) => {
            const path = reader.getPath();
            writer.at(path, (cursor) => cursor.mergeTree([component]));
        });

        const redo = writer.get();
        expect(JSON1.apply(before, redo)).toEqual({});
        expect(upstream.apply({}, JSON1.invert(redo))).toEqual(before);
        expect(JSON1.apply({}, upstream.invertWithDoc(stored, before))).toEqual(before);
        for (const [key, value] of Object.entries(before)) {
            const remove = JSON1.removeOp([key], value);
            expect(JSON1.apply({}, JSON1.invert(remove))).toEqual({ [key]: value });
        }
    });

    it('resolves concurrent insertions by priority only when the conflict policy allows it', () => {
        const first = JSON1.insertOp(['title'], 'first');
        const second = JSON1.insertOp(['title'], 'second');
        const allowInsertCollision = JSON1.createTransform((conflict) => conflict.type === JSON1.DROP_COLLISION);
        const allowRemoveConflict = JSON1.createTransform((conflict) => conflict.type === JSON1.RM_UNEXPECTED_CONTENT);

        expect(() => JSON1.transform(first, second, 'left')).toThrow();
        expect(() => allowRemoveConflict(first, second, 'left')).toThrow();
        const left = allowInsertCollision(first, second, 'left');
        const right = allowInsertCollision(second, first, 'right');
        expect(JSON1.apply(JSON1.apply({}, second), left)).toEqual({ title: 'first' });
        expect(JSON1.apply(JSON1.apply({}, first), right)).toEqual({ title: 'first' });
    });
});
