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

import type { IUniverSheetsHyperLinkConfig } from './controllers/config.schema';
import { DependentOn, IConfigService, Inject, Injector, merge, Plugin, registerDependencies, touchDependencies, UniverInstanceType } from '@univerjs/core';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { defaultPluginConfig, SHEETS_HYPER_LINK_PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { SheetsHyperLinkRefRangeController } from './controllers/ref-range.controller';
import { SheetsHyperLinkRemoveSheetController } from './controllers/remove-sheet.controller';
import { SheetsHyperLinkRichTextRefRangeController } from './controllers/rich-text-ref-range.controller';
import { SheetHyperLinkSetRangeController } from './controllers/set-range.controller';
import { SheetsHyperLinkResourceController } from './controllers/sheet-hyper-link-resource.controller';
import { SheetsHyperLinkController } from './controllers/sheet-hyper-link.controller';
import { HyperLinkModel } from './models/hyper-link.model';
import { SheetsHyperLinkParserService } from './services/parser.service';
import { SHEET_HYPER_LINK_PLUGIN } from './types/const';

@DependentOn(UniverSheetsPlugin)
export class UniverSheetsHyperLinkPlugin extends Plugin {
    static override pluginName = SHEET_HYPER_LINK_PLUGIN;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config: Partial<IUniverSheetsHyperLinkConfig> = defaultPluginConfig,
        @Inject(Injector) protected _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration.
        const { ...rest } = merge(
            {},
            defaultPluginConfig,
            this._config
        );
        this._configService.setConfig(SHEETS_HYPER_LINK_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        registerDependencies(this._injector, [
            [HyperLinkModel],
            [SheetsHyperLinkParserService],
            [SheetsHyperLinkResourceController],
            [SheetsHyperLinkController],
            [SheetsHyperLinkRefRangeController],
            [SheetHyperLinkSetRangeController],
            [SheetsHyperLinkRemoveSheetController],
            [SheetsHyperLinkRichTextRefRangeController],

        ]);

        touchDependencies(this._injector, [
            [SheetsHyperLinkRefRangeController],
            [SheetsHyperLinkResourceController],
            [SheetsHyperLinkController],
            [SheetHyperLinkSetRangeController],
            [SheetsHyperLinkRemoveSheetController],
            [SheetsHyperLinkRichTextRefRangeController],
        ]);
    }
}
