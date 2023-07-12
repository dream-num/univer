import { Ctor } from './DependencyItem';
import { ForwardRef } from './DependencyForwardRef';

export const IdentifierDecoratorSymbol = Symbol('$$IDENTIFIER_DECORATOR');

export type IdentifierDecorator<T> = {
    // call signature of an decorator
    (...args: any[]): void;

    type: T;

    [IdentifierDecoratorSymbol]: true;

    /**
     * beautify console
     */
    toString(): string;
};

export type DependencyIdentifier<T> =
    | string
    | Ctor<T>
    | ForwardRef<T>
    | IdentifierDecorator<T>;

export type NormalizedDependencyIdentifier<T> = Exclude<
    DependencyIdentifier<T>,
    ForwardRef<T>
>;
