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
import type { IUniverDataValidationConfig } from './controllers/config.schema';
import { ICommandService, IConfigService, Inject, Injector, merge, Plugin, UniverInstanceType } from '@univerjs/core';
import { AddDataValidationCommand, RemoveAllDataValidationCommand, RemoveDataValidationCommand, UpdateDataValidationOptionsCommand, UpdateDataValidationSettingCommand } from './commands/commands/data-validation.command';
import { AddDataValidationMutation, RemoveDataValidationMutation, UpdateDataValidationMutation } from './commands/mutations/data-validation.mutation';
import { DATA_VALIDATION_PLUGIN_CONFIG_KEY, defaultPluginConfig } from './controllers/config.schema';
import { DataValidationResourceController } from './controllers/dv-resource.controller';
import { DataValidationModel } from './models/data-validation-model';
import { DataValidatorRegistryService } from './services/data-validator-registry.service';

const PLUGIN_NAME = 'UNIVER_DATA_VALIDATION_PLUGIN';

export class UniverDataValidationPlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config: Partial<IUniverDataValidationConfig> = defaultPluginConfig,
        @Inject(Injector) protected _injector: Injector,
        @ICommandService private _commandService: ICommandService,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration.
        const { ...rest } = merge(
            {},
            defaultPluginConfig,
            this._config
        );
        this._configService.setConfig(DATA_VALIDATION_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        ([
            [DataValidationModel],
            [DataValidatorRegistryService],
            [DataValidationResourceController],
        ] as Dependency[]).forEach((d) => this._injector.add(d));

        [
            // command
            AddDataValidationCommand,
            RemoveAllDataValidationCommand,
            UpdateDataValidationOptionsCommand,
            UpdateDataValidationSettingCommand,
            RemoveDataValidationCommand,

            // mutation
            AddDataValidationMutation,
            UpdateDataValidationMutation,
            RemoveDataValidationMutation,
        ].forEach((command) => {
            this._commandService.registerCommand(command);
        });
    }

    override onReady(): void {
        this._injector.get(DataValidationResourceController);
    }
}
