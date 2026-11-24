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

import type { IJSON1Component, IJSON1Subtype, JSON1Document, JSONXActions, JSONXPath } from './json1';
import type { Key, OperationList } from './snapshot';
import { JSON1WriteCursor } from './cursor';
import { assert } from './snapshot';
import { unicodeText } from './unicode-text';

/** Runtime hooks used when decoding an embedded edit, normalizing it or mapping a position inside its value. */
interface IRegisteredSubtype extends IJSON1Subtype<unknown, unknown> {
    checkValidOp?(edit: unknown): void;
    normalize?(edit: unknown): unknown;
    transformPosition?(index: Key, edit: unknown): Key;
}

const subtypes = new Map<string, IRegisteredSubtype>();

/** Index a subtype under its name and optional URI. Registering an identifier again updates its implementation. */
export function registerSubtype(subtype: IRegisteredSubtype) {
    subtypes.set(subtype.name, subtype);
    if (subtype.uri) {
        subtypes.set(subtype.uri, subtype);
    }
}

function typeOrThrow(name: string) {
    const subtype = subtypes.get(name);
    if (!subtype) {
        throw new Error(`Missing type: ${name}`);
    }
    return subtype;
}

registerSubtype(unicodeText);

registerSubtype({
    name: 'number',
    apply: (a: number, b: number) => a + b,
    compose: (a: number, b: number) => a + b,
    transform: (a: number) => a,
    invert: (a: number) => -a,
});

/** Encode a single subtype edit at `path`. Keep an empty edit when `preserveNoop` is set or the subtype has no no-op check. */
export const editOp = (path: JSONXPath, type: IRegisteredSubtype | string, subOp: unknown, preserveNoop = false) =>
    new JSON1WriteCursor().at(path, (w) => writeEdit(w, type, subOp, preserveNoop)).get();

/** Resolve an explicit subtype or the implicit subtype of `es` and `ena`. Structural components return `null`. */
export function getEditType(component?: IJSON1Component | null) {
    if (component?.et) {
        return typeOrThrow(component.et);
    }
    if (component?.es) {
        return typeOrThrow('text-unicode');
    }
    return component?.ena != null ? typeOrThrow('number') : null;
}

/** Read the embedded payload, preserving numeric additions of zero. */
export function getEdit(component: IJSON1Component) {
    if (component.es) {
        return component.es;
    }
    return component.ena ?? component.e;
}

/**
 * Write the compact `ena` or `es` field for built-in subtype names. Other identifiers are encoded in `et` with payload `e`.
 * Set `preserveNoop` when a caller needs to retain an explicitly empty edit.
 */
export const writeEdit = (
    w: JSON1WriteCursor,
    typeOrName: IRegisteredSubtype | string,
    edit: unknown,
    preserveNoop = false
) => {
    const [type, name] =
        typeof typeOrName === 'string' ? [typeOrThrow(typeOrName), typeOrName] : [typeOrName, typeOrName.name];
    if (!preserveNoop && type.isNoop && type.isNoop(edit)) {
        return;
    }
    if (name === 'number') {
        w.write('ena', edit as number);
    } else if (name === 'text-unicode') {
        w.write('es', edit as IJSON1Component['es']);
    } else {
        w.write('et', name);
        w.write('e', edit);
    }
};

function checkNonNegInteger(n: unknown): asserts n is number {
    assert(typeof n === 'number');
    assert(n >= 0);
    assert(n === (n | 0));
}

function checkScalar(s: unknown): asserts s is number | string {
    if (typeof s === 'number') {
        checkNonNegInteger(s);
    } else {
        assert(typeof s === 'string');
    }
}

/**
 * Validate the encoding without reading a snapshot. Siblings must be ordered, each component can hold one edit,
 * and slots numbered from zero must each have one pick and one drop. `null` is a valid empty operation.
 *
 * @throws When a structural rule fails, a named subtype is missing, or a subtype validator rejects an edit.
 */
export function checkValidOp(op: JSONXActions) {
    if (op === null) {
        return;
    }
    const pickedSlots = new Set<number>();
    const droppedSlots = new Set<number>();
    const checkComponent = (e: IJSON1Component) => {
        let empty = true;
        let hasEdit = false;
        for (const k in e) {
            const v = e[k as keyof IJSON1Component];
            empty = false;
            assert(
                k === 'p' ||
                    k === 'r' ||
                    k === 'd' ||
                    k === 'i' ||
                    k === 'e' ||
                    k === 'es' ||
                    k === 'ena' ||
                    k === 'et',
                `Invalid component item '${k}'`
            );
            if (k === 'p') {
                checkNonNegInteger(v);
                assert(!pickedSlots.has(v));
                pickedSlots.add(v);
                assert(e.r === undefined);
            } else if (k === 'd') {
                checkNonNegInteger(v);
                assert(!droppedSlots.has(v));
                droppedSlots.add(v);
                assert(e.i === undefined);
            } else if (k === 'e' || k === 'es' || k === 'ena') {
                assert(!hasEdit);
                hasEdit = true;
                const t = getEditType(e);
                assert(t, 'Missing type in edit');
                if (t.checkValidOp) {
                    t.checkValidOp(getEdit(e));
                }
            }
        }
        assert(!empty);
    };
    const SCALAR = 1;
    const EDIT = 2;
    const DESCENT = 3;
    const checkDescent = (descent: OperationList, isRoot: boolean) => {
        assert(Array.isArray(descent), 'Op must be null or a list');
        if (descent.length === 0) {
            throw new Error('Empty descent');
        }
        if (!isRoot) {
            checkScalar(descent[0]);
        }
        let last = SCALAR;
        let numDescents = 0;
        let lastKey: Key = 0;
        for (let i = 0; i < descent.length; i++) {
            const d = descent[i];
            assert(d != null);
            if (Array.isArray(d)) {
                const key = checkDescent(d, false);
                if (numDescents) {
                    const t1 = typeof lastKey;
                    const t2 = typeof key;
                    if (t1 === t2) {
                        assert(lastKey < key, 'descent keys are not in order');
                    } else {
                        assert(t1 === 'number' && t2 === 'string');
                    }
                }
                lastKey = key;
                numDescents++;
                last = DESCENT;
            } else if (typeof d === 'object') {
                assert(last === SCALAR, `Prev not scalar - instead ${last}`);
                checkComponent(d);
                last = EDIT;
            } else {
                assert(last !== DESCENT);
                checkScalar(d);
                assert(d !== '__proto__', 'Invalid path key');
                last = SCALAR;
            }
        }
        assert(numDescents !== 1, 'Operation makes multiple descents. Remove some []');
        assert(last === EDIT || last === DESCENT);
        return descent[0] as Key;
    };
    checkDescent(op, true);
    assert(pickedSlots.size === droppedSlots.size, 'Mismatched picks and drops in op');
    for (let i = 0; i < pickedSlots.size; i++) {
        assert(pickedSlots.has(i));
        assert(droppedSlots.has(i));
    }
}

/**
 * Rebuild the operation in wire order, renumber moves by first visit and normalize embedded edits where supported.
 * Conflict resolution uses this form before retrying the transform.
 */
export function normalize(op: JSONXActions) {
    let nextSlot = 0;
    const slotMap: number[] = [];
    const getSlot = (inSlot: number) => {
        if (slotMap[inSlot] == null) {
            slotMap[inSlot] = nextSlot++;
        }
        return slotMap[inSlot];
    };
    const w = new JSON1WriteCursor();
    w.mergeTree(op, (c, w) => {
        const t = getEditType(c);
        if (t) {
            const op = getEdit(c);
            writeEdit(w, t, t.normalize ? t.normalize(op) : op);
        }
        for (const k of ['r', 'p', 'i', 'd'] as const) {
            if (c[k] !== undefined) {
                const r = k === 'p' || k === 'd' ? getSlot(c[k]!) : c[k];
                w.write(k, r);
            }
        }
    });
    return w.get();
}

/** Build an insertion at an object key, array index or the root. Array indices refer to the insertion position. */
export function insertOp(path: JSONXPath, value: JSON1Document): JSONXActions {
    return new JSON1WriteCursor().writeAtPath(path, 'i', value).get();
}
/** Build a removal. Omitting `value` writes `r: true`. Use the source snapshot to recover the removed value for undo. */
export function removeOp(path: JSONXPath, value: JSON1Document = true): JSONXActions {
    return new JSON1WriteCursor().writeAtPath(path, 'r', value).get();
}
/** Connect one source path to one destination path using slot zero. The destination is in the result snapshot. */
export function moveOp(from: JSONXPath, to: JSONXPath): JSONXActions {
    return new JSON1WriteCursor().writeMove(from, to).get();
}
/** Record the previous value in `r` and the replacement in `i` at the same path. */
export function replaceOp(path: JSONXPath, previous: JSON1Document, next: JSON1Document): JSONXActions {
    return new JSON1WriteCursor()
        .at(path, (w) => {
            w.write('r', previous);
            w.write('i', next);
        })
        .get();
}
