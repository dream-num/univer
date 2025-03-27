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
import { AddHyperLinkCommand, AddRichHyperLinkCommand } from '../commands/commands/add-hyper-link.command';
import { CancelHyperLinkCommand, CancelRichHyperLinkCommand } from '../commands/commands/remove-hyper-link.command';
import { UpdateHyperLinkCommand, UpdateRichHyperLinkCommand } from '../commands/commands/update-hyper-link.command';
import { AddHyperLinkMutation } from '../commands/mutations/add-hyper-link.mutation';
import { RemoveHyperLinkMutation } from '../commands/mutations/remove-hyper-link.mutation';
import { UpdateHyperLinkMutation, UpdateHyperLinkRefMutation, UpdateRichHyperLinkMutation } from '../commands/mutations/update-hyper-link.mutation';

export class SheetsHyperLinkController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._registerCommands();
    }

    private _registerCommands() {
        [
            AddHyperLinkCommand,
            UpdateHyperLinkCommand,
            CancelHyperLinkCommand,
            UpdateRichHyperLinkCommand,
            CancelRichHyperLinkCommand,
            AddRichHyperLinkCommand,
            AddHyperLinkMutation,
            UpdateHyperLinkMutation,
            RemoveHyperLinkMutation,
            UpdateHyperLinkRefMutation,
            UpdateRichHyperLinkMutation,
        ].forEach((command) => {
            this._commandService.registerCommand(command);
        });
    }
}
