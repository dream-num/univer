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

import { ICommandService, Plugin, UniverInstanceType } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import { DataValidatorRegistryService } from './services/data-validator-registry.service';
import { DataValidationModel } from './models/data-validation-model';
import { AddDataValidationCommand, RemoveAllDataValidationCommand, RemoveDataValidationCommand, UpdateDataValidationOptionsCommand, UpdateDataValidationSettingCommand } from './commands/commands/data-validation.command';
import { AddDataValidationMutation, RemoveDataValidationMutation, UpdateDataValidationMutation } from './commands/mutations/data-validation.mutation';
import { DataValidationResourceController } from './controllers/dv-resource.controller';
import { DataValidationSheetController } from './controllers/dv-sheet.controller';

const PLUGIN_NAME = 'UNIVER_DATA_VALIDATION_PLUGIN';

export class UniverDataValidationPlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        _config: unknown,
        @Inject(Injector) protected _injector: Injector,
        @ICommandService private _commandService: ICommandService
    ) {
        super();
    }

    override onStarting(injector: Injector): void {
        ([
            // model
            [DataValidationModel],
            // service
            [DataValidatorRegistryService],

            [DataValidationResourceController],
            [DataValidationSheetController],
        ] as Dependency[]).forEach(
            (d) => {
                injector.add(d);
            }
        );

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
}
