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

export class RefAlias<T extends Record<string, unknown>, K extends keyof T = keyof T> {
    private _values: T[] = [];
    private _keys: K[] = [];
    private _keyMaps: Map<keyof T, Map<unknown, T>> = new Map();

    constructor(values: T[], keys: K[]) {
        this._values = values;
        this._keys = keys;
        values.forEach((item) => {
            this._initKeyMap(item);
        });
    }

    _initKeyMap(item: T) {
        this._keys.forEach((key) => {
            const value = item[key];
            const keyMap = this._keyMaps.get(key) || new Map();
            keyMap.set(value, item);
            this._keyMaps.set(key, keyMap);
        });
    }

    /**
     * If a key group is specified, the order of values is determined by the key group, otherwise it depends on the keys at initialization
     * @param {string} key
     * @param {K[]} [keyGroup]
     * @return {*}
     * @memberof RefAlias
     */
    getValue(key: string, keyGroup?: K[]) {
        const keys = keyGroup || this._keys;
        for (let index = 0; index < keys.length; index++) {
            const keyMap = this._keyMaps.get(keys[index]);
            if (keyMap?.has(key)) {
                return keyMap.get(key);
            }
        }
        return null;
    }

    hasValue(key: string) {
        for (let index = 0; index < this._keys.length; index++) {
            const keyMap = this._keyMaps.get(this._keys[index]);
            if (keyMap?.has(key)) {
                return true;
            }
        }
        return false;
    }

    addValue(item: T) {
        this._values.push(item);
        this._initKeyMap(item);
    }

    setValue(key: string, attr: keyof T, value: unknown) {
        const item = this.getValue(key);
        if (item) {
            if (Object.keys(item).includes(attr as string)) {
                item[attr] = value as T[keyof T];
            }
        }
    }

    deleteValue(key: string, keyGroup?: K[]) {
        const value = this.getValue(key, keyGroup);
        if (value) {
            this._keys.forEach((keyItem) => {
                const keyMap = this._keyMaps.get(keyItem);
                const _key = value[keyItem];
                keyMap?.delete(_key);
            });
            const index = this._values.findIndex((item) => item === value);
            this._values.splice(index, 1);
        }
    }

    getValues() {
        return this._values;
    }

    getKeyMap(key: K) {
        return [...(this._keyMaps.get(key)?.keys() || [])];
    }

    clear() {
        this._values = [];
        this._keys = [];
        this._keyMaps.clear();
    }
}
