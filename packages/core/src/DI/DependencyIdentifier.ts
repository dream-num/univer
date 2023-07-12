import { ForwardRef } from './DependencyForwardRef';
import { Ctor, isCtor } from './Types';

export type IdentifierDecorator<T> = {
    // call signature of an decorator
    (...args: any[]): void;

    type: T;

    [IdentifierDecoratorSymbol]: true;

    // beautify console
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

export const IdentifierDecoratorSymbol = Symbol('$$IDENTIFIER_DECORATOR');

export function prettyPrintIdentifier<T>(id: DependencyIdentifier<T>): string {
    if (typeof id === 'undefined') {
        return 'undefined';
    }

    return isCtor(id) && !(id as any)[IdentifierDecoratorSymbol]
        ? id.name
        : id.toString();
}
