import type { IUnitRange, Nullable } from '@univerjs/core';
import { Disposable } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';

import type { FormulaDependencyTree } from '../dependency/dependency-tree';

export interface IReferenceExecutorManagerParams {
    unitId: string;
    subComponentId: string;
    dependencyRanges: IUnitRange[];
    executor: (currentDependencyTree: FormulaDependencyTree) => void;
}

export interface IReferenceExecutorManagerService {
    dispose(): void;

    delete(featureId: string): void;

    get(featureId: string): Nullable<IReferenceExecutorManagerParams>;

    has(featureId: string): boolean;

    register(featureId: string, referenceExecutor: IReferenceExecutorManagerParams): void;

    getReferenceExecutorMap(): Map<string, IReferenceExecutorManagerParams>;
}

export class ReferenceExecutorManagerService extends Disposable implements IReferenceExecutorManagerService {
    private _referenceExecutorMap: Map<string, IReferenceExecutorManagerParams> = new Map();

    override dispose(): void {
        this._referenceExecutorMap.clear();
    }

    delete(featureId: string) {
        this._referenceExecutorMap.delete(featureId);
    }

    get(featureId: string) {
        return this._referenceExecutorMap.get(featureId);
    }

    has(featureId: string) {
        return this._referenceExecutorMap.has(featureId);
    }

    register(featureId: string, referenceExecutor: IReferenceExecutorManagerParams) {
        this._referenceExecutorMap.set(featureId, referenceExecutor);
    }

    getReferenceExecutorMap() {
        return this._referenceExecutorMap;
    }
}

export const IReferenceExecutorManagerService = createIdentifier<ReferenceExecutorManagerService>(
    'univer.formula.reference-executor-manager.service'
);
