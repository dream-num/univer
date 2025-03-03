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

import type { Dependency } from '@univerjs/core';
import type { IUniverSheetsDataValidationConfig } from './controllers/config.schema';
import {
    DependentOn,
    ICommandService,
    IConfigService,
    Inject,
    Injector,
    merge,
    Plugin,
    UniverInstanceType,
} from '@univerjs/core';
import { UniverDataValidationPlugin } from '@univerjs/data-validation';
import {
    AddSheetDataValidationCommand,
    ClearRangeDataValidationCommand,
    RemoveSheetAllDataValidationCommand,
    RemoveSheetDataValidationCommand,
    UpdateSheetDataValidationOptionsCommand,
    UpdateSheetDataValidationRangeCommand,
    UpdateSheetDataValidationSettingCommand,
} from './commands/commands/data-validation.command';
import { DATA_VALIDATION_PLUGIN_NAME } from './common/const';
import { defaultPluginConfig, SHEETS_DATA_VALIDATION_PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { DataValidationFormulaRefRangeController } from './controllers/dv-formula-ref-range.controller';
import { DataValidationFormulaController } from './controllers/dv-formula.controller';
import { DataValidationRefRangeController } from './controllers/dv-ref-range.controller';
import { SheetDataValidationSheetController } from './controllers/dv-sheet.controller';
import { DataValidationController } from './controllers/dv.controller';
import { SheetDataValidationModel } from './models/sheet-data-validation-model';
import { DataValidationCacheService } from './services/dv-cache.service';
import { DataValidationCustomFormulaService } from './services/dv-custom-formula.service';
import { DataValidationFormulaService } from './services/dv-formula.service';
import { SheetsDataValidationValidatorService } from './services/dv-validator-service';

@DependentOn(UniverDataValidationPlugin)
export class UniverSheetsDataValidationPlugin extends Plugin {
    static override pluginName = DATA_VALIDATION_PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config: Partial<IUniverSheetsDataValidationConfig> = defaultPluginConfig,
        @Inject(Injector) protected _injector: Injector,
        @ICommandService private readonly _commandService: ICommandService,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration.
        const { ...rest } = merge(
            {},
            defaultPluginConfig,
            this._config
        );
        this._configService.setConfig(SHEETS_DATA_VALIDATION_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting() {
        ([
            [DataValidationCacheService],
            [DataValidationFormulaService],
            [DataValidationCustomFormulaService],
            [SheetsDataValidationValidatorService],
            [SheetDataValidationModel],
            [DataValidationController],
            [DataValidationFormulaController],
            [SheetDataValidationSheetController],
            [DataValidationRefRangeController],
            [DataValidationFormulaRefRangeController],
        ] as Dependency[]).forEach((dep) => {
            this._injector.add(dep);
        });

        [
            AddSheetDataValidationCommand,
            UpdateSheetDataValidationRangeCommand,
            UpdateSheetDataValidationSettingCommand,
            UpdateSheetDataValidationOptionsCommand,
            RemoveSheetDataValidationCommand,
            RemoveSheetAllDataValidationCommand,
            ClearRangeDataValidationCommand,
        ].forEach((command) => {
            this._commandService.registerCommand(command);
        });

        this._injector.get(DataValidationCacheService);
        this._injector.get(SheetsDataValidationValidatorService);
        this._injector.get(DataValidationController);
        this._injector.get(DataValidationFormulaRefRangeController);
        this._injector.get(DataValidationRefRangeController);
    }

    override onReady(): void {
        this._injector.get(SheetDataValidationSheetController);
    }

    override onRendered(): void {
        this._injector.get(DataValidationFormulaController);
    }
}
