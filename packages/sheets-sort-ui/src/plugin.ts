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

import { LocaleService, Plugin, UniverInstanceType } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { zhCN } from './locale';
import { SheetsSortUIService } from './services/sheets-sort-ui.service';
import { SheetsSortUIController } from './controllers/sheets-sort-ui.controller';

const NAME = 'UNIVER_SHEETS_SORT_UI_PLUGIN';

export class UniverSheetsSortUIPlugin extends Plugin {
    static override type = UniverInstanceType.UNIVER_SHEET;
    static override pluginName = NAME;

    constructor(
        _config: unknown,
        @Inject(Injector) protected readonly _injector: Injector,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super();

        this._localeService.load({
            zhCN,
        });
    }

    override onStarting(injector: Injector): void {
        ([
            [SheetsSortUIService],
            [SheetsSortUIController],
        ] as Dependency[]).forEach((d) => injector.add(d));
    }
}
