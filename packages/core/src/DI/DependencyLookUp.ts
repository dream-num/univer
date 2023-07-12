import { getDependencyByIndex } from './Decorators';
import { Ctor } from './DependencyItem';
import { LookUp } from './Types';

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
