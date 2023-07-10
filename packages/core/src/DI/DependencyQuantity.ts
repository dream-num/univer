import {
    getDependencyByIndex,
    IdentifierUndefinedError,
    setDependency,
} from './Decorators';
import { DependencyIdentifier } from './DependencyIdentifier';
import { Ctor, prettyPrintIdentifier } from './DependencyItem';
import { DIError } from './Error';
import { Quantity } from './Types';

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
