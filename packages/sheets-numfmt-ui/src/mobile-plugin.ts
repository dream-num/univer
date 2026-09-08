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
import { IRenderManagerService, UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt';
import { UniverSheetsMobileUIPlugin } from '@univerjs/sheets-ui';
import { UniverMobileUIPlugin } from '@univerjs/ui';
import pkg from '../package.json';
import { defaultPluginConfig, SHEETS_NUMFMT_UI_PLUGIN_CONFIG_KEY } from './config/config';
import { MobileComponentsController } from './controllers/mobile/components.controller';
import { SheetNumfmtMobileUIController } from './controllers/mobile/ui.controller';
import { NumfmtAlertRenderController } from './controllers/numfmt-alert-render.controller';
import { NumfmtRepeatLastActionController } from './controllers/numfmt-repeat-last-action.controller';
import { NumfmtEditorController } from './controllers/numfmt.editor.controller';
import { MobileNumfmtMenuController } from './menu/mobile-numfmt.menu.controller';

@DependentOn(
    UniverRenderEnginePlugin,
    UniverSheetsPlugin,
    UniverSheetsNumfmtPlugin,
    UniverSheetsMobileUIPlugin,
    UniverMobileUIPlugin
)
export class UniverSheetsNumfmtMobileUIPlugin extends Plugin {
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

        const { menu, ...rest } = merge({}, defaultPluginConfig, this._config);
        if (menu) {
            this._configService.setConfig('menu', menu, { merge: true });
        }
        this._configService.setConfig(SHEETS_NUMFMT_UI_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        registerDependencies(this._injector, [
            [MobileComponentsController],
            [SheetNumfmtMobileUIController],
            [NumfmtEditorController],
            [MobileNumfmtMenuController],
            [NumfmtRepeatLastActionController],
        ]);
        touchDependencies(this._injector, [
            [MobileComponentsController],
            [SheetNumfmtMobileUIController],
        ]);
    }

    override onRendered(): void {
        const modules: Dependency[] = [
            [NumfmtAlertRenderController],
        ];
        modules.forEach((module) => {
            this.disposeWithMe(
                this._renderManagerService.registerRenderModule(UniverInstanceType.UNIVER_SHEET, module)
            );
        });

        touchDependencies(this._injector, [
            [NumfmtEditorController],
            [MobileNumfmtMenuController],
            [NumfmtRepeatLastActionController],
        ]);
    }
}
