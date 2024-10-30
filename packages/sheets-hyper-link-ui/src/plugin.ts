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
import type { IUniverSheetsHyperLinkUIConfig } from './controllers/config.schema';
import { DependentOn, IConfigService, Inject, Injector, Plugin, UniverInstanceType } from '@univerjs/core';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { defaultPluginConfig, PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { SheetsHyperLinkPermissionController } from './controllers/hyper-link-permission.controller';
import { SheetsHyperLinkPopupController } from './controllers/popup.controller';
import { SheetsHyperLinkRichTextRefRangeController } from './controllers/rich-text-ref-range.controller';
import { SheetsHyperLinkUIController } from './controllers/ui.controller';
import { SheetHyperLinkUrlController } from './controllers/url.controller';
import { SheetsHyperLinkPopupService } from './services/popup.service';
import { SheetsHyperLinkResolverService } from './services/resolver.service';
import { SheetsHyperLinkSidePanelService } from './services/side-panel.service';
import { SHEET_HYPER_LINK_UI_PLUGIN } from './types/const';

@DependentOn(UniverDocsUIPlugin)
export class UniverSheetsHyperLinkUIPlugin extends Plugin {
    static override pluginName: string = SHEET_HYPER_LINK_UI_PLUGIN;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config: Partial<IUniverSheetsHyperLinkUIConfig> = defaultPluginConfig,
        @Inject(Injector) protected override _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration.
        const { menu, ...rest } = this._config;
        if (menu) {
            this._configService.setConfig('menu', menu, { merge: true });
        }
        this._configService.setConfig(PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        const dependencies: Dependency[] = [
            [SheetsHyperLinkResolverService],
            [SheetsHyperLinkPopupService],
            [SheetsHyperLinkSidePanelService],

            [SheetsHyperLinkPopupController],
            [SheetsHyperLinkUIController],
            [SheetsHyperLinkPermissionController],
            [SheetHyperLinkUrlController],
            [SheetsHyperLinkRichTextRefRangeController],
        ];
        dependencies.forEach((dep) => this._injector.add(dep));

        this._injector.get(SheetsHyperLinkRichTextRefRangeController);
    }

    override onReady(): void {
        this._injector.get(SheetsHyperLinkUIController);
    }

    override onRendered(): void {
        this._injector.get(SheetsHyperLinkPermissionController);
        this._injector.get(SheetHyperLinkUrlController);
        this._injector.get(SheetsHyperLinkPopupController);
    }
}
