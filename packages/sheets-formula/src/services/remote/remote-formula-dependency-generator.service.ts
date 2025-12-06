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

import type { IUnitRange } from '@univerjs/core';
import { createIdentifier, Inject, isFormulaId, isFormulaString } from '@univerjs/core';
import { FormulaDataModel, ICalculateFormulaService, IFormulaCurrentConfigService } from '@univerjs/engine-formula';

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
    generate(range?: IUnitRange): Promise<Array<IFormulaCellAndFeatureItem>>;
}

export const RemoteFormulaDependencyGeneratorServiceName = 'sheets-formula.remote-formula-dependency-generator.service';
export const IRemoteFormulaDependencyGenerator = createIdentifier<IRemoteFormulaDependencyGenerator>(RemoteFormulaDependencyGeneratorServiceName);

/**
 * This class should resident in the main process.
 */
export class RemoteFormulaDependencyGeneratorService implements IRemoteFormulaDependencyGenerator {
    constructor(
        @ICalculateFormulaService private readonly _calculateFormulaService: ICalculateFormulaService,
        @Inject(FormulaDataModel) private readonly _formulaDataModel: FormulaDataModel,
        @IFormulaCurrentConfigService private readonly _currentConfigService: IFormulaCurrentConfigService
    ) {}

    async generate(range?: IUnitRange): Promise<Array<IFormulaCellAndFeatureItem>> {
        const formulaData = this._formulaDataModel.getFormulaData();
        const arrayFormulaCellData = this._formulaDataModel.getArrayFormulaCellData();
        const arrayFormulaRange = this._formulaDataModel.getArrayFormulaRange();

        const formulaDatasetConfig = {
            formulaData,
            arrayFormulaCellData,
            arrayFormulaRange,
            forceCalculate: false,
            dirtyRanges: range ? [range] : [],
            dirtyNameMap: {},
            dirtyDefinedNameMap: {},
            dirtyUnitFeatureMap: {},
            dirtyUnitOtherFormulaMap: {},
            clearDependencyTreeCache: {},
            maxIteration: 1,
            rowData: undefined,
        };

        const trees = await this._calculateFormulaService.generateDependencyTrees(formulaDatasetConfig);

        const result: Array<IFormulaCellAndFeatureItem> = [];
        for (let i = 0; i < trees.length; i++) {
            const tree = trees[i];
            if ((isFormulaString(tree.formula) || isFormulaId(tree.formulaId)) || tree.featureId != null) {
                result.push({
                    unitId: tree.unitId,
                    subUnitId: tree.subUnitId,
                    row: tree.row,
                    column: tree.column,
                    featureId: tree.featureId || undefined,
                    formula: tree.formula || undefined,
                    formulaId: tree.formulaId || undefined,
                });
            }
        }
        return result;
    }
}
