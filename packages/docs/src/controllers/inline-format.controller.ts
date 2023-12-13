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

import type { ICommandInfo } from '@univerjs/core';
import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

import {
    SetInlineFormatBoldCommand,
    SetInlineFormatCommand,
    SetInlineFormatFontFamilyCommand,
    SetInlineFormatFontSizeCommand,
    SetInlineFormatItalicCommand,
    SetInlineFormatStrikethroughCommand,
    SetInlineFormatSubscriptCommand,
    SetInlineFormatSuperscriptCommand,
    SetInlineFormatTextColorCommand,
    SetInlineFormatUnderlineCommand,
} from '../commands/commands/inline-format.command';
import { TextSelectionManagerService } from '../services/text-selection-manager.service';

/**
 * Used to manage the addition and removal of inline styles,
 * and to assemble the command parameters here,
 * some of the logic may be moved to the command, as the command is testable.
 */
@OnLifecycle(LifecycleStages.Rendered, InlineFormatController)
export class InlineFormatController extends Disposable {
    constructor(
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._commandExecutedListener();
    }

    private _commandExecutedListener() {
        const updateCommandList = [
            SetInlineFormatBoldCommand.id,
            SetInlineFormatItalicCommand.id,
            SetInlineFormatUnderlineCommand.id,
            SetInlineFormatStrikethroughCommand.id,
            SetInlineFormatSubscriptCommand.id,
            SetInlineFormatSuperscriptCommand.id,
            SetInlineFormatFontSizeCommand.id,
            SetInlineFormatFontFamilyCommand.id,
            SetInlineFormatTextColorCommand.id,
        ];

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (!updateCommandList.includes(command.id)) {
                    return;
                }

                this._handleInlineFormat(command);
            })
        );
    }

    private _handleInlineFormat(command: ICommandInfo) {
        const { segmentId } = this._textSelectionManagerService.getActiveRange() ?? {};

        if (segmentId == null) {
            return;
        }

        this._commandService.executeCommand(SetInlineFormatCommand.id, {
            segmentId,
            preCommandId: command.id,
            ...(command.params ?? {}),
        });
    }
}
