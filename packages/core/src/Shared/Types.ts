/**
 * Alias type for value that can be null
 */
export type Nullable<T> = T | null | undefined | void;

/**
 * wrap any
 */
export type NoNeedCheckedType = any;

/**
 * Class type
 */
export type Class<T> = {
    new (...param: any): T;
};

/**
 * Key value object
 */
export interface IKeyValue {
    [key: string]: any;
}

/**
 * Custom type of key
 */
export type IKeyType<T> = {
    [key: string]: T;
};

export type AsyncFunction<T = void, R = void> = (value: T) => Promise<R>;
