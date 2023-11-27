/**
 * Enter an object, indexed by the keys in the object
 * example:
 * object a is {a:'a',b:'b',c:'c'}
 * object b is {a:'aa',b:'bb',c:'cc'}
 * object b is {a:'aaa',b:'bbb',c:'ccc'}
 * const model = new RefAlias([a,b,c],['a','b']) // the index is 'a' and 'b'.
 * we can use model.getValue('aa') or model.getValue('bb') get the object b
 * but can't use model.getValue('cc') to get the object b ,because model([a,b,c],['a','b']) is not set 'c' in the second parameter array
 */
export class RefAlias<T extends Record<string, unknown>, K extends keyof T = keyof T> {
    _values: T[] = [];
    _keys: K[] = [];
    _keyMaps: Map<keyof T, Map<unknown, T>> = new Map();

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

    getValue(key: string) {
        for (let index = 0; index < this._keys.length; index++) {
            const keyMap = this._keyMaps.get(this._keys[index]);
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

    deleteValue(key: string) {
        const value = this.getValue(key);
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
