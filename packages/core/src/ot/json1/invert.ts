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

// Exchange picks with drops and removes with inserts. Embedded edits follow the moved value back to its source.
export function invert(op: JSONXActions): JSONXActions {
    if (op == null) {
        return null;
    }
    const r = new JSON1ReadCursor(op);
    const w = new JSON1WriteCursor();
    let editsToTransform: undefined | Set<IJSON1Component>;
    const heldPick: JSON1ReadCursor[] = [];
    const heldWrites: JSON1WriteCursor[] = [];
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

// Capture removed values and subtype undo data from the snapshot immediately before this operation.
export function makeInvertible(op: JSONXActions, doc: JSON1Document) {
    if (op == null || !anyComponent(op, (c) => c.r !== undefined || getEditType(c)?.makeInvertible != null)) {
        return op;
    }
    const r = new JSON1ReadCursor(op);
    const w = new JSON1WriteCursor();
    let hasEdits = false;
    const heldPick: JSON1ReadCursor[] = [];
    const heldDoc: JSON1Document[] = [];
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

export function invertWithDoc(op: JSONXActions, doc: JSON1Document) {
    return invert(makeInvertible(op, doc));
}
