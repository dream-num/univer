export {
    AsyncDependencyItem,
    AsyncHook,
    ClassDependencyItem,
    createIdentifier,
    DependencyItem,
    FactoryDependencyItem,
    Inject,
    isAsyncDependencyItem,
    isAsyncHook,
    isClassDependencyItem,
    isFactoryDependencyItem,
    isValueDependencyItem,
    Many,
    Optional,
    Self,
    SkipSelf,
    SyncDependencyItem,
    ValueDependencyItem,
} from './Decorators';
export { Quantity, LookUp, Ctor, isCtor } from './Types';
export { forwardRef } from './DependencyForwardRef';
export { Injector } from './Injector';
export { DependencyPair, Dependency } from './DependencyCollection';
export { DependencyIdentifier, IdentifierDecorator } from './DependencyIdentifier';
export { IDisposable, ICreatable } from './Lifecycle';
export { setDependencies } from './DependencyDeclare';
export { registerSingleton } from './DependencySingletons';
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
