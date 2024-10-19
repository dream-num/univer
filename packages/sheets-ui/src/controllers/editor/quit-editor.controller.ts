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

import { Disposable, generateRandomId, ICommandService, Inject, Injector, toDisposable } from '@univerjs/core';
import { SetRangeBoldCommand, SetRangeFontFamilyCommand, SetRangeFontSizeCommand, SetRangeItalicCommand, SetRangeStrickThroughCommand, SetRangeSubscriptCommand, SetRangeSuperscriptCommand, SetRangeTextColorCommand, SetRangeUnderlineCommand } from '../../commands/commands/inline-format.command';
import { quitEditingBeforeCommand } from '../../common/editor';

export class QuitEditorController extends Disposable {
    private _extraCommandIds: Record<string, string> = Object.create(null);

    private _commandIds: Set<string> = new Set<string>([
        SetRangeBoldCommand.id,
        SetRangeItalicCommand.id,
        SetRangeUnderlineCommand.id,
        SetRangeStrickThroughCommand.id,
        SetRangeSubscriptCommand.id,
        SetRangeSuperscriptCommand.id,
        SetRangeFontSizeCommand.id,
        SetRangeFontFamilyCommand.id,
        SetRangeTextColorCommand.id,
    ]);

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        super();
        this._initialize();
    }

    private _initialize() {
        this._commandService.beforeCommandExecuted((commandInfo) => {
            const commandIds = new Set([...this._commandIds, ...Object.values(this._extraCommandIds)]);

            if (commandInfo.id.indexOf('sheet.command') === 0 && !commandIds.has(commandInfo.id)) {
                quitEditingBeforeCommand(this._injector);
            }
        });
    }

    /**
     * Register command that should not quit editor
     * @param commandId - command id
     * @returns - disposable
     */
    registerCommand(commandId: string) {
        const key = generateRandomId(6);
        this._extraCommandIds[key] = commandId;

        return toDisposable(() => {
            delete this._extraCommandIds[key];
        });
    }
}
