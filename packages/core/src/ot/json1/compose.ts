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
import type { IEdit } from './operation';
import type { Value } from './revision';
import { JSON1WriteCursor } from './cursor';
import { editComponent } from './operation';
import { Revision } from './revision';

function parentIn(revision: Revision, value: Value, set: Set<Value>) {
    let parent = revision.location(value)?.parent;
    while (parent && parent !== revision.root) {
        if (set.has(parent)) {
            return true;
        }
        parent = revision.location(parent)?.parent;
    }
    return false;
}

/** Order paths in the same numeric and property order as the changeset writer. */
export function comparePath(a: JSONXPath, b: JSONXPath) {
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        if (a[i] === b[i]) {
            continue;
        }
        if (typeof a[i] !== typeof b[i]) {
            return typeof a[i] === 'number' ? -1 : 1;
        }
        return a[i] < b[i] ? -1 : 1;
    }
    return a.length - b.length;
}

/** Encode the structural difference between two revisions. Sibling index shifts do not create moves. */
export function difference(source: Revision, target: Revision, edits: Map<Value, IEdit>): JSONXActions {
    const writer = new JSON1WriteCursor();
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
    const hints = new Map([...source.records, ...target.records]);
    const sorted = Array.from(moved).sort((a, b) => comparePath(from.get(a)!, from.get(b)!));
    for (const [slot, value] of sorted.entries()) {
        writer.writeMove(from.get(value)!, to.get(value)!, slot);
    }
    for (const value of removed) {
        if (!parentIn(source, value, removed)) {
            writer.writeAtPath(from.get(value)!, 'r', source.literal(value, moved, hints));
        }
    }
    for (const value of inserted) {
        if (!parentIn(target, value, inserted)) {
            writer.writeAtPath(to.get(value)!, 'i', target.literal(value, moved, hints));
        }
    }
    for (const [value, edit] of edits) {
        const path = target.path(value);
        if (path && source.path(value)) {
            writer.reset();
            writer.at(path, (w) => w.mergeTree([editComponent(edit)]));
        }
    }
    return writer.get();
}

/** Combine consecutive changes by following the identities they cut, edit or reattach. */
export function compose(first: JSONXActions, second: JSONXActions) {
    if (!first || !second) {
        return first ?? second;
    }
    const base = new Revision();
    const final = base.copy().replay(first).replay(second);
    return difference(base, final, final.edits);
}
