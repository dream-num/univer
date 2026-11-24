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

import type { IJSON1Component, IJSON1WriteCursor, JSONXActions, JSONXPath } from './json1';

type Key = JSONXPath[number];
type OperationList = NonNullable<JSONXActions>;

function isComponent(item: OperationList[number] | undefined): item is IJSON1Component {
    return item != null && typeof item === 'object' && !Array.isArray(item);
}

interface IReadPosition {
    list: OperationList;
    offset: number;
    branch: number;
}

/** A position in the encoded operation. Clones can follow moves without moving the original cursor. */
export class JSON1ReadCursor {
    private _path: JSONXPath = [];
    private _parents: IReadPosition[] = [];
    private _offset = 0;

    constructor(private _list: JSONXActions) {}

    getComponent(): IJSON1Component | null {
        const item = this._list?.[this._offset];
        return isComponent(item) ? item : null;
    }

    getPath(): JSONXPath {
        return this._path.slice();
    }

    getKey(): Key {
        return this._path[this._path.length - 1];
    }

    clone(): JSON1ReadCursor {
        const cursor = new JSON1ReadCursor(this._list);
        cursor._offset = this._offset;
        cursor._path = this._path.slice();
        cursor._parents = this._parents.slice();
        return cursor;
    }

    descendFirst(): boolean {
        const list = this._list;
        if (list === null) {
            return false;
        }
        const index = this._offset + (this.getComponent() ? 1 : 0);
        if (index >= list.length) {
            return false;
        }
        const child = list[index];
        const branch = Array.isArray(child) ? index : -1;
        this._parents.push({ list, offset: this._offset, branch });
        if (Array.isArray(child)) {
            this._list = child;
            this._offset = 1;
            this._path.push(child[0] as Key);
        } else {
            this._offset = index + 1;
            this._path.push(child as Key);
        }
        return true;
    }

    nextSibling(): boolean {
        const depth = this._parents.length - 1;
        const parent = this._parents[depth];
        if (!parent || parent.branch < 0 || parent.branch + 1 >= parent.list.length) {
            return false;
        }
        const branch = parent.branch + 1;
        // Cloned cursors share immutable parent frames.
        this._parents[depth] = { ...parent, branch };
        this._list = parent.list[branch] as OperationList;
        this._offset = 1;
        this._path[depth] = this._list[0] as Key;
        return true;
    }

    ascend(): void {
        const parent = this._parents.pop();
        if (!parent) {
            throw new Error('Cannot ascend above the JSON1 root');
        }
        this._list = parent.list;
        this._offset = parent.offset;
        this._path.pop();
    }

    * [Symbol.iterator](): Generator<Key> {
        if (this.descendFirst()) {
            do {
                yield this.getKey();
            } while (this.nextSibling());
            this.ascend();
        }
    }

    traverse<W extends JSON1WriteCursor | null>(writer: W, visit: (component: IJSON1Component, writer: W) => void): void {
        const component = this.getComponent();
        if (component) {
            visit(component, writer);
        }
        for (const key of this) {
            writer?.descend(key);
            this.traverse(writer, visit);
            writer?.ascend();
        }
    }

    eachDrop<W extends JSON1WriteCursor | null>(writer: W, visit: (slot: number, writer: W) => void): void {
        this.traverse(writer, (component, current) => {
            if (component.d != null) {
                visit(component.d, current);
            }
        });
    }
}

interface IParentPosition {
    list: OperationList;
    offset: number;
    branch?: number;
}

/** JSON1 orders numeric array indices before string object keys, even when both spell the same digit. */
export function precedes(a: Key, b: Key): boolean {
    return typeof a === typeof b ? a < b : typeof a === 'number';
}

/** Build a live wire tree, keeping a single child's path inline until it acquires a sibling. */
export class JSON1WriteCursor implements IJSON1WriteCursor {
    private readonly _root: OperationList = [];
    private _list = this._root;
    /** Position immediately after the current path key, where a component may be stored. */
    private _offset = 0;
    private readonly _parents: IParentPosition[] = [];
    private readonly _pending: JSONXPath = [];
    private _lastBranch: number | undefined;

    get(): JSONXActions {
        return this._root.length > 0 ? this._root : null;
    }

    /** Allow the next descent to revisit an earlier sibling without changing the current path. */
    reset(): void {
        this._lastBranch = undefined;
    }

    descend(key: Key): void {
        if (typeof key !== 'number' && (typeof key !== 'string' || key === '__proto__')) {
            throw new Error('Invalid JSON key');
        }
        this._pending.push(key);
    }

    descendPath(path: JSONXPath): this {
        const depth = this._pending.length;
        try {
            for (const key of path) {
                this.descend(key);
            }
        } catch (error) {
            this._pending.length = depth;
            throw error;
        }
        return this;
    }

    ascend(): void {
        if (this._pending.length > 0) {
            this._pending.pop();
            return;
        }
        const parent = this._parents.pop();
        if (!parent) {
            throw new Error('Cannot ascend above the JSON1 root');
        }
        this._list = parent.list;
        this._offset = parent.offset;
        if (parent.branch !== undefined) {
            this._lastBranch = parent.branch;
        }
    }

    write<K extends keyof IJSON1Component>(key: K, value: IJSON1Component[K]): void {
        const component = this.getComponent();
        if (component[key] != null && component[key] !== value) {
            throw new Error('Cannot overwrite an existing JSON1 component field');
        }
        component[key] = value;
    }

    getComponent(): IJSON1Component {
        for (const segment of this._pending) {
            this._enter(segment);
        }
        this._pending.length = 0;

        const existing = this._list[this._offset];
        if (isComponent(existing)) {
            return existing;
        }
        const component: IJSON1Component = {};
        this._list.splice(this._offset, 0, component);
        return component;
    }

    private _enter(key: Key): void {
        const list = this._list;
        const offset = this._offset;
        const start = isComponent(list[offset]) ? offset + 1 : offset;
        const first = list[start];
        if (first === undefined || first === key) {
            if (first === undefined) {
                list.push(key);
            }
            // Ascending from the first inline root key also positions the cursor at the first branch for ordered writes.
            this._parents.push({ list, offset, branch: start === 0 ? 0 : undefined });
            this._offset = start + 1;
            return;
        }

        // A fork changes the encoding in place so earlier get() results still see subsequent writes.
        if (!Array.isArray(first)) {
            const suffix = list.splice(start);
            list.push(suffix);
            if (this._lastBranch !== undefined) {
                this._lastBranch = start;
            }
        }

        let next = start;
        if (this._lastBranch !== undefined) {
            const previous = list[this._lastBranch] as OperationList;
            if (!precedes(previous[0] as Key, key)) {
                throw new Error('Use reset() before revisiting an earlier JSON1 sibling');
            }
            next = this._lastBranch + 1;
        }
        // Ordered batch writes resume at the next sibling instead of rescanning the whole batch.
        while (next < list.length && precedes((list[next] as OperationList)[0] as Key, key)) {
            next++;
        }
        let child = list[next] as OperationList | undefined;
        if (child?.[0] !== key) {
            child = [key];
            list.splice(next, 0, child);
        }
        this._parents.push({ list, offset, branch: next });
        this._list = child;
        this._offset = 1;
        this.reset();
    }

    at(path: JSONXPath, visit: (writer: JSON1WriteCursor) => void): this {
        this.descendPath(path);
        visit(this);
        for (let i = 0; i < path.length; i++) {
            this.ascend();
        }
        return this;
    }

    writeAtPath<K extends keyof IJSON1Component>(path: JSONXPath, key: K, value: IJSON1Component[K]): this {
        this.at(path, () => this.write(key, value));
        this.reset();
        return this;
    }

    writeMove(from: JSONXPath, to: JSONXPath, slot = 0): this {
        return this.writeAtPath(from, 'p', slot).writeAtPath(to, 'd', slot);
    }

    /** Merge fields at paths relative to the current node, retaining move slot numbers and subtype payloads. */
    mergeTree(op: JSONXActions, merge?: (component: IJSON1Component, writer: JSON1WriteCursor) => void): void {
        if (op === null) {
            return;
        }
        if (!Array.isArray(op) || op === this._root) {
            throw new Error('Expected a separate JSON1 operation tree');
        }
        const startList = this._list;
        const previousBranch = this._lastBranch;
        let depth = 0;
        for (const item of op) {
            if (Array.isArray(item)) {
                this.mergeTree(item, merge);
            } else if (isComponent(item)) {
                if (merge) {
                    merge(item, this);
                    continue;
                }
                for (const field of Object.keys(item) as Array<keyof IJSON1Component>) {
                    this.write(field, item[field]);
                }
            } else {
                this.descend(item);
                depth++;
            }
        }
        while (depth > 0) {
            this.ascend();
            depth--;
        }
        this._lastBranch = this._list === startList ? previousBranch : undefined;
    }
}
