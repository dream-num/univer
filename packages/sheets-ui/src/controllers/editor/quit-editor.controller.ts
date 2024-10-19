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

import { Disposable, ICommandService, Inject, Injector } from '@univerjs/core';
import { SetBackgroundColorCommand, SetBorderCommand, SetRangeValuesCommand, SetStyleCommand } from '@univerjs/sheets';
import { SetOnceFormatPainterCommand } from '../../commands/commands/set-format-painter.command';
import { quitEditingBeforeCommand } from '../../common/editor';

export class QuitEditorController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();
        this._initialize();
    }

    private _initialize() {
        const commandIds = new Set<string>([
            SetBackgroundColorCommand.id,
            SetBorderCommand.id,
            SetStyleCommand.id,
            SetRangeValuesCommand.id,
            SetOnceFormatPainterCommand.id,
        ]);
        this._commandService.beforeCommandExecuted((commandInfo) => {
            if (commandIds.has(commandInfo.id)) {
                quitEditingBeforeCommand(this._injector);
            }
        });
    }
}
