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

import { DependentOn, Inject, Injector, Plugin, Tools, UniverInstanceType } from '@univerjs/core';
import type { Dependency } from '@univerjs/core';
import { fromModule, IRPCChannelService, toModule } from '@univerjs/rpc';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import { IRefSelectionsService, RefSelectionsService } from '@univerjs/sheets';

import { FORMULA_UI_PLUGIN_NAME } from './common/plugin-name';
import { ActiveDirtyController } from './controllers/active-dirty.controller';
import { ArrayFormulaDisplayController } from './controllers/array-formula-display.controller';
import { FormulaAutoFillController } from './controllers/formula-auto-fill.controller';
import { FormulaClipboardController } from './controllers/formula-clipboard.controller';
import { FormulaEditorShowController } from './controllers/formula-editor-show.controller';
import type { IUniverSheetsFormulaConfig } from './controllers/formula-ui.controller';
import { DefaultSheetFormulaConfig, FormulaUIController } from './controllers/formula-ui.controller';
import { TriggerCalculationController } from './controllers/trigger-calculation.controller';
import { UpdateFormulaController } from './controllers/update-formula.controller';
import { DescriptionService, IDescriptionService } from './services/description.service';
import { FormulaPromptService, IFormulaPromptService } from './services/prompt.service';
import { IRegisterFunctionService, RegisterFunctionService } from './services/register-function.service';
import { DefinedNameController } from './controllers/defined-name.controller';
import { FormulaRefRangeService } from './services/formula-ref-range.service';
import { RegisterOtherFormulaService } from './services/register-other-formula.service';
import { FormulaAlertRenderController } from './controllers/formula-alert-render.controller';
import { FormulaRenderManagerController } from './controllers/formula-render.controller';
import { RefSelectionsRenderService } from './services/render-services/ref-selections.render-service';
import { PromptController } from './controllers/prompt.controller';
import { IRemoteRegisterFunctionService, RemoteRegisterFunctionService, RemoteRegisterFunctionServiceName } from './services/remote/remote-register-function.service';

@DependentOn(UniverFormulaEnginePlugin)
export class UniverRemoteSheetsFormulaPlugin extends Plugin {
    static override pluginName = 'SHEETS_FORMULA_REMOTE_PLUGIN';
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config = {},
        @Inject(Injector) override readonly _injector: Injector
    ) {
        super();
    }

    override onStarting(): void {
        this._injector.add([RemoteRegisterFunctionService]);
        this._injector.get(IRPCChannelService).registerChannel(
            RemoteRegisterFunctionServiceName,
            fromModule(this._injector.get(RemoteRegisterFunctionService))
        );
    }
}

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
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();

        this._config = Tools.deepMerge({}, DefaultSheetFormulaConfig, this._config);
    }

    override onStarting(): void {
        const j = this._injector;
        const dependencies: Dependency[] = [
            [IFormulaPromptService, { useClass: FormulaPromptService }],
            [IRefSelectionsService, { useClass: RefSelectionsService }],
            [IDescriptionService, { useFactory: () => j.createInstance(DescriptionService, this._config?.description) }],
            [IRegisterFunctionService, { useClass: RegisterFunctionService }],
            [FormulaRefRangeService],
            [RegisterOtherFormulaService],
            [FormulaUIController, { useFactory: () => j.createInstance(FormulaUIController, this._config) }],
            [FormulaAutoFillController],
            [FormulaClipboardController],
            [ArrayFormulaDisplayController],
            [TriggerCalculationController],
            [UpdateFormulaController],
            [FormulaEditorShowController],
            [ActiveDirtyController],
            [DefinedNameController],
            [FormulaRenderManagerController],
            [PromptController],
        ];

        // If the plugin do not execute formula, it should delegate a remote calculator.
        // So custom functions should be synced to that remote calculator.
        if (this._config.notExecuteFormula) {
            const rpcChannelService = j.get(IRPCChannelService);
            dependencies.push([IRemoteRegisterFunctionService, {
                useFactory: () => toModule<IRemoteRegisterFunctionService>(rpcChannelService.requestChannel(RemoteRegisterFunctionServiceName)),
            }]);
        }

        dependencies.forEach((dependency) => j.add(dependency));
    }

    override onRendered(): void {
        ([
            [RefSelectionsRenderService],
            [FormulaAlertRenderController],
        ] as Dependency[]).forEach((dep) => {
            this.disposeWithMe(this._renderManagerService.registerRenderModule(UniverInstanceType.UNIVER_SHEET, dep));
        });
    }
}

export class UniverSheetsFormulaMobilePlugin extends Plugin {
    static override pluginName = FORMULA_UI_PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config: Partial<IUniverSheetsFormulaConfig> = {},
        @Inject(Injector) override readonly _injector: Injector
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
            [IRegisterFunctionService, { useClass: RegisterFunctionService }],
            [FormulaRefRangeService],
            [RegisterOtherFormulaService],
            [FormulaClipboardController],
            [ArrayFormulaDisplayController],
            [TriggerCalculationController],
            [UpdateFormulaController],
            [ActiveDirtyController],
            [DefinedNameController],
            [FormulaRenderManagerController],
        ];

        dependencies.forEach((dependency) => this._injector.add(dependency));
    }
}
