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

import { LocaleService, Plugin, PluginType } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { zhCN } from './locale';
import { SheetsFilterRenderController } from './controllers/sheets-filter-render.controller';
import { SheetsFilterUIController } from './controllers/sheets-filter-ui.controller';

const NAME = 'UNIVER_SHEETS_FILTER_UI_PLUGIN';

export class UniverSheetsFilterUIPlugin extends Plugin {
    static override type = PluginType.Sheet;

    constructor(
        _config: unknown,
        @Inject(Injector) protected readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super(NAME);

        this._localeService.load({
            zhCN,
        });
    }

    override onStarting(injector: Injector): void {
        ([
            [SheetsFilterRenderController],
            [SheetsFilterUIController],
        ] as Dependency[]).forEach((d) => injector.add(d));
    }
}
