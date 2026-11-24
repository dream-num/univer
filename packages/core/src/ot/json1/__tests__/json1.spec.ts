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

import { insertOp, moveOp, removeOp, replaceOp, type as upstream } from 'ot-json1';
import { describe, expect, it } from 'vitest';
import type { IJSON1WriteCursor, JSON1Document, JSONXActions, JSONXPath } from '../json1';
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

/** Rebuild a peer's operation one component at a time, as collaboration filters do. */
function rebuild(op: JSONXActions, readerFactory: typeof JSON1.readCursor, writer: IJSON1WriteCursor) {
    const reader = readerFactory(op);
    reader.traverse(null, (component) => {
        expect(reader.getComponent()).toBe(component);
        writer.reset();
        writer.at(reader.getPath(), (destination) => destination.mergeTree([component]));
    });
    expect(reader.getPath()).toEqual([]);
    return writer.get();
}

describe('JSON1 cursor interoperability', () => {
    it('round-trips root edits, edits beneath inserted objects, moves and subtype payloads in both directions', () => {
        const operations: JSONXActions[] = [
            null,
            [{ r: false, i: null }],
            ['rows', { i: [] }, [0, { i: { label: 'A' } }], [1, { i: { label: 'B' } }]],
            [['from', 0, { p: 0 }], ['to', 0, { d: 0 }, 'label', { es: [1, '!'] }]],
            [['body', { et: 'text-x', e: [{ t: 'r', len: 1 }] }], ['count', { ena: 1 }]],
            ['grid', [2, 'value', { r: 0 }], [10, { i: 0 }], ['10', { i: '' }], ['2', { i: false }]],
        ];

        for (const op of operations) {
            expect(JSON1.readCursor(op).getComponent()).toEqual(upstream.readCursor(op).getComponent());
            const fromPeer = rebuild(op, upstream.readCursor, JSON1.writeCursor());
            const fromCore = rebuild(op, JSON1.readCursor, upstream.writeCursor());
            expect(fromPeer).toStrictEqual(op);
            expect(fromCore).toStrictEqual(op);
        }
    });

    it('retains visited paths and edits the original peer component for replay', () => {
        const before = { rows: [{ title: 'A' }, { title: 'B' }] };
        for (const createReader of [JSON1.readCursor, upstream.readCursor]) {
            const op = upstream.compose(replaceOp(['rows', 0, 'title'], 'A', 'a'), replaceOp(['rows', 1, 'title'], 'B', 'b'));
            const reader = createReader(op);
            const visited: JSONXPath[] = [];
            reader.traverse(null, (component) => {
                const path = reader.getPath();
                visited.push(path);
                if (path[1] === 1) {
                    component.i = 'changed';
                }
            });
            expect(visited).toEqual([['rows', 0, 'title'], ['rows', 1, 'title']]);
            expect(upstream.apply(before, op)).toEqual({ rows: [{ title: 'a' }, { title: 'changed' }] });
        }
    });

    it('can keep building a batch after reading it, resetting sibling order, and merging a relative subtree', () => {
        function build(writer: IJSON1WriteCursor) {
            writer.descendPath(['unused', 0]);
            writer.ascend();
            writer.ascend();
            expect(writer.get()).toBeNull();

            writer.descend('records');
            writer.at(['a'], (w) => w.write('i', { count: 0 }));
            const first = writer.get();
            writer.at(['c'], (w) => w.write('i', { count: 2 }));
            writer.reset();
            writer.at(['b'], (w) => w.mergeTree([{ i: {} }, 'count', { i: 1 }]));
            writer.ascend();
            writer.reset();
            writer.writeMove(['order', 0], ['order', 2]);
            // A caller holding an earlier get() result still sees the completed batch.
            expect(first).toBe(writer.get());
            return writer.get();
        }

        const local = build(JSON1.writeCursor());
        const peer = build(upstream.writeCursor());
        expect(local).toStrictEqual(peer);
        upstream.checkValidOp(local);
        const before = { records: {}, order: ['b', 'c', 'a'] };
        const after = { records: { a: { count: 0 }, b: { count: 1 }, c: { count: 2 } }, order: ['c', 'a', 'b'] };
        expect(upstream.apply(before, local)).toEqual(after);
        expect(upstream.apply(after, upstream.invertWithDoc(rebuild(peer, JSON1.readCursor, JSON1.writeCursor()), before))).toEqual(before);
    });

    it('preserves the writer guards against overwrites, self-merges and unbalanced ascent', () => {
        for (const create of [JSON1.writeCursor, upstream.writeCursor]) {
            const writer = create();
            expect(() => writer.ascend()).toThrow();
            writer.writeAtPath(['count'], 'i', 0);
            expect(() => writer.writeAtPath(['count'], 'i', 1)).toThrow();
            expect(() => writer.mergeTree(writer.get())).toThrow();

            const ordered = create();
            ordered.at(['a'], (w) => w.write('i', 1));
            ordered.at(['c'], (w) => w.write('i', 3));
            expect(() => ordered.at(['b'], (w) => w.write('i', 2))).toThrow();
        }
    });

    it('keeps the writer at its original path if a requested descent contains a reserved key', () => {
        const writer = JSON1.writeCursor();
        writer.descend('settings');
        expect(() => writer.descendPath(['partial', '__proto__'])).toThrow();
        writer.write('i', { zoom: 2 });
        expect(upstream.apply({}, writer.get())).toEqual({ settings: { zoom: 2 } });
    });

    it('replays mixed-version record histories and undoes the composed changeset', () => {
        const before = { active: [{ value: 0 }], archived: [{ value: 1 }] };
        const values = [false, 0, '', null, { label: '文本' }];
        for (let seed = 1; seed <= 24; seed++) {
            let state = seed;
            const choose = (size: number) => {
                state = (Math.imul(1664525, state) + 1013904223) >>> 0;
                return Math.floor(state / 0x100000000 * size);
            };
            let snapshot: JSON1Document = before;
            let batch: JSONXActions = null;
            for (let step = 0; step < 40; step++) {
                const tables = snapshot as Record<string, Array<{ value: JSON1Document }>>;
                const table = choose(2) ? 'active' : 'archived';
                const rows = tables[table];
                const index = choose(rows.length);
                const path: JSONXPath = [table, index];
                const value = values[choose(values.length)];
                let local: JSONXActions;
                let peer: JSONXActions;
                switch (rows.length ? choose(4) : 0) {
                    case 0:
                        local = JSON1.insertOp(path, { value });
                        peer = insertOp(path, { value });
                        break;
                    case 1:
                        local = JSON1.replaceOp([...path, 'value'], rows[index].value, value);
                        peer = replaceOp([...path, 'value'], rows[index].value, value);
                        break;
                    case 2: {
                        const to = choose(2) ? 'active' : 'archived';
                        const destination = [to, choose(tables[to].length + (table === to ? 0 : 1))];
                        local = JSON1.moveOp(path, destination);
                        peer = moveOp(path, destination);
                        break;
                    }
                    default:
                        local = JSON1.removeOp(path);
                        peer = removeOp(path);
                }

                expect(local).toStrictEqual(peer);
                const readPeer = rebuild(peer, JSON1.readCursor, JSON1.writeCursor());
                const readLocal = rebuild(local, upstream.readCursor, upstream.writeCursor());
                const after: JSON1Document = upstream.apply(snapshot, readLocal)!;
                expect(upstream.apply(snapshot, readPeer)).toEqual(after);
                expect(upstream.apply(after, upstream.invertWithDoc(readPeer, snapshot))).toEqual(snapshot);
                batch = upstream.compose(batch, step % 2 ? readPeer : readLocal);
                snapshot = after;
            }
            const replay = rebuild(batch, JSON1.readCursor, JSON1.writeCursor());
            upstream.checkValidOp(replay);
            expect(replay).toStrictEqual(batch);
            expect(upstream.apply(before, replay)).toEqual(snapshot);
            expect(upstream.apply(snapshot, upstream.invertWithDoc(replay, before))).toEqual(before);
        }
    });

    it('can exchange two moves with distinct slots in the same changeset', () => {
        const from = { left: ['A', 'B'], right: ['C', 'D'] };
        const to = { left: ['C', 'B'], right: ['A', 'D'] };
        function exchange(writer: IJSON1WriteCursor) {
            writer.writeMove(['left', 0], ['right', 0], 0);
            writer.writeMove(['right', 0], ['left', 0], 1);
            return writer.get();
        }

        const local = exchange(JSON1.writeCursor());
        const peer = exchange(upstream.writeCursor());
        expect(local).toStrictEqual(peer);
        expect(upstream.apply(from, local)).toEqual(to);
        expect(upstream.apply(to, upstream.invert(rebuild(peer, JSON1.readCursor, JSON1.writeCursor())))).toEqual(from);
    });

    it('preserves root construction and recorded removals of every JSON value kind', () => {
        for (const value of [null, false, 0, '', [1], { id: 'a' }]) {
            expect(JSON1.insertOp([], value)).toEqual(insertOp([], value));
            expect(JSON1.replaceOp([], value, false)).toEqual(replaceOp([], value, false));
            const removed = JSON1.removeOp([], value);
            expect(removed).toEqual(upstream.writeCursor().writeAtPath([], 'r', value).get());
            const empty = upstream.apply(value, removed);
            expect(empty).toBeUndefined();
            expect(upstream.apply(empty, upstream.invert(removed))).toEqual(value);
        }
        expect(JSON1.moveOp(['order', 2], ['order', 2])).toEqual(moveOp(['order', 2], ['order', 2]));
    });
});
