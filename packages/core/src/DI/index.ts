export { createIdentifier } from './Decorators';
export { Quantity, LookUp } from './Types';
export { Many, Optional, Inject } from './DependencyQuantity';
export { forwardRef } from './DependencyForwardRef';
export { Injector } from './Injector';
export { SkipSelf, Self } from './DependencyLookUp';
export { DependencyPair, Dependency } from './DependencyCollection';
export { DependencyIdentifier, IdentifierDecorator } from './DependencyIdentifier';
export { IDisposable, ICreatable } from './Lifecycle';
export { setDependencies } from './DependencyDeclare';
export { registerSingleton } from './DependencySingletons';
export { WithNew } from './DependencyWithNew';
export {
    AsyncDependencyItem,
    AsyncHook,
    ClassDependencyItem,
    Ctor,
    DependencyItem,
    FactoryDependencyItem,
    isAsyncDependencyItem,
    isAsyncHook,
    isClassDependencyItem,
    isCtor,
    isFactoryDependencyItem,
    isValueDependencyItem,
    SyncDependencyItem,
    ValueDependencyItem,
} from './DependencyItem';
export { DIError } from './Error';

const globalObject: any =
    (typeof globalThis !== 'undefined' && globalThis) ||
    (typeof window !== 'undefined' && window) ||
    // @ts-ignore
    (typeof global !== 'undefined' && global);

const __REDI_GLOBAL_LOCK__ = 'REDI_GLOBAL_LOCK';

if (globalObject[__REDI_GLOBAL_LOCK__]) {
    console.error(
        '[DI]: Load scripts of DI more than once! This may cause undesired behavior in your application.'
    );
} else {
    globalObject[__REDI_GLOBAL_LOCK__] = true;
}
