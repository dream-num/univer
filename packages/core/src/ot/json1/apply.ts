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

import { cloneDeep } from 'lodash-es';
import type { IJSON1Component, JSON1Document, JSONXActions, JSONXPath } from './json1';
import { JSON1WriteCursor } from './cursor';
import { editComponent, entries, getEdit } from './operation';

type Container = JSON1Document[] | Record<string, JSON1Document>;

function insert(parent: Record<string, JSON1Document | undefined>, key: string | number, value: JSON1Document) {
    if (Array.isArray(parent)) {
        if (Number(key) > parent.length) {
            throw new Error('Array insertion is out of bounds');
        }
        parent.splice(Number(key), 0, value);
    } else {
        if (Object.prototype.hasOwnProperty.call(parent, key) && parent[key] !== undefined) {
            throw new Error('Insertion would overwrite a property');
        }
        parent[key] = value;
    }
}

/** A replay clones each written container once, retaining references to unaffected branches. */
function replay(snapshot: JSON1Document | undefined, op: JSONXActions, undoData?: JSON1WriteCursor) {
    const changes = entries(op);
    const holder: Record<string, JSON1Document | undefined> = { root: snapshot };
    const owned = new WeakSet<object>();

    function target(path: JSONXPath) {
        let parent = holder;
        let key: string | number = 'root';
        for (const segment of path) {
            const child = Object.prototype.hasOwnProperty.call(parent, key) ? parent[key] : undefined;
            if (!child || typeof child !== 'object' || Array.isArray(child) !== (typeof segment === 'number')) {
                throw new Error('Invalid document path');
            }
            let writable: Container = child;
            if (!owned.has(child)) {
                writable = Array.isArray(child) ? child.slice() : { ...child };
                owned.add(writable);
                parent[key] = writable;
            }
            parent = writable as Record<string, JSON1Document>;
            key = segment;
        }
        return { parent, key };
    }

    const slots: JSON1Document[] = [];
    const captured = new Map<JSONXPath, IJSON1Component>();
    for (let index = changes.length - 1; index >= 0; index--) {
        const { path, component } = changes[index];
        if (component.r === undefined && component.p === undefined) {
            continue;
        }
        const { parent, key } = target(path);
        const value = Object.prototype.hasOwnProperty.call(parent, key) ? parent[key] : undefined;
        if (value === undefined) {
            throw new Error('Cannot remove a missing value');
        }
        if (component.p !== undefined) {
            slots[component.p] = value;
        }
        if (undoData && component.r !== undefined) {
            captured.set(path, { ...component, r: value });
        }
        if (Array.isArray(parent)) {
            parent.splice(Number(key), 1);
        } else {
            delete parent[key];
        }
    }
    for (const { path, component } of changes) {
        let record = captured.get(path) ?? component;
        const edit = getEdit(component);
        const value = component.d === undefined ? component.i as JSON1Document | undefined : slots[component.d];
        if (value !== undefined || edit) {
            const { parent, key } = target(path);
            if (value !== undefined) {
                insert(parent, key, value);
            }
            if (edit) {
                const current = Object.prototype.hasOwnProperty.call(parent, key) ? parent[key] : undefined;
                if (current === undefined) {
                    throw new Error('Cannot edit a missing value');
                }
                if (undoData && edit.type.makeInvertible) {
                    const payload = edit.type.makeInvertible(edit.payload, current);
                    record = { ...record, ...editComponent({ ...edit, payload }) };
                }
                parent[key] = edit.type.apply(undoData ? cloneDeep(current) : current, edit.payload) as JSON1Document;
            }
        }
        if (undoData) {
            undoData.reset();
            undoData.at(path, (w) => w.mergeTree([record]));
        }
    }
    return holder.root;
}

/** Replay structural edits in source order for cuts and result order for insertions. */
export function apply(snapshot: JSON1Document | undefined, op: JSONXActions) {
    return op === null ? snapshot : replay(snapshot, op);
}

/** Capture values at the instant they are removed, after any nested moves have been detached. */
export function makeInvertible(op: JSONXActions, snapshot: JSON1Document) {
    const writer = new JSON1WriteCursor();
    replay(snapshot, op, writer);
    return writer.get();
}
