import { DependencyIdentifier } from './DependencyIdentifier';
import { FactoryDep, FactoryDepModifier } from './DependencyItem';
import { Self, SkipSelf } from './DependencyLookUp';
import { Many, Optional } from './DependencyQuantity';
import { WithNew } from './DependencyWithNew';
import { DIError } from './Error';
import { LookUp, Quantity } from './Types';

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
