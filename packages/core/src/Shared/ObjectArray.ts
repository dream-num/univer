import { IKeyValue, Nullable } from './Types';

/**
 * Predicate Function type
 */
export type PredicateFunction<T> = (index: number, value: T) => Nullable<boolean>;

/**
 * Function type
 */
export type Function<T, S> = (value: Nullable<T>) => S;

/**
 * Unary Operator Function type
 */
export type UnaryOperatorFunction<T> = (value: T) => T;

/**
 * Object Array Primitive Type
 */
export type ObjectArrayPrimitiveType<T> = { [key: number]: T; length?: number };

/**
 * Object Array Type
 * @deprecated
 */
export type ObjectArrayType<T> = ObjectArray<T> | ObjectArrayPrimitiveType<T>;

const define = <T>(value?: T): value is T => value !== undefined && value !== null;

const likeArr = (value: object): number => {
    let keys: string[] = Object.keys(value);
    let regexp = /^\d+$/;
    let maxKey = 0;
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        if (!regexp.test(key)) {
            return -1;
        }
        let seq = parseInt(key) + 1;
        if (seq > maxKey) {
            maxKey = seq;
        }
    }
    return maxKey;
};

/**
 * Arrays in object form and provide an array-like API
 *
 * @beta
 */
export class ObjectArray<T> {
    private _array: ObjectArrayPrimitiveType<T>;

    private _length: number;

    constructor();
    constructor(array: ObjectArrayPrimitiveType<T>);
    constructor(size: number);
    constructor(array: ObjectArrayPrimitiveType<T>, size: number);
    constructor(...argument: any) {
        switch (argument.length) {
            case 0: {
                this._array = {};
                this._length = 0;
                return;
            }
            case 1: {
                if (typeof argument[0] === 'number') {
                    this._array = {};
                    this._length = argument[0];
                    return;
                }
                const length = likeArr(argument[0]);
                if (length > -1) {
                    this._array = argument[0];
                    this._length = length;
                    return;
                }
                throw new Error(`create object array error ${JSON.stringify(argument[0])}`);
            }
            case 2: {
                if (likeArr(argument[0]) > -1) {
                    this._array = argument[0];
                    this._length = argument[1];
                    return;
                }
                throw new Error(`create object array error ${JSON.stringify(argument[0])}`);
            }
        }
    }

    static objectKeys<T>(array: Nullable<ObjectArrayPrimitiveType<T>>) {
        if (array) {
            const keys = Object.keys(array);
            const index = keys.indexOf('length');
            if (index > -1) {
                keys.splice(index, 1);
            }
            return keys;
        }
        return [];
    }

    static getMaxLength<T>(array: Nullable<ObjectArrayPrimitiveType<T>>) {
        if (array) {
            if (array.length) {
                return array.length;
            }
            const keys: unknown[] = ObjectArray.objectKeys(array);
            if (keys.length) {
                return Math.max(...(keys as number[])) + 1;
            }
        }
        return 0;
    }

    obtain(index: number, defaultValue: T): T {
        return this._array[index] ?? defaultValue;
    }

    getKeys(): string[] {
        return ObjectArray.objectKeys(this._array);
    }

    get(index: number): Nullable<T> {
        return this._array[index];
    }

    set(index: number, value: T): void {
        if (define(value)) {
            const length = this._length;
            this._array[index] = value;
            if (index >= length) {
                this._length = index + 1;
            }
        }
    }

    pop(): Nullable<T> {
        const length = this._length;
        const array = this._array;
        if (length > 0) {
            const lastIndex = length - 1;
            const lastValue = array[lastIndex];
            if (lastIndex > 0) {
                delete array[lastIndex];
                this._length--;
            }
            return lastValue;
        }
        return null;
    }

    push(value: T): void {
        if (define(value)) {
            let length = this._length;
            const array = this._array;
            array[length++] = value;
            this._length = length;
        }
    }

    first(): Nullable<T> {
        return this._array[0];
    }

    last(): Nullable<T> {
        const length = this._length - 1;
        return this._array[length];
    }

    shift(): Nullable<T> {
        const length = this._length;
        if (length > 0) {
            const first = this._array[0];
            const sizeOf = length - 1;
            let next: T;
            for (let i = 0; i < sizeOf; i++) {
                next = this._array[i + 1];
                if (define(next)) {
                    this._array[i] = next;
                }
            }
            this._length--;
            delete this._array[sizeOf];
            return first;
        }
        return null;
    }

    unshift(topValue: T): void {
        if (define(topValue)) {
            const length = this._length;
            const array = this._array;
            const sizeOf = length + 1;
            let last = array[0];
            for (let i = 1; i < sizeOf; i++) {
                const temp = this._array[i];
                if (define(last)) {
                    array[i] = last;
                }
                last = temp;
            }
            array[0] = topValue;
            this._length = sizeOf;
        }
    }

    clear(): void {
        this._array = {};
        this._length = 0;
    }

    getLength(): number {
        return this._length;
    }

    getSizeOf(): number {
        const array = this._array;
        const keys = Object.keys(array);
        return keys.length;
    }

    toJSON(): ObjectArrayPrimitiveType<T> {
        return this._array;
    }

    toArray(): T[] {
        const native = new Array<T>();
        const array = this._array;
        const keys = Object.keys(array);
        const length = keys.length;
        for (let i = 0; i < length; i++) {
            const key = +keys[i];
            native[key] = array[key];
        }
        return native;
    }

    forEach(callback: PredicateFunction<T>): ObjectArray<T> {
        const array = this._array;
        const keys = Object.keys(array);
        const length = keys.length;
        for (let i = 0; i < length; i++) {
            const key = +keys[i];
            const result = callback(key, array[key]);
            if (result === false) {
                return this;
            }
        }
        return this;
    }

    clone(callback: Nullable<UnaryOperatorFunction<T>>): ObjectArray<T> {
        const instance = new ObjectArray<T>();
        if (callback) {
            this.forEach((idx, val) => {
                instance.set(idx, callback(val));
            });
        } else {
            this.forEach((idx, val) => {
                instance.set(idx, val);
            });
        }
        return instance;
    }

    isEmpty(): boolean {
        const array = this._array;
        const keys = Object.keys(array);
        return keys.length === 0;
    }

    delete(index: number): void {
        this.splice(index, 1);
    }

    includes(target: T): boolean {
        const array = this._array;
        const keys = Object.keys(array);
        const length = keys.length;
        for (let i = 0; i < length; i++) {
            const key = +keys[i];
            const value = array[key];
            if (value === target) {
                return true;
            }
        }
        return false;
    }

    slice(start: number, end: number): ObjectArray<T> {
        const array = this._array;
        const length = this._length;
        if (length > 0) {
            const fragment: IKeyValue = {};
            let effective = 0;
            for (let i = start; i < end; i++) {
                const item = array[i];
                if (define(item)) {
                    fragment[effective] = array[i];
                    effective++;
                }
            }
            return new ObjectArray(fragment, effective);
        }
        return new ObjectArray<T>();
    }

    concat(target: ObjectArray<T>): ObjectArray<T> {
        const srcArray = this._array;
        const srcKeys = Object.keys(srcArray) as unknown as number[];
        const srcLength = srcKeys.length;

        const targetArray = target._array;
        const targetKeys = Object.keys(targetArray) as unknown as number[];
        const targetLength = targetKeys.length;

        const container = new ObjectArray<T>(srcLength + targetLength);
        const containerArray = container._array;
        let master = 0;

        for (let i = 0; i < srcLength; i++, master++) {
            const key = srcKeys[i];
            containerArray[master] = srcArray[key];
        }
        for (let i = 0; i < targetLength; i++, master++) {
            const key = targetKeys[i];
            containerArray[master] = targetArray[key];
        }

        return container;
    }

    find(callback: PredicateFunction<T>): Nullable<T> {
        const array = this._array;
        const keys = Object.keys(array);
        const length = keys.length;
        for (let i = 0; i < length; i++) {
            const key = +keys[i];
            const value = array[key];
            const result = callback(key, value);
            if (result === true) {
                return value;
            }
        }
        return null;
    }

    splice(start: number, count: number): ObjectArray<T> {
        const length = this._length;
        if (length > 0) {
            const end = start + count;
            const array = this._array;
            let effective = 0;
            const splice: ObjectArrayPrimitiveType<T> = {};
            for (let i = start; i < end; i++) {
                const item = array[i];
                if (define(item)) {
                    delete array[i];
                    splice[effective] = item;
                    effective++;
                }
            }

            const diff = end - start;
            const last = length;
            this._length -= diff;

            if (this._length <= 0) {
                this._array = {};
                this._length = 0;
            } else {
                for (let i = end; i < last; i++) {
                    const item = array[i];
                    if (define(item)) {
                        array[i - diff] = array[i];
                        delete array[i];
                    }
                }
            }
            return new ObjectArray(splice, effective);
        }
        return new ObjectArray<T>();
    }

    findIndex(callback: PredicateFunction<T>): number {
        const array = this._array;
        const keys = Object.keys(array);
        const length = keys.length;
        for (let i = 0; i < length; i++) {
            const key = +keys[i];
            const result = callback(key, array[key]);
            if (result === true) {
                return i;
            }
        }
        return -1;
    }

    map<S>(callback: Function<T, S>): ObjectArray<S> {
        const array = this._array;
        const keys = Object.keys(array);
        const length = keys.length;
        const result: ObjectArrayPrimitiveType<S> = {};
        for (let i = 0; i < length; i++) {
            const key = +keys[i];
            const value = array[key];
            result[i] = callback(value);
        }
        return new ObjectArray<S>(result);
    }

    filter(callback: PredicateFunction<T>): ObjectArray<T> {
        const array = this._array;
        const keys = Object.keys(array);
        const length = keys.length;
        const filter: ObjectArrayPrimitiveType<T> = {};
        let master = 0;
        for (let i = 0; i < length; i++) {
            const key = +keys[i];
            const value = array[key];
            if (callback(key, value)) {
                filter[master] = value;
                master++;
            }
        }
        return new ObjectArray(filter, master);
    }

    insert(index: number, value: T): ObjectArray<T> {
        const length = this._length;
        const array = this._array;
        for (let i = length - 1; i >= index; i--) {
            array[i + 1] = array[i];
        }
        array[index] = value;
        this._length = length + 1;
        return this;
    }

    inserts(index: number, target: ObjectArray<T>): ObjectArray<T> {
        const targetArray = target._array;
        const targetLength = target._length;

        const srcArray = this._array;
        const srcLength = this._length;

        const lastIndex = srcLength - 1;
        for (let i = lastIndex; i >= index; i--) {
            const item = srcArray[i];
            if (define(item)) {
                delete srcArray[i];
                srcArray[i + targetLength] = item;
            }
        }
        for (let i = 0; i < targetLength; i++) {
            const item = targetArray[i];
            if (define(item)) {
                srcArray[i + index] = targetArray[i];
            }
        }
        this._length += targetLength;
        return this;
    }

    [Symbol.iterator](): IterableIterator<T> {
        return new ObjectArrayIterableIterator<T>(this);
    }
}

/**
 * Iterator with ObjectArray
 */
export class ObjectArrayIterableIterator<T> implements IterableIterator<T> {
    private _array: ObjectArray<T>;

    private _keys: string[];

    private _cursor: number;

    constructor(objectArray: ObjectArray<T>) {
        this._array = objectArray;
        this._keys = objectArray.getKeys();
        this._cursor = 0;
    }

    next(): IteratorResult<T, null> {
        const array = this._array;
        const keys = this._keys;
        const cursor = this._cursor;
        if (cursor < keys.length) {
            const key = keys[cursor];
            const value = array.get(+key);
            this._cursor++;
            return { value: value as T, done: false };
        }
        return { value: null, done: true };
    }

    [Symbol.iterator](): IterableIterator<T> {
        return new ObjectArrayIterableIterator(this._array);
    }
}
