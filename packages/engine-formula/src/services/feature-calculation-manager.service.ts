/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IUnitRange, Nullable } from '@univerjs/core';
import { Disposable } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';

import type { IFeatureDirtyRangeType, IRuntimeUnitDataType } from '../basics/common';
import type { FormulaDependencyTree } from '../engine/dependency/dependency-tree';

export interface IFeatureCalculationManagerParam {
    unitId: string;
    subUnitId: string;
    dependencyRanges: IUnitRange[];
    getDirtyData: (currentDependencyTree: FormulaDependencyTree) => {
        runtimeCellData: IRuntimeUnitDataType;
        dirtyRanges: IFeatureDirtyRangeType;
    };
}

export interface IFeatureCalculationManagerService {
    dispose(): void;

    remove(featureId: string): void;

    get(featureId: string): Nullable<IFeatureCalculationManagerParam>;

    has(featureId: string): boolean;

    register(featureId: string, referenceExecutor: IFeatureCalculationManagerParam): void;

    getReferenceExecutorMap(): Map<string, IFeatureCalculationManagerParam>;
}

/**
 * Passively marked as dirty, register the reference and execution actions of the feature plugin.
 * After execution, a dirty area and calculated data will be returned,
 * causing the formula to be marked dirty again,
 * thereby completing the calculation of the entire dependency tree.
 */
export class FeatureCalculationManagerService extends Disposable implements IFeatureCalculationManagerService {
    private _referenceExecutorMap: Map<string, IFeatureCalculationManagerParam> = new Map();

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

    register(featureId: string, referenceExecutor: IFeatureCalculationManagerParam) {
        this._referenceExecutorMap.set(featureId, referenceExecutor);
    }

    getReferenceExecutorMap() {
        return this._referenceExecutorMap;
    }
}

export const IFeatureCalculationManagerService = createIdentifier<FeatureCalculationManagerService>(
    'univer.formula.feature-calculation-manager.service'
);
