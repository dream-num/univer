import { DependencyDescriptor } from './DependencyDescriptor';
import {
    DependencyIdentifier,
    IdentifierDecorator,
    IdentifierDecoratorSymbol,
} from './DependencyIdentifier';
import { Ctor, prettyPrintIdentifier } from './DependencyItem';
import { LookUp, Quantity } from './Types';
import { DIError } from './Error';

export const TARGET = Symbol('$$TARGET');
export const DEPENDENCIES = Symbol('$$DEPENDENCIES');

class DependencyDescriptorNotFoundError extends DIError {
    constructor(index: number, target: Ctor<any>) {
        const msg = `Could not find dependency registered on the ${
            index + 1
        } parameter of the constructor of "${prettyPrintIdentifier(target)}".`;

        super(msg);
    }
}

export class IdentifierUndefinedError extends DIError {
    constructor(target: Ctor<any>, index: number) {
        const msg = `It seems that you register "undefined" as dependency on the ${
            index + 1
        } parameter of "${prettyPrintIdentifier(
            target
        )}". Please make sure that there is not cyclic dependency among your TypeScript files, or consider using "forwardRef".`;

        super(msg);
    }
}

/**
 * get dependencies declared on a class
 *
 * @param registerTarget the class
 * @returns dependencies
 */
export function getDependencies<T>(
    registerTarget: Ctor<T>
): Array<DependencyDescriptor<any>> {
    const target = registerTarget as any;
    return target[DEPENDENCIES] || [];
}

export function getDependencyByIndex<T>(
    registerTarget: Ctor<T>,
    index: number
): DependencyDescriptor<any> {
    const allDependencies = getDependencies(registerTarget);
    const dep = allDependencies.find(
        (descriptor) => descriptor.paramIndex === index
    );

    if (!dep) {
        throw new DependencyDescriptorNotFoundError(index, registerTarget);
    }

    return dep;
}

/**
 * declare dependency relationship on a class
 *
 * if the IDependencyDescriptor already exists, just modify it without creating
 * a new descriptor since differently decorators could be applied on a same
 * constructor property
 *
 * @param registerTarget the class to be registered
 * @param identifier dependency item identifier
 * @param paramIndex index of the decorator constructor parameter
 * @param quantity quantity of the dependency
 * @param lookUp optional lookup
 */
export function setDependency<T, U>(
    registerTarget: Ctor<U>,
    identifier: DependencyIdentifier<T>,
    paramIndex: number,
    quantity: Quantity = Quantity.REQUIRED,
    lookUp?: LookUp
): void {
    const descriptor: DependencyDescriptor<T> = {
        paramIndex,
        identifier,
        quantity,
        lookUp,
        withNew: false,
    };

    // sometimes identifier could be 'undefined' if user meant to pass in an ES class
    // this is related to how classes are transpiled
    if (typeof identifier === 'undefined') {
        throw new IdentifierUndefinedError(registerTarget, paramIndex);
    }

    const target = registerTarget as any;
    // deal with inheritance, subclass need to declare dependencies on its on
    if (target[TARGET] === target) {
        target[DEPENDENCIES].push(descriptor);
    } else {
        target[DEPENDENCIES] = [descriptor];
        target[TARGET] = target;
    }
}

const knownIdentifiers = new Set<string>();
export function createIdentifier<T>(id: string): IdentifierDecorator<T> {
    if (knownIdentifiers.has(id)) {
        throw new DIError(`Identifier "${id}" already exists.`);
    } else {
        knownIdentifiers.add(id);
    }

    const decorator = function d(
        registerTarget: Ctor<T>,
        _key: string,
        index: number
    ): void {
        setDependency(registerTarget, decorator, index);
    } as unknown as IdentifierDecorator<T>; // decorator as an identifier

    decorator.toString = () => id;
    decorator[IdentifierDecoratorSymbol] = true;

    return decorator;
}

/* istanbul ignore next */
export function TEST_ONLY_clearKnownIdentifiers(): void {
    knownIdentifiers.clear();
}
