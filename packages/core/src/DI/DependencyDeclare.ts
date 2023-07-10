import { setDependency } from './Decorators';
import { normalizeFactoryDeps } from './DependencyDescriptor';
import { Ctor, FactoryDep } from './DependencyItem';

export function setDependencies<U>(
    registerTarget: Ctor<U>,
    deps: Array<FactoryDep<any>>
): void {
    const normalizedDescriptors = normalizeFactoryDeps(deps);
    normalizedDescriptors.forEach((descriptor) => {
        setDependency(
            registerTarget,
            descriptor.identifier,
            descriptor.paramIndex,
            descriptor.quantity,
            descriptor.lookUp
        );
    });
}
