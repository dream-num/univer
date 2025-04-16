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
import type { IUniverSheetsConditionalFormattingConfig } from './controllers/config.schema';
import { ICommandService, IConfigService, Inject, Injector, merge, Plugin, touchDependencies, UniverInstanceType } from '@univerjs/core';
import { SHEET_CONDITIONAL_FORMATTING_PLUGIN } from './base/const';
import { AddCfCommand } from './commands/commands/add-cf.command';
import { ClearRangeCfCommand } from './commands/commands/clear-range-cf.command';
import { ClearWorksheetCfCommand } from './commands/commands/clear-worksheet-cf.command';
import { DeleteCfCommand } from './commands/commands/delete-cf.command';
import { MoveCfCommand } from './commands/commands/move-cf.command';
import { SetCfCommand } from './commands/commands/set-cf.command';
import { AddConditionalRuleMutation } from './commands/mutations/add-conditional-rule.mutation';
import { DeleteConditionalRuleMutation } from './commands/mutations/delete-conditional-rule.mutation';
import { ConditionalFormattingFormulaMarkDirty } from './commands/mutations/formula-mark-dirty.mutation';
import { MoveConditionalRuleMutation } from './commands/mutations/move-conditional-rule.mutation';
import { SetConditionalRuleMutation } from './commands/mutations/set-conditional-rule.mutation';
import {
    defaultPluginConfig,
    SHEETS_CONDITIONAL_FORMATTING_PLUGIN_CONFIG_KEY,
} from './controllers/config.schema';
import { ConditionalFormattingRuleModel } from './models/conditional-formatting-rule-model';
import { ConditionalFormattingViewModel } from './models/conditional-formatting-view-model';
import { ConditionalFormattingFormulaService } from './services/conditional-formatting-formula.service';
import { ConditionalFormattingService } from './services/conditional-formatting.service';

export class UniverSheetsConditionalFormattingPlugin extends Plugin {
    static override pluginName = SHEET_CONDITIONAL_FORMATTING_PLUGIN;
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config: Partial<IUniverSheetsConditionalFormattingConfig> = defaultPluginConfig,
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(ICommandService) private _commandService: ICommandService,
        @IConfigService private readonly _configService: IConfigService
    ) {
        super();

        // Manage the plugin configuration.
        const { ...rest } = merge(
            {},
            defaultPluginConfig,
            this._config
        );
        this._configService.setConfig(SHEETS_CONDITIONAL_FORMATTING_PLUGIN_CONFIG_KEY, rest);

        ([
            [ConditionalFormattingService],
            [ConditionalFormattingFormulaService],
            [ConditionalFormattingRuleModel],
            [ConditionalFormattingViewModel],
        ] as Dependency[]).forEach((dependency) => {
            this._injector.add(dependency);
        });

        [
            AddCfCommand,
            ClearRangeCfCommand,
            ClearWorksheetCfCommand,
            DeleteCfCommand,
            MoveCfCommand,
            SetCfCommand,
            AddConditionalRuleMutation,
            DeleteConditionalRuleMutation,
            SetConditionalRuleMutation,
            MoveConditionalRuleMutation,
            ConditionalFormattingFormulaMarkDirty,
        ].forEach((m) => {
            this._commandService.registerCommand(m);
        });
    }

    override onStarting(): void {
        this._injector.get(ConditionalFormattingService);
        touchDependencies(this._injector, [[ConditionalFormattingService], [ConditionalFormattingViewModel]]);
    }
}
