/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { FormulaCurrentConfigService } from '@univerjs/engine-formula';
import { createIdentifier, isFormulaId, isFormulaString } from '@univerjs/core';
import { IFormulaCurrentConfigService, IFormulaDependencyGenerator } from '@univerjs/engine-formula';

export interface IFormulaCellAndFeatureItem {
    unitId: string;
    subUnitId: string;
    row?: number;
    column?: number;
    featureId?: string;
    formula?: string;
    formulaId?: string;
}

export interface IRemoteFormulaDependencyGenerator {
    generate(): Promise<Array<IFormulaCellAndFeatureItem>>;
}

export const RemoteFormulaDependencyGeneratorServiceName = 'sheets-formula.remote-formula-dependency-generator.service';
export const IRemoteFormulaDependencyGenerator = createIdentifier<IRemoteFormulaDependencyGenerator>(RemoteFormulaDependencyGeneratorServiceName);

/**
 * This class should resident in the main process.
 */
export class RemoteFormulaDependencyGeneratorService implements IRemoteFormulaDependencyGenerator {
    constructor(
        @IFormulaDependencyGenerator private readonly _dependencyGenerator: IFormulaDependencyGenerator,
        @IFormulaCurrentConfigService private readonly _currentConfigService: IFormulaCurrentConfigService
    ) {}

    async generate(): Promise<Array<IFormulaCellAndFeatureItem>> {
        const configService = this._currentConfigService as FormulaCurrentConfigService;
        const originalForceCalculate = configService.isForceCalculate();
        configService.setForceCalculate(true);
        const trees = await this._dependencyGenerator.generate();
        configService.setForceCalculate(originalForceCalculate);
        return trees
            .filter((tree) => (isFormulaString(tree.formula) || isFormulaId(tree.formulaId)) || tree.featureId != null)
            .map((tree) => ({
                unitId: tree.unitId,
                subUnitId: tree.subUnitId,
                row: tree.row,
                column: tree.column,
                featureId: tree.featureId || undefined,
                formula: tree.formula || undefined,
                formulaId: tree.formulaId || undefined,
            }));
    }
}
