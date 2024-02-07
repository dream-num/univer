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
import { addAverageCfCommand } from './commands/commands/addAverageCf.command';
import { addColorScaleConditionalRuleCommand } from './commands/commands/addColorScaleCf.command';
import { addDataBarConditionalRuleCommand } from './commands/commands/addDataBarCf.command';
import { addDuplicateValuesCfCommand } from './commands/commands/addDuplicateValuesCf.command';
import { addNumberCfCommand } from './commands/commands/addNumberCf.command';
import { addRankCfCommand } from './commands/commands/addRankCf.command';
import { addTextCfCommand } from './commands/commands/addTextCf.command';
import { addTimePeriodCfCommand } from './commands/commands/addTimePeriodCf.command';
import { addUniqueValuesCfCommand } from './commands/commands/addUniqueValuesCf.command';
import { addConditionalRuleMutation } from './commands/mutations/addConditionalRule.mutation';
import { deleteConditionalRuleMutation } from './commands/mutations/deleteConditionalRule.mutation';
import { RefRangeController } from './controllers/cf.ref-range.controller';
import { setConditionalRuleMutation } from './commands/mutations/setConditionalRule.mutation';
import { ConditionalFormatCopyPasteController } from './controllers/cf.copy-paste.controller';

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
    ];

    static mutationList = [addConditionalRuleMutation, deleteConditionalRuleMutation, setConditionalRuleMutation];
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
    }

    _initCommand() {
        SheetsConditionalFormatPlugin.commandList.forEach((m) => {
            this._commandService.registerCommand(m);
        });
        SheetsConditionalFormatPlugin.mutationList.forEach((m) => {
            this._commandService.registerCommand(m);
        });
            // test
        (window as any).commandService = this._commandService;
    }
}
