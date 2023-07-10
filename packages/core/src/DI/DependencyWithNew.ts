import { getDependencyByIndex } from './Decorators';
import { Ctor } from './DependencyItem';

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
