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
import type { IUniverSheetsNumfmtUIConfig } from './config/config';
import {
    DependentOn,
    IConfigService,
    Inject,
    Injector,
    merge,
    Plugin,
    registerDependencies,
    touchDependencies,
    UniverInstanceType,
} from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt';
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui';
import pkg from '../package.json';
import { defaultPluginConfig, SHEETS_NUMFMT_UI_PLUGIN_CONFIG_KEY } from './config/config';
import { ComponentsController } from './controllers/components.controller';
import { NumfmtAlertRenderController } from './controllers/numfmt-alert-render.controller';
import { NumfmtRepeatLastActionController } from './controllers/numfmt-repeat-last-action.controller';
import { NumfmtEditorController } from './controllers/numfmt.editor.controller';
import { SheetNumfmtUIController } from './controllers/ui.controller';
import { UserHabitController } from './controllers/user-habit.controller';
import { NumfmtMenuController } from './menu/numfmt.menu.controller';

@DependentOn(UniverSheetsUIPlugin, UniverSheetsNumfmtPlugin)
export class UniverSheetsNumfmtUIPlugin extends Plugin {
    static override pluginName = 'SHEET_NUMFMT_UI_PLUGIN';
    static override packageName = pkg.name;
    static override version = pkg.version;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config: Partial<IUniverSheetsNumfmtUIConfig> = defaultPluginConfig,
        @Inject(Injector) override readonly _injector: Injector,
        @IConfigService private readonly _configService: IConfigService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();

        // Manage the plugin configuration.
        const { menu, ...rest } = merge(
            {},
            defaultPluginConfig,
            this._config
        );
        if (menu) {
            this._configService.setConfig('menu', menu, { merge: true });
        }

        this._configService.setConfig(SHEETS_NUMFMT_UI_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        this._injector.add([ComponentsController]);
        this._injector.get(ComponentsController);
        registerDependencies(this._injector, [
            [SheetNumfmtUIController],
            [NumfmtEditorController],
            [UserHabitController],
            [NumfmtMenuController],
            [NumfmtRepeatLastActionController],
        ]);
    }

    override onRendered(): void {
        this._registerRenderModules();
        touchDependencies(this._injector, [
            [SheetNumfmtUIController],
            [NumfmtEditorController],
            [NumfmtMenuController],
            [NumfmtRepeatLastActionController],
        ]);
    }

    private _registerRenderModules(): void {
        const modules: Dependency[] = [
            [NumfmtAlertRenderController],
        ];

        modules.forEach((m) => {
            this.disposeWithMe(this._renderManagerService.registerRenderModule(UniverInstanceType.UNIVER_SHEET, m));
        });
    }
}
