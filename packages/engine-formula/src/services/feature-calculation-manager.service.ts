import type { IUnitRange, Nullable } from '@univerjs/core';
import { Disposable } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';

import type { IFeatureDirtyRangeType, IRuntimeUnitDataType } from '../basics/common';
import type { FormulaDependencyTree } from '../engine/dependency/dependency-tree';

export interface IReferenceExecutorManagerParams {
    unitId: string;
    subComponentId: string;
    dependencyRanges: IUnitRange[];
    getDirtyData: (currentDependencyTree: FormulaDependencyTree) => {
        runtimeCellData: IRuntimeUnitDataType;
        dirtyRanges: IFeatureDirtyRangeType;
    };
}

export interface IFeatureCalculationManagerService {
    dispose(): void;

    remove(featureId: string): void;

    get(featureId: string): Nullable<IReferenceExecutorManagerParams>;

    has(featureId: string): boolean;

    register(featureId: string, referenceExecutor: IReferenceExecutorManagerParams): void;

    getReferenceExecutorMap(): Map<string, IReferenceExecutorManagerParams>;
}

/**
 * Passively marked as dirty, register the reference and execution actions of the feature plugin.
 * After execution, a dirty area and calculated data will be returned,
 * causing the formula to be marked dirty again,
 * thereby completing the calculation of the entire dependency tree.
 */
export class FeatureCalculationManagerService extends Disposable implements IFeatureCalculationManagerService {
    private _referenceExecutorMap: Map<string, IReferenceExecutorManagerParams> = new Map();

    override dispose(): void {
        this._referenceExecutorMap.clear();
    }

    remove(featureId: string) {
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

export const IFeatureCalculationManagerService = createIdentifier<FeatureCalculationManagerService>(
    'univer.formula.feature-calculation-manager.service'
);
