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

import { DependentOn, LocaleService, Plugin, Tools, UniverInstanceType } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { FORMULA_UI_PLUGIN_NAME } from './common/plugin-name';
import { ActiveDirtyController } from './controllers/active-dirty.controller';
import { ArrayFormulaDisplayController } from './controllers/array-formula-display.controller';
import { FormulaAutoFillController } from './controllers/formula-auto-fill.controller';
import { FormulaClipboardController } from './controllers/formula-clipboard.controller';
import { FormulaEditorShowController } from './controllers/formula-editor-show.controller';
import type { IUniverSheetsFormulaConfig } from './controllers/formula-ui.controller';
import { DefaultSheetFormulaConfig, FormulaUIController } from './controllers/formula-ui.controller';
import { PromptController } from './controllers/prompt.controller';
import { TriggerCalculationController } from './controllers/trigger-calculation.controller';
import { UpdateFormulaController } from './controllers/update-formula.controller';

import { DescriptionService, IDescriptionService } from './services/description.service';
import {
    FormulaCustomFunctionService,
    IFormulaCustomFunctionService,
} from './services/formula-custom-function.service';
import { FormulaPromptService, IFormulaPromptService } from './services/prompt.service';
import { IRegisterFunctionService, RegisterFunctionService } from './services/register-function.service';
import { DefinedNameController } from './controllers/defined-name.controller';
import { FormulaRefRangeService } from './services/formula-ref-range.service';
import { RegisterOtherFormulaService } from './services/register-other-formula.service';
import { FormulaAlertController } from './controllers/formula-alert.controller';
import { FormulaRenderManagerController } from './controllers/formula-render.controller';

/**
 * The configuration of the formula UI plugin.
 */
@DependentOn(UniverFormulaEnginePlugin)
export class UniverSheetsFormulaPlugin extends Plugin {
    static override pluginName = FORMULA_UI_PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config: Partial<IUniverSheetsFormulaConfig> = {},
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super();

        this._config = Tools.deepMerge({}, DefaultSheetFormulaConfig, this._config);
    }

    override onStarting(): void {
        this._init();
    }

    _init(): void {
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
            [FormulaRefRangeService],
            [RegisterOtherFormulaService],

            // controllers
            [
                FormulaUIController,
                {
                    useFactory: () => this._injector.createInstance(FormulaUIController, this._config),
                },
            ],
            [PromptController],
            [FormulaAutoFillController],
            [FormulaClipboardController],
            [ArrayFormulaDisplayController],
            [TriggerCalculationController],
            [UpdateFormulaController],
            [FormulaEditorShowController],
            [ActiveDirtyController],
            [DefinedNameController],
            [FormulaRenderManagerController],
            [FormulaAlertController],
        ];

        dependencies.forEach((dependency) => this._injector.add(dependency));
    }
}
