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
