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

import type { IUniverSheetsConditionalFormattingUIConfig } from './controllers/config.schema';
import {
    DependentOn,
    ICommandService,
    IConfigService,
    Inject,
    Injector,
    merge,
    Plugin,
    registerDependencies,
    touchDependencies,
    UniverInstanceType,
} from '@univerjs/core';
import { SHEET_CONDITIONAL_FORMATTING_PLUGIN, UniverSheetsConditionalFormattingPlugin } from '@univerjs/sheets-conditional-formatting';
import { AddAverageCfCommand } from './commands/commands/add-average-cf.command';
import { AddColorScaleConditionalRuleCommand } from './commands/commands/add-color-scale-cf.command';
import { AddDataBarConditionalRuleCommand } from './commands/commands/add-data-bar-cf.command';
import { AddDuplicateValuesCfCommand } from './commands/commands/add-duplicate-values-cf.command';
import { AddNumberCfCommand } from './commands/commands/add-number-cf.command';
import { AddRankCfCommand } from './commands/commands/add-rank-cf.command';
import { AddTextCfCommand } from './commands/commands/add-text-cf.command';
import { AddTimePeriodCfCommand } from './commands/commands/add-time-period-cf.command';
import { AddUniqueValuesCfCommand } from './commands/commands/add-unique-values-cf.command';

import { OpenConditionalFormattingOperator } from './commands/operations/open-conditional-formatting-panel';
import { ConditionalFormattingAutoFillController } from './controllers/cf.auto-fill.controller';
import { ConditionalFormattingClearController } from './controllers/cf.clear.controller';
import { ConditionalFormattingCopyPasteController } from './controllers/cf.copy-paste.controller';
import { ConditionalFormattingEditorController } from './controllers/cf.editor.controller';
import { ConditionalFormattingI18nController } from './controllers/cf.i18n.controller';
import { ConditionalFormattingMenuController } from './controllers/cf.menu.controller';
import { ConditionalFormattingPainterController } from './controllers/cf.painter.controller';
import { ConditionalFormattingPanelController } from './controllers/cf.panel.controller';
import { ConditionalFormattingPermissionController } from './controllers/cf.permission.controller';
import { SheetsCfRefRangeController } from './controllers/cf.ref-range.controller';
import { SheetsCfRenderController } from './controllers/cf.render.controller';
import { ConditionalFormattingViewportController } from './controllers/cf.viewport.controller';
import { defaultPluginConfig, SHEETS_CONDITIONAL_FORMATTING_UI_PLUGIN_CONFIG_KEY } from './controllers/config.schema';

@DependentOn(UniverSheetsConditionalFormattingPlugin)
export class UniverSheetsConditionalFormattingUIPlugin extends Plugin {
    static override pluginName = `${SHEET_CONDITIONAL_FORMATTING_PLUGIN}_UI_PLUGIN`;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config: Partial<IUniverSheetsConditionalFormattingUIConfig> = defaultPluginConfig,
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(ICommandService) private _commandService: ICommandService,
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
        this._configService.setConfig(SHEETS_CONDITIONAL_FORMATTING_UI_PLUGIN_CONFIG_KEY, rest);

        this._initCommand();
    }

    override onStarting(): void {
        registerDependencies(this._injector, [
            [SheetsCfRenderController],
            [SheetsCfRefRangeController],
            [ConditionalFormattingCopyPasteController],
            [ConditionalFormattingAutoFillController],
            [ConditionalFormattingPermissionController],
            [ConditionalFormattingPanelController],
            [ConditionalFormattingMenuController],
            [ConditionalFormattingI18nController],
            [ConditionalFormattingEditorController],
            [ConditionalFormattingClearController],
            [ConditionalFormattingPainterController],
            [ConditionalFormattingViewportController],
        ]);

        touchDependencies(this._injector, [
            [SheetsCfRenderController],
        ]);
    }

    override onReady(): void {
        touchDependencies(this._injector, [
            [ConditionalFormattingMenuController],
            [ConditionalFormattingPanelController],
        ]);
    }

    override onRendered(): void {
        touchDependencies(this._injector, [
            [ConditionalFormattingAutoFillController],
            [ConditionalFormattingClearController],
            [ConditionalFormattingCopyPasteController],
            [ConditionalFormattingEditorController],
            [ConditionalFormattingI18nController],
            [ConditionalFormattingPainterController],
            [ConditionalFormattingPermissionController],
            [SheetsCfRefRangeController],
            [ConditionalFormattingViewportController],
        ]);
    }

    private _initCommand() {
        [
            AddAverageCfCommand,
            AddColorScaleConditionalRuleCommand,
            AddDataBarConditionalRuleCommand,
            AddDuplicateValuesCfCommand,
            AddNumberCfCommand,
            AddRankCfCommand,
            AddTextCfCommand,
            AddTimePeriodCfCommand,
            AddUniqueValuesCfCommand,
            OpenConditionalFormattingOperator,
        ].forEach((m) => {
            this._commandService.registerCommand(m);
        });
    }
}
