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
import { beforeAll, describe, expect, it } from 'vitest';
import type { IJSON1WriteCursor, JSON1Document, JSONXActions, JSONXPath } from '../json1';
import { JSONX } from '../../../docs/data-model/json-x/json-x';
import { TextXActionType } from '../../../docs/data-model/text-x/action-types';
import { TextX } from '../../../docs/data-model/text-x/text-x';
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
            let peerBatch: JSONXActions = null;
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
                expect(JSON1.apply(snapshot, readPeer)).toEqual(after);
                expect(JSON1.apply(after, upstream.invertWithDoc(readLocal, snapshot))).toEqual(snapshot);
                expect(upstream.apply(after, JSON1.invertWithDoc(readPeer, snapshot))).toEqual(snapshot);
                batch = JSON1.compose(batch, readPeer);
                peerBatch = upstream.compose(peerBatch, readLocal);
                expect(batch).toEqual(peerBatch);
                snapshot = after;
            }
            const replay = rebuild(batch, JSON1.readCursor, JSON1.writeCursor());
            upstream.checkValidOp(replay);
            expect(replay).toStrictEqual(batch);
            expect(upstream.apply(before, replay)).toEqual(snapshot);
            expect(JSON1.apply(before, peerBatch)).toEqual(snapshot);
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

/** Operations and snapshots cross the network and history store as JSON. */
function wire<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
}

describe('JSON1 mixed-version history and collaboration', () => {
    beforeAll(() => upstream.registerSubtype(TextX));

    it('replays persisted revisions, exchanges undo operations and redoes the original history', () => {
        const initial = {
            rows: [{ id: 'a', value: false }, { id: 'b', value: null }],
            archive: [],
            title: 'A🤖文',
            count: 0,
            body: { dataStream: 'hello\r\n', customBlocks: [], customRanges: [] },
        };
        // Frozen wire examples include compact deletion, pick/drop, numeric, Unicode and document edits.
        const revisions: JSONXActions[] = [
            [['archive', 0, { d: 0 }], ['rows', 0, { p: 0 }]],
            [['count', { ena: 3 }], ['title', { es: [1, { d: 1 }, '新'] }]],
            ['body', { et: 'text-x', e: [{ t: 'r', len: 2 }, { t: 'd', len: 2 }] }],
            ['rows', 0, { r: true }],
        ];
        expect(JSONX.getInstance().removeOp(['rows', 0])).toEqual(revisions[3]);
        for (const [author, peer] of [[JSON1, upstream], [upstream, JSON1]] as const) {
            let snapshot: JSON1Document = wire(initial);
            let authorBatch: JSONXActions = null;
            let peerBatch: JSONXActions = null;
            const previous: JSON1Document[] = [];
            const undos: JSONXActions[] = [];
            for (const op of revisions) {
                previous.push(wire(snapshot));
                const invertible = author.makeInvertible(wire(op), wire(snapshot));
                const undo = peer.invert(wire(invertible));
                expect(undo).toEqual(author.invertWithDoc(wire(op), wire(snapshot)));
                undos.push(undo);
                authorBatch = author.compose(authorBatch, wire(op));
                peerBatch = peer.compose(peerBatch, wire(op));
                const next: JSON1Document = peer.apply(wire(snapshot), wire(op))!;
                expect(author.apply(wire(snapshot), wire(op))).toEqual(next);
                snapshot = next;
            }
            expect(snapshot).toMatchObject({
                rows: [],
                archive: [{ id: 'a', value: false }],
                title: 'A新文',
                count: 3,
                body: { dataStream: 'heo\r\n' },
            });
            expect(authorBatch).toEqual(peerBatch);
            expect(peer.apply(wire(initial), wire(authorBatch))).toEqual(snapshot);
            expect(author.apply(wire(initial), wire(peerBatch))).toEqual(snapshot);
            const final = wire(snapshot);
            for (let i = undos.length - 1; i >= 0; i--) {
                snapshot = author.apply(snapshot, wire(undos[i]))!;
                expect(snapshot).toEqual(previous[i]);
            }
            for (const redo of revisions) {
                snapshot = peer.apply(snapshot, wire(redo))!;
            }
            expect(snapshot).toEqual(final);
        }
    });

    it('replays sparse document bodies with the same TextX undo serialization as older clients', () => {
        const sparse = { body: { dataStream: 'abc\r\n' } };
        const deletion: JSONXActions = ['body', { et: 'text-x', e: [{ t: 'r', len: 1 }, { t: 'd', len: 1 }] }];
        const historicalUndo = upstream.invertWithDoc(wire(deletion), wire(sparse));
        const oldAfter = upstream.apply(wire(sparse), wire(deletion));
        const expected = upstream.apply(wire(oldAfter), wire(historicalUndo));
        const localAfter = JSON1.apply(wire(sparse), wire(deletion));
        expect(JSON1.apply(wire(localAfter), wire(historicalUndo))).toEqual(expected);
        expect(upstream.apply(wire(oldAfter), JSON1.invertWithDoc(wire(deletion), wire(sparse)))).toEqual(expected);
        expect(expected).toMatchObject({ body: { dataStream: sparse.body.dataStream } });
    });

    it('keeps remote edits when undoing and redoing a concurrent move and rich-text insertion', () => {
        const initial = { body: { dataStream: 'ab\r\n', customBlocks: [], customRanges: [] }, rows: [{ id: 'A' }, { id: 'B' }] };
        const leftInsert = JSONX.getInstance().editOp([
            { t: TextXActionType.RETAIN, len: 1 },
            { t: TextXActionType.INSERT, len: 1, body: { dataStream: 'L' } },
        ]);
        const rightInsert: JSONXActions = ['body', { et: 'text-x', e: [
            { t: 'r', len: 1 },
            { t: 'i', len: 1, body: { dataStream: 'R' } },
        ] }];
        for (const [left, right] of [[JSON1, upstream], [upstream, JSON1]] as const) {
            const move = moveOp(['rows', 0], ['rows', 1]);
            const leftOp = left.compose(move, wire(leftInsert));
            const rightOp = right.compose(replaceOp(['rows', 0, 'id'], 'A', 'A*'), wire(rightInsert));
            const afterLeft = left.apply(wire(initial), wire(leftOp))!;
            const afterRight = right.apply(wire(initial), wire(rightOp))!;
            const leftPrime = left.transform(wire(leftOp), wire(rightOp), 'left')!;
            const rightPrime = right.transform(wire(rightOp), wire(leftOp), 'right')!;
            const merged = right.apply(wire(afterRight), wire(leftPrime))!;
            expect(left.apply(wire(afterLeft), wire(rightPrime))).toEqual(merged);
            expect(merged).toMatchObject({ body: { dataStream: 'aLRb\r\n' }, rows: [{ id: 'B' }, { id: 'A*' }] });
            expect(left.transformPosition(['rows', 0, 'id'], move)).toEqual(['rows', 1, 'id']);
            const undo = left.invertWithDoc(wire(leftPrime), wire(afterRight));
            expect(right.apply(wire(merged), wire(undo))).toEqual(afterRight);
            const redo = right.invertWithDoc(wire(undo), wire(merged));
            expect(left.apply(wire(afterRight), wire(redo))).toEqual(merged);
        }
    });

    const conflicts: Array<{ name: string; type: number; doc: JSON1Document; left: JSONXActions; right: JSONXActions }> = [
        { name: 'competing insertions', type: upstream.DROP_COLLISION, doc: {}, left: insertOp(['a'], 1), right: insertOp(['a'], 2) },
        { name: 'removal against a nested edit', type: upstream.RM_UNEXPECTED_CONTENT, doc: { a: {} }, left: removeOp(['a']), right: insertOp(['a', 'x'], 1) },
        { name: 'cyclic moves', type: upstream.BLACKHOLE, doc: { a: {}, b: {} }, left: moveOp(['a'], ['b', 'a']), right: moveOp(['b'], ['a', 'b']) },
    ];

    it.each(conflicts)('exchanges conflict details and converges under an accepting policy for $name', ({ type, doc, left, right }) => {
        const detected = upstream.tryTransform(left, right, 'left');
        expect(detected.ok).toBe(false);
        if (detected.ok) {
            throw new Error('Expected the reference engine to report a conflict');
        }
        expect(detected.conflict.type).toBe(type);
        const detail = { name: 'writeConflict', type: 'writeConflict', conflict: detected.conflict };
        expect(() => JSON1.transform(left, right, 'left')).toThrowError(expect.objectContaining(detail));
        expect(() => JSON1.createTransform(() => false)(left, right, 'left')).toThrowError(expect.objectContaining(detail));

        const allow = (conflict: { type: number }) => conflict.type === type;
        const local = JSON1.createTransform(allow);
        const old = upstream.typeAllowingConflictsPred(allow).transform;
        const leftPrime = local(wire(left), wire(right), 'left');
        const rightPrime = old(wire(right), wire(left), 'right');
        expect(old(wire(left), wire(right), 'left')).toEqual(leftPrime);
        expect(JSON1.transformNoConflict(wire(right), wire(left), 'right')).toEqual(rightPrime);
        const appliedLeft = JSON1.apply(wire(doc), wire(left));
        const appliedRight = upstream.apply(wire(doc), wire(right));
        expect(JSON1.apply(appliedLeft, wire(rightPrime))).toEqual(upstream.apply(appliedRight, wire(leftPrime)));
    });

    it('preserves replay errors for invalid Unicode changes and incomplete undo data', () => {
        const cases: Array<(engine: typeof JSON1 | typeof upstream) => unknown> = [
            (engine) => engine.apply(2, [{ es: ['x'] }]),
            (engine) => engine.apply('text', [{ es: [1, 1, 'x'] }]),
            (engine) => engine.apply('text', [{ es: [1] }]),
            (engine) => engine.invert([{ es: [{ d: 1 }] }]),
        ];
        for (const run of cases) {
            let reference: unknown;
            try {
                run(upstream);
            } catch (error) {
                reference = error;
            }
            expect(reference).toBeInstanceOf(Error);
            expect(() => run(JSON1)).toThrowError(expect.objectContaining({
                name: (reference as Error).name,
                message: (reference as Error).message,
            }));
        }
    });

    it('rejects malformed persisted moves and out-of-order branches in both engines', () => {
        for (const op of [
            ['rows', 0, { p: 0 }],
            [['a', { p: 1 }], ['b', { d: 1 }]],
            [['b', { i: 1 }], ['a', { i: 2 }]],
        ] satisfies JSONXActions[]) {
            for (const engine of [JSON1, upstream]) {
                expect(() => engine.checkValidOp(wire(op))).toThrow();
                expect(() => engine.apply({}, wire(op))).toThrow();
            }
        }
    });
});
