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

import { DependentOn, IConfigService, Inject, Injector, Plugin, registerDependencies, touchDependencies, UniverInstanceType } from '@univerjs/core';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { SheetsHyperLinkController } from './controllers/hyper-link.controller';
import { SheetsHyperLinkParserService } from './services/parser.service';
import { SHEET_HYPER_LINK_PLUGIN } from './types/const';

@DependentOn(UniverSheetsPlugin)
export class UniverSheetsHyperLinkPlugin extends Plugin {
    static override pluginName = SHEET_HYPER_LINK_PLUGIN;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config: unknown = {},
        @Inject(Injector) protected _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();
    }

    override onStarting(): void {
        registerDependencies(this._injector, [
            [SheetsHyperLinkParserService],
            [SheetsHyperLinkController],
        ]);

        touchDependencies(this._injector, [
            [SheetsHyperLinkController],
        ]);
    }
}
