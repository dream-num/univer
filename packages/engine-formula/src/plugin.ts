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

import type { Dependency } from '@univerjs/core';
import type { IUniverEngineFormulaConfig } from './controller/config.schema';
import { IConfigService, Inject, Injector, Plugin, registerDependencies, touchDependencies } from '@univerjs/core';
import { CalculateController } from './controller/calculate.controller';
import { defaultPluginConfig, PLUGIN_CONFIG_KEY } from './controller/config.schema';
import { FormulaController } from './controller/formula.controller';
import { SetDefinedNameController } from './controller/set-defined-name.controller';
import { SetDependencyController } from './controller/set-dependency.controller';
import { SetFeatureCalculationController } from './controller/set-feature-calculation.controller';
import { SetOtherFormulaController } from './controller/set-other-formula.controller';
import { Lexer } from './engine/analysis/lexer';
import { LexerTreeBuilder } from './engine/analysis/lexer-tree-builder';
import { AstTreeBuilder } from './engine/analysis/parser';
import { AstRootNodeFactory } from './engine/ast-node/ast-root-node';
import { FunctionNodeFactory } from './engine/ast-node/function-node';
import { LambdaNodeFactory } from './engine/ast-node/lambda-node';
import { LambdaParameterNodeFactory } from './engine/ast-node/lambda-parameter-node';
import { OperatorNodeFactory } from './engine/ast-node/operator-node';
import { PrefixNodeFactory } from './engine/ast-node/prefix-node';
import { ReferenceNodeFactory } from './engine/ast-node/reference-node';
import { SuffixNodeFactory } from './engine/ast-node/suffix-node';
import { UnionNodeFactory } from './engine/ast-node/union-node';
import { ValueNodeFactory } from './engine/ast-node/value-node';
import { FormulaDependencyGenerator } from './engine/dependency/formula-dependency';
import { Interpreter } from './engine/interpreter/interpreter';
import { FormulaDataModel } from './models/formula-data.model';
import { ActiveDirtyManagerService } from './services/active-dirty-manager.service';
import { CalculateFormulaService } from './services/calculate-formula.service';
import { FormulaCurrentConfigService } from './services/current-data.service';
import { DefinedNamesService } from './services/defined-names.service';
import { DependencyManagerService } from './services/dependency-manager.service';
import { FeatureCalculationManagerService } from './services/feature-calculation-manager.service';
import { FunctionService } from './services/function.service';
import { OtherFormulaManagerService } from './services/other-formula-manager.service';
import { FormulaRuntimeService } from './services/runtime.service';

const PLUGIN_NAME = 'UNIVER_ENGINE_FORMULA_PLUGIN';

export class UniverFormulaEnginePlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;

    constructor(
        private readonly _config: Partial<IUniverEngineFormulaConfig> = defaultPluginConfig,
        @Inject(Injector) protected override _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration.
        const { ...rest } = this._config;
        this._configService.setConfig(PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        this._initialize();
    }

    override onReady(): void {
        touchDependencies(this._injector, [
            [FormulaController],
            [SetDefinedNameController],
            [SetOtherFormulaController],
            [SetFeatureCalculationController],
            [SetDependencyController],
            [CalculateController],
        ]);
    }

    override onRendered(): void {
        touchDependencies(this._injector, [
            [CalculateFormulaService],
            [FormulaDependencyGenerator],
        ]);
    }

    private _initialize() {
        const dependencies: Dependency[] = [
            // Services
            [FunctionService],
            [DefinedNamesService],
            [ActiveDirtyManagerService],
            // Models
            [FormulaDataModel],
            // Engine
            [LexerTreeBuilder],
            [FormulaController],
            [SetDefinedNameController],
        ];

        if (!this._config?.notExecuteFormula) {
            // Dependencies for computing.
            dependencies.push(
                // Services
                [CalculateFormulaService],
                [OtherFormulaManagerService],
                [FormulaRuntimeService],
                [FormulaCurrentConfigService],
                [DependencyManagerService],
                [FeatureCalculationManagerService],
                //Controller
                [CalculateController],
                [SetOtherFormulaController],
                [SetDependencyController],
                [SetFeatureCalculationController],
                // Calculation engine
                [FormulaDependencyGenerator],
                [Interpreter],
                [AstTreeBuilder],
                [Lexer],
                // AstNode factory
                [AstRootNodeFactory],
                [FunctionNodeFactory],
                [LambdaNodeFactory],
                [LambdaParameterNodeFactory],
                [OperatorNodeFactory],
                [PrefixNodeFactory],
                [ReferenceNodeFactory],
                [SuffixNodeFactory],
                [UnionNodeFactory],
                [ValueNodeFactory]
            );
        }

        registerDependencies(this._injector, dependencies);
    }
}
