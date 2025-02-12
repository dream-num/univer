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

import { remove } from '../../common/array';

import { toDisposable } from '../lifecycle';
import type { IDisposable } from '../../common/di';

const NEWER = Symbol('newer');
const OLDER = Symbol('older');

export class KeyIterator<K, V> implements IterableIterator<K> {
    entry: Entry<K, V> | undefined;

    constructor(oldestEntry: Entry<K, V> | undefined) {
        this.entry = oldestEntry;
    }

    [Symbol.iterator](): IterableIterator<K> {
        return this;
    }

    next(): IteratorResult<K, K | undefined> {
        const ent = this.entry;
        if (ent) {
            this.entry = ent[NEWER];
            return { done: false, value: ent.key };
        }
        return { done: true, value: undefined };
    }
}

export class ValueIterator<K, V> implements IterableIterator<V> {
    entry: Entry<K, V> | undefined;

    constructor(oldestEntry: Entry<K, V> | undefined) {
        this.entry = oldestEntry;
    }

    [Symbol.iterator](): IterableIterator<V> {
        return this;
    }

    next(): IteratorResult<V, V | undefined> {
        const ent = this.entry;
        if (ent) {
            this.entry = ent[NEWER];
            return { done: false, value: ent.value };
        }
        return { done: true, value: undefined };
    }
}

export class EntryIterator<K, V> implements IterableIterator<[K, V]> {
    entry: Entry<K, V> | undefined;

    constructor(oldestEntry: Entry<K, V> | undefined) {
        this.entry = oldestEntry;
    }

    [Symbol.iterator](): IterableIterator<[K, V]> {
        return this;
    }

    next(): IteratorResult<[K, V], [K, V] | undefined> {
        const ent = this.entry;
        if (ent) {
            this.entry = ent[NEWER];
            return { done: false, value: [ent.key, ent.value] };
        }
        return { done: true, value: undefined };
    }
}

export class Entry<K, V> {
    key: K;

    value: V;

    [NEWER]: Entry<K, V> | undefined;

    [OLDER]: Entry<K, V> | undefined;

    constructor(key: K, value: V) {
        this.key = key;
        this.value = value;

        this[NEWER] = undefined;
        this[OLDER] = undefined;
    }

    toJSON(): { key: K; value: V } {
        return {
            key: this.key,
            value: this.value,
        };
    }
}

export class LRUMap<K, V> {
    private _keymap!: Map<K, Entry<K, V>>;

    size: number = 0;

    limit!: number;

    oldest: Entry<K, V> | undefined;

    newest: Entry<K, V> | undefined;

    private readonly _onShiftListeners: Array<(entry: Entry<K, V>) => void> = [];

    onShift(callback: (entry: Entry<K, V>) => void): IDisposable {
        if (this._onShiftListeners.indexOf(callback) === -1) {
            this._onShiftListeners.push(callback);

            return toDisposable(() => remove(this._onShiftListeners, callback));
        }

        throw new Error('[LRUMap]: the listener has been registered!');
    }

    constructor(entries: Iterable<[K, V]>);
    constructor(limit: number);
    constructor(limit: number, entries: Iterable<[K, V]>);
    constructor(...parameter: any) {
        if (LRUHelper.hasLength(parameter, 1)) {
            if (LRUHelper.isNumber(parameter[0])) {
                const limit = parameter[0];
                this._initialize(limit, undefined);
                return;
            }
            if (LRUHelper.isIterable<[K, V]>(parameter[0])) {
                const entries = parameter[0];
                this._initialize(0, entries);
                return;
            }
            return;
        }
        if (LRUHelper.hasLength(parameter, 2)) {
            const limit = parameter[0];
            const entries = parameter[1];
            this._initialize(limit, entries);
        }
    }

    _initialize(limit: number, entries: Iterable<[K, V]> | undefined): void {
        this.oldest = undefined;
        this.newest = undefined;
        this.size = 0;
        this.limit = limit;
        this._keymap = new Map();

        if (entries) {
            this.assign(entries);
            if (limit < 1) {
                this.limit = this.size;
            }
        }
    }

    _markEntryAsUsed(entry: Entry<K, V>) {
        if (entry === this.newest) {
            // Already the most recently used entry, so no need to update the list
            return;
        }
        // HEAD--------------TAIL
        //   <.older   .newer>
        //  <--- add direction --
        //   A  B  C  <D>  E
        if (entry[NEWER]) {
            if (entry === this.oldest) {
                this.oldest = entry[NEWER];
            }
            entry[NEWER][OLDER] = entry[OLDER]; // C <-- E.
        }
        if (entry[OLDER]) {
            entry[OLDER][NEWER] = entry[NEWER]; // C. --> E
        }
        entry[NEWER] = undefined; // D --x
        entry[OLDER] = this.newest; // D. --> E
        if (this.newest) {
            this.newest[NEWER] = entry; // E. <-- D
        }
        this.newest = entry;
    }

    assign(entries: Iterable<[K, V]>): void {
        let entry;
        let limit = this.limit || Number.MAX_VALUE;
        this._keymap.clear();
        const it = entries[Symbol.iterator]();
        for (let itv = it.next(); !itv.done; itv = it.next()) {
            const e = new Entry(itv.value[0], itv.value[1]);
            this._keymap.set(e.key, e);
            if (!entry) {
                this.oldest = e;
            } else {
                entry[NEWER] = e;
                e[OLDER] = entry;
            }
            entry = e;
            if (limit-- === 0) {
                throw new Error('overflow');
            }
        }
        this.newest = entry;
        this.size = this._keymap.size;
    }

    set(key: K, value: V): LRUMap<K, V> {
        let entry = this._keymap.get(key);

        if (entry) {
            // update existing
            entry.value = value;
            this._markEntryAsUsed(entry);
            return this;
        }

        // new entry
        this._keymap.set(key, (entry = new Entry<K, V>(key, value)));

        if (this.newest) {
            // link previous tail to the new tail (entry)
            this.newest[NEWER] = entry;
            entry[OLDER] = this.newest;
        } else {
            // we're first in -- yay
            this.oldest = entry;
        }

        // add new entry to the end of the linked list -- it's now the freshest entry.
        this.newest = entry;
        ++this.size;
        if (this.size > this.limit) {
            // we hit the limit -- remove the head
            this.shift();
        }

        return this;
    }

    shift(): [K, V] | undefined {
        // todo: handle special case when limit == 1
        const entry = this.oldest;
        if (entry) {
            if (this.oldest && this.oldest[NEWER]) {
                // advance the list
                this.oldest = this.oldest[NEWER];
                this.oldest[OLDER] = undefined;
            } else {
                // the cache is exhausted
                this.oldest = undefined;
                this.newest = undefined;
            }
            // Remove last strong reference to <entry> and remove links from the purged
            // entry being returned:
            entry[NEWER] = entry[OLDER] = undefined;
            this._keymap.delete(entry.key);
            --this.size;
            this._onShiftListeners.forEach((callback) => callback(entry));
            return [entry.key, entry.value];
        }
    }

    get(key: K): V | undefined {
        // First, find our cache entry
        const entry = this._keymap.get(key);
        if (!entry) return; // Not cached. Sorry.
        // As <key> was found in the cache, register it as being requested recently
        this._markEntryAsUsed(entry);
        return entry.value;
    }

    has(key: K): boolean {
        return this._keymap.has(key);
    }

    find(key: K): V | undefined {
        const e = this._keymap.get(key);
        return e ? e.value : undefined;
    }

    delete(key: K): V | undefined {
        const entry = this._keymap.get(key);
        if (!entry) return;
        this._keymap.delete(entry.key);
        if (entry[NEWER] && entry[OLDER]) {
            // relink the older entry with the newer entry
            entry[OLDER][NEWER] = entry[NEWER];
            entry[NEWER][OLDER] = entry[OLDER];
        } else if (entry[NEWER]) {
            // remove the link to us
            entry[NEWER][OLDER] = undefined;
            // link the newer entry to head
            this.oldest = entry[NEWER];
        } else if (entry[OLDER]) {
            // remove the link to us
            entry[OLDER][NEWER] = undefined;
            // link the newer entry to head
            this.newest = entry[OLDER];
        } else {
            // if(entry[OLDER] === undefined && entry.newer === undefined) {
            this.oldest = this.newest = undefined;
        }

        this.size--;
        return entry.value;
    }

    clear(): void {
        // Not clearing links should be safe, as we don't expose live links to user
        this.oldest = undefined;
        this.newest = undefined;
        this.size = 0;
        this._keymap.clear();
    }

    keys(): Iterator<K, K | undefined> {
        return new KeyIterator(this.oldest);
    }

    values(): Iterator<V, V | undefined> {
        return new ValueIterator(this.oldest);
    }

    entries(): Iterator<[K, V], [K, V] | undefined> {
        return this[Symbol.iterator]();
    }

    [Symbol.iterator](): Iterator<[K, V], [K, V] | undefined> {
        return new EntryIterator(this.oldest);
    }

    forEach(fun: (value: V, key: K, m: LRUMap<K, V>) => void, thisObj?: any): void {
        if (typeof thisObj !== 'object') {
            thisObj = this;
        }
        let entry = this.oldest;
        while (entry) {
            fun.call(thisObj, entry.value, entry.key, this);
            entry = entry[NEWER];
        }
    }

    toJSON(): Array<{ key: K; value: V }> {
        const s = new Array(this.size);
        let i = 0;
        let entry = this.oldest;
        while (entry) {
            s[i++] = { key: entry.key, value: entry.value };
            entry = entry[NEWER];
        }
        return s;
    }

    toString(): string {
        let s = String();
        let entry = this.oldest;
        while (entry) {
            s += `${String(entry.key)}:${entry.value}`;
            entry = entry[NEWER];
            if (entry) {
                s += ' < ';
            }
        }
        return s;
    }
}

export class LRUHelper {
    static hasLength(array: unknown[], size: number) {
        return array.length === size;
    }

    static getValueType(value: any): string {
        return Object.prototype.toString.apply(value);
    }

    static isObject<T = object>(value?: any): value is T {
        return this.getValueType(value) === '[object Object]';
    }

    static isIterable<T>(value?: any): value is Iterable<T> {
        return value[Symbol.iterator] != null;
    }

    static isNumber(value?: any): value is number {
        return this.getValueType(value) === '[object Number]';
    }
}
