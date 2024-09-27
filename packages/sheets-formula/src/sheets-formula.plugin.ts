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

import { DependentOn, IConfigService, Inject, Injector, Plugin, UniverInstanceType } from '@univerjs/core';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { fromModule, IRPCChannelService, toModule } from '@univerjs/rpc';
import { UniverSheetsPlugin } from '@univerjs/sheets';

import type { Dependency } from '@univerjs/core';
import { SHEETS_FORMULA_PLUGIN_NAME } from './common/plugin-name';
import { ActiveDirtyController } from './controllers/active-dirty.controller';
import { ArrayFormulaCellInterceptorController } from './controllers/array-formula-cell-interceptor.controller';
import {
    defaultPluginBaseConfig,
    defaultPluginRemoteConfig,
    PLUGIN_CONFIG_KEY_BASE,
    PLUGIN_CONFIG_KEY_REMOTE,
} from './controllers/config.schema';
import { DefinedNameController } from './controllers/defined-name.controller';
import { FormulaController } from './controllers/formula.controller';
import { TriggerCalculationController } from './controllers/trigger-calculation.controller';
import { UpdateFormulaController } from './controllers/update-formula.controller';
import { DescriptionService, IDescriptionService } from './services/description.service';
import { FormulaRefRangeService } from './services/formula-ref-range.service';
import { IRegisterFunctionService, RegisterFunctionService } from './services/register-function.service';
import { RegisterOtherFormulaService } from './services/register-other-formula.service';
import { IRemoteRegisterFunctionService, RemoteRegisterFunctionService, RemoteRegisterFunctionServiceName } from './services/remote/remote-register-function.service';
import type {
    IUniverSheetsFormulaBaseConfig,
    IUniverSheetsFormulaRemoteConfig,
} from './controllers/config.schema';

@DependentOn(UniverFormulaEnginePlugin)
export class UniverRemoteSheetsFormulaPlugin extends Plugin {
    static override pluginName = 'SHEET_FORMULA_REMOTE_PLUGIN';
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config: Partial<IUniverSheetsFormulaRemoteConfig> = defaultPluginRemoteConfig,
        @Inject(Injector) override readonly _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration.
        const { ...rest } = this._config;
        this._configService.setConfig(PLUGIN_CONFIG_KEY_REMOTE, rest);
    }

    override onStarting(): void {
        this._injector.add([RemoteRegisterFunctionService]);
        this._injector.get(IRPCChannelService).registerChannel(
            RemoteRegisterFunctionServiceName,
            fromModule(this._injector.get(RemoteRegisterFunctionService))
        );
    }
}

@DependentOn(UniverFormulaEnginePlugin, UniverSheetsPlugin)
export class UniverSheetsFormulaPlugin extends Plugin {
    static override pluginName = SHEETS_FORMULA_PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config: Partial<IUniverSheetsFormulaBaseConfig> = defaultPluginBaseConfig,
        @Inject(Injector) override readonly _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration.
        const { ...rest } = this._config;
        this._configService.setConfig(PLUGIN_CONFIG_KEY_BASE, rest);
    }

    override onStarting(): void {
        const j = this._injector;
        const dependencies: Dependency[] = [
            [IRegisterFunctionService, { useClass: RegisterFunctionService }],
            [IDescriptionService, { useClass: DescriptionService }],
            [FormulaController],
            [FormulaRefRangeService],
            [RegisterOtherFormulaService],
            [ArrayFormulaCellInterceptorController],
            [TriggerCalculationController],
            [UpdateFormulaController],
            [ActiveDirtyController],
            [DefinedNameController],
        ];

        // If the plugin do not execute formula, it should delegate a remote proxy.
        // So custom functions should be synced to that remote calculator.
        if (this._config.notExecuteFormula) {
            const rpcChannelService = j.get(IRPCChannelService);
            dependencies.push([IRemoteRegisterFunctionService, {
                useFactory: () => toModule<IRemoteRegisterFunctionService>(rpcChannelService.requestChannel(RemoteRegisterFunctionServiceName)),
            }]);
        }

        dependencies.forEach((dependency) => j.add(dependency));
    }

    override onReady(): void {
        this._injector.get(TriggerCalculationController);
        this._injector.get(FormulaController);
    }
}

// TODO@wzhudev: after I separate the sheets-formula-ui plugin,
// I found out that `UniverSheetsFormulaPlugin` provides the same services as `UniverSheetsFormulaMobilePlugin`.
// The the later on can be removed.

export class UniverSheetsFormulaMobilePlugin extends Plugin {
    static override pluginName = SHEETS_FORMULA_PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config: undefined,
        @Inject(Injector) override readonly _injector: Injector
    ) {
        super();
    }

    override onStarting(): void {
        const dependencies: Dependency[] = [
            [IRegisterFunctionService, { useClass: RegisterFunctionService }],
            [FormulaRefRangeService],
            [RegisterOtherFormulaService],
            [ArrayFormulaCellInterceptorController],
            [TriggerCalculationController],
            [UpdateFormulaController],
            [ActiveDirtyController],
            [DefinedNameController],
        ];

        dependencies.forEach((dependency) => this._injector.add(dependency));
    }

    override onReady(): void {
        ([TriggerCalculationController]).forEach((module) => this._injector.get(module));
    }
}
