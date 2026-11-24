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

import type { IJSON1Conflict, JSONXActions, JSONXPath } from './json1';
import type { IMove } from './move';
import type { IEdit, IEntry } from './operation';
import type { Value } from './revision';
import { Tools } from '../../shared/tools';
import { combineIndependent } from './batch';
import { compose, difference } from './compose';
import { JSON1WriteCursor } from './cursor';
import { followMove, rebaseReorders, singleMove } from './move';
import { atEdit, comparePath, effectiveComponent, encode, entries, getEdit, hasPrefix, independentBranches, independentReplacements, singleEdit } from './operation';
import { Revision } from './revision';

type Side = 'left' | 'right';
type Policy = (conflict: IJSON1Conflict) => boolean;

/** Conflicts that a document collaboration policy can elect to resolve. */
export enum DocumentConflict {
    Removal = 1,
    Destination = 2,
    Cycle = 3,
}

type Report = (type: DocumentConflict, high: JSONXPath, low: JSONXPath, removal?: 'high' | 'low', cycle?: Set<Value>) => void;

/** Isolate the removal, incoming value or embedded edit that the policy is deciding on. */
function fragment(path: JSONXPath, changes: IEntry[], removed: boolean): JSONXActions {
    const writer = new JSON1WriteCursor();
    if (removed) {
        return writer.writeAtPath(path, 'r', true).get();
    }
    const match = changes.filter((entry) => hasPrefix(path, entry.path)).pop()!;
    const { component } = match;
    if (component.d !== undefined) {
        const source = changes.find(({ component: part }) => part.p === component.d)!;
        return writer.writeMove(source.path, match.path).get();
    }
    if (component.i !== undefined) {
        return writer.writeAtPath(match.path, 'i', component.i).get();
    }
    const { e, et, es, ena } = component;
    if (et !== undefined) {
        return writer.at(match.path, (w) => {
            w.write('et', et);
            w.write('e', e);
        }).get();
    }
    return es === undefined ? writer.writeAtPath(match.path, 'ena', ena).get() : writer.writeAtPath(match.path, 'es', es).get();
}

/** Expose complete move edges to the policy, using consecutive slots local to the fragment. */
function moveFragment(changes: IEntry[], slots: Map<number, number>): JSONXActions {
    const fields: IEntry[] = [];
    for (const { component, path } of changes) {
        for (const field of ['p', 'd'] as const) {
            const slot = component[field];
            if (slot !== undefined && slots.has(slot)) {
                fields.push({ path, component: { [field]: slots.get(slot)! } });
            }
        }
    }
    return encode(fields);
}

/** A cycle policy sees the move edges that close the loop, with slots local to this fragment. */
function cycleFragment(changes: IEntry[], revision: Revision, cycle: Set<Value>, high: Revision, low: Revision): JSONXActions {
    // A move can be blocked by the cycle even if it only enters a descendant.
    // A competing move takes the same value to safety when its winning parent is reachable.
    const slots = new Map<number, number>();
    for (const { component, path } of changes) {
        if (component.d === undefined) {
            continue;
        }
        const value = revision.at(path);
        let winner: Value | undefined = value;
        const visited = new Set<Value>();
        while (winner && !cycle.has(winner) && !visited.has(winner)) {
            visited.add(winner);
            winner = high.locations.has(winner) ? high.locations.get(winner)?.parent : low.location(winner)?.parent;
        }
        if (!winner || !cycle.has(winner)) {
            continue;
        }
        let parent = revision.location(value)?.parent;
        while (parent && !cycle.has(parent)) {
            parent = revision.location(parent)?.parent;
        }
        if (parent) {
            slots.set(component.d, slots.size);
        }
    }
    return moveFragment(changes, slots);
}

/**
 * In stored histories the peer publishes its destinations first. Two author/peer rounds follow.
 * A move still waiting on a later round must reach the conflict policy. The two receiving clients
 * can consequently observe different fragments for the same chain of alternating destinations.
 */
function pendingDestinations(author: Revision, peer: Revision, merged: Revision, authored: IEntry[], received: IEntry[]): IJSON1Conflict | undefined {
    if (author.locations.size < 2 || peer.locations.size < 2) {
        return;
    }
    const owners = new Map<Value, Revision>();
    const a = new Map<number, number>();
    const b = new Map<number, number>();
    for (const [revision, changes] of [[author, authored], [peer, received]] as const) {
        for (const { path, component } of changes) {
            if (component.d !== undefined) {
                const value = revision.at(path);
                if (merged.locations.get(value)?.action === revision.locations.get(value)?.action) {
                    owners.set(value, revision);
                }
            }
        }
    }
    if (owners.size < 4) {
        return;
    }
    let unresolved = false;
    for (const [revision, changes, slots] of [[author, authored, a], [peer, received, b]] as const) {
        for (const { path, component } of changes) {
            const drop = component.d !== undefined;
            if (!drop && component.i === undefined && !getEdit(component)) {
                continue;
            }
            let value: Value | undefined = revision.at(path);
            if (drop && owners.get(value) !== revision) {
                continue;
            }
            let last: Revision = revision;
            let rounds = 1;
            while (value) {
                const owner = owners.get(value);
                if (owner && last !== owner) {
                    rounds++;
                    last = owner;
                }
                value = merged.location(value)?.parent;
            }
            if (rounds + Number(last === author) > 5) {
                unresolved = true;
                if (component.d !== undefined) {
                    slots.set(component.d, slots.size);
                }
            }
        }
    }
    if (unresolved) {
        return { type: DocumentConflict.Cycle, op1: moveFragment(authored, a), op2: moveFragment(received, b) };
    }
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

/** Find the explicit cut that also removes this descendant in the given revision. */
function removedAncestor(revision: Revision, node: Value | undefined): Value | undefined {
    let value = node;
    while (value && value !== revision.root) {
        if (revision.locations.get(value) === null) {
            return value;
        }
        value = revision.location(value)?.parent;
    }
}

/** Report edits and incoming moves inside a concurrently removed subtree. */
function checkRemovals(remover: Revision, peer: Revision, removedFirst: boolean, report: Report) {
    if (!Array.from(remover.locations.values()).includes(null)) {
        return;
    }
    const source = new Revision(remover.root);
    for (const value of new Set([...peer.locations.keys(), ...peer.edits.keys()])) {
        const edited = peer.path(value);
        if (!edited || (removedFirst && value.home && remover.locations.get(value) && !peer.edits.has(value))) {
            continue;
        }
        let parent: Value | undefined = peer.edits.has(value) ? value : peer.location(value)?.parent;
        while (parent && parent !== remover.root) {
            const cut = removedAncestor(remover, parent);
            if (cut) {
                const removed = source.path(cut)!;
                if (value.home && !peer.edits.has(value) && !remover.path(value)) {
                    break;
                }
                if (removedFirst) {
                    report(DocumentConflict.Removal, removed, edited, 'high');
                } else {
                    report(DocumentConflict.Removal, edited, removed, 'low');
                }
                break;
            }
            if (remover.locations.get(parent) && (parent !== value || removedFirst || !peer.locations.get(value))) {
                break;
            }
            parent = peer.location(parent)?.parent;
        }
    }
}

/** Reattach higher-priority values over the peer revision, resolving cycles and occupied properties. */
function mergePlacements(high: Revision, low: Revision, merged: Revision, report: Report) {
    // Deleting a source subtree also deletes descendants a peer moved out of it.
    for (const [value, location] of low.locations) {
        if (location && value.home && !high.path(value)) {
            merged.cut(value);
        }
    }
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
        if (low.locations.get(value) === null || (value.home && !low.path(value))) {
            continue;
        }
        let ancestor: Value | undefined = parent;
        while (ancestor && ancestor !== value) {
            ancestor = merged.location(ancestor)?.parent;
        }
        if (ancestor === value) {
            const cycle = new Set([value]);
            let node = parent;
            while (!cycle.has(node)) {
                cycle.add(node);
                node = merged.location(node)!.parent;
            }
            report(DocumentConflict.Cycle, high.path(value)!, low.path(parent) ?? [], undefined, cycle);
            merged.cut(parent);
            continue;
        }
        let key = destination.key;
        if (typeof key === 'number') {
            key = insertionIndex(high, low, merged, parent, key);
        } else {
            const other = merged.child(parent, key);
            if (other && other !== value) {
                if (!Tools.diffValue(value.literal, other.literal) || value.home || other.home) {
                    report(DocumentConflict.Destination, high.path(value)!, low.path(other) ?? []);
                }
                merged.cut(other);
            }
        }
        merged.put(parent, key, value, high.locations.get(value)?.action);
    }
}

/** Replacing descendants travels with a single moved subtree. Siblings shift once at each endpoint. */
function rebaseReplacements(replacements: IEntry[], move: IMove, returnMove: boolean): JSONXActions | undefined {
    if (!independentReplacements(replacements)) {
        return;
    }
    const writer = new JSON1WriteCursor();
    for (const { path, component } of replacements) {
        if (typeof path[path.length - 1] !== 'string' || hasPrefix(move.from, path)) {
            return;
        }
        const mapped = followMove(path, move);
        if (!mapped || hasPrefix(move.insertParent, mapped)) {
            return;
        }
        if (!returnMove) {
            writer.reset();
            writer.at(mapped, (w) => {
                w.write('r', true);
                w.write('i', component.i);
            });
        }
    }
    return returnMove ? writer.writeMove(move.from, move.to).get() : writer.get();
}

/** Rebase by building the same merged revision on both peers, then emitting each peer's missing edits. */
function tryRebase(op: JSONXActions, against: JSONXActions, side: Side): JSONXActions | IJSON1Conflict {
    if (!op || !against) {
        return op;
    }
    const highOp = side === 'left' ? op : against;
    const lowOp = side === 'left' ? against : op;
    const highChanges = entries(highOp);
    const lowChanges = entries(lowOp);
    const highEdit = singleEdit(highChanges);
    const lowEdit = singleEdit(lowChanges);
    if (highEdit && lowEdit && comparePath(highChanges[0].path, lowChanges[0].path) === 0 && highEdit.type === lowEdit.type) {
        const author = side === 'left' ? highEdit : lowEdit;
        const peer = side === 'left' ? lowEdit : highEdit;
        return atEdit(highChanges[0].path, author.type, author.type.transform(author.payload, peer.payload, side));
    }
    const highMove = singleMove(highChanges);
    const lowMove = singleMove(lowChanges);
    if (highMove && lowMove) {
        const reorder = side === 'left' ? rebaseReorders(highMove, lowMove, side) : rebaseReorders(lowMove, highMove, side);
        if (reorder !== undefined) {
            return reorder;
        }
    }
    if (independentBranches(highChanges, lowChanges)) {
        const { component, path } = side === 'left' ? highChanges[0] : lowChanges[0];
        const effective = effectiveComponent(component);
        if (!effective) {
            return null;
        }
        if (effective.r !== undefined) {
            return [...path, { ...effective, r: true }];
        }
        return effective === component ? op : [...path, effective];
    }
    const mapped = highMove
        ? rebaseReplacements(lowChanges, highMove, side === 'left')
        : lowMove && rebaseReplacements(highChanges, lowMove, side === 'right');
    if (mapped !== undefined) {
        return mapped;
    }
    const independent = side === 'left' ? combineIndependent(highChanges, lowChanges, side) : combineIndependent(lowChanges, highChanges, side);
    if (independent !== undefined) {
        return independent;
    }
    const high = new Revision().replay(highChanges);
    const low = new Revision(high.root).replay(lowChanges, high);
    const conflicts: Array<{ phase: number; path: JSONXPath; conflict: IJSON1Conflict }> = [];
    const report: Report = (type, a, b, removal, cycle) => {
        const first = cycle ? cycleFragment(highChanges, high, cycle, high, low) : fragment(a, highChanges, removal === 'high');
        const second = cycle ? cycleFragment(lowChanges, low, cycle, high, low) : fragment(b, lowChanges, removal === 'low');
        const authorRemoved = removal === (side === 'left' ? 'high' : 'low');
        const authored = side === 'left' ? a : b;
        const peer = side === 'left' ? b : a;
        conflicts.push({
            phase: type === DocumentConflict.Cycle ? 2 : Number(!authorRemoved),
            path: authorRemoved ? peer : authored,
            conflict: { type, op1: side === 'left' ? first : second, op2: side === 'left' ? second : first },
        });
    };

    // Cuts authored by this client are visited first in source order. A policy decision
    // on their contents precedes destination collisions and cycles.
    const author = side === 'left' ? high : low;
    const peer = side === 'left' ? low : high;
    checkRemovals(author, peer, side === 'left', report);
    if (conflicts.length) {
        return conflicts.sort((a, b) => comparePath(a.path, b.path))[0].conflict;
    }
    checkRemovals(peer, author, side !== 'left', report);
    const merged = low.copy();
    mergePlacements(high, low, merged, report);
    if (conflicts.length) {
        conflicts.sort((a, b) => a.phase - b.phase || comparePath(a.path, b.path));
        return conflicts[0].conflict;
    }
    const pendingMoves = pendingDestinations(author, peer, merged, side === 'left' ? highChanges : lowChanges, side === 'left' ? lowChanges : highChanges);
    if (pendingMoves) {
        return pendingMoves;
    }
    high.records.forEach((record, value) => merged.records.set(value, record));
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
        merged.setEdit(value, { ...edit, payload });
    }
    return difference(peer, merged, pending, author);
}

/** Remove the conflicting result values, keeping all surviving picks in source coordinates. */
function cancelIncoming(op: JSONXActions, conflict: JSONXActions) {
    const cuts = entries(conflict).filter(({ component }) => component.d !== undefined || component.i !== undefined
        || (component.r === undefined && component.p === undefined));
    const correction = encode(cuts.map(({ path }) => ({ path, component: { r: true } })));
    if (!correction) {
        return { op, correction };
    }
    const changes = entries(op);
    if (!cuts.every(({ path }) => changes.some((entry) => comparePath(entry.path, path) === 0
        && (entry.component.d !== undefined || entry.component.i !== undefined)))) {
        // An edit to a pre-existing value needs its original location to encode the removal.
        return { op: compose(op, correction), correction };
    }
    const cancelled = new Set<number>();
    const result: IEntry[] = [];
    for (const { path, component } of changes) {
        if (cuts.some((cut) => hasPrefix(path, cut.path))) {
            if (component.d !== undefined) {
                cancelled.add(component.d);
            }
            continue;
        }
        const { p, r, ...incoming } = component;
        if (!Object.keys(incoming).length) {
            continue;
        }
        const target = path.slice();
        for (const cut of cuts) {
            const depth = cut.path.length - 1;
            const index = cut.path[depth];
            if (typeof index === 'number' && typeof path[depth] === 'number' && path[depth] > index
                && cut.path.slice(0, depth).every((key, i) => key === path[i])) {
                target[depth] = Number(target[depth]) - 1;
            }
        }
        result.push({ path: target, component: incoming });
    }
    const slots = new Map<number, number>();
    for (const { path, component } of changes) {
        if (component.p !== undefined) {
            if (cancelled.has(component.p)) {
                result.push({ path, component: { r: true } });
            } else {
                slots.set(component.p, slots.size);
                result.push({ path, component: { p: slots.size - 1 } });
            }
        } else if (component.r !== undefined) {
            result.push({ path, component: { r: component.r } });
        }
    }
    for (const entry of result) {
        if (entry.component.d !== undefined) {
            entry.component.d = slots.get(entry.component.d)!;
        }
    }
    return { op: encode(result), correction };
}

/**
 * Rebase from the common revision. Resolving one conflict changes the operations that remain:
 * a cancelled drop removes its source and can invalidate another move's destination.
 * Keep the peer corrections so the returned change applies to the peer's original document.
 */
export function rebase(op: JSONXActions, against: JSONXActions, side: Side, allow: Policy): JSONXActions {
    let author = op;
    let peer = against;
    let corrections: JSONXActions = null;
    for (;;) {
        const result = tryRebase(author, peer, side);
        if (result === null || Array.isArray(result)) {
            return compose(corrections, result);
        }
        // An unresolved edit can have no move edges on either side. Its wire conflict
        // has no correction to apply and a retry would revisit the same operations.
        if (!allow(result) || (!result.op1 && !result.op2)) {
            throw Object.assign(new Error('Document write conflict'), { name: 'writeConflict', type: 'writeConflict', conflict: result });
        }
        if (result.type !== DocumentConflict.Destination || side === 'right') {
            author = cancelIncoming(author, result.op1).op;
        }
        if (result.type !== DocumentConflict.Destination || side === 'left') {
            const cancelled = cancelIncoming(peer, result.op2);
            peer = cancelled.op;
            corrections = compose(corrections, cancelled.correction);
        }
    }
}
