import { getDependencies } from './Decorators';
import {
    Dependency,
    DependencyCollection,
    DependencyNotFoundError,
    ResolvedDependencyCollection,
    DependencyPair,
} from './DependencyCollection';
import { normalizeFactoryDeps } from './DependencyDescriptor';
import { DependencyIdentifier } from './DependencyIdentifier';
import {
    Ctor,
    DependencyItem,
    AsyncDependencyItem,
    isClassDependencyItem,
    isFactoryDependencyItem,
    isValueDependencyItem,
    isAsyncDependencyItem,
    ClassDependencyItem,
    FactoryDependencyItem,
    AsyncHook,
    isAsyncHook,
    isCtor,
    ValueDependencyItem,
    prettyPrintIdentifier,
} from './DependencyItem';
import { normalizeForwardRef } from './DependencyForwardRef';
import { IdleValue } from './IdleValue';
import { getSingletonDependencies } from './DependencySingletons';
import { DIError } from './Error';
import { Quantity, LookUp } from './Types';
import { isICreatable } from './Lifecycle';

const MAX_RESOLUTIONS_QUEUED = 300;

const NotInstantiatedSymbol = Symbol('$$NOT_INSTANTIATED_SYMBOL');

class CircularDependencyError<T> extends DIError {
    constructor(id: DependencyIdentifier<T>) {
        super(
            `Detecting cyclic dependency. The last identifier is "${prettyPrintIdentifier(
                id
            )}".`
        );
    }
}

class InjectorAlreadyDisposedError extends DIError {
    constructor() {
        super('Injector cannot be accessed after it disposes.');
    }
}

class AsyncItemReturnAsyncItemError<T> extends DIError {
    constructor(id: DependencyIdentifier<T>) {
        super(
            `Async item "${prettyPrintIdentifier(id)}" returns another async item.`
        );
    }
}

class GetAsyncItemFromSyncApiError<T> extends DIError {
    constructor(id: DependencyIdentifier<T>) {
        super(`Cannot get async item "${prettyPrintIdentifier(id)}" from sync api.`);
    }
}

export class Injector {
    private readonly dependencyCollection: DependencyCollection;

    private readonly resolvedDependencyCollection: ResolvedDependencyCollection;

    private readonly parent: Injector | null;

    private readonly children: Injector[] = [];

    private resolutionOngoing = 0;

    private disposed = false;

    constructor(collectionOrDependencies?: Dependency[], parent?: Injector) {
        this.dependencyCollection = new DependencyCollection(
            collectionOrDependencies || []
        );

        if (!parent) {
            this.parent = null;
            this.dependencyCollection.append(getSingletonDependencies());
        } else {
            this.parent = parent;
            parent.children.push(this);
        }

        this.resolvedDependencyCollection = new ResolvedDependencyCollection();
    }

    createChild(dependencies?: Dependency[]): Injector {
        this.ensureInjectorNotDisposed();

        return new Injector(dependencies, this);
    }

    dispose(): void {
        this.dependencyCollection.dispose();
        this.resolvedDependencyCollection.dispose();
        this.deleteThisFromParent();

        this.disposed = true;
    }

    add<T>(ctor: Ctor<T>): void;
    add<T>(pair: DependencyPair<T>): void;
    add<T>(id: DependencyIdentifier<T>, item: DependencyItem<T> | T): void;
    add<T>(
        dependency: Ctor<T> | DependencyPair<T> | DependencyIdentifier<T>,
        item?: DependencyItem<T> | T
    ): void {
        if (typeof item !== 'undefined' || Array.isArray(dependency)) {
            if (Array.isArray(dependency)) {
                item = dependency[1];
                dependency = dependency[0];
            }

            if (
                isAsyncDependencyItem(item) ||
                isClassDependencyItem(item) ||
                isValueDependencyItem(item) ||
                isFactoryDependencyItem(item)
            ) {
                this.dependencyCollection.add(dependency, item as DependencyItem<T>);
            } else {
                this.resolvedDependencyCollection.add(dependency, item as T);
            }
        } else {
            this.dependencyCollection.add(dependency as Ctor<T>);
        }
    }

    /**
     * delete a dependency and instantiated values from an injector
     */
    delete<T>(id: DependencyIdentifier<T>): void {
        this.dependencyCollection.delete(id);
        this.resolvedDependencyCollection.delete(id);
    }

    /**
     * get a dependency
     */
    get<T>(id: DependencyIdentifier<T>, lookUp?: LookUp): T;
    get<T>(
        id: DependencyIdentifier<T>,
        quantity: Quantity.MANY,
        lookUp?: LookUp
    ): T[];
    get<T>(
        id: DependencyIdentifier<T>,
        quantity: Quantity.OPTIONAL,
        lookUp?: LookUp
    ): T | null;
    get<T>(
        id: DependencyIdentifier<T>,
        quantity: Quantity.REQUIRED,
        lookUp?: LookUp
    ): T;
    get<T>(
        id: DependencyIdentifier<T>,
        quantity?: Quantity,
        lookUp?: LookUp
    ): T[] | T | null;
    get<T>(
        id: DependencyIdentifier<T>,
        quantityOrLookup?: Quantity | LookUp,
        lookUp?: LookUp
    ): T[] | T | null;
    get<T>(
        id: DependencyIdentifier<T>,
        quantityOrLookup?: Quantity | LookUp,
        lookUp?: LookUp
    ): T[] | T | null {
        const newResult = this._get(id, quantityOrLookup, lookUp);

        if (
            (Array.isArray(newResult) && newResult.some((r) => isAsyncHook(r))) ||
            isAsyncHook(newResult)
        ) {
            throw new GetAsyncItemFromSyncApiError(id);
        }

        return newResult as T | T[] | null;
    }

    _get<T>(
        id: DependencyIdentifier<T>,
        quantityOrLookup?: Quantity | LookUp,
        lookUp?: LookUp,
        toSelf?: boolean
    ): T[] | T | AsyncHook<T> | null {
        this.ensureInjectorNotDisposed();

        let quantity: Quantity = Quantity.REQUIRED;
        if (
            quantityOrLookup === Quantity.REQUIRED ||
            quantityOrLookup === Quantity.OPTIONAL ||
            quantityOrLookup === Quantity.MANY
        ) {
            quantity = quantityOrLookup as Quantity;
        } else {
            lookUp = quantityOrLookup as LookUp;
        }

        if (!toSelf) {
            // see if the dependency is already resolved, return it and check quantity
            const cachedResult = this.getValue(id, quantity, lookUp);
            if (cachedResult !== NotInstantiatedSymbol) {
                return cachedResult;
            }
        }

        // see if the dependency can be instantiated by itself or its parent
        return this.createDependency(id, quantity, lookUp, !toSelf) as
            | T[]
            | T
            | AsyncHook<T>
            | null;
    }

    /**
     * get a dependency, but in async way
     */
    getAsync<T>(id: DependencyIdentifier<T>): Promise<T> {
        this.ensureInjectorNotDisposed();

        const cachedResult = this.getValue(id, Quantity.REQUIRED);
        if (cachedResult !== NotInstantiatedSymbol) {
            return Promise.resolve(cachedResult as T);
        }

        const newResult = this.createDependency(id, Quantity.REQUIRED);
        if (!isAsyncHook(newResult)) {
            return Promise.resolve(newResult as T);
        }

        return newResult.whenReady();
    }

    /**
     * to instantiate a class withing the current injector
     */
    createInstance<T extends unknown[], U extends unknown[], C>(
        ctor: new (...args: [...T, ...U]) => C,
        ...customArgs: T
    ): C {
        this.ensureInjectorNotDisposed();

        return this.resolveClass_(ctor as Ctor<C>, ...customArgs);
    }

    /**
     * resolve different types of dependencies
     */
    private resolveDependency<T>(
        id: DependencyIdentifier<T>,
        item: DependencyItem<T>,
        shouldCache = true
    ): T | AsyncHook<T> {
        if (isValueDependencyItem(item)) {
            return this.resolveValueDependency(id, item as ValueDependencyItem<T>);
        }
        if (isFactoryDependencyItem(item)) {
            return this.resolveFactory(
                id,
                item as FactoryDependencyItem<T>,
                shouldCache
            );
        }
        if (isClassDependencyItem(item)) {
            return this.resolveClass(
                id,
                item as ClassDependencyItem<T>,
                shouldCache
            );
        }
        return this.resolveAsync(id, item as AsyncDependencyItem<T>);
    }

    private resolveValueDependency<T>(
        id: DependencyIdentifier<T>,
        item: ValueDependencyItem<T>
    ): T {
        const thing = item.useValue;
        this.resolvedDependencyCollection.add(id, thing);
        return thing;
    }

    private resolveClass<T>(
        id: DependencyIdentifier<T> | null,
        item: ClassDependencyItem<T>,
        shouldCache = true
    ): T {
        const ctor = item.useClass;
        let thing: T;

        if (item.lazy) {
            const idle = new IdleValue<T>(() => this.resolveClass_(ctor));
            thing = new Proxy(Object.create(null), {
                get(target: any, key: string | number | symbol): any {
                    if (key in target) {
                        return target[key]; // such as toString
                    }

                    // hack checking if it's a async loader
                    if (key === 'whenReady') {
                        return undefined;
                    }

                    const hasInstantiated = idle.hasRun();
                    const thing = idle.getValue();
                    if (!hasInstantiated) {
                        item.onInstantiation?.(thing);
                    }

                    let property = (thing as any)[key];
                    if (typeof property !== 'function') {
                        return property;
                    }

                    property = property.bind(thing);
                    target[key] = property;

                    return property;
                },
                set(
                    _target: any,
                    key: string | number | symbol,
                    value: any
                ): boolean {
                    (idle.getValue() as any)[key] = value;
                    return true;
                },
            });
        } else {
            thing = this.resolveClass_(ctor);
        }

        if (id && shouldCache) {
            this.resolvedDependencyCollection.add(id, thing);
        }

        return thing;
    }

    private resolveClass_<T>(CCtor: Ctor<T>, ...extraParams: any[]) {
        this.markNewResolution(CCtor);

        const declaredDependencies = getDependencies(CCtor)
            .sort((a, b) => a.paramIndex - b.paramIndex)
            .map((descriptor) => ({
                ...descriptor,
                identifier: normalizeForwardRef(descriptor.identifier),
            }));

        const resolvedArgs: any[] = [];

        for (const dep of declaredDependencies) {
            // recursive happens here
            const thing = this._get(
                dep.identifier,
                dep.quantity,
                dep.lookUp,
                dep.withNew
            );
            resolvedArgs.push(thing);
        }

        let args = [...extraParams];
        const firstDependencyArgIndex =
            declaredDependencies.length > 0
                ? declaredDependencies[0].paramIndex
                : args.length;

        if (args.length !== firstDependencyArgIndex) {
            console.warn(
                `[DI]: Expect ${firstDependencyArgIndex} custom parameter(s) but get ${args.length}.`
            );

            const delta = firstDependencyArgIndex - args.length;
            if (delta > 0) {
                args = [...args, ...new Array(delta).fill(undefined)];
            } else {
                args = args.slice(0, firstDependencyArgIndex);
            }
        }

        const thing = new CCtor(...args, ...resolvedArgs);

        this.callOnCreationMethod(thing);
        this.markResolutionCompleted();

        return thing;
    }

    private callOnCreationMethod(thing: unknown): void {
        if (isICreatable(thing)) {
            thing.onCreate.apply(thing);
        }
    }

    private resolveFactory<T>(
        id: DependencyIdentifier<T>,
        item: FactoryDependencyItem<T>,
        shouldCache: boolean
    ): T {
        this.markNewResolution(id);

        const declaredDependencies = normalizeFactoryDeps(item.deps);

        const resolvedArgs: any[] = [];
        for (const dep of declaredDependencies) {
            const thing = this._get(
                dep.identifier,
                dep.quantity,
                dep.lookUp,
                dep.withNew
            );
            resolvedArgs.push(thing);
        }

        const thing = item.useFactory.apply(null, resolvedArgs);

        if (shouldCache) {
            this.resolvedDependencyCollection.add(id, thing);
        }

        this.markResolutionCompleted();

        item?.onInstantiation?.(thing);

        return thing;
    }

    private resolveAsync<T>(
        id: DependencyIdentifier<T>,
        item: AsyncDependencyItem<T>
    ): AsyncHook<T> {
        const asyncLoader: AsyncHook<T> = {
            whenReady: () => this.resolveAsync_(id, item),
        };
        return asyncLoader;
    }

    private resolveAsync_<T>(
        id: DependencyIdentifier<T>,
        item: AsyncDependencyItem<T>
    ): Promise<T> {
        return item.useAsync().then((thing) => {
            // check if another promise has been resolved,
            // do not resolve the async item twice
            const resolvedCheck = this.getValue(id);
            if (resolvedCheck !== NotInstantiatedSymbol) {
                return resolvedCheck as T;
            }

            let ret: T;
            if (Array.isArray(thing)) {
                const item = thing[1];
                if (isAsyncDependencyItem(item)) {
                    throw new AsyncItemReturnAsyncItemError(id);
                } else {
                    ret = this.resolveDependency(id, item) as T;
                }
            } else if (isCtor(thing)) {
                ret = this.resolveClass_(thing);
            } else {
                ret = thing;
            }

            this.resolvedDependencyCollection.add(id, ret);

            return ret;
        });
    }

    /**
     * recursively get a dependency value
     */
    private getValue<T>(
        id: DependencyIdentifier<T>,
        quantity: Quantity = Quantity.REQUIRED,
        lookUp?: LookUp
    ): null | T | T[] | typeof NotInstantiatedSymbol {
        const onSelf = () => {
            if (
                this.dependencyCollection.has(id) &&
                !this.resolvedDependencyCollection.has(id)
            ) {
                return NotInstantiatedSymbol;
            }

            return this.resolvedDependencyCollection.get(id, quantity);
        };

        const onParent = () => {
            if (this.parent) {
                return this.parent.getValue(id, quantity);
            }
            return NotInstantiatedSymbol;
        };

        if (lookUp === LookUp.SKIP_SELF) {
            return onParent();
        }

        if (lookUp === LookUp.SELF) {
            return onSelf();
        }

        if (
            this.resolvedDependencyCollection.has(id) ||
            this.dependencyCollection.has(id)
        ) {
            return onSelf();
        }

        return onParent();
    }

    /**
     * create instance on the correct injector
     */
    private createDependency<T>(
        id: DependencyIdentifier<T>,
        quantity: Quantity = Quantity.REQUIRED,
        lookUp?: LookUp,
        shouldCache = true
    ): null | T | T[] | AsyncHook<T> | Array<T | AsyncHook<T>> {
        const onSelf = () => {
            const registrations = this.dependencyCollection.get(id, quantity);

            let ret: Array<T | AsyncHook<T>> | T | AsyncHook<T> | null = null;
            if (Array.isArray(registrations)) {
                ret = registrations.map((dependencyItem) =>
                    this.resolveDependency(id, dependencyItem, shouldCache)
                );
            } else if (registrations) {
                ret = this.resolveDependency(id, registrations, shouldCache);
            }

            return ret;
        };

        const onParent = () => {
            if (this.parent) {
                return this.parent.createDependency(
                    id,
                    quantity,
                    undefined,
                    shouldCache
                );
            }
            if (quantity === Quantity.OPTIONAL) {
                return null;
            }

            throw new DependencyNotFoundError(id);
        };

        if (lookUp === LookUp.SKIP_SELF) {
            return onParent();
        }

        if ((id as any as Ctor<Injector>) === Injector) {
            return this as any as T;
        }

        if (this.dependencyCollection.has(id)) {
            return onSelf();
        }

        return onParent();
    }

    private markNewResolution<T>(id: DependencyIdentifier<T>): void {
        this.resolutionOngoing += 1;

        if (this.resolutionOngoing >= MAX_RESOLUTIONS_QUEUED) {
            throw new CircularDependencyError(id);
        }
    }

    private markResolutionCompleted(): void {
        this.resolutionOngoing -= 1;
    }

    private ensureInjectorNotDisposed(): void {
        if (this.disposed) {
            throw new InjectorAlreadyDisposedError();
        }
    }

    private deleteThisFromParent(): void {
        if (this.parent) {
            const index = this.parent.children.indexOf(this);
            this.parent.children.splice(index, 1);
        }
    }
}
