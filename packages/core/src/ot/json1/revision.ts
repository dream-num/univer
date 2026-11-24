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

import type { JSON1Document, JSONXPath } from './json1';
import type { IEdit, IEntry } from './operation';
import { Tools } from '../../shared/tools';
import { cloneDocument, getEdit } from './operation';

type Key = JSONXPath[number];
interface ILocation { parent: Value; key: Key; version?: number; action?: object }
interface IShift { index: number; add: boolean; value: Value }

/** Identity shared by all revisions. Untouched children exist on demand, even at a large array index. */
export class Value {
    private _children?: Map<Key, Value>;
    absent?: Set<Key>;

    constructor(readonly home?: { parent: Value; key: Key }, readonly literal?: JSON1Document) {}

    child(key: Key) {
        let value = this._children?.get(key);
        if (!value) {
            const data = this.literal as Record<Key, JSON1Document> | undefined;
            const literal = data && Object.prototype.hasOwnProperty.call(data, key) ? data[key] : undefined;
            value = new Value({ parent: this, key }, literal);
            (this._children ??= new Map()).set(key, value);
        }
        return value;
    }
}

/** A sparse revision records relocations and array splices without constructing the document. */
export class Revision {
    readonly locations = new Map<Value, ILocation | null>();
    private readonly _modified = new Set<Value>();
    readonly edits = new Map<Value, IEdit>();
    readonly records = new Map<Value, JSON1Document>();
    private _objects?: Map<Value, Map<Key, Value | null>>;
    private _shifts?: Map<Value, IShift[]>;

    constructor(readonly root = new Value()) {}

    copy() {
        const result = new Revision(this.root);
        this._modified.forEach((value) => result._modified.add(value));
        this.locations.forEach((v, k) => result.locations.set(k, v));
        this.edits.forEach((v, k) => result.edits.set(k, v));
        this.records.forEach((v, k) => result.records.set(k, v));
        if (this._objects) {
            result._objects = new Map();
            this._objects.forEach((v, k) => result._objects!.set(k, new Map(v)));
        }
        if (this._shifts) {
            result._shifts = new Map();
            this._shifts.forEach((v, k) => result._shifts!.set(k, v.slice()));
        }
        return result;
    }

    child(parent: Value, segment: Key): Value | null {
        let key = segment;
        if (typeof key === 'string') {
            const props = this._objects?.get(parent);
            if (props?.has(key)) {
                return props.get(key)!;
            }
            if (parent.absent?.has(key)) {
                return null;
            }
        } else {
            const shifts = this._shifts?.get(parent) ?? [];
            for (let i = shifts.length - 1; i >= 0; i--) {
                const shift = shifts[i];
                if (key < shift.index) {
                    continue;
                }
                if (shift.add && key === shift.index) {
                    return shift.value;
                }
                key += shift.add ? -1 : 1;
            }
        }
        if (parent.literal !== undefined && (parent.literal === null || !Object.prototype.hasOwnProperty.call(parent.literal, key))) {
            return null;
        }
        return parent.child(key);
    }

    /** Locate the original child after all splices that followed its attachment. */
    location(value: Value): ILocation | null {
        const attached = this.locations.get(value);
        if (attached === null) {
            return null;
        }
        const source = attached ?? value.home;
        if (!source) {
            return null;
        }
        const { parent } = source;
        let { key } = source;
        const version = attached?.version ?? 0;
        if (typeof key === 'number') {
            const shifts = this._shifts?.get(parent);
            if (!shifts || shifts.length === version) {
                return source;
            }
            for (let i = version; i < shifts.length; i++) {
                const shift = shifts[i];
                if (shift.index <= key) {
                    key += shift.add ? 1 : -1;
                }
            }
        } else {
            const occupants = this._objects?.get(parent);
            if (occupants?.has(key) ? occupants.get(key) !== value : parent.absent?.has(key)) {
                return null;
            }
            return source;
        }
        return { parent, key, version };
    }

    path(node: Value): JSONXPath | null {
        let value = node;
        const path: JSONXPath = [];
        let seen: Set<Value> | undefined;
        while (value !== this.root) {
            if (path.length >= 16) {
                seen ??= new Set();
                if (seen.has(value)) {
                    throw new Error('A document move creates a cycle');
                }
                seen.add(value);
            }
            const loc = this.location(value);
            if (!loc) {
                return null;
            }
            path.push(loc.key);
            value = loc.parent;
        }
        path.pop();
        return path.reverse();
    }

    at(path: JSONXPath, length = path.length): Value {
        let node = this.child(this.root, 'root');
        for (let i = 0; node && i < length; i++) {
            node = this.child(node, path[i]);
        }
        if (!node) {
            throw new Error('Document path refers to a removed value');
        }
        return node;
    }

    private _markChanged(node: Value) {
        let current: Value | undefined = node;
        while (current && !this._modified.has(current)) {
            this._modified.add(current);
            current = this.location(current)?.parent;
        }
    }

    /** Mark ancestor literals dirty when a nested subtype edit changes their materialized contents. */
    setEdit(value: Value, edit: IEdit) {
        this._markChanged(value);
        this.edits.set(value, edit);
    }

    private _place(parent: Value, key: Key, value: Value, add: boolean, action?: object) {
        this._markChanged(parent);
        let version = 0;
        if (typeof key === 'number') {
            let shifts = this._shifts?.get(parent);
            if (!shifts) {
                (this._shifts ??= new Map()).set(parent, shifts = []);
            }
            version = shifts.push({ index: key, add, value });
        } else {
            let props = this._objects?.get(parent);
            if (!props) {
                (this._objects ??= new Map()).set(parent, props = new Map());
            }
            if (add && !props.has(key)) {
                (parent.absent ??= new Set()).add(key);
            }
            props.set(key, add ? value : null);
        }
        this.locations.set(value, add ? { parent, key, version, action: action ?? {} } : null);
    }

    cut(value: Value) {
        const loc = this.location(value);
        if (loc) {
            this._place(loc.parent, loc.key, value, false);
        }
    }

    put(parent: Value, key: Key, value: Value, action?: object) {
        this._place(parent, key, value, true, action);
    }

    /** Interpret one changeset, keeping a stable identity for a value while it travels between paths. */
    replay(changes: IEntry[], concurrent?: Revision) {
        const held: Value[] = [];
        for (let i = changes.length - 1; i >= 0; i--) {
            const { path, component } = changes[i];
            if (component.p === undefined && component.r === undefined) {
                continue;
            }
            const value = this.at(path);
            if (component.p !== undefined) {
                held[component.p] = value;
            }
            if (component.r !== undefined) {
                // History stores the removal payload from the operation that actually cut
                // this value, even when an earlier edit or move changed its contents.
                this.records.set(value, component.r as JSON1Document);
            }
            this.cut(value);
        }
        for (const { path, component } of changes) {
            const incoming = component.d === undefined ? undefined : held[component.d];
            if (incoming || component.i !== undefined) {
                const parent = path.length ? this.at(path, path.length - 1) : this.root;
                const key = path.length ? path[path.length - 1] : 'root';
                const peer = typeof key === 'string' && concurrent?.child(parent, key);
                const shared = peer && !peer.home && Tools.diffValue(peer.literal, component.i) ? peer : undefined;
                this.put(parent, key, incoming ?? shared ?? new Value(undefined, component.i as JSON1Document));
            }
            const edit = getEdit(component);
            if (edit) {
                const value = this.at(path);
                const prior = this.edits.get(value);
                if (prior && prior.type !== edit.type) {
                    throw new Error('Cannot compose different edit types');
                }
                this.setEdit(value, prior ? { ...edit, payload: edit.type.compose(prior.payload, edit.payload) } : edit);
            }
        }
        return this;
    }

    /** Materialize literals in an insertion, omitting children transferred separately by move slots. */
    literal(value: Value, omit: Set<Value>, hints: Map<Value, JSON1Document>, fallback?: JSON1Document, applyEdits = true): JSON1Document {
        if (value.literal !== undefined && !this._modified.has(value)) {
            return value.literal;
        }
        let data = value.literal !== undefined ? value.literal : hints.get(value);
        if (data === undefined) {
            data = fallback;
        }
        if (data === undefined) {
            return true;
        }
        if (Array.isArray(data)) {
            const length = data.length + (this._shifts?.get(value) ?? []).reduce((n, s) => n + (s.add ? 1 : -1), 0);
            const list: JSON1Document[] = [];
            for (let i = 0; i < length; i++) {
                const item = this.child(value, i)!;
                if (!omit.has(item)) {
                    list.push(this.literal(item, omit, hints, data[item.home?.key as number], applyEdits));
                }
            }
            data = list;
        } else if (data !== null && typeof data === 'object') {
            const record: Record<string, JSON1Document> = {};
            for (const key of new Set([...Object.keys(data), ...(this._objects?.get(value)?.keys() ?? [])])) {
                const item = this.child(value, key);
                if (item && !omit.has(item)) {
                    const original = data[key];
                    Object.defineProperty(record, key, {
                        value: original === undefined && !this.locations.has(item) && !hints.has(item) ? undefined : this.literal(item, omit, hints, original, applyEdits),
                        writable: true,
                        enumerable: true,
                        configurable: true,
                    });
                }
            }
            data = record;
        }
        const edit = applyEdits && this.edits.get(value);
        // A compact removal has no snapshot to pass to a subtype. Its caller can recover
        // the exact value with makeInvertible against the document on which it will run.
        if (edit && data === true && value.literal === undefined) {
            return true;
        }
        return edit ? edit.type.apply(cloneDocument(data), edit.payload) as JSON1Document : data;
    }
}
