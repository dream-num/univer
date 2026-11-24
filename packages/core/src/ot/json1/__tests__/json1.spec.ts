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
import type { JSON1Document, JSONXActions, JSONXPath } from '../json1';
import { JSONX } from '../../../docs/data-model/json-x/json-x';
import { JSON1, registerJSON1Subtype } from '../json1';

function wire<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
}

describe('document changesets', () => {
    it('replays stored revisions and restores each revision on undo and redo', () => {
        const initial = {
            rows: [{ id: 'A', enabled: false }, { id: 'B', enabled: null }],
            archive: [],
            count: 0,
            title: 'A🤖文',
            body: { dataStream: 'hello\r\n', customBlocks: [], customRanges: [] },
        };
        const revisions: JSONXActions[] = [
            [['archive', 0, { d: 0 }], ['rows', 0, { p: 0 }]],
            [['count', { ena: 3 }], ['title', { es: [1, { d: 1 }, '新'] }]],
            ['body', { et: 'text-x', e: [{ t: 'r', len: 2 }, { t: 'd', len: 2 }] }],
            ['rows', 0, { r: true }],
        ];
        expect(JSONX.getInstance().removeOp(['rows', 0])).toEqual(revisions[3]);
        let snapshot: JSON1Document = wire(initial);
        const previous: JSON1Document[] = [];
        const undo: JSONXActions[] = [];
        for (const op of revisions) {
            previous.push(wire(snapshot));
            undo.push(JSON1.invert(wire(JSON1.makeInvertible(op, snapshot))));
            snapshot = JSON1.apply(snapshot, wire(op))!;
        }
        const final = wire(snapshot);
        expect(final).toMatchObject({
            rows: [],
            archive: [{ id: 'A', enabled: false }],
            count: 3,
            title: 'A新文',
            body: { dataStream: 'heo\r\n' },
        });
        for (let i = undo.length - 1; i >= 0; i--) {
            snapshot = JSON1.apply(snapshot, wire(undo[i]))!;
            expect(snapshot).toEqual(previous[i]);
        }
        const batch = revisions.reduce(JSON1.compose, null);
        expect(JSON1.apply(wire(snapshot), wire(batch))).toEqual(final);
        expect(JSON1.apply(final, JSON1.invertWithDoc(batch, initial))).toEqual(initial);
    });

    it('replays and undoes Unicode edits across paired and unpaired surrogates', () => {
        const before = 'A😀e\u0301\uD800B\uDC00尾';
        const edit: JSONXActions = [{ es: [1, { d: 1 }, '🐈', 2, { d: 1 }, '甲', 1, { d: 1 }] }];
        const after = JSON1.apply(before, wire(edit))!;
        expect(after).toBe('A🐈e\u0301甲B尾');
        expect(JSON1.apply(after, wire(JSON1.invertWithDoc(edit, before)))).toBe(before);
        expect(() => JSON1.apply(before, [{ es: [8, { d: 1 }] }])).toThrow('Text edit extends past the source');
    });

    it('preserves remote edits when undoing a move and a concurrent document-body edit', () => {
        const initial = { rows: [{ id: 'A' }, { id: 'B' }], body: { dataStream: 'ab\r\n', customBlocks: [], customRanges: [] } };
        const insert = (s: string): JSONXActions => ['body', { et: 'text-x', e: [
            { t: 'r', len: 1 },
            { t: 'i', len: 1, body: { dataStream: s } },
        ] }];
        const move = JSON1.moveOp(['rows', 0], ['rows', 1]);
        const left = JSON1.compose(move, insert('L'));
        const right = JSON1.compose(JSON1.replaceOp(['rows', 0, 'id'], 'A', 'A*'), insert('R'));
        const afterRight = JSON1.apply(wire(initial), right)!;
        const afterLeft = JSON1.apply(wire(initial), left)!;
        const rebased = JSON1.transform(left, right, 'left');
        const merged = JSON1.apply(wire(afterRight), rebased)!;
        expect(merged).toMatchObject({ rows: [{ id: 'B' }, { id: 'A*' }], body: { dataStream: 'aLRb\r\n' } });
        expect(JSON1.apply(wire(afterLeft), JSON1.transform(right, left, 'right'))).toEqual(merged);
        expect(JSON1.transformPosition(['rows', 0, 'id'], move)).toEqual(['rows', 1, 'id']);
        const undo = JSON1.invertWithDoc(rebased, afterRight);
        expect(JSON1.apply(wire(merged), undo)).toEqual(afterRight);
        expect(JSON1.apply(wire(afterRight), JSON1.invertWithDoc(undo, merged))).toEqual(merged);
    });

    it('replays composed record changes against an independent array model', () => {
        type Tables = Record<string, Array<{ value: JSON1Document }>>;
        const initial: Tables = { active: [{ value: 0 }], archive: [{ value: 1 }] };
        const values = [false, 0, '', null, { label: '文' }];
        for (let seed = 1; seed <= 24; seed++) {
            let state = seed;
            const choose = (n: number) => {
                state = (Math.imul(1664525, state) + 1013904223) >>> 0;
                return Math.floor(state / 0x100000000 * n);
            };
            const model = wire(initial);
            let history: JSONXActions = null;
            for (let step = 0; step < 40; step++) {
                const before = wire(model);
                const table = choose(2) ? 'active' : 'archive';
                const rows = model[table];
                const index = choose(rows.length);
                const path = [table, index];
                const value = values[choose(values.length)];
                let op: JSONXActions;
                switch (rows.length ? choose(4) : 0) {
                    case 0:
                        op = JSON1.insertOp(path, { value });
                        rows.splice(index, 0, { value });
                        break;
                    case 1:
                        op = JSON1.replaceOp([...path, 'value'], rows[index].value, value);
                        rows[index] = { value };
                        break;
                    case 2: {
                        const to = choose(2) ? 'active' : 'archive';
                        const [moved] = rows.splice(index, 1);
                        const dest = choose(model[to].length + 1);
                        op = JSON1.moveOp(path, [to, dest]);
                        model[to].splice(dest, 0, moved);
                        break;
                    }
                    default:
                        op = JSON1.removeOp(path);
                        rows.splice(index, 1);
                }
                history = JSON1.compose(history, wire(op));
                expect(JSON1.apply(initial, history)).toEqual(model);
                expect(JSON1.apply(model, JSON1.invertWithDoc(op, before))).toEqual(before);
            }
            expect(JSON1.apply(model, JSON1.invertWithDoc(history, initial))).toEqual(initial);
        }
    });

    it('replays a batch assembled by revisiting earlier rows in arbitrary order', () => {
        const writer = JSON1.writeCursor();
        const before = Array.from({ length: 127 }, () => ({ count: 0 }));
        for (let row = 0; row < before.length; row++) {
            const index = row * 71 % before.length;
            writer.writeAtPath([index, 'count'], 'ena', index + 1);
        }
        const batch = wire(writer.get());
        const after = JSON1.apply(before, batch)!;
        expect(after).toEqual(before.map((_, index) => ({ count: index + 1 })));
        expect(JSON1.apply(after, JSON1.invert(batch))).toEqual(before);
    });

    it('allows a collaboration filter to rewrite a component and rebuild a multi-slot move', () => {
        const writer = JSON1.writeCursor();
        writer.writeMove(['left', 0], ['right', 0], 0);
        writer.writeMove(['right', 0], ['left', 0], 1);
        writer.writeAtPath(['right', 0, 'id'], 'ena', 1);
        const reader = JSON1.readCursor(writer.get());
        const batch = JSON1.writeCursor();
        const paths: JSONXPath[] = [];
        reader.traverse(null, (component) => {
            const path = reader.getPath();
            paths.push(path);
            if (component.ena) {
                component.ena = 5;
            }
            batch.reset();
            batch.at(path, (w) => w.mergeTree([component]));
        });
        expect(paths).toEqual([['left', 0], ['right', 0], ['right', 0, 'id']]);
        const before = { left: [{ id: 1 }], right: [{ id: 2 }] };
        const after = { left: [{ id: 2 }], right: [{ id: 6 }] };
        expect(JSON1.apply(before, writer.get())).toEqual(after);
        expect(JSON1.apply(after, JSON1.invert(batch.get()))).toEqual(before);
    });

    it('resolves conflicts according to the collaboration policy and side', () => {
        const cases: Array<{ base: JSON1Document; a: JSONXActions; b: JSONXActions; kind: number; expected: JSON1Document }> = [
            { base: {}, a: JSON1.insertOp(['a'], 1), b: JSON1.insertOp(['a'], 2), kind: JSON1.DROP_COLLISION, expected: { a: 1 } },
            { base: { a: {} }, a: JSON1.removeOp(['a']), b: JSON1.insertOp(['a', 'x'], 1), kind: JSON1.RM_UNEXPECTED_CONTENT, expected: {} },
            { base: { a: {}, b: {} }, a: JSON1.moveOp(['a'], ['b', 'a']), b: JSON1.moveOp(['b'], ['a', 'b']), kind: 3, expected: {} },
        ];
        for (const { base, a, b, kind, expected } of cases) {
            expect(() => JSON1.transform(a, b, 'left')).toThrowError(expect.objectContaining({ conflict: expect.objectContaining({ type: kind }) }));
            const transform = JSON1.createTransform((c) => c.type === kind);
            expect(JSON1.apply(JSON1.apply(base, b), transform(a, b, 'left'))).toEqual(expected);
            expect(JSON1.apply(JSON1.apply(base, a), transform(b, a, 'right'))).toEqual(expected);
        }
    });

    it('passes a self-contained move to the conflict policy when only one destination collides', () => {
        const batch = JSON1.writeCursor();
        batch.writeMove(['x'], ['keep'], 0).writeMove(['y'], ['shared'], 1);
        const insertion = JSON1.insertOp(['shared'], 3);
        const base = { x: 1, y: 2 };
        const resolve = JSON1.createTransform(({ op1, op2 }) => {
            JSON1.checkValidOp(op1);
            expect(JSON1.apply(base, op1)).toEqual({ x: 1, shared: 2 });
            expect(op2).toEqual(insertion);
            return true;
        });
        const after = JSON1.apply(base, insertion);
        expect(JSON1.apply(after, resolve(batch.get(), insertion, 'left'))).toEqual({ keep: 1, shared: 2 });
    });

    it('drops a move from a concurrently deleted subtree without inserting a placeholder', () => {
        const before = { meta: { name: 'title' }, archive: [] };
        const move = JSON1.moveOp(['meta', 'name'], ['archive', 0]);
        const replace = JSON1.replaceOp(['meta'], before.meta, { version: 2 });
        const expected = { meta: { version: 2 }, archive: [] };
        expect(JSON1.apply(JSON1.apply(before, replace), JSON1.transform(move, replace, 'left'))).toEqual(expected);
        expect(JSON1.apply(JSON1.apply(before, move), JSON1.transform(replace, move, 'right'))).toEqual(expected);
    });

    it('isolates a removal from a move into the same table property when consulting the document policy', () => {
        const before = { archive: [{ name: 'incoming' }], tableSource: { active: { name: 'old' } } };
        const move: JSONXActions = [['archive', 0, { p: 0 }], ['tableSource', 'active', { r: true, d: 0 }]];
        const rename = JSON1.replaceOp(['tableSource', 'active', 'name'], 'old', 'remote');
        const resolve = JSON1.createTransform(({ op1, op2 }) => op1?.[0] === 'tableSource' && op2?.[0] === 'tableSource');
        expect(JSON1.apply(JSON1.apply(before, rename), resolve(move, rename, 'left'))).toEqual({
            archive: [],
            tableSource: { active: { name: 'incoming' } },
        });
    });

    it('preserves removals inside a moved collection after its original parent is deleted', () => {
        const before = { rows: [{ children: [{ n: 3 }] }], saved: [] };
        const move = JSON1.moveOp(['rows', 0, 'children'], ['saved', 0]);
        const trim = JSON1.removeOp(['saved', 0, 0, 'n'], 3);
        const dropParent = JSON1.removeOp(['rows', 0], {});
        const history = JSON1.compose(JSON1.compose(move, trim), dropParent);
        expect(JSON1.apply(before, history)).toEqual({ rows: [], saved: [[{}]] });
        expect(JSON1.apply({ rows: [], saved: [[{}]] }, JSON1.invertWithDoc(history, before))).toEqual(before);
    });

    it('keeps both clients from restoring a collection moved into a concurrently deleted row', () => {
        const before = { rows: [{ id: 'A', children: ['K'] }, { id: 'B', children: [] }] };
        const lift: JSONXActions = ['rows', [0, { d: 0 }, 'children', { p: 0 }], [1, { r: true }]];
        const nest: JSONXActions = ['rows', [0, 'children', { p: 0 }], [1, 'children', 0, { i: {} }, 'nested', { d: 0 }]];
        const expected = { rows: [{ id: 'A' }] };
        expect(JSON1.apply(JSON1.apply(before, nest), JSON1.transformNoConflict(lift, nest, 'left'))).toEqual(expected);
        expect(JSON1.apply(JSON1.apply(before, lift), JSON1.transformNoConflict(nest, lift, 'right'))).toEqual(expected);
    });

    it('removes a value moved out of a collection when both destinations are lost', () => {
        const before: JSON1Document = { group: [{ v: 1 }, {}], archive: [], saved: {} };
        const archive: JSONXActions = [['archive', 0, { d: 0 }], ['group', { p: 0 }, 1, { r: true }]];
        const relocate: JSONXActions = [
            ['archive', { p: 1 }],
            ['group', [0, 'v', { p: 0 }], [1, 'links', { d: 1 }]],
            ['saved', 'v', { d: 0 }],
        ];
        const afterRelocate = JSON1.apply(before, relocate);
        const afterArchive = JSON1.apply(before, archive);
        expect(JSON1.apply(afterRelocate, JSON1.transformNoConflict(archive, relocate, 'left'))).toEqual({ saved: {} });
        expect(JSON1.apply(afterArchive, JSON1.transformNoConflict(relocate, archive, 'right'))).toEqual({ saved: {} });
    });

    it('keeps the winning move outside a cycle even when the other client moves the same row into it', () => {
        const before: JSON1Document = { rows: [{ cells: [{ n: 1 }, { n: 2 }] }, { id: 'B', cells: [{ n: 3 }] }], saved: {} };
        const nest: JSONXActions = ['rows', [0, ['cells', [0, { d: 0 }], [1, { p: 1 }, 'sibling', { d: 1 }]], ['copy', { d: 2 }]], [1, { p: 0 }, 'cells', { p: 2 }]];
        const save: JSONXActions = [
            ['rows', { p: 1 }, 1, { p: 0 }],
            ['saved', 'row', { d: 0 }, 'cells', 0, 'rows', { d: 1 }],
        ];
        const expected = { saved: { row: { id: 'B' } } };
        expect(JSON1.apply(JSON1.apply(before, save), JSON1.transformNoConflict(nest, save, 'right'))).toEqual(expected);
        expect(JSON1.apply(JSON1.apply(before, nest), JSON1.transformNoConflict(save, nest, 'left'))).toEqual(expected);
    });

    it('consults the removal policy when a moved and edited value loses its parent', () => {
        const before: JSON1Document = { rows: [{ n: 1 }, {}], saved: {} };
        const transfer: JSONXActions = ['rows', [0, 'n', { p: 0 }], [1, 'n', { d: 0, ena: 2 }]];
        const save: JSONXActions = [['rows', [0, 'n', { p: 0 }], [1, { r: true }]], ['saved', 'n', { d: 0 }]];
        const afterSave = JSON1.apply(before, save);
        expect(() => JSON1.transform(transfer, save, 'left')).toThrowError(expect.objectContaining({
            conflict: expect.objectContaining({ type: JSON1.RM_UNEXPECTED_CONTENT }),
        }));
        expect(JSON1.apply(afterSave, JSON1.transformNoConflict(transfer, save, 'left'))).toEqual({ rows: [{}], saved: {} });
    });

    it('shares concurrent equal literals and reports a write conflict for different nested values', () => {
        const one = JSON1.insertOp(['row'], { name: 'A', cells: [0, false, null] });
        const same = JSON1.insertOp(['row'], { cells: [0, false, null], name: 'A' });
        const changed = JSON1.insertOp(['row'], { cells: [0, true, null], name: 'A' });
        expect(JSON1.transform(one, same, 'left')).toBeNull();
        expect(() => JSON1.transform(one, changed, 'left')).toThrowError(expect.objectContaining({
            conflict: expect.objectContaining({ type: JSON1.DROP_COLLISION }),
        }));
    });

    it('preserves a subtype edit for a third client that inserted the same literal after a reorder', () => {
        const before = { rows: [{ count: 0 }, { count: 8 }] };
        const reorder = JSON1.moveOp(['rows', 1], ['rows', 0]);
        const replace = JSON1.replaceOp(['rows', 0, 'count'], 0, 3);
        const increment = JSON1.compose(replace, ['rows', 0, 'count', { ena: 2 }]);
        const replaced = JSON1.transform(replace, reorder, 'right');
        const incremented = JSON1.transform(increment, reorder, 'left');
        const snapshot = JSON1.apply(JSON1.apply(before, reorder), replaced);
        expect(JSON1.apply(snapshot, JSON1.transform(incremented, replaced, 'right'))).toEqual({ rows: [{ count: 8 }, { count: 5 }] });
    });

    it('projects insertions and move picks into their respective history coordinates', () => {
        const before = { cells: ['A', 'B'], saved: [], count: 0 };
        const add: JSONXActions = [['cells', 0, { i: 'new' }], ['count', { ena: 1 }]];
        const move = JSON1.moveOp(['cells', 1], ['saved', 0]);
        expect(JSON1.apply(before, JSON1.compose(add, move))).toEqual({ cells: ['new', 'B'], saved: ['A'], count: 1 });
        const expected = { cells: ['new', 'A'], saved: ['B'], count: 1 };
        expect(JSON1.apply(JSON1.apply(before, add), JSON1.transform(move, add, 'right'))).toEqual(expected);
        expect(JSON1.apply(JSON1.apply(before, move), JSON1.transform(add, move, 'left'))).toEqual(expected);
    });

    it('replays the result recorded on each side of an overlapping group deletion', () => {
        const before: JSON1Document = { dest: {}, rows: [{}, { v: 1 }] };
        const archive: JSONXActions = [
            ['dest', 'rows', { d: 0 }],
            ['rows', { p: 0 }, [0, { r: true }], [1, 'v', { p: 1 }]],
            ['saved', { d: 1 }],
        ];
        const nest: JSONXActions = [['dest', { r: true }], ['rows', [0, 'nested', { d: 0 }], [1, { p: 0 }]]];
        const resolve = JSON1.createTransform((c) => c.type === JSON1.RM_UNEXPECTED_CONTENT);
        // Both snapshots occur in existing histories, depending on which edit was applied locally.
        expect(JSON1.apply(JSON1.apply(before, archive), resolve(nest, archive, 'right'))).toEqual({ saved: 1 });
        expect(JSON1.apply(JSON1.apply(before, nest), resolve(archive, nest, 'left'))).toEqual({});
    });

    it('preserves the conflict decision for a chain of alternating move destinations', () => {
        const before = { a: {}, b: {}, c: {}, d: {}, e: {} };
        const author = JSON1.compose(JSON1.compose(JSON1.moveOp(['a'], ['saved']), JSON1.moveOp(['c'], ['b', 'child'])), JSON1.moveOp(['e'], ['d', 'child']));
        const peer = JSON1.compose(JSON1.moveOp(['b'], ['a', 'child']), JSON1.moveOp(['d'], ['c', 'child']));
        const pending = JSON1.moveOp(['e'], ['d', 'child']);
        expect(() => JSON1.transform(author, peer, 'left')).toThrowError(expect.objectContaining({
            conflict: { type: 3, op1: pending, op2: null },
        }));
        expect(JSON1.apply(JSON1.apply(before, peer), JSON1.transformNoConflict(author, peer, 'left'))).toEqual({
            saved: { child: { child: { child: {} } } },
        });
        expect(JSON1.apply(JSON1.apply(before, author), JSON1.transform(peer, author, 'right'))).toEqual({
            saved: { child: { child: { child: { child: {} } } } },
        });
    });

    it('preserves recorded removals and uses the original snapshot when preparing full undo', () => {
        const before = { rows: [null, false, 2], count: 3 };
        const first = JSON1.compose(JSON1.removeOp(['rows', 0], null), ['count', { ena: 2 }]);
        const remove = JSON1.compose(JSON1.removeOp(['rows'], [false, 2]), JSON1.removeOp(['count'], 5));
        const batch = JSON1.compose(first, remove);
        expect(JSON1.apply(before, batch)).toEqual({});
        expect(JSON1.apply({}, JSON1.invert(wire(batch)))).toEqual({ rows: [null, false, 2], count: 5 });
        expect(JSON1.apply({}, JSON1.invertWithDoc(wire(batch), before))).toEqual(before);
    });

    it('keeps the caller snapshot intact when preparing undo for a mutating subtype', () => {
        const name = 'document-test-change-metadata';
        registerJSON1Subtype<Record<string, { count: number }>, number>({
            name,
            apply(metadata, delta) {
                Object.getOwnPropertyDescriptor(metadata, '__proto__')!.value.count += delta;
                return metadata;
            },
            invert: (delta) => -delta,
            compose: (a, b) => a + b,
            transform: (delta) => delta,
        });
        const before = { annotation: JSON.parse('{"__proto__":{"count":3}}'), removed: 'value' };
        const actions: JSONXActions = [['annotation', { et: name, e: 2 }], ['removed', { r: true }]];
        const undo = JSON1.invertWithDoc(actions, before);
        expect(Object.getOwnPropertyDescriptor(before.annotation, '__proto__')!.value.count).toBe(3);
        const edited = JSON1.apply(wire(before), actions);
        expect(JSON1.apply(edited, undo)).toEqual(before);
    });

    it('restores edits made within a new literal when redoing its insertion', () => {
        const op: JSONXActions = ['record', { i: { title: '🤖' } }, 'title', { es: [1, '!'] }];
        const undo = JSON1.invert(op);
        const after = JSON1.apply({}, op);
        expect(JSON1.apply(after, undo)).toEqual({});
        expect(JSON1.apply({}, JSON1.invert(undo))).toEqual({ record: { title: '🤖!' } });
        expect(JSON1.transformPosition(['title', 2], ['title', { es: [1, '🤖'] }])).toEqual(['title', 3]);
    });

    it('keeps insertions on opposite sides of an item moved past a concurrently deleted sibling', () => {
        const before = ['A', 'B'];
        const move = JSON1.moveOp([0], [1]);
        const edit = JSON1.compose(JSON1.removeOp([1], 'B'), JSON1.insertOp([0], 'X'));
        expect(JSON1.apply(JSON1.apply(before, move), JSON1.transform(edit, move, 'right'))).toEqual(['X', 'A']);
        expect(JSON1.apply(JSON1.apply(before, edit), JSON1.transform(move, edit, 'left'))).toEqual(['X', 'A']);
    });

    it('restores stored falsy root values and distinguishes a missing root from null', () => {
        for (const value of [null, false, 0, '', [1], { id: 'a' }]) {
            const op = JSON1.removeOp([], value);
            expect(JSON1.apply(value, op)).toBeUndefined();
            expect(JSON1.apply(JSON1.apply(value, op), JSON1.invert(op))).toEqual(value);
        }
    });

    it('rejects invalid stored operations before replay', () => {
        for (const op of [
            ['rows', 0, { p: 0 }],
            [['a', { p: 1 }], ['b', { d: 1 }]],
            [['b', { i: 1 }], ['a', { i: 2 }]],
            ['__proto__', { i: {} }],
        ] satisfies JSONXActions[]) {
            expect(() => JSON1.checkValidOp(op)).toThrow();
            expect(() => JSON1.apply({}, op)).toThrow();
        }
        expect(() => JSON1.apply(2, [{ es: ['x'] }])).toThrow();
        expect(() => JSON1.apply('abc', [{ es: [4, 'x'] }])).toThrow();
        expect(() => JSON1.invert([{ es: [{ d: 1 }] }])).toThrow();
    });
});
