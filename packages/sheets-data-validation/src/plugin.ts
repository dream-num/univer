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

import { ICommandService, Plugin } from '@univerjs/core';
import { type Dependency, Inject, Injector } from '@wendellhu/redi';
import { DataValidationRenderController } from './controllers/dv-render.controller';
import { DataValidationController } from './controllers/dv.controller';
import { SheetDataValidationService } from './services/dv.service';
import { DataValidationAlertController } from './controllers/dv-alert.controller';
import { AddSheetDataValidationCommand, UpdateSheetDataValidationRangeCommand } from './commands/commands/data-validation.command';
import { DataValidationCacheService } from './services/dv-cache.service';
import { DataValidationFormulaService } from './services/dv-formula.service';
import { DataValidationCustomFormulaService } from './services/dv-custom-formula.service';

const PLUGIN_NAME = 'sheets-data-validation';

export class UniverSheetsDataValidationPlugin extends Plugin {
    constructor(
        @Inject(Injector) protected _injector: Injector,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super(PLUGIN_NAME);
    }

    override onStarting(injector: Injector) {
        ([
            [SheetDataValidationService],
            [DataValidationCacheService],
            [DataValidationFormulaService],
            [DataValidationCustomFormulaService],
            // controller
            [DataValidationController],
            [DataValidationRenderController],
            [DataValidationAlertController],
        ] as Dependency[]).forEach((dep) => {
            injector.add(dep);
        });

        [
            AddSheetDataValidationCommand,
            UpdateSheetDataValidationRangeCommand,
        ].forEach((command) => {
            this._commandService.registerCommand(command);
        });
    }
}
