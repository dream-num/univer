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
import { RenderController } from './controllers/render.controller';
import { addCfRule } from './commands/commands/command';

export class SheetsConditionalFormatPlugin extends Plugin {
    static override type = PluginType.Sheet;
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
    }

    _initCommand() {
        this._commandService.registerCommand(addCfRule);
        // console.log(addCfRule);
        // window.commandService = this._commandService;
    }
}
