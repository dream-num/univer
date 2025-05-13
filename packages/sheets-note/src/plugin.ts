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
import type { IUniverSheetsNoteConfig } from './controllers/config.schema';
import { DependentOn, IConfigService, Inject, Injector, merge, Plugin, touchDependencies, UniverInstanceType } from '@univerjs/core';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { PLUGIN_NAME } from './const';
import { defaultPluginConfig, SHEETS_NOTE_PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { SheetsNoteRefRangeController } from './controllers/sheets-note-ref-range.controller';
import { SheetsNoteResourceController } from './controllers/sheets-note-resource.controller';
import { SheetsNoteController } from './controllers/sheets.note.controller';
import { SheetsNoteModel } from './models/sheets-note.model';

@DependentOn(UniverSheetsPlugin)
export class UniverSheetsNotePlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config: IUniverSheetsNoteConfig = defaultPluginConfig,
        @IConfigService private readonly _configService: IConfigService,
        @Inject(Injector) protected override readonly _injector: Injector
    ) {
        super();
        // Manage the plugin configuration.
        const { ...rest } = merge(
            {},
            defaultPluginConfig,
            this._config
        );

        this._configService.setConfig(SHEETS_NOTE_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        ([
            [SheetsNoteModel],
            [SheetsNoteController],
            [SheetsNoteResourceController],
            [SheetsNoteRefRangeController],
        ] as Dependency[]).forEach((dependency) => {
            this._injector.add(dependency);
        });

        touchDependencies(this._injector, [
            [SheetsNoteModel],
            [SheetsNoteController],
            [SheetsNoteResourceController],
        ]);
    }

    override onReady(): void {
        touchDependencies(this._injector, [
            [SheetsNoteRefRangeController],
        ]);
    }
}
