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

import { ICommandService, LocaleService, Plugin } from '@univerjs/core';
import { type Dependency, Inject, Injector } from '@wendellhu/redi';
import { DataValidationRenderController } from './controllers/dv-render.controller';
import { DataValidationController } from './controllers/dv.controller';
import { SheetDataValidationService } from './services/dv.service';
import { DataValidationAlertController } from './controllers/dv-alert.controller';
import { AddSheetDataValidationAndOpenCommand, AddSheetDataValidationCommand, UpdateSheetDataValidationRangeCommand } from './commands/commands/data-validation.command';
import { DataValidationCacheService } from './services/dv-cache.service';
import { DataValidationFormulaService } from './services/dv-formula.service';
import { DataValidationCustomFormulaService } from './services/dv-custom-formula.service';
import { RegisterOtherFormulaService } from './services/register-formula.service';
import { DataValidationRefRangeController } from './controllers/dv-ref-range.controller';
import { DataValidationFormulaMarkDirty } from './commands/mutations/formula.mutation';
import { enUS, zhCN } from './locales';
import { DATA_VALIDATION_PLUGIN_NAME } from './common/const';
import { DataValidationAutoFillController } from './controllers/dv-auto-fill.controller';
import { DataValidationSheetController } from './controllers/dv-sheet.controller';
import { DataValidationCopyPasteController } from './controllers/dv-copy-paste.controller';
import { DataValidationResourceController } from './controllers/dv-resource.controller';
import { DataValidationDropdownManagerService } from './services/dropdown-manager.service';
import { HideDataValidationDropdown, ShowDataValidationDropdown } from './commands/operations/data-validation.operation';

export class UniverSheetsDataValidationPlugin extends Plugin {
    constructor(
        @Inject(Injector) protected _injector: Injector,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super(DATA_VALIDATION_PLUGIN_NAME);
    }

    override onStarting(injector: Injector) {
        ([
            [SheetDataValidationService],
            [DataValidationCacheService],
            [DataValidationFormulaService],
            [DataValidationCustomFormulaService],
            [RegisterOtherFormulaService],
            [DataValidationDropdownManagerService],

            // controller
            [DataValidationResourceController],
            [DataValidationController],
            [DataValidationRenderController],
            [DataValidationAlertController],
            [DataValidationRefRangeController],
            [DataValidationAutoFillController],
            [DataValidationSheetController],
            [DataValidationCopyPasteController],
        ] as Dependency[]).forEach((dep) => {
            injector.add(dep);
        });

        [
            AddSheetDataValidationCommand,
            AddSheetDataValidationAndOpenCommand,
            UpdateSheetDataValidationRangeCommand,
            DataValidationFormulaMarkDirty,
            ShowDataValidationDropdown,
            HideDataValidationDropdown,
        ].forEach((command) => {
            this._commandService.registerCommand(command);
        });

        this._localeService.load({
            zhCN,
            enUS,
        });
    }
}
