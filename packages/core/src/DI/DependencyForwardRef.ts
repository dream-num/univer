import {
    DependencyIdentifier,
    NormalizedDependencyIdentifier,
} from './DependencyIdentifier';
import { Ctor } from './DependencyItem';

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

export function normalizeForwardRef<T>(
    id: DependencyIdentifier<T>
): NormalizedDependencyIdentifier<T> {
    if (isForwardRef(id)) {
        return id.unwrap();
    }

    return id;
}
