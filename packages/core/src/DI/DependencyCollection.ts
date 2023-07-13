import { DependencyIdentifier, prettyPrintIdentifier } from './DependencyIdentifier';
import { IDisposable, isIDisposable } from './Lifecycle';
import { Ctor, Quantity } from './Types';
import { DIError } from './Error';
import { DependencyItem, checkQuantity, retrieveQuantity } from './Decorators';

export type DependencyPair<T> = [DependencyIdentifier<T>, DependencyItem<T>];
export type DependencyClass<T> = [Ctor<T>];
export type Dependency<T = any> = DependencyPair<T> | DependencyClass<T>;

export function isBareClassDependency<T>(
    thing: Dependency<T>
): thing is DependencyClass<T> {
    return thing.length === 1;
}

export class DependencyNotFoundError extends DIError {
    constructor(id: DependencyIdentifier<any>) {
        const msg = `Cannot find "${prettyPrintIdentifier(
            id
        )}" registered by any injector.`;

        super(msg);
    }
}

/**
 * store unresolved dependencies in an injector
 *
 * @internal
 */
export class DependencyCollection implements IDisposable {
    private readonly dependencyMap = new Map<
        DependencyIdentifier<any>,
        Array<DependencyItem<any>>
    >();

    constructor(dependencies: Dependency[]) {
        this.normalizeDependencies(dependencies).map((pair) =>
            this.add(pair[0], pair[1])
        );
    }

    add<T>(ctor: Ctor<T>): void;
    add<T>(id: DependencyIdentifier<T>, val: DependencyItem<T>): void;
    add<T>(
        ctorOrId: Ctor<T> | DependencyIdentifier<T>,
        val?: DependencyItem<T>
    ): void {
        if (typeof val === 'undefined') {
            val = { useClass: ctorOrId as Ctor<T>, lazy: false };
        }

        let arr = this.dependencyMap.get(ctorOrId);
        if (typeof arr === 'undefined') {
            arr = [];
            this.dependencyMap.set(ctorOrId, arr);
        }
        arr.push(val);
    }

    delete<T>(id: DependencyIdentifier<T>): void {
        this.dependencyMap.delete(id);
    }

    get<T>(id: DependencyIdentifier<T>): DependencyItem<T>;
    get<T>(
        id: DependencyIdentifier<T>,
        quantity: Quantity.REQUIRED
    ): DependencyItem<T>;
    get<T>(
        id: DependencyIdentifier<T>,
        quantity: Quantity.MANY
    ): Array<DependencyItem<T>>;
    get<T>(
        id: DependencyIdentifier<T>,
        quantity: Quantity.OPTIONAL
    ): DependencyItem<T> | null;
    get<T>(
        id: DependencyIdentifier<T>,
        quantity: Quantity
    ): DependencyItem<T> | Array<DependencyItem<T>> | null;
    get<T>(
        id: DependencyIdentifier<T>,
        quantity: Quantity = Quantity.REQUIRED
    ): DependencyItem<T> | Array<DependencyItem<T>> | null {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const ret = this.dependencyMap.get(id)!;

        checkQuantity(id, quantity, ret.length);
        return retrieveQuantity(quantity, ret);
    }

    has<T>(id: DependencyIdentifier<T>): boolean {
        return this.dependencyMap.has(id);
    }

    append(dependencies: Array<Dependency<any>>): void {
        this.normalizeDependencies(dependencies).forEach((pair) =>
            this.add(pair[0], pair[1])
        );
    }

    dispose(): void {
        this.dependencyMap.clear();
    }

    /**
     * normalize dependencies to `DependencyItem`
     */
    private normalizeDependencies(
        dependencies: Dependency[]
    ): Array<DependencyPair<any>> {
        return dependencies.map((dependency) => {
            const id = dependency[0];
            let val: DependencyItem<any>;
            if (isBareClassDependency(dependency)) {
                val = {
                    useClass: dependency[0],
                    lazy: false,
                };
            } else {
                val = dependency[1];
            }

            return [id, val];
        });
    }
}

/**
 * store resolved dependencies
 *
 * @internal
 */
export class ResolvedDependencyCollection implements IDisposable {
    private readonly resolvedDependencies = new Map<
        DependencyIdentifier<any>,
        any[]
    >();

    add<T>(id: DependencyIdentifier<T>, val: T | null): void {
        let arr = this.resolvedDependencies.get(id);
        if (typeof arr === 'undefined') {
            arr = [];
            this.resolvedDependencies.set(id, arr);
        }

        arr.push(val);
    }

    has<T>(id: DependencyIdentifier<T>): boolean {
        return this.resolvedDependencies.has(id);
    }

    delete<T>(id: DependencyIdentifier<T>): void {
        if (this.resolvedDependencies.has(id)) {
            const things = this.resolvedDependencies.get(id)!;
            things.forEach((t) => (isIDisposable(t) ? t.dispose() : undefined));
            this.resolvedDependencies.delete(id);
        }
    }

    get<T>(id: DependencyIdentifier<T>): T;
    get<T>(id: DependencyIdentifier<T>, quantity: Quantity.OPTIONAL): T | null;
    get<T>(id: DependencyIdentifier<T>, quantity: Quantity.REQUIRED): T;
    get<T>(id: DependencyIdentifier<T>, quantity: Quantity.MANY): T[];
    get<T>(id: DependencyIdentifier<T>, quantity: Quantity): T[] | T | null;
    get<T>(
        id: DependencyIdentifier<T>,
        quantity: Quantity = Quantity.REQUIRED
    ): T | T[] | null {
        const ret = this.resolvedDependencies.get(id);

        if (!ret) {
            throw new DependencyNotFoundError(id);
        }

        checkQuantity(id, quantity, ret.length);

        if (quantity === Quantity.MANY) {
            return ret;
        }
        return ret[0];
    }

    dispose(): void {
        Array.from(this.resolvedDependencies.values()).forEach((items) => {
            items.forEach((item) =>
                isIDisposable(item) ? item.dispose() : undefined
            );
        });

        this.resolvedDependencies.clear();
    }
}
