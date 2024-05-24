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

import { Plugin, UniverInstanceType } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { SHEET_FILTER_SNAPSHOT_ID, SheetsFilterService } from './services/sheet-filter.service';
import { SheetsFilterController } from './controllers/sheets-filter.controller';

export class UniverSheetsFilterPlugin extends Plugin {
    static override type = UniverInstanceType.UNIVER_SHEET;
    static override pluginName = SHEET_FILTER_SNAPSHOT_ID;

    constructor(_config: unknown, @Inject(Injector) protected readonly _injector: Injector) {
        super();
    }

    override onStarting(injector: Injector): void {
        ([
            [SheetsFilterService],
            [SheetsFilterController],
        ] as Dependency[]).forEach((d) => injector.add(d));
    }
}
