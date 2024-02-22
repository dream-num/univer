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
import { addAverageCfCommand } from './commands/commands/add-average-cf.command';
import { addColorScaleConditionalRuleCommand } from './commands/commands/add-color-scale-cf.command';
import { addDataBarConditionalRuleCommand } from './commands/commands/add-data-bar-cf.command';
import { addDuplicateValuesCfCommand } from './commands/commands/add-duplicate-values-cf.command';
import { addNumberCfCommand } from './commands/commands/add-number-cf.command';
import { addRankCfCommand } from './commands/commands/add-rank-cf.command';
import { addTextCfCommand } from './commands/commands/add-text-cf.command';
import { addTimePeriodCfCommand } from './commands/commands/add-time-period-cf.command';
import { addUniqueValuesCfCommand } from './commands/commands/add-unique-values-cf.command';
import { addConditionalRuleMutation } from './commands/mutations/addConditionalRule.mutation';
import { deleteConditionalRuleMutation } from './commands/mutations/deleteConditionalRule.mutation';
import { RefRangeController } from './controllers/cf.ref-range.controller';
import { setConditionalRuleMutation } from './commands/mutations/setConditionalRule.mutation';
import { ConditionalFormatCopyPasteController } from './controllers/cf.copy-paste.controller';
import { ConditionalFormatAutoFillController } from './controllers/cf.auto-fill.controller';
import { ConditionalFormatSheetController } from './controllers/cf.sheet.controller';
import { ConditionalFormatMenuController } from './controllers/cf.menu.controller';
import { OpenConditionalFormatOperator } from './commands/operations/open-conditional-format-panel';
import { deleteCfCommand } from './commands/commands/delete-cf.command';
import { setCfCommand } from './commands/commands/set-cf.command';
import { moveCfCommand } from './commands/commands/move-cf.command';
import { addCfCommand } from './commands/commands/add-cf.command';
import { moveConditionalRuleMutation } from './commands/mutations/move-conditional-rule.mutation';

export class SheetsConditionalFormatPlugin extends Plugin {
    static override type = PluginType.Sheet;
    static commandList = [addAverageCfCommand,
        addColorScaleConditionalRuleCommand,
        addDataBarConditionalRuleCommand,
        addDuplicateValuesCfCommand,
        addNumberCfCommand,
        addRankCfCommand,
        addTextCfCommand,
        addTimePeriodCfCommand,
        addUniqueValuesCfCommand,
        OpenConditionalFormatOperator,
        deleteCfCommand,
        setCfCommand,
        moveCfCommand,
        addCfCommand,
    ];

    static mutationList = [addConditionalRuleMutation, deleteConditionalRuleMutation, setConditionalRuleMutation, moveConditionalRuleMutation];
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
        this._injector.add([ConditionalFormatRuleModel]);
        this._injector.add([ConditionalFormatViewModel]);
        this._injector.add([RenderController]);
        this._injector.add([RefRangeController]);
        this._injector.add([ConditionalFormatCopyPasteController]);
        this._injector.add([ConditionalFormatAutoFillController]);
        this._injector.add([ConditionalFormatSheetController]);
        this._injector.add([ConditionalFormatMenuController]);
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
