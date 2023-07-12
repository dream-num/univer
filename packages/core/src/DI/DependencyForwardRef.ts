import { Ctor } from './Types';

export interface ForwardRef<T> {
    unwrap(): Ctor<T>;
}

export function forwardRef<T>(wrapper: () => Ctor<T>): ForwardRef<T> {
    return {
        unwrap: wrapper,
    };
}

export function isForwardRef<T = any>(thing: unknown): thing is ForwardRef<T> {
    return !!thing && typeof (thing as any).unwrap === 'function';
}
