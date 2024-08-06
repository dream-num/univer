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

import { DependentOn, Inject, Injector, LocaleService, Plugin, Tools, UniverInstanceType } from '@univerjs/core';
import type { Dependency } from '@univerjs/core';

import { UniverSheetsSortPlugin } from '@univerjs/sheets-sort';
import { SheetsSortUIService } from './services/sheets-sort-ui.service';
import type { IUniverSheetsSortUIConfig } from './controllers/sheets-sort-ui.controller';
import { DefaultSheetsSortUIConfig, SheetsSortUIController } from './controllers/sheets-sort-ui.controller';

const NAME = 'UNIVER_SHEETS_SORT_UI_PLUGIN';
@DependentOn(UniverSheetsSortPlugin)
export class UniverSheetsSortUIPlugin extends Plugin {
    static override type = UniverInstanceType.UNIVER_SHEET;
    static override pluginName = NAME;

    constructor(
        private readonly _config: Partial<IUniverSheetsSortUIConfig> = {},
        @Inject(Injector) protected readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super();

        this._config = Tools.deepMerge({}, DefaultSheetsSortUIConfig, this._config);
    }

    override onStarting(): void {
        ([
            [SheetsSortUIService],
            [SheetsSortUIController, {
                useFactory: () => this._injector.createInstance(SheetsSortUIController, this._config),
            }],
        ] as Dependency[]).forEach((d) => this._injector.add(d));
    }
}
