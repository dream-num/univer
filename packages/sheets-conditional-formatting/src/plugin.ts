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

import { ICommandService, Plugin, PluginType } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';
import { SHEET_CONDITIONAL_FORMATTING_PLUGIN } from './base/const';
import { ConditionalFormattingService } from './services/conditional-formatting.service';
import { ConditionalFormattingRuleModel } from './models/conditional-formatting-rule-model';
import { ConditionalFormattingViewModel } from './models/conditional-formatting-view-model';
import { RenderController } from './controllers/cf.render.controller';
import { DddAverageCfCommand } from './commands/commands/add-average-cf.command';
import { AddColorScaleConditionalRuleCommand } from './commands/commands/add-color-scale-cf.command';
import { AddDataBarConditionalRuleCommand } from './commands/commands/add-data-bar-cf.command';
import { AddDuplicateValuesCfCommand } from './commands/commands/add-duplicate-values-cf.command';
import { AddNumberCfCommand } from './commands/commands/add-number-cf.command';
import { AddRankCfCommand } from './commands/commands/add-rank-cf.command';
import { AddTextCfCommand } from './commands/commands/add-text-cf.command';
import { AddTimePeriodCfCommand } from './commands/commands/add-time-period-cf.command';
import { AddUniqueValuesCfCommand } from './commands/commands/add-unique-values-cf.command';
import { AddConditionalRuleMutation } from './commands/mutations/add-conditional-rule.mutation';
import { DeleteConditionalRuleMutation } from './commands/mutations/delete-conditional-rule.mutation';
import { RefRangeController } from './controllers/cf.ref-range.controller';
import { SetConditionalRuleMutation } from './commands/mutations/set-conditional-rule.mutation';
import { ConditionalFormattingCopyPasteController } from './controllers/cf.copy-paste.controller';
import { ConditionalFormattingAutoFillController } from './controllers/cf.auto-fill.controller';
import { ConditionalFormattingMenuController } from './controllers/cf.menu.controller';
import { ConditionalFormattingI18nController } from './controllers/cf.i18n.controller';

import { ClearRangeCfCommand } from './commands/commands/clear-range-cf.command';
import { ClearWorksheetCfCommand } from './commands/commands/clear-worksheet-cf.command';
import { OpenConditionalFormattingOperator } from './commands/operations/open-conditional-formatting-panel';
import { DeleteCfCommand } from './commands/commands/delete-cf.command';
import { SetCfCommand } from './commands/commands/set-cf.command';
import { moveCfCommand } from './commands/commands/move-cf.command';
import { AddCfCommand } from './commands/commands/add-cf.command';
import { MoveConditionalRuleMutation } from './commands/mutations/move-conditional-rule.mutation';
import { ConditionalFormattingFormulaService } from './services/conditional-formatting-formula.service';
import { ConditionalFormattingFormulaMarkDirty } from './commands/mutations/formula-mark-dirty.mutation';
import { ConditionalFormattingEditorController } from './controllers/cf.editor.controller';
import { ConditionalFormattingClearController } from './controllers/cf.clear.controller';

export class SheetsConditionalFormattingPlugin extends Plugin {
    static override type = PluginType.Sheet;
    static commandList = [
        DddAverageCfCommand,
        AddColorScaleConditionalRuleCommand,
        AddDataBarConditionalRuleCommand,
        AddDuplicateValuesCfCommand,
        AddNumberCfCommand,
        AddRankCfCommand,
        AddTextCfCommand,
        AddTimePeriodCfCommand,
        AddUniqueValuesCfCommand,
        OpenConditionalFormattingOperator,
        DeleteCfCommand,
        SetCfCommand,
        moveCfCommand,
        AddCfCommand,
        ClearRangeCfCommand,
        ClearWorksheetCfCommand,
    ];

    static mutationList = [AddConditionalRuleMutation, DeleteConditionalRuleMutation, SetConditionalRuleMutation, MoveConditionalRuleMutation, ConditionalFormattingFormulaMarkDirty];
    constructor(
        _config: unknown,
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(ICommandService) private _commandService: ICommandService
    ) {
        super(SHEET_CONDITIONAL_FORMATTING_PLUGIN);
        this._initCommand();
    }

    override onStarting(): void {
        this._injector.add([ConditionalFormattingService]);
        this._injector.add([ConditionalFormattingFormulaService]);

        this._injector.add([ConditionalFormattingRuleModel]);
        this._injector.add([ConditionalFormattingViewModel]);

        this._injector.add([RenderController]);
        this._injector.add([RefRangeController]);
        this._injector.add([ConditionalFormattingCopyPasteController]);
        this._injector.add([ConditionalFormattingAutoFillController]);
        this._injector.add([ConditionalFormattingMenuController]);
        this._injector.add([ConditionalFormattingI18nController]);
        this._injector.add([ConditionalFormattingEditorController]);
        this._injector.add([ConditionalFormattingClearController]);
    }

    _initCommand() {
        SheetsConditionalFormattingPlugin.commandList.forEach((m) => {
            this._commandService.registerCommand(m);
        });
        SheetsConditionalFormattingPlugin.mutationList.forEach((m) => {
            this._commandService.registerCommand(m);
        });
    }
}
