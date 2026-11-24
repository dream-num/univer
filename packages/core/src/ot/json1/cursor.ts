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

import type { IJSON1Component, IJSON1WriteCursor, JSONXActions, JSONXPath } from './json1';

type Key = JSONXPath[number];
type OperationList = NonNullable<JSONXActions>;

function isComponent(item: OperationList[number] | undefined): item is IJSON1Component {
    return item != null && typeof item === 'object' && !Array.isArray(item);
}

/** Visit the wire tree directly so consumers can inspect or edit a component at its original path. */
export class JSON1ReadCursor {
    private readonly _path: JSONXPath = [];
    private _offset = 0;

    constructor(private _list: JSONXActions) {}

    getComponent(): IJSON1Component | null {
        const item = this._list?.[this._offset];
        return isComponent(item) ? item : null;
    }

    getPath(): JSONXPath {
        return this._path.slice();
    }

    traverse(writer: null, visit: (component: IJSON1Component, writer: null) => void): void {
        const list = this._list;
        if (list === null) {
            return;
        }

        const start = this._offset;
        const depth = this._path.length;
        for (let index = start; index < list.length; index++) {
            const item = list[index];
            if (Array.isArray(item)) {
                this._list = item;
                this._offset = 0;
                this.traverse(writer, visit);
            } else if (typeof item === 'object') {
                this._list = list;
                this._offset = index;
                visit(item, writer);
            } else {
                this._path.push(item);
            }
        }
        this._path.length = depth;
        this._list = list;
        this._offset = start;
    }
}

interface IParentPosition {
    list: OperationList;
    offset: number;
    branch?: number;
}

/** JSON1 orders numeric array indices before string object keys, even when both spell the same digit. */
function precedes(a: Key, b: Key): boolean {
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
        for (const segment of this._pending) {
            this._enter(segment);
        }
        this._pending.length = 0;

        const existing = this._list[this._offset];
        let component: IJSON1Component;
        if (isComponent(existing)) {
            component = existing;
        } else {
            component = {};
            this._list.splice(this._offset, 0, component);
        }
        if (component[key] != null && component[key] !== value) {
            throw new Error('Cannot overwrite an existing JSON1 component field');
        }
        component[key] = value;
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

    at(path: JSONXPath, visit: (writer: IJSON1WriteCursor) => void): this {
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
    mergeTree(op: JSONXActions): void {
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
                this.mergeTree(item);
            } else if (isComponent(item)) {
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
