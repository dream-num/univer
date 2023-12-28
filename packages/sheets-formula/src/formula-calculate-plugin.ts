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

import { Plugin, PluginType } from '@univerjs/core';
import type { BaseFunction, IFunctionNames } from '@univerjs/engine-formula';
import type { Ctor, Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { FORMULA_CALCULATE_PLUGIN_NAME } from './common/plugin-name';
import { FormulaAlgorithmController } from './controllers/formula-algorithm.controller';

/**
 * The configuration for the formula worker thread plugin.
 */
interface IFormulaCalculateConfig {
    function: Array<[Ctor<BaseFunction>, IFunctionNames]>;
}
export class UniverSheetsFormulaCalculatePlugin extends Plugin {
    static override type = PluginType.Sheet;

    constructor(
        private _config: Partial<IFormulaCalculateConfig>,
        @Inject(Injector) override readonly _injector: Injector
    ) {
        super(FORMULA_CALCULATE_PLUGIN_NAME);
    }

    initialize(): void {
        const dependencies: Dependency[] = [
            [
                FormulaAlgorithmController,
                {
                    useFactory: () =>
                        this._injector.createInstance(FormulaAlgorithmController, this._config?.function || []),
                },
            ],
        ];

        dependencies.forEach((dependency) => this._injector.add(dependency));
    }

    override onStarting(): void {
        this.initialize();
    }
}
