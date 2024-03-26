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
import { SHEET_CONDITION_FORMAT_PLUGIN } from './base/const';
import { ConditionalFormatService } from './services/conditional-format.service';
import { ConditionalFormatRuleModel } from './models/conditional-format-rule-model';
import { ConditionalFormatViewModel } from './models/conditional-format-view-model';
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
import { ConditionalFormatCopyPasteController } from './controllers/cf.copy-paste.controller';
import { ConditionalFormatAutoFillController } from './controllers/cf.auto-fill.controller';
import { ConditionalFormatMenuController } from './controllers/cf.menu.controller';
import { ConditionalFormatI18nController } from './controllers/cf.i18n.controller';

import { ClearRangeCfCommand } from './commands/commands/clear-range-cf.command';
import { ClearWorksheetCfCommand } from './commands/commands/clear-worksheet-cf.command';
import { OpenConditionalFormatOperator } from './commands/operations/open-conditional-format-panel';
import { DeleteCfCommand } from './commands/commands/delete-cf.command';
import { SetCfCommand } from './commands/commands/set-cf.command';
import { moveCfCommand } from './commands/commands/move-cf.command';
import { AddCfCommand } from './commands/commands/add-cf.command';
import { MoveConditionalRuleMutation } from './commands/mutations/move-conditional-rule.mutation';
import { ConditionalFormatFormulaService } from './services/conditional-format-formula.service';
import { ConditionalFormatFormulaMarkDirty } from './commands/mutations/formula-mark-dirty.mutation';
import { ConditionalFormatEditorController } from './controllers/cf.editor.controller';
import { ConditionalFormatClearController } from './controllers/cf.clear.controller';

export class SheetsConditionalFormatPlugin extends Plugin {
    static override type = PluginType.Sheet;
    static commandList = [DddAverageCfCommand,
        AddColorScaleConditionalRuleCommand,
        AddDataBarConditionalRuleCommand,
        AddDuplicateValuesCfCommand,
        AddNumberCfCommand,
        AddRankCfCommand,
        AddTextCfCommand,
        AddTimePeriodCfCommand,
        AddUniqueValuesCfCommand,
        OpenConditionalFormatOperator,
        DeleteCfCommand,
        SetCfCommand,
        moveCfCommand,
        AddCfCommand,
        ClearRangeCfCommand,
        ClearWorksheetCfCommand,
    ];

    static mutationList = [AddConditionalRuleMutation, DeleteConditionalRuleMutation, SetConditionalRuleMutation, MoveConditionalRuleMutation, ConditionalFormatFormulaMarkDirty];
    constructor(
        _config: unknown,
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(ICommandService) private _commandService: ICommandService
    ) {
        super(SHEET_CONDITION_FORMAT_PLUGIN);
        this._initCommand();
    }

    override onStarting(): void {
        this._injector.add([ConditionalFormatService]);
        this._injector.add([ConditionalFormatFormulaService]);

        this._injector.add([ConditionalFormatRuleModel]);
        this._injector.add([ConditionalFormatViewModel]);

        this._injector.add([RenderController]);
        this._injector.add([RefRangeController]);
        this._injector.add([ConditionalFormatCopyPasteController]);
        this._injector.add([ConditionalFormatAutoFillController]);
        this._injector.add([ConditionalFormatMenuController]);
        this._injector.add([ConditionalFormatI18nController]);
        this._injector.add([ConditionalFormatEditorController]);
        this._injector.add([ConditionalFormatClearController]);
    }

    _initCommand() {
        SheetsConditionalFormatPlugin.commandList.forEach((m) => {
            this._commandService.registerCommand(m);
        });
        SheetsConditionalFormatPlugin.mutationList.forEach((m) => {
            this._commandService.registerCommand(m);
        });
    }
}
