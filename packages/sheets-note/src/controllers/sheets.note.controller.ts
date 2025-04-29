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

import { Disposable, ICommandService } from '@univerjs/core';
import { SheetDeleteNoteCommand, SheetToggleNotePopupCommand, SheetUpdateNoteCommand } from '../commands/commands/note.command';
import { RemoveNoteMutation, ToggleNotePopupMutation, UpdateNoteMutation, UpdateNotePositionMutation } from '../commands/mutations/note.mutation';

export class SheetsNoteController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        [
            UpdateNotePositionMutation,
            ToggleNotePopupMutation,
            UpdateNoteMutation,
            RemoveNoteMutation,
            SheetDeleteNoteCommand,
            SheetToggleNotePopupCommand,
            SheetUpdateNoteCommand,
        ].forEach((command) => {
            this.disposeWithMe(
                this._commandService.registerCommand(command)
            );
        });
    }
}
