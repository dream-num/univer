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

import { isEqual } from 'lodash-es';
import type { IJSON1Conflict, JSONXActions, JSONXPath } from './json1';
import type { IEdit } from './operation';
import type { Value } from './revision';
import { comparePath, difference } from './compose';
import { JSON1WriteCursor } from './cursor';
import { entries } from './operation';
import { Revision } from './revision';

type Side = 'left' | 'right';
type Policy = (conflict: IJSON1Conflict) => boolean;

/** Conflicts that a document collaboration policy can elect to resolve. */
export enum DocumentConflict {
    Removal = 1,
    Destination = 2,
    Cycle = 3,
}

type Report = (type: DocumentConflict, high: JSONXPath, low: JSONXPath) => void;

/** Isolate the conflicting change so policy decisions can depend on its document path. */
function fragment(path: JSONXPath, op: JSONXActions): JSONXActions {
    const changes = entries(op);
    const match = changes.filter((entry) => entry.path.every((key, i) => path[i] === key)).pop();
    if (!match) {
        return op;
    }
    const { component } = match;
    const writer = new JSON1WriteCursor();
    const slots = Array.from(new Set([component.p, component.d].filter((slot) => slot !== undefined)));
    for (const entry of changes) {
        const part = entry === match ? { ...component } : {};
        for (const field of ['p', 'd'] as const) {
            const slot = entry.component[field];
            if (slot !== undefined && slots.includes(slot)) {
                part[field] = slots.indexOf(slot);
            }
        }
        if (Object.keys(part).length) {
            writer.reset();
            writer.at(entry.path, (w) => w.mergeTree([part]));
        }
    }
    return writer.get();
}

/** Source index of the closest original sibling on one side of an insertion. */
function neighbor(revision: Revision, parent: Value, index: number, direction: number) {
    for (let i = index + direction; i >= 0; i += direction) {
        const child = revision.child(parent, i);
        if (!child) {
            break;
        }
        if (!revision.locations.has(child)) {
            return Number(child.home!.key);
        }
    }
    return direction < 0 ? -1 : Infinity;
}

/** Locate the first shared successor to anchor an insertion in its peer's array. */
function insertionIndex(high: Revision, low: Revision, merged: Revision, parent: Value, index: number) {
    const earliest = neighbor(high, parent, index, -1) + 1;
    let anchor = index + 1;
    let position: number;
    while (true) {
        const next = high.child(parent, anchor++);
        if (!next) {
            position = 0;
            while (merged.child(parent, position)) {
                position++;
            }
            break;
        }
        const loc = merged.location(next);
        if (loc?.parent === parent && typeof loc.key === 'number' && !high.locations.has(next) && !low.locations.has(next)) {
            position = loc.key;
            break;
        }
    }
    while (position > 0) {
        const before = merged.child(parent, position - 1);
        if (!before || !low.locations.has(before) || high.locations.has(before)) {
            break;
        }
        const previous = low.location(before)!;
        if (neighbor(low, parent, Number(previous.key), 1) < earliest) {
            break;
        }
        position--;
    }
    return position;
}

/** Report edits and incoming moves inside a concurrently removed subtree. */
function checkRemovals(remover: Revision, peer: Revision, removedFirst: boolean, report: Report) {
    const source = new Revision(remover.root);
    for (const value of new Set([...peer.locations.keys(), ...peer.edits.keys()])) {
        const edited = peer.path(value);
        if (!edited) {
            continue;
        }
        let parent: Value | undefined = peer.edits.has(value) ? value : peer.location(value)?.parent;
        while (parent && parent !== remover.root) {
            if (remover.locations.get(parent) === null) {
                const removed = source.path(parent)!;
                if (removedFirst) {
                    report(DocumentConflict.Removal, removed, edited);
                } else {
                    report(DocumentConflict.Removal, edited, removed);
                }
                break;
            }
            parent = peer.location(parent)?.parent;
        }
    }
}

/** Reattach higher-priority values over the peer revision, resolving cycles and occupied properties. */
function mergePlacements(high: Revision, low: Revision, merged: Revision, report: Report) {
    for (const value of high.locations.keys()) {
        if (merged.location(value)) {
            merged.cut(value);
        }
    }
    const drops = Array.from(high.locations.keys(), (value) => ({ value, path: high.path(value) }))
        .filter((drop): drop is { value: Value; path: JSONXPath } => drop.path !== null);
    drops.sort((a, b) => a.path.length - b.path.length || comparePath(a.path, b.path));
    for (const { value } of drops) {
        const destination = high.location(value)!;
        const parent = destination.parent;
        if (low.locations.get(value) === null) {
            continue;
        }
        let ancestor: Value | undefined = parent;
        while (ancestor && ancestor !== value) {
            ancestor = merged.location(ancestor)?.parent;
        }
        if (ancestor === value) {
            report(DocumentConflict.Cycle, high.path(value)!, low.path(parent) ?? []);
            merged.cut(parent);
            continue;
        }
        if (parent !== merged.root && !merged.path(parent)) {
            continue;
        }
        let key = destination.key;
        if (typeof key === 'number') {
            key = insertionIndex(high, low, merged, parent, key);
        } else {
            const other = merged.child(parent, key);
            if (other && other !== value) {
                if (!isEqual(value.literal, other.literal) || value.home || other.home) {
                    report(DocumentConflict.Destination, high.path(value)!, low.path(other) ?? []);
                }
                merged.cut(other);
            }
        }
        merged.put(parent, key, value, high.locations.get(value)?.action);
    }
}

/** Rebase by building the same merged revision on both peers, then emitting each peer's missing edits. */
export function rebase(op: JSONXActions, against: JSONXActions, side: Side, allow: Policy): JSONXActions {
    if (!op || !against) {
        return op;
    }
    const highOp = side === 'left' ? op : against;
    const lowOp = side === 'left' ? against : op;
    const high = new Revision().replay(entries(highOp));
    const low = new Revision(high.root).replay(entries(lowOp), high);
    const merged = low.copy();
    const report: Report = (type, a, b) => {
        const first = fragment(a, highOp);
        const second = fragment(b, lowOp);
        const conflict = { type, op1: side === 'left' ? first : second, op2: side === 'left' ? second : first };
        if (!allow(conflict)) {
            throw Object.assign(new Error('Document write conflict'), { name: 'writeConflict', type: 'writeConflict', conflict });
        }
    };

    checkRemovals(high, low, true, report);
    checkRemovals(low, high, false, report);

    mergePlacements(high, low, merged, report);
    high.records.forEach((record, value) => merged.records.set(value, record));
    const author = side === 'left' ? high : low;
    const peer = side === 'left' ? low : high;
    const pending = new Map<Value, IEdit>();
    for (const [value, edit] of author.edits) {
        const other = peer.edits.get(value);
        if (other && other.type !== edit.type) {
            throw new Error('Concurrent edits use different types');
        }
        pending.set(value, other ? { ...edit, payload: edit.type.transform(edit.payload, other.payload, side) } : edit);
    }
    for (const [value, edit] of high.edits) {
        const other = low.edits.get(value);
        const payload = other ? edit.type.compose(other.payload, edit.type.transform(edit.payload, other.payload, 'left')) : edit.payload;
        merged.edits.set(value, { ...edit, payload });
    }
    return difference(peer, merged, pending);
}
