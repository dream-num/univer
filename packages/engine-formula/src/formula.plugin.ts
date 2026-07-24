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

import type { IUniverFormulaConfig } from './config/formula.config';
import {
    DependentOn,
    IConfigService,
    Inject,
    Injector,
    merge,
    Plugin,
    touchDependencies,
    UniverInstanceType,
} from '@univerjs/core';
import pkg from '../package.json';
import { defaultPluginConfig, FORMULA_PLUGIN_CONFIG_KEY } from './config/formula.config';
import { FormulaCalculationSessionController } from './controllers/formula-calculation-session.controller';
import { UniverFormulaEnginePlugin } from './plugin';
import { DescriptionService, IDescriptionService } from './services/formula/description.service';
import { FormulaCalculationSessionService } from './services/formula/formula-calculation-session.service';
import { IRegisterFunctionService, RegisterFunctionService } from './services/formula/register-function.service';

@DependentOn(UniverFormulaEnginePlugin)
export class UniverFormulaPlugin extends Plugin {
    static override pluginName = 'FORMULA_PLUGIN';
    static override packageName = pkg.name;
    static override version = pkg.version;
    static override type = UniverInstanceType.UNIVER_UNKNOWN;

    constructor(
        private readonly _config: IUniverFormulaConfig = defaultPluginConfig,
        @Inject(Injector) protected readonly _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        const { ...rest } = merge({}, defaultPluginConfig, this._config);
        this._configService.setConfig(FORMULA_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        this._injector.add([IDescriptionService, { useClass: DescriptionService }]);
        this._injector.add([IRegisterFunctionService, { useClass: RegisterFunctionService }]);
        this._injector.add([FormulaCalculationSessionService]);
        this._injector.add([FormulaCalculationSessionController]);
    }

    override onReady(): void {
        touchDependencies(this._injector, [[FormulaCalculationSessionController]]);
    }
}
