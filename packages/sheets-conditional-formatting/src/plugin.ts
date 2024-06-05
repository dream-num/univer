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

import { ICommandService, Plugin, UniverInstanceType } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';
import { SHEET_CONDITIONAL_FORMATTING_PLUGIN } from './base/const';
import { ConditionalFormattingService } from './services/conditional-formatting.service';
import { ConditionalFormattingRuleModel } from './models/conditional-formatting-rule-model';
import { ConditionalFormattingViewModel } from './models/conditional-formatting-view-model';
import { AddConditionalRuleMutation } from './commands/mutations/add-conditional-rule.mutation';
import { DeleteConditionalRuleMutation } from './commands/mutations/delete-conditional-rule.mutation';
import { SetConditionalRuleMutation } from './commands/mutations/set-conditional-rule.mutation';

import { MoveConditionalRuleMutation } from './commands/mutations/move-conditional-rule.mutation';
import { ConditionalFormattingFormulaService } from './services/conditional-formatting-formula.service';
import { ConditionalFormattingFormulaMarkDirty } from './commands/mutations/formula-mark-dirty.mutation';

export class SheetsConditionalFormattingPlugin extends Plugin {
    static override pluginName = SHEET_CONDITIONAL_FORMATTING_PLUGIN;
    static override type = UniverInstanceType.UNIVER_SHEET;

    static readonly dependencyList: Dependency[] = [
        [ConditionalFormattingService],
        [ConditionalFormattingFormulaService],
        [ConditionalFormattingRuleModel],
        [ConditionalFormattingViewModel],
    ];

    static readonly mutationList = [
        AddConditionalRuleMutation,
        DeleteConditionalRuleMutation,
        SetConditionalRuleMutation,
        MoveConditionalRuleMutation,
        ConditionalFormattingFormulaMarkDirty,
    ];

    constructor(
        _config: unknown,
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(ICommandService) private _commandService: ICommandService
    ) {
        super();
        this._initCommand();
    }

    override onStarting(): void {
        SheetsConditionalFormattingPlugin.dependencyList.forEach((dependency) => {
            this._injector.add(dependency);
        });
    }

    _initCommand() {
        SheetsConditionalFormattingPlugin.mutationList.forEach((m) => {
            this._commandService.registerCommand(m);
        });
    }
}
