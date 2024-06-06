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

import { DependentOn, Plugin, Tools, UniverInstanceType } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';

import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui';
import { SHEET_NUMFMT_PLUGIN } from './base/const/PLUGIN_NAME';
import { SheetsNumfmtCellContentController } from './controllers/numfmt.cell-content.controller';
import { NumfmtController } from './controllers/numfmt.controller';
import { NumfmtEditorController } from './controllers/numfmt.editor.controller';
import { NumfmtI18nController } from './controllers/numfmt.i18n.controller';
import type { IUniverSheetsNumfmtConfig } from './controllers/numfmt.menu.controller';
import { DefaultSheetNumfmtConfig, NumfmtMenuController } from './controllers/numfmt.menu.controller';
import { INumfmtController } from './controllers/type';
import { UserHabitController } from './controllers/user-habit.controller';

@DependentOn(UniverSheetsPlugin, UniverSheetsUIPlugin)
export class UniverSheetsNumfmtPlugin extends Plugin {
    static override pluginName = SHEET_NUMFMT_PLUGIN;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config: Partial<IUniverSheetsNumfmtConfig> = {},
        @Inject(Injector) override readonly _injector: Injector
    ) {
        super();
        this._config = Tools.deepMerge({}, DefaultSheetNumfmtConfig, this._config);
    }

    override onStarting(): void {
        this._injector.add([INumfmtController, { useClass: NumfmtController, lazy: false }]);
        this._injector.add([NumfmtEditorController]);
        this._injector.add([UserHabitController]);
        this._injector.add([SheetsNumfmtCellContentController]);
        this._injector.add([NumfmtI18nController]);
        this._injector.add(
            [
                NumfmtMenuController,
                {
                    useFactory: () => this._injector.createInstance(NumfmtMenuController, this._config),
                },
            ]);
    }
}
