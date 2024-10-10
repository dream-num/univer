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

import type { Dependency } from '@univerjs/core';
import type { IUniverSheetsDataValidationConfig } from './controllers/config.schema';
import { ICommandService, IConfigService, Inject, Injector, Plugin, UniverInstanceType } from '@univerjs/core';
import { AddSheetDataValidationAndOpenCommand } from './commands/commands/data-validation-ui.command';
import {
    CloseValidationPanelOperation,
    HideDataValidationDropdown,
    OpenValidationPanelOperation,
    ShowDataValidationDropdown,
    ToggleValidationPanelOperation,
} from './commands/operations/data-validation.operation';
import { defaultPluginConfig, PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { DataValidationAlertController } from './controllers/dv-alert.controller';
import { DataValidationAutoFillController } from './controllers/dv-auto-fill.controller';
import { DataValidationCopyPasteController } from './controllers/dv-copy-paste.controller';
import { DataValidationPermissionController } from './controllers/dv-permission.controller';
import { DataValidationRejectInputController } from './controllers/dv-reject-input.controller';
import { SheetsDataValidationRenderController } from './controllers/dv-render.controller';
import { SheetsDataValidationUIController } from './controllers/dv-ui.controller';
import { DataValidationPanelService } from './services/data-validation-panel.service';
import { DataValidationDropdownManagerService } from './services/dropdown-manager.service';

const PLUGIN_NAME = 'SHEET_DATA_VALIDATION_UI_PLUGIN';

export class UniverSheetsDataValidationUIPlugin extends Plugin {
    static override pluginName: string = PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config: Partial<IUniverSheetsDataValidationConfig> = defaultPluginConfig,
        @Inject(Injector) protected readonly _injector: Injector,
        @ICommandService private readonly _commandService: ICommandService,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration..
        const { menu, ...rest } = this._config;
        if (menu) {
            this._configService.setConfig('menu', menu, { merge: true });
        }
        this._configService.setConfig(PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        ([
            [DataValidationPanelService],
            [DataValidationDropdownManagerService],
            [DataValidationAlertController],
            [DataValidationAutoFillController],
            [SheetsDataValidationRenderController],
            [DataValidationPermissionController],
            [DataValidationCopyPasteController],
            [DataValidationRejectInputController],
            [SheetsDataValidationUIController],
        ] as Dependency[]).forEach((dep) => {
            this._injector.add(dep);
        });

        [
            AddSheetDataValidationAndOpenCommand,
            ShowDataValidationDropdown,
            HideDataValidationDropdown,
            CloseValidationPanelOperation,
            OpenValidationPanelOperation,
            ToggleValidationPanelOperation,
        ].forEach((command) => {
            this._commandService.registerCommand(command);
        });
    }

    override onReady(): void {
        this._injector.get(DataValidationCopyPasteController);
        this._injector.get(DataValidationPermissionController);
        this._injector.get(DataValidationRejectInputController);
        this._injector.get(DataValidationAlertController);
    }

    override onRendered(): void {
        this._injector.get(SheetsDataValidationUIController);
        this._injector.get(SheetsDataValidationRenderController);
    }

    override onSteady(): void {
        this._injector.get(DataValidationAutoFillController);
    }
}
