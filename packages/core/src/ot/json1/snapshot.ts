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

import type { JSON1ReadCursor, JSON1WriteCursor } from './cursor';
import type { IJSON1Component, JSON1Document, JSONXActions, JSONXPath } from './json1';

/** An encoded branch. A valid branch contains at least one component or child. */
export type OperationList = NonNullable<JSONXActions>;

/** A string property name or a numeric array index used in a JSON1 path. */
export type Key = JSONXPath[number];

/** Throw a plain `Error` on a failed wire or snapshot invariant. Replay callers observe the supplied message. */
export function assert(condition: unknown, message?: string): asserts condition {
    if (!condition) {
        throw new Error(message);
    }
}

/** Read from a positioned cursor, or return `null` for an absent branch. A writer materializes its current component. */
export const getComponent = (r?: JSON1ReadCursor | JSON1WriteCursor | null) => (r ? r.getComponent() : null);

function isObject(value: unknown): value is IJSONObject {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Copy one container so changes can share untouched descendants with the input snapshot. */
export const shallowClone = (obj: JSON1Document) =>
    Array.isArray(obj) ? obj.slice() : obj !== null && typeof obj === 'object' ? Object.assign({}, obj) : obj;

/** Test for either operation that detaches a value during the pick pass (`p` or `r`). */
export const hasPick = (c?: IJSON1Component | null) => c && (c.p != null || c.r !== undefined);

/** Test for either operation that supplies a value during the drop pass (`d` or `i`). */
export const hasDrop = (c?: IJSON1Component | null) => c && (c.d != null || c.i !== undefined);

/** An object snapshot with string property names and JSON values. */
export interface IJSONObject {
    [k: string]: JSON1Document;
}

/** Return a shallow copy with the property removed or the indexed array element spliced out. */
export function removeChild(container: JSON1Document[] | IJSONObject, key: Key) {
    assert(container != null);
    if (typeof key === 'number') {
        assert(Array.isArray(container), 'Invalid key - child is not an array');
        container = container.slice();
        container.splice(key, 1);
    } else {
        assert(isObject(container), 'Invalid key - child is not an object');
        container = Object.assign({}, container);
        delete (container as IJSONObject)[key];
    }
    return container;
}

/**
 * Insert into a writable container and return the inserted value. Array insertion shifts later elements.
 *
 * @throws If the index exceeds the array length, the container is incompatible, or the destination property is occupied.
 */
export function insertChildMut(container: JSON1Document[] | IJSONObject, key: Key, value: JSON1Document) {
    if (typeof key === 'number') {
        assert(container != null, 'Container is missing for key');
        assert(Array.isArray(container), 'Cannot use numerical key for object container');
        assert(container.length >= key, 'Cannot insert into out of bounds index');
        container.splice(key, 0, value);
    } else {
        assert(isObject(container), 'Cannot insert into missing item');
        assert(
            (container as IJSONObject)[key] === undefined,
            'Trying to overwrite value at key. Your op needs to remove it first'
        );
        (container as IJSONObject)[key] = value;
    }
    return value;
}

/** Return a shallow copy with the child at `k` replaced. Array indices retain their positions. */
export const replaceChild = (obj: JSON1Document[] | IJSONObject, k: Key, v: JSON1Document) => {
    obj = shallowClone(obj) as typeof obj;
    (obj as IJSONObject)[k] = v;
    return obj;
};

/** Check that the container admits this key kind. A numeric key requires an array. Existence is checked separately. */
export const isValidKey = (container: JSON1Document | undefined, key: Key): boolean =>
    container == null ? false : typeof key === 'number' ? Array.isArray(container) : typeof container === 'object';

/** Read a child if its container admits the key. An absent container or child yields `undefined`. */
export const maybeGetChild = (container: JSON1Document | undefined, key: Key): JSON1Document | undefined =>
    isValidKey(container, key) ? (container as IJSONObject)[key] : undefined;

/** Update a child in a writable container. An `undefined` child splices an array element or deletes an object property. */
export const setOrRemoveChild = (container: JSON1Document[] | IJSONObject, key: Key, child?: JSON1Document) => {
    if (typeof key === 'number') {
        assert(Array.isArray(container));
        assert(key < container.length);
    } else {
        assert(!Array.isArray(container));
        assert(container[key] !== undefined);
    }
    if (child === undefined) {
        if (typeof key === 'number') {
            (container as JSON1Document[]).splice(key, 1);
        } else {
            delete (container as IJSONObject)[key];
        }
    } else {
        (container as IJSONObject)[key] = child;
    }
};

function eqObj(a: { [k: string]: JSON1Document }, b: JSON1Document[] | { [k: string]: JSON1Document }) {
    if (Array.isArray(b)) {
        return false;
    }

    for (const k in a) {
        if (!deepEqual(a[k], b[k])) {
            return false;
        }
    }
    for (const k in b) {
        if (a[k] === undefined) {
            return false;
        }
    }
    return true;
}

function eqArr(a: JSON1Document[], b: JSON1Document) {
    if (!Array.isArray(b)) {
        return false;
    }
    if (a.length !== b.length) {
        return false;
    }

    for (let i = 0; i < a.length; i++) {
        if (!deepEqual(a[i], b[i])) {
            return false;
        }
    }

    return true;
}

/** Compare JSON values recursively when deciding whether competing inserted content is equivalent. */
export function deepEqual(a: JSON1Document, b: JSON1Document) {
    // This will cover null, bools, string and number
    if (a === b) {
        return true;
    }
    if (a === null || b === null) {
        return false;
    }
    if (typeof a !== 'object' || typeof b !== 'object') {
        return false;
    }

    return Array.isArray(a) ? eqArr(a, b) : eqObj(a, b);
}

/** Copy a JSON subtree so a stored operation can retain its own copy of snapshot or component data. */
export function deepClone(old: JSON1Document): JSON1Document {
    if (old === null) {
        return null;
    }

    if (Array.isArray(old)) {
        return old.map(deepClone);
    } else if (typeof old === 'object') {
        const o: JSON1Document = {};
        for (const k in old) {
            o[k] = deepClone(old[k]);
        }
        return o;
    } else {
        // Everything else in JS is immutable.
        return old;
    }
}
