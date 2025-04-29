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
import { IConfigService, Inject, Injector, Plugin, touchDependencies, UniverInstanceType } from '@univerjs/core';
import { SheetsCellContentController } from '../../sheets-note-ui/src/controllers/sheets-cell-content.controller';

export const PLUGIN_NAME = 'SHEET_NOTE_PLUGIN';

export class SheetsNotePlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        @Inject(Injector) protected override readonly _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();
    }

    override onStarting(): void {
        ([
            [SheetsCellContentController],
        ] as Dependency[]).forEach((dependency) => {
            this._injector.add(dependency);
        });
    }

    override onReady(): void {
        touchDependencies(this._injector, [
            [SheetsCellContentController],
        ]);
    }
}
