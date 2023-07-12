export enum Quantity {
    MANY = 'many',
    OPTIONAL = 'optional',
    REQUIRED = 'required',
}

export enum LookUp {
    SELF = 'self',
    SKIP_SELF = 'skipSelf',
}

export interface Ctor<T> {
    name: string; // constructor function has a name

    new (...args: any[]): T;
}
export function isCtor<T>(thing: unknown): thing is Ctor<T> {
    return typeof thing === 'function';
}
