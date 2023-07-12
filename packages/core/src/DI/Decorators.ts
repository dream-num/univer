import {
    DependencyIdentifier,
    IdentifierDecorator,
    IdentifierDecoratorSymbol,
    prettyPrintIdentifier,
} from './DependencyIdentifier';
import { Ctor, LookUp, Quantity } from './Types';
import { DIError } from './Error';

export interface DependencyItemHooks<T> {
    onInstantiation?: (instance: T) => void;
}

export interface ClassDependencyItem<T> extends DependencyItemHooks<T> {
    useClass: Ctor<T>;
    lazy?: boolean;
}

export function isClassDependencyItem<T>(
    thing: unknown
): thing is ClassDependencyItem<T> {
    if (thing && typeof (thing as any).useClass !== 'undefined') {
        return true;
    }

    return false;
}

export type FactoryDepModifier =
    | typeof Self
    | typeof SkipSelf
    | typeof Optional
    | typeof Many
    | typeof WithNew;

export type FactoryDep<T> =
    | [...FactoryDepModifier[], DependencyIdentifier<T>]
    | DependencyIdentifier<T>;

export interface FactoryDependencyItem<T> extends DependencyItemHooks<T> {
    useFactory: (...deps: any[]) => T;
    dynamic?: true;
    deps?: Array<FactoryDep<any>>;
}

export function isFactoryDependencyItem<T>(
    thing: unknown
): thing is FactoryDependencyItem<T> {
    if (thing && typeof (thing as any).useFactory !== 'undefined') {
        return true;
    }

    return false;
}

export interface ValueDependencyItem<T> extends DependencyItemHooks<T> {
    useValue: T;
}

export function isValueDependencyItem<T>(
    thing: unknown
): thing is ValueDependencyItem<T> {
    if (thing && typeof (thing as any).useValue !== 'undefined') {
        return true;
    }

    return false;
}

export interface AsyncDependencyItem<T> extends DependencyItemHooks<T> {
    useAsync: () => Promise<
        T | Ctor<T> | [DependencyIdentifier<T>, SyncDependencyItem<T>]
    >;
}

export function isAsyncDependencyItem<T>(
    thing: unknown
): thing is AsyncDependencyItem<T> {
    if (thing && typeof (thing as any).useAsync !== 'undefined') {
        return true;
    }

    return false;
}

export interface AsyncHook<T> {
    whenReady(): Promise<T>;
}

export function isAsyncHook<T>(thing: unknown): thing is AsyncHook<T> {
    if (thing && typeof (thing as any).whenReady !== 'undefined') {
        return true;
    }

    return false;
}

export type SyncDependencyItem<T> =
    | ClassDependencyItem<T>
    | FactoryDependencyItem<T>
    | ValueDependencyItem<T>;

export type DependencyItem<T> = SyncDependencyItem<T> | AsyncDependencyItem<T>;

export const TARGET = Symbol('$$TARGET');
export const DEPENDENCIES = Symbol('$$DEPENDENCIES');

export interface DependencyDescriptor<T> {
    paramIndex: number;
    identifier: DependencyIdentifier<T>;
    quantity: Quantity;
    lookUp?: LookUp;
    withNew: boolean;
}

/**
 * describes dependencies of a IDependencyItem
 */
export interface Dependencies {
    dependencies: Array<DependencyDescriptor<any>>;
}

export function normalizeFactoryDeps(
    deps?: Array<FactoryDep<any>>
): Array<DependencyDescriptor<any>> {
    if (!deps) {
        return [];
    }

    return deps.map((dep, index) => {
        if (!Array.isArray(dep)) {
            return {
                paramIndex: index,
                identifier: dep,
                quantity: Quantity.REQUIRED,
                withNew: false,
            };
        }

        const modifiers = dep.slice(0, dep.length - 1) as FactoryDepModifier[];
        const identifier = dep[dep.length - 1] as DependencyIdentifier<any>;

        let lookUp: LookUp | undefined;
        let quantity = Quantity.REQUIRED;
        let withNew = false;

        (modifiers as FactoryDepModifier[]).forEach(
            (modifier: FactoryDepModifier) => {
                if (modifier instanceof Self) {
                    lookUp = LookUp.SELF;
                } else if (modifier instanceof SkipSelf) {
                    lookUp = LookUp.SKIP_SELF;
                } else if (modifier instanceof Optional) {
                    quantity = Quantity.OPTIONAL;
                } else if (modifier instanceof Many) {
                    quantity = Quantity.MANY;
                } else if (modifier instanceof WithNew) {
                    withNew = true;
                } else {
                    throw new DIError(`unknown dep modifier ${modifier}.`);
                }
            }
        );

        return {
            paramIndex: index,
            identifier: identifier as DependencyIdentifier<any>,
            quantity,
            lookUp,
            withNew,
        };
    });
}

function changeLookup(target: Ctor<any>, index: number, lookUp: LookUp) {
    const descriptor = getDependencyByIndex(target, index);
    descriptor.lookUp = lookUp;
}

function lookupDecoratorFactoryProducer(lookUp: LookUp) {
    return function DecoratorFactory<T>(this: any) {
        if (this instanceof DecoratorFactory) {
            return this;
        }

        return function d(target: Ctor<T>, _key: string, index: number) {
            changeLookup(target, index, lookUp);
        };
    } as any;
}

interface SkipSelfDecorator {
    (): any;
    // eslint-disable-next-line @typescript-eslint/no-misused-new
    new (): SkipSelfDecorator;
}
/**
 * when resolving this dependency, skip the current injector
 */
export const SkipSelf: SkipSelfDecorator = lookupDecoratorFactoryProducer(
    LookUp.SKIP_SELF
);

interface SelfDecorator {
    (): any;
    // eslint-disable-next-line @typescript-eslint/no-misused-new
    new (): SelfDecorator;
}
/**
 * when resolving this dependency, only search the current injector
 */
export const Self: SelfDecorator = lookupDecoratorFactoryProducer(LookUp.SELF);

class QuantityCheckError extends DIError {
    constructor(id: DependencyIdentifier<any>, quantity: Quantity, actual: number) {
        const msg = `Expect "${quantity}" dependency items for id "${prettyPrintIdentifier(
            id
        )}" but get ${actual}.`;

        super(msg);
    }
}

export function checkQuantity(
    id: DependencyIdentifier<any>,
    quantity: Quantity,
    length: number
): void {
    if (
        (quantity === Quantity.OPTIONAL && length > 1) ||
        (quantity === Quantity.REQUIRED && length !== 1)
    ) {
        throw new QuantityCheckError(id, quantity, length);
    }
}

export function retrieveQuantity<T>(quantity: Quantity, arr: T[]): T[] | T {
    if (quantity === Quantity.MANY) {
        return arr;
    }
    return arr[0];
}

function changeQuantity(target: Ctor<any>, index: number, quantity: Quantity) {
    const descriptor = getDependencyByIndex(target, index);
    descriptor.quantity = quantity;
}

function quantifyDecoratorFactoryProducer(quantity: Quantity) {
    return function decoratorFactory<T>(
        // typescript would remove `this` after transpilation
        // this line just declare the type of `this`
        this: any,
        id?: DependencyIdentifier<T>
    ) {
        if (this instanceof decoratorFactory) {
            return this;
        }

        return function d(registerTarget: Ctor<T>, _key: string, index: number) {
            if (id) {
                setDependency(registerTarget, id, index, quantity);
            } else {
                if (quantity === Quantity.REQUIRED) {
                    throw new IdentifierUndefinedError(registerTarget, index);
                }

                changeQuantity(registerTarget, index, quantity);
            }
        };
    } as any;
}

interface ManyDecorator {
    (id?: DependencyIdentifier<any>): any;
    // eslint-disable-next-line @typescript-eslint/no-misused-new
    new (): ManyDecorator;
}
export const Many: ManyDecorator = quantifyDecoratorFactoryProducer(Quantity.MANY);

interface OptionalDecorator {
    (id?: DependencyIdentifier<any>): any;
    // eslint-disable-next-line @typescript-eslint/no-misused-new
    new (): OptionalDecorator;
}
export const Optional: OptionalDecorator = quantifyDecoratorFactoryProducer(
    Quantity.OPTIONAL
);

interface InjectDecorator {
    (id: DependencyIdentifier<any>): any;
    // eslint-disable-next-line @typescript-eslint/no-misused-new
    new (): InjectDecorator;
}
export const Inject: InjectDecorator = quantifyDecoratorFactoryProducer(
    Quantity.REQUIRED
);

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

function changeToSelf(target: Ctor<any>, index: number, withNew: boolean) {
    const descriptor = getDependencyByIndex(target, index);
    descriptor.withNew = withNew;
}

function withNewDecoratorFactoryProducer(withNew: boolean) {
    return function DecoratorFactory<T>(this: any) {
        if (this instanceof DecoratorFactory) {
            return this;
        }

        return function d(target: Ctor<T>, _key: string, index: number) {
            changeToSelf(target, index, withNew);
        };
    } as any;
}

interface ToSelfDecorator {
    (): any;
    // eslint-disable-next-line @typescript-eslint/no-misused-new
    new (): ToSelfDecorator;
}

/**
 * Always initialize a new instance of that dependency instead of getting the cached instance from the injector.
 */
export const WithNew: ToSelfDecorator = withNewDecoratorFactoryProducer(true);
