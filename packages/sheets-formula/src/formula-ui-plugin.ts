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

import { IUniverInstanceService, LocaleService, Plugin, PluginType } from '@univerjs/core';
import type { BaseFunction, IFunctionInfo, IFunctionNames } from '@univerjs/engine-formula';
import type { Ctor, Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { FORMULA_UI_PLUGIN_NAME } from './common/plugin-name';
import { ActiveDirtyController } from './controllers/active-dirty.controller';
import { ArrayFormulaDisplayController } from './controllers/array-formula-display.controller';
import { FormulaAutoFillController } from './controllers/formula-auto-fill.controller';
import { FormulaClipboardController } from './controllers/formula-clipboard.controller';
import { FormulaEditorShowController } from './controllers/formula-editor-show.controller';
import { FormulaUIController } from './controllers/formula-ui.controller';
import { PromptController } from './controllers/prompt.controller';
import { TriggerCalculationController } from './controllers/trigger-calculation.controller';
import { UpdateFormulaController } from './controllers/update-formula.controller';
import { zhCN } from './locale';

import { DescriptionService, IDescriptionService } from './services/description.service';
import {
    FormulaCustomFunctionService,
    IFormulaCustomFunctionService,
} from './services/formula-custom-function.service';
import { FormulaPromptService, IFormulaPromptService } from './services/prompt.service';
import { IRegisterFunctionService, RegisterFunctionService } from './services/register-function.service';
import { NumfmtFormulaDisplayController } from './controllers/numfmt-formula-display.controller';

/**
 * The configuration of the formula UI plugin.
 */
interface IFormulaUIConfig {
    description: IFunctionInfo[];
    function: Array<[Ctor<BaseFunction>, IFunctionNames]>;
}
export class UniverSheetsFormulaPlugin extends Plugin {
    static override type = PluginType.Sheet;

    constructor(
        private _config: Partial<IFormulaUIConfig>,
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService
    ) {
        super(FORMULA_UI_PLUGIN_NAME);
    }

    initialize(): void {
        this._localeService.load({
            zhCN,
        });

        const dependencies: Dependency[] = [
            // services
            [IFormulaPromptService, { useClass: FormulaPromptService }],
            [
                IDescriptionService,
                {
                    useFactory: () => this._injector.createInstance(DescriptionService, this._config?.description),
                },
            ],
            [IFormulaCustomFunctionService, { useClass: FormulaCustomFunctionService }],

            [IRegisterFunctionService, { useClass: RegisterFunctionService }],

            // controllers
            [FormulaUIController],
            [PromptController],
            [FormulaAutoFillController],
            [FormulaClipboardController],
            [ArrayFormulaDisplayController],
            [NumfmtFormulaDisplayController],
            [TriggerCalculationController],
            [UpdateFormulaController],
            [FormulaEditorShowController],
            [ActiveDirtyController],
        ];

        dependencies.forEach((dependency) => this._injector.add(dependency));
    }

    override onReady(): void {
        this.initialize();
    }
}
