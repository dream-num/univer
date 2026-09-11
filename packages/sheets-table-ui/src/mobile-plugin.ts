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
import type { IUniverSheetsTableUIConfig } from './config/config';
import {
    DependentOn,
    ICommandService,
    IConfigService,
    Inject,
    Injector,
    merge,
    Plugin,
    registerDependencies,
    touchDependencies,
    UniverInstanceType,
} from '@univerjs/core';
import { IRenderManagerService, UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsTablePlugin } from '@univerjs/sheets-table';
import { UniverSheetsMobileUIPlugin } from '@univerjs/sheets-ui';
import { UniverMobileUIPlugin } from '@univerjs/ui';
import pkg from '../package.json';
import { OpenTableFilterPanelMobileOperation } from './commands/operations/mobile/open-table-filter-dialog.operation';
import { OpenTableSelectorOperation } from './commands/operations/open-table-selector.operation';
import { defaultPluginConfig, SHEETS_TABLE_UI_PLUGIN_CONFIG_KEY } from './config/config';
import { PLUGIN_NAME } from './const';
import { MobileComponentsController } from './controllers/mobile/components.controller';
import { SheetsTableMobileComponentController } from './controllers/mobile/sheet-table-component.controller';
import { SheetTableControlsMobileRenderController } from './controllers/mobile/sheet-table-controls-render.controller';
import { SheetsTableFilterButtonRenderController } from './controllers/sheet-table-filter-button-render.controller';
import { SheetsTableRenderController } from './controllers/sheet-table-render.controller';
import { SheetTableSelectionController } from './controllers/sheet-table-selection.controller';
import { SheetTableThemeUIController } from './controllers/sheet-table-theme-ui.controller';
import { SheetTableMenuController } from './menu/sheet-table-menu.controller';
import { SheetsTableUiService } from './services/sheets-table-ui.service';

@DependentOn(
    UniverRenderEnginePlugin,
    UniverSheetsPlugin,
    UniverSheetsTablePlugin,
    UniverSheetsMobileUIPlugin,
    UniverMobileUIPlugin
)
export class UniverSheetsTableMobileUIPlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;
    static override packageName = pkg.name;
    static override version = pkg.version;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config: Partial<IUniverSheetsTableUIConfig> = defaultPluginConfig,
        @Inject(Injector) protected override readonly _injector: Injector,
        @Inject(ICommandService) private readonly _commandService: ICommandService,
        @IConfigService private readonly _configService: IConfigService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();

        const { menu, ...rest } = merge({}, defaultPluginConfig, this._config);
        if (menu) {
            this._configService.setConfig('menu', menu, { merge: true });
        }
        this._configService.setConfig(SHEETS_TABLE_UI_PLUGIN_CONFIG_KEY, rest);

        this._initRegisterCommand();
    }

    override onStarting(): void {
        this._injector.add([MobileComponentsController]);
        this._injector.get(MobileComponentsController);

        registerDependencies(this._injector, [
            [SheetsTableMobileComponentController],
            [SheetsTableUiService],
            [SheetTableMenuController],
            [SheetTableThemeUIController],
            [SheetTableSelectionController],
        ]);
    }

    override onReady(): void {
        touchDependencies(this._injector, [
            [SheetsTableMobileComponentController],
            [SheetsTableUiService],
            [SheetTableMenuController],
            [SheetTableThemeUIController],
            [SheetTableSelectionController],
        ]);
    }

    override onRendered(): void {
        this._registerRenderModules();
    }

    private _registerRenderModules(): void {
        const renderDependencies: Dependency[] = [];
        if (this._config.hideAnchor !== true) {
            renderDependencies.push([
                SheetTableControlsMobileRenderController,
            ]);
        }
        renderDependencies.push(
            [SheetsTableFilterButtonRenderController],
            [SheetsTableRenderController]
        );

        renderDependencies.forEach((dependency) => {
            this.disposeWithMe(
                this._renderManagerService.registerRenderModule(UniverInstanceType.UNIVER_SHEET, dependency)
            );
        });
    }

    private _initRegisterCommand(): void {
        [
            OpenTableFilterPanelMobileOperation,
            OpenTableSelectorOperation,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }
}
