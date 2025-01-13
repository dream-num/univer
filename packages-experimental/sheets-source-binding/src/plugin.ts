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
import { IConfigService, Inject, Injector, Plugin, touchDependencies, UniverInstanceType } from '@univerjs/core';
import { SheetsBindingManager } from './controllers/binding-manager';
import { SheetsSourceManager } from './controllers/source-manager';
import { SheetsSourceBindService } from './services/source-binding-service';

interface IUniverSheetsBindingSourceConfig {}

export class UniverSheetsBindingSourcePlugin extends Plugin {
    static override type = UniverInstanceType.UNIVER_SHEET;
    static override pluginName = 'SHEET_BINDING_SOURCE_PLUGIN';

    constructor(
        private readonly _config: Partial<IUniverSheetsBindingSourceConfig> = {},
        @Inject(Injector) override readonly _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();
    }

    override onStarting(): void {
        ([
            [SheetsBindingManager],
            [SheetsSourceManager],
            [SheetsSourceBindService],
        ] as Dependency[]).forEach((d) => this._injector.add(d));
    }

    override onReady(): void {
        touchDependencies(this._injector, [
            [SheetsBindingManager],
            [SheetsSourceManager],
            [SheetsSourceBindService],
        ]);
    }
}
