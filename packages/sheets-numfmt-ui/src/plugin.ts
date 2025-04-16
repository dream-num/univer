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
import type { IUniverSheetsNumfmtUIConfig } from './controllers/config.schema';
import { DependentOn, IConfigService, Inject, Injector, merge, Plugin, registerDependencies, touchDependencies, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt';
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui';
import { defaultPluginConfig } from './controllers/config.schema';
import { NumfmtAlertRenderController } from './controllers/numfmt-alert-render.controller';
import { SheetNumfmtUIController } from './controllers/numfmt.controller';
import { NumfmtEditorController } from './controllers/numfmt.editor.controller';
import { NumfmtMenuController } from './controllers/numfmt.menu.controller';
import { UserHabitController } from './controllers/user-habit.controller';

export const SHEET_NUMFMT_UI_PLUGIN = 'SHEET_NUMFMT_UI_PLUGIN';

@DependentOn(UniverSheetsUIPlugin, UniverSheetsNumfmtPlugin)
export class UniverSheetsNumfmtUIPlugin extends Plugin {
    static override pluginName = SHEET_NUMFMT_UI_PLUGIN;
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

        this._configService.setConfig('sheets-numfmt-ui.config', rest);
    }

    override onStarting(): void {
        registerDependencies(this._injector, [
            [SheetNumfmtUIController],
            [NumfmtEditorController],
            [UserHabitController],
            [NumfmtMenuController],
        ]);
    }

    override onRendered(): void {
        this._registerRenderModules();
        touchDependencies(this._injector, [
            [SheetNumfmtUIController],
            [NumfmtEditorController],
            [NumfmtMenuController],
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
