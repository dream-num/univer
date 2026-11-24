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

import type { JSONXActions, JSONXPath } from './json1';
import type { IEdit, IEntry } from './operation';
import type { Value } from './revision';
import { combineIndependent } from './batch';
import { JSON1WriteCursor } from './cursor';
import { separateReorders, singleMove } from './move';
import { atEdit, comparePath, editComponent, encode, entries, getEdit, independentBranches, singleEdit } from './operation';
import { Revision } from './revision';

function parentIn(revision: Revision, value: Value, set: Set<Value>, moved: Set<Value>) {
    let parent = revision.location(value)?.parent;
    while (parent && parent !== revision.root && !moved.has(parent)) {
        if (set.has(parent)) {
            return true;
        }
        parent = revision.location(parent)?.parent;
    }
    return false;
}

/** Encode the structural difference between two revisions. Sibling index shifts do not create moves. */
export function difference(source: Revision, target: Revision, edits: Map<Value, IEdit>, author?: Revision): JSONXActions {
    const changes: IEntry[] = [];
    const removed = new Set<Value>();
    const inserted = new Set<Value>();
    const moved = new Set<Value>();
    const from = new Map<Value, JSONXPath>();
    const to = new Map<Value, JSONXPath>();
    for (const value of new Set([...source.locations.keys(), ...target.locations.keys()])) {
        const start = source.path(value);
        const end = target.path(value);
        if (start) {
            from.set(value, start);
        }
        if (end) {
            to.set(value, end);
        }
        if (!start && end) {
            inserted.add(value);
        }
        if (start && !end) {
            removed.add(value);
        }
        if (start && end && source.locations.get(value)?.action !== target.locations.get(value)?.action) {
            const before = source.location(value)!;
            const after = target.location(value)!;
            if (before.parent !== after.parent || before.key !== after.key || typeof after.key === 'number') {
                moved.add(value);
            }
        }
    }
    const hints = source.records.size ? new Map([...source.records, ...target.records]) : target.records;
    const sorted = Array.from(moved).sort((a, b) => comparePath(to.get(a)!, to.get(b)!));
    for (const [slot, value] of sorted.entries()) {
        changes.push({ path: from.get(value)!, component: { p: slot } }, { path: to.get(value)!, component: { d: slot } });
    }
    for (const value of removed) {
        // A peer move within a concurrently removed subtree is covered by the
        // ancestor cut. A separately authored child removal stays in the journal.
        if (author && author.locations.get(value) !== null && parentIn(source, value, removed, moved)) {
            continue;
        }
        const recorded = hints.get(value);
        changes.push({ path: from.get(value)!, component: { r: author || recorded === undefined ? true : recorded } });
    }
    const placements = inserted.size ? new Set([...inserted, ...moved]) : moved;
    for (const value of inserted) {
        // Separate incoming children and subtype edits retain their own identity on the wire.
        // A later peer may insert the very same literal and still need to receive its edit.
        changes.push({ path: to.get(value)!, component: { i: target.literal(value, placements, hints, undefined, false) } });
    }
    for (const [value, edit] of edits) {
        const path = target.path(value);
        if (path) {
            const component = editComponent(edit);
            if (Object.keys(component).length) {
                changes.push({ path, component });
            }
        }
    }
    return encode(changes);
}

/** Combine consecutive changes by following the identities they cut, edit or reattach. */
export function compose(first: JSONXActions, second: JSONXActions): JSONXActions {
    if (!first || !second) {
        return first ?? second;
    }
    const a = entries(first);
    const b = entries(second);
    if (independentBranches(a, b)) {
        return encode([a[0], b[0]]);
    }
    const earlier = singleEdit(a);
    const later = singleEdit(b);
    if (earlier && later && earlier.type === later.type && comparePath(a[0].path, b[0].path) === 0) {
        return atEdit(a[0].path, earlier.type, earlier.type.compose(earlier.payload, later.payload));
    }
    if (a.length === 1 && b.length === 1 && !earlier && !later && comparePath(a[0].path, b[0].path) === 0) {
        const { component: x, path } = a[0];
        const y = b[0].component;
        if (!getEdit(x) && !getEdit(y)) {
            // An insert followed by its removal cancels. A replacement leaves the original removal.
            if (x.i !== undefined && y.r !== undefined) {
                const component = { ...(x.r === undefined ? {} : { r: x.r }), ...(y.i === undefined ? {} : { i: y.i }) };
                return Object.keys(component).length ? [...path, component] : null;
            }
            if (x.r !== undefined && x.i === undefined && y.i !== undefined && y.r === undefined) {
                return [...path, { r: x.r, i: y.i }];
            }
        }
    }
    const firstMove = singleMove(a);
    const secondMove = singleMove(b);
    if (firstMove && secondMove && separateReorders(firstMove, secondMove)) {
        const slot = comparePath(firstMove.to, secondMove.to) < 0 ? 0 : 1;
        return new JSON1WriteCursor().writeMove(firstMove.from, firstMove.to, slot).writeMove(secondMove.from, secondMove.to, 1 - slot).get();
    }
    const independent = combineIndependent(a, b);
    if (independent !== undefined) {
        return independent;
    }
    const base = new Revision();
    const final = new Revision(base.root).replay(a).replay(b);
    return difference(base, final, final.edits);
}
