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
import { ICommandService, Inject, Injector, Plugin, registerDependencies, touchDependencies, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { OpenTableFilterPanelOperation } from './commands/operations/open-table-filter-dialog.opration';
import { OpenTableSelectorOperation } from './commands/operations/open-table-selector.operation';
import { PLUGIN_NAME } from './const';
import { SheetTableAnchorController } from './controllers/sheet-table-anchor.controller';
import { SheetsTableComponentController } from './controllers/sheet-table-component.controller';
import { SheetsTableFilterButtonRenderController } from './controllers/sheet-table-filter-button-render.controller';
import { SheetTableMenuController } from './controllers/sheet-table-menu.controller';
import { SheetsTableRenderController } from './controllers/sheet-table-render.controller';
import { SheetTableSelectionController } from './controllers/sheet-table-selection.controller';
import { SheetTableThemeUIController } from './controllers/sheet-table-theme-ui.controller';
import { SheetsTableUiService } from './services/sheets-table-ui-service';

export class UniverSheetTableUIPlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config = {},
        @Inject(Injector) protected override _injector: Injector,
        @Inject(ICommandService) private _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();
        this._initRegisterCommand();
    }

    override onStarting(): void {
        registerDependencies(this._injector, [
            [SheetsTableComponentController],
            [SheetsTableUiService],
            [SheetTableMenuController],
            [SheetTableThemeUIController],
            [SheetTableSelectionController],
        ]);
    }

    override onReady(): void {
        touchDependencies(this._injector, [
            [SheetsTableComponentController],
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
        ([
            [SheetsTableFilterButtonRenderController],
            [SheetsTableRenderController],
            [SheetTableAnchorController],
        ] as Dependency[]).forEach((m) => {
            this.disposeWithMe(this._renderManagerService.registerRenderModule(UniverInstanceType.UNIVER_SHEET, m));
        });
    }

    private _initRegisterCommand() {
        [
            OpenTableFilterPanelOperation,
            OpenTableSelectorOperation,
        ].forEach((m) => this._commandService.registerCommand(m));
    }
}
