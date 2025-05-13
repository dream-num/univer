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
import type { IUniverSheetsNoteUIPluginConfig } from './controllers/config.schema';
import { DependentOn, IConfigService, Inject, Injector, merge, Plugin, touchDependencies, UniverInstanceType } from '@univerjs/core';
import { UniverSheetsNotePlugin } from '@univerjs/sheets-note';
import { defaultPluginConfig, SHEETS_NOTE_UI_PLUGIN_CONFIG_KEY } from './controllers/config.schema';
import { SheetsCellContentController } from './controllers/sheets-cell-content.controller';
import { SheetsNoteAttachmentController } from './controllers/sheets-note-attachment.controller';
import { SheetsNotePopupController } from './controllers/sheets-note-popup.controller';
import { SheetsNoteUIController } from './controllers/sheets-note-ui.controller';
import { SheetsNotePopupService } from './services/sheets-note-popup.service';

export const PLUGIN_NAME = 'SHEET_NOTE_UI_PLUGIN';

@DependentOn(UniverSheetsNotePlugin)
export class UniverSheetsNoteUIPlugin extends Plugin {
    static override pluginName = PLUGIN_NAME;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config: Partial<IUniverSheetsNoteUIPluginConfig> = defaultPluginConfig,
        @Inject(Injector) protected override readonly _injector: Injector,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();
        // Manage the plugin configuration.
        const { menu, ...rest } = merge(
            {},
            defaultPluginConfig,
            this._config
        );
        if (menu) {
            this._configService.setConfig('menu', menu, { merge: true });
        }
        this._configService.setConfig(SHEETS_NOTE_UI_PLUGIN_CONFIG_KEY, rest);
    }

    override onStarting(): void {
        ([
            [SheetsNotePopupService],
            [SheetsCellContentController],
            [SheetsNotePopupController],
            [SheetsNoteUIController],
            [SheetsNoteAttachmentController],
        ] as Dependency[]).forEach((dependency) => {
            this._injector.add(dependency);
        });
    }

    override onReady(): void {
        touchDependencies(this._injector, [
            [SheetsNoteUIController],
            [SheetsCellContentController],
        ]);
    }

    override onRendered(): void {
        touchDependencies(this._injector, [
            [SheetsNotePopupController],
            [SheetsNoteAttachmentController],
        ]);
    }
}
