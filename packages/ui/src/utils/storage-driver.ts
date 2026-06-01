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

const DB_NAME = 'UniverLocalStorage';
const STORE_NAME = 'kv';
const DB_VERSION = 1;

interface IStorageDriver {
    getItem<T>(key: string): Promise<T | null>;
    setItem<T>(key: string, value: T): Promise<T>;
    removeItem(key: string): Promise<void>;
    clear(): Promise<void>;
    key(index: number): Promise<string | null>;
    keys(): Promise<string[]>;
    iterate<T, U>(iteratee: (value: T, key: string, iterationNumber: number) => U): Promise<U>;
}

class IndexedDBDriver implements IStorageDriver {
    private _db: Promise<IDBDatabase>;

    constructor() {
        this._db = this._init();
    }

    private _init(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onerror = () => reject(req.error);
            req.onsuccess = () => resolve(req.result);
            req.onupgradeneeded = () => {
                req.result.createObjectStore(STORE_NAME);
            };
        });
    }

    private _store(mode: IDBTransactionMode): Promise<IDBObjectStore> {
        return this._db.then((db) => {
            const tx = db.transaction(STORE_NAME, mode);
            return tx.objectStore(STORE_NAME);
        });
    }

    async getItem<T>(key: string): Promise<T | null> {
        const store = await this._store('readonly');
        return new Promise((resolve, reject) => {
            const req = store.get(key);
            req.onsuccess = () => resolve(req.result ?? null);
            req.onerror = () => reject(req.error);
        });
    }

    async setItem<T>(key: string, value: T): Promise<T> {
        const store = await this._store('readwrite');
        return new Promise((resolve, reject) => {
            const req = store.put(value, key);
            req.onsuccess = () => resolve(value);
            req.onerror = () => reject(req.error);
        });
    }

    async removeItem(key: string): Promise<void> {
        const store = await this._store('readwrite');
        return new Promise((resolve, reject) => {
            const req = store.delete(key);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    }

    async clear(): Promise<void> {
        const store = await this._store('readwrite');
        return new Promise((resolve, reject) => {
            const req = store.clear();
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    }

    async key(index: number): Promise<string | null> {
        const store = await this._store('readonly');
        return new Promise((resolve, reject) => {
            const req = store.openCursor();
            let i = 0;
            req.onsuccess = () => {
                const cursor = req.result;
                if (!cursor) return resolve(null);
                if (i === index) return resolve(cursor.key as string);
                i++;
                cursor.continue();
            };
            req.onerror = () => reject(req.error);
        });
    }

    async keys(): Promise<string[]> {
        const store = await this._store('readonly');
        return new Promise((resolve, reject) => {
            const req = store.openCursor();
            const keys: string[] = [];
            req.onsuccess = () => {
                const cursor = req.result;
                if (!cursor) return resolve(keys);
                keys.push(cursor.key as string);
                cursor.continue();
            };
            req.onerror = () => reject(req.error);
        });
    }

    async iterate<T, U>(iteratee: (value: T, key: string, iterationNumber: number) => U): Promise<U> {
        const store = await this._store('readonly');
        return new Promise((resolve, reject) => {
            const req = store.openCursor();
            let i = 1;
            let result: U = undefined as U;
            req.onsuccess = () => {
                const cursor = req.result;
                if (!cursor) return resolve(result);
                result = iteratee(cursor.value as T, cursor.key as string, i++) as U;
                if (result !== undefined) return resolve(result);
                cursor.continue();
            };
            req.onerror = () => reject(req.error);
        });
    }
}

class LocalStorageDriver implements IStorageDriver {
    private _prefix = `${DB_NAME}/`;

    private _key(key: string): string {
        return this._prefix + key;
    }

    private _rawKey(key: string): string {
        return key.startsWith(this._prefix) ? key.slice(this._prefix.length) : key;
    }

    async getItem<T>(key: string): Promise<T | null> {
        try {
            const item = localStorage.getItem(this._key(key));
            return item ? JSON.parse(item) : null;
        } catch {
            return null;
        }
    }

    async setItem<T>(key: string, value: T): Promise<T> {
        localStorage.setItem(this._key(key), JSON.stringify(value));
        return value;
    }

    async removeItem(key: string): Promise<void> {
        localStorage.removeItem(this._key(key));
    }

    async clear(): Promise<void> {
        const toRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i)!;
            if (k.startsWith(this._prefix)) toRemove.push(k);
        }
        toRemove.forEach((k) => localStorage.removeItem(k));
    }

    async key(index: number): Promise<string | null> {
        const keys = this._keys();
        return keys[index] ?? null;
    }

    async keys(): Promise<string[]> {
        return this._keys();
    }

    private _keys(): string[] {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i)!;
            if (k.startsWith(this._prefix)) keys.push(this._rawKey(k));
        }
        return keys;
    }

    async iterate<T, U>(iteratee: (value: T, key: string, iterationNumber: number) => U): Promise<U> {
        const keys = this._keys();
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = await this.getItem<T>(key);
            const result = iteratee(value as T, key, i + 1) as U;
            if (result !== undefined) return result;
        }
        return undefined as U;
    }
}

function createDriver(): IStorageDriver {
    try {
        if (typeof indexedDB !== 'undefined') {
            return new IndexedDBDriver();
        }
    } catch {
        // fall through
    }
    return new LocalStorageDriver();
}

export const browserStorage = createDriver();
