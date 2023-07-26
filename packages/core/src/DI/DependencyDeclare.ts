import { FactoryDep, normalizeFactoryDeps, setDependency } from './Decorators';
import { Ctor } from './Types';

export function setDependencies<U>(registerTarget: Ctor<U>, deps: Array<FactoryDep<any>>): void {
    const normalizedDescriptors = normalizeFactoryDeps(deps);
    normalizedDescriptors.forEach((descriptor) => {
        setDependency(registerTarget, descriptor.identifier, descriptor.paramIndex, descriptor.quantity, descriptor.lookUp);
    });
}
