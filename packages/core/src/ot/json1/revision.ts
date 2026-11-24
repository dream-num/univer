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

import { cloneDeep, isEqual } from 'lodash-es';
import type { JSON1Document, JSONXActions, JSONXPath } from './json1';
import type { IEdit } from './operation';
import { entries, getEdit } from './operation';

type Key = JSONXPath[number];
interface ILocation { parent: Value; key: Key; version: number; action?: object }
interface IShift { index: number; add: boolean; value: Value }

/** Identity shared by all revisions. Untouched children exist on demand, even at a large array index. */
export class Value {
    private readonly _children = new Map<Key, Value>();
    readonly absent = new Set<Key>();

    constructor(readonly home?: { parent: Value; key: Key }, readonly literal?: JSON1Document) {}

    child(key: Key) {
        let value = this._children.get(key);
        if (!value) {
            const data = this.literal as Record<Key, JSON1Document> | undefined;
            const literal = data && Object.prototype.hasOwnProperty.call(data, key) ? data[key] : undefined;
            value = new Value({ parent: this, key }, literal);
            this._children.set(key, value);
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
    private readonly _objects = new Map<Value, Map<Key, Value | null>>();
    private readonly _shifts = new Map<Value, IShift[]>();

    constructor(readonly root = new Value()) {}

    copy() {
        const result = new Revision(this.root);
        this._modified.forEach((value) => result._modified.add(value));
        this.locations.forEach((v, k) => result.locations.set(k, v));
        this.edits.forEach((v, k) => result.edits.set(k, v));
        this.records.forEach((v, k) => result.records.set(k, v));
        this._objects.forEach((v, k) => result._objects.set(k, new Map(v)));
        this._shifts.forEach((v, k) => result._shifts.set(k, v.slice()));
        return result;
    }

    child(parent: Value, segment: Key): Value | null {
        let key = segment;
        if (typeof key === 'string') {
            const props = this._objects.get(parent);
            if (props?.has(key)) {
                return props.get(key)!;
            }
            if (parent.absent.has(key)) {
                return null;
            }
        } else {
            const shifts = this._shifts.get(parent) ?? [];
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
            const shifts = this._shifts.get(parent) ?? [];
            for (let i = version; i < shifts.length; i++) {
                const shift = shifts[i];
                if (shift.index <= key) {
                    key += shift.add ? 1 : -1;
                }
            }
        } else if (this.child(parent, key) !== value) {
            return null;
        }
        return { parent, key, version };
    }

    path(node: Value): JSONXPath | null {
        let value = node;
        const path: JSONXPath = [];
        const seen = new Set<Value>();
        while (value !== this.root) {
            if (seen.has(value)) {
                throw new Error('A document move creates a cycle');
            }
            seen.add(value);
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

    at(path: JSONXPath): Value {
        let node: Value | null = this.root;
        for (const key of ['root', ...path]) {
            node = this.child(node, key);
            if (!node) {
                throw new Error('Document path refers to a removed value');
            }
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

    private _place(parent: Value, key: Key, value: Value, add: boolean, action?: object) {
        this._markChanged(parent);
        let version = 0;
        if (typeof key === 'number') {
            let shifts = this._shifts.get(parent);
            if (!shifts) {
                this._shifts.set(parent, shifts = []);
            }
            version = shifts.push({ index: key, add, value });
        } else {
            let props = this._objects.get(parent);
            if (!props) {
                this._objects.set(parent, props = new Map());
            }
            if (add && !props.has(key)) {
                parent.absent.add(key);
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

    /**
     * Recover a source value from a later recorded deletion. Child identities put array entries
     * back in source order even when preceding changes moved or removed them.
     */
    private _record(value: Value, removed: JSON1Document) {
        if (value.literal !== undefined) {
            return;
        }
        if (!this._modified.has(value)) {
            this.records.set(value, removed);
            return;
        }
        let data = removed;
        const edit = this.edits.get(value);
        if (edit && data !== true) {
            try {
                if (!edit.type.invert) {
                    return;
                }
                data = edit.type.apply(cloneDeep(data), edit.type.invert(edit.payload)) as JSON1Document;
            } catch {
                // A compact subtype edit can omit deleted data. Its removal still replays, and
                // makeInvertible can recover the source from the document when undo is requested.
                data = true;
            }
        }
        if (Array.isArray(data)) {
            data.forEach((child, i) => {
                const node = this.child(value, i);
                if (node) {
                    this._record(node, child);
                }
            });
            const originalLength = data.length - (this._shifts.get(value) ?? []).reduce((n, shift) => n + (shift.add ? 1 : -1), 0);
            data = Array.from({ length: originalLength }, (_, i) => this.records.has(value.child(i)) ? this.records.get(value.child(i))! : true);
        } else if (data !== null && typeof data === 'object') {
            const original: Record<string, JSON1Document> = {};
            const keys = new Set([...Object.keys(data), ...(this._objects.get(value)?.keys() ?? [])]);
            for (const key of keys) {
                const child = this.child(value, key);
                if (child && data[key] !== undefined) {
                    this._record(child, data[key]);
                }
                if (!value.absent.has(key)) {
                    Object.defineProperty(original, key, {
                        value: this.records.get(value.child(key)),
                        writable: true,
                        enumerable: true,
                        configurable: true,
                    });
                }
            }
            data = original;
        }
        this.records.set(value, data);
    }

    /** Interpret one changeset, keeping a stable identity for a value while it travels between paths. */
    replay(op: JSONXActions, concurrent?: Revision) {
        const changes = entries(op);
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
                this._record(value, component.r as JSON1Document);
            }
            this.cut(value);
        }
        for (const { path, component } of changes) {
            const incoming = component.d === undefined ? undefined : held[component.d];
            if (incoming || component.i !== undefined) {
                const parent = path.length ? this.at(path.slice(0, -1)) : this.root;
                const key = path.length ? path[path.length - 1] : 'root';
                const peer = typeof key === 'string' && concurrent?.child(parent, key);
                const shared = peer && !peer.home && isEqual(peer.literal, component.i) ? peer : undefined;
                this.put(parent, key, incoming ?? shared ?? new Value(undefined, component.i as JSON1Document));
            }
            const edit = getEdit(component);
            if (edit) {
                const value = this.at(path);
                this._markChanged(value);
                const prior = this.edits.get(value);
                if (prior && prior.type !== edit.type) {
                    throw new Error('Cannot compose different edit types');
                }
                this.edits.set(value, prior ? { ...edit, payload: edit.type.compose(prior.payload, edit.payload) } : edit);
            }
        }
        return this;
    }

    /** Materialize literals in an insertion, omitting children transferred separately by move slots. */
    literal(value: Value, omit: Set<Value>, hints: Map<Value, JSON1Document>, fallback?: JSON1Document): JSON1Document {
        if (value.literal !== undefined && !this._modified.has(value) && !omit.size && !this.edits.has(value)) {
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
            const length = data.length + (this._shifts.get(value) ?? []).reduce((n, s) => n + (s.add ? 1 : -1), 0);
            const list: JSON1Document[] = [];
            for (let i = 0; i < length; i++) {
                const item = this.child(value, i)!;
                if (!omit.has(item)) {
                    list.push(this.literal(item, omit, hints, data[item.home?.key as number]));
                }
            }
            data = list;
        } else if (data !== null && typeof data === 'object') {
            const record: Record<string, JSON1Document> = {};
            for (const key of new Set([...Object.keys(data), ...(this._objects.get(value)?.keys() ?? [])])) {
                const item = this.child(value, key);
                if (item && !omit.has(item)) {
                    const original = data[key];
                    Object.defineProperty(record, key, {
                        value: original === undefined && !this.locations.has(item) && !hints.has(item) ? undefined : this.literal(item, omit, hints, original),
                        writable: true,
                        enumerable: true,
                        configurable: true,
                    });
                }
            }
            data = record;
        }
        const edit = this.edits.get(value);
        return edit ? edit.type.apply(cloneDeep(data), edit.payload) as JSON1Document : data;
    }
}
