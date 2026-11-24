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

// Adapted from ot-json1 1.0.2 (Joseph Gentle). See THIRD_PARTY_NOTICES.txt.

import type { IJSON1Component, JSON1Document, JSONXActions } from './json1';
import type { IJSONObject, OperationList } from './snapshot';
import { JSON1ReadCursor, JSON1WriteCursor } from './cursor';
import { advancer } from './navigation';
import { getEdit, getEditType, writeEdit } from './operation';
import {
    assert,
    deepClone,
    hasDrop,
    hasPick,
    isValidKey,
    maybeGetChild,
    removeChild,
    shallowClone,
} from './snapshot';

/**
 * Exchange picks with drops and removes with inserts. Move inverse subtype edits back to the paths
 * where their values will be restored. Each removal must already contain the value to reinsert.
 *
 * @param op - An operation prepared with `makeInvertible`, or authored with its undo data.
 * @returns An operation applicable to the revision immediately after `op`.
 */
export function invert(op: JSONXActions): JSONXActions {
    if (op == null) {
        return null;
    }
    const r = new JSON1ReadCursor(op);
    const w = new JSON1WriteCursor();
    let editsToTransform: undefined | Set<IJSON1Component>;
    const heldPick: JSON1ReadCursor[] = [];
    const heldWrites: JSON1WriteCursor[] = [];
    /** Reverse structural components and compute the final value of each literal insertion so undo can remove it. */
    function invertSimple(r: JSON1ReadCursor, w: JSON1WriteCursor, subDoc: JSON1Document | undefined) {
        const c = r.getComponent();
        let insertHere;
        let subdocModified = false;
        if (c) {
            if (c.p != null) {
                w.write('d', c.p);
                heldPick[c.p] = r.clone();
            }
            if (c.r !== undefined) {
                w.write('i', c.r);
            }
            if (c.d != null) {
                w.write('p', c.d);
                subDoc = undefined;
            }
            if (c.i !== undefined) {
                subDoc = insertHere = c.i as JSON1Document;
            }
            const t = getEditType(c);
            if (t) {
                if (subDoc === undefined) {
                    if (!editsToTransform) {
                        editsToTransform = new Set();
                    }
                    editsToTransform.add(c);
                } else {
                    subDoc = t.apply(subDoc, getEdit(c)) as JSON1Document;
                    subdocModified = true;
                }
            }
        }
        let dropOff = 0;
        for (const key of r) {
            w.descend(key);
            const raw = typeof key === 'number' ? key - dropOff : key;
            const childIn = maybeGetChild(subDoc, raw);
            if (hasDrop(r.getComponent())) {
                dropOff++;
            }
            const childOut = invertSimple(r, w, childIn);
            if (subDoc !== undefined && childOut !== undefined) {
                if (!subdocModified) {
                    subdocModified = true;
                    subDoc = shallowClone(subDoc);
                }
                if (!isValidKey(subDoc, raw)) {
                    throw new Error('Cannot modify child - invalid operation');
                }
                (subDoc as IJSONObject)[raw] = childOut;
            }
            w.ascend();
        }
        if (insertHere !== undefined) {
            w.write('r', subDoc);
        } else {
            return subdocModified ? subDoc : undefined;
        }
    }
    invertSimple(r, w, undefined);
    if (editsToTransform) {
        /** Follow forward drops back to their picks to emit inverse edits on the restored subtree. */
        function transformEdits(rPick: JSON1ReadCursor | null, rDrop: JSON1ReadCursor, w: JSON1WriteCursor) {
            const cd = rDrop.getComponent();
            if (cd) {
                const dropSlot = cd.d;
                if (dropSlot != null) {
                    rPick = heldPick[dropSlot];
                    w = heldWrites[dropSlot] = new JSON1WriteCursor();
                }
                if (editsToTransform!.has(cd)) {
                    const t = getEditType(cd)!;
                    if (!t.invert) {
                        throw new Error(`Cannot invert subtype ${t.name}`);
                    }
                    writeEdit(w, t, t.invert(getEdit(cd)));
                }
            }
            let pickOff = 0;
            let dropOff = 0;
            const ap = advancer(
                rPick,
                (k, c) => (hasPick(c) ? pickOff - k - 1 : k - pickOff),
                (k, c) => {
                    if (hasPick(c)) {
                        pickOff++;
                    }
                }
            );
            for (const key of rDrop) {
                if (typeof key === 'number') {
                    const mid = key - dropOff;
                    const _rPick = ap(mid);
                    const raw = mid + pickOff;
                    w.descend(raw);
                    transformEdits(_rPick, rDrop, w);
                    if (hasDrop(rDrop.getComponent())) {
                        dropOff++;
                    }
                    w.ascend();
                } else {
                    w.descend(key);
                    const _rPick = ap(key);
                    transformEdits(_rPick, rDrop, w);
                    w.ascend();
                }
            }
            ap.end();
        }
        w.reset();
        transformEdits(r.clone(), r, w);
        if (heldWrites.length) {
            w.reset();
            r.traverse(w, (c, w) => {
                const slot = c.p;
                if (slot != null) {
                    const _w = heldWrites[slot];
                    if (_w) {
                        w.mergeTree(_w.get());
                    }
                }
            });
        }
    }
    const result = w.get();
    return result;
}

const anyComponent = (op: OperationList, fn: (c: IJSON1Component) => boolean): boolean =>
    op.some((c) => (typeof c === 'object' ? (Array.isArray(c) ? anyComponent(c, fn) : fn(c)) : false));

/**
 * Record values taken from the source snapshot and let each subtype capture its own undo data.
 *
 * @param op - Forward operation, potentially containing compact removals or text deletions by length.
 * @param doc - Snapshot immediately before `op` is applied.
 * @returns A forward operation with equivalent effects and enough information for supported subtypes to invert.
 */
export function makeInvertible(op: JSONXActions, doc: JSON1Document) {
    if (op == null || !anyComponent(op, (c) => c.r !== undefined || getEditType(c)?.makeInvertible != null)) {
        return op;
    }
    const r = new JSON1ReadCursor(op);
    const w = new JSON1WriteCursor();
    let hasEdits = false;
    const heldPick: JSON1ReadCursor[] = [];
    const heldDoc: JSON1Document[] = [];
    /**
     * Process children before recording a parent removal so its undo value excludes descendants picked into move slots.
     * Keep those moved values for subtype edits at their destinations.
     */
    const traversePick = (r: JSON1ReadCursor, w: JSON1WriteCursor, subDoc: JSON1Document | undefined) => {
        const c = r.getComponent();
        let modified = false;
        if (c) {
            if (c.d != null) {
                w.write('d', c.d);
            }
            if (c.i !== undefined) {
                w.write('i', c.i);
            }
            const pickSlot = c.p;
            if (pickSlot != null) {
                heldPick[pickSlot] = r.clone();
                assert(subDoc !== undefined, 'Operation picks up at an invalid key');
                heldDoc[pickSlot] = subDoc;
                w.write('p', c.p);
            }
            if (c.r !== undefined && subDoc === undefined) {
                throw new Error('Invalid doc / op in makeInvertible: removed item missing from doc');
            }
            const t = getEditType(c);
            if (t) {
                if (t.makeInvertible) {
                    hasEdits = true;
                } else {
                    writeEdit(w, t, getEdit(c), true);
                }
            }
        }
        let listOff = 0;
        for (const key of r) {
            w.descend(key);
            const keyRaw = typeof key === 'number' ? key - listOff : key;
            const childIn = maybeGetChild(subDoc, keyRaw);
            const childOut = traversePick(r, w, childIn);
            if (childIn !== childOut) {
                if (!modified) {
                    modified = true;
                    subDoc = shallowClone(subDoc as JSON1Document);
                }
                if (childOut === undefined) {
                    subDoc = removeChild(subDoc as JSON1Document[] | IJSONObject, keyRaw);
                    if (typeof key === 'number') {
                        listOff++;
                    }
                } else {
                    (subDoc as IJSONObject)[keyRaw] = childOut;
                }
            }
            w.ascend();
        }
        if (c) {
            if (c.r !== undefined) {
                w.write('r', deepClone(subDoc as JSON1Document));
                subDoc = undefined;
            } else if (c.p != null) {
                subDoc = undefined;
            }
        }
        return subDoc;
    };
    traversePick(r, w, doc);
    if (hasEdits) {
        w.reset();
        /** Find the pre-edit subtype value in the source snapshot, an inserted literal, or a subtree held by a move. */
        function traverseDrop(
            rPick: JSON1ReadCursor | null,
            rDrop: JSON1ReadCursor,
            w: JSON1WriteCursor,
            subDoc: JSON1Document | undefined,
            isLiteral: boolean
        ) {
            const c = rDrop.getComponent();
            if (c) {
                if (c.i !== undefined) {
                    subDoc = c.i as JSON1Document;
                    isLiteral = true;
                } else if (c.d != null) {
                    subDoc = heldDoc[c.d];
                    rPick = heldPick[c.d];
                    isLiteral = false;
                }
                const t = getEditType(c);
                if (t && t.makeInvertible) {
                    const edit = getEdit(c);
                    writeEdit(w, t, t.makeInvertible(edit, subDoc), true);
                }
            }
            let pickOff = 0;
            let dropOff = 0;
            const ap = advancer(
                rPick,
                (k, c) => (hasPick(c) ? pickOff - k - 1 : k - pickOff),
                (k, c) => {
                    if (hasPick(c)) {
                        pickOff++;
                    }
                }
            );
            for (const key of rDrop) {
                if (typeof key === 'number') {
                    const mid = key - dropOff;
                    const _rPick = ap(mid);
                    const raw = mid + pickOff;
                    const child = maybeGetChild(subDoc, isLiteral ? mid : raw);
                    w.descend(key);
                    traverseDrop(_rPick, rDrop, w, child, isLiteral);
                    if (hasDrop(rDrop.getComponent())) {
                        dropOff++;
                    }
                    w.ascend();
                } else {
                    const child = maybeGetChild(subDoc, key);
                    w.descend(key);
                    traverseDrop(ap(key), rDrop, w, child, isLiteral);
                    w.ascend();
                }
            }
            ap.end();
        }
        traverseDrop(r.clone(), r, w, doc, false);
    }
    const result = w.get();
    return result;
}

/** Prepare and invert `op` against its source revision. Apply the returned undo at the revision produced by `op`. */
export function invertWithDoc(op: JSONXActions, doc: JSON1Document) {
    return invert(makeInvertible(op, doc));
}
