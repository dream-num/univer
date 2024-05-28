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

import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { AddHyperLinkMutation } from '../commands/mutations/add-hyper-link.mutation';
import { UpdateHyperLinkMutation, UpdateHyperLinkRefMutation } from '../commands/mutations/update-hyper-link.mutation';
import { RemoveHyperLinkMutation } from '../commands/mutations/remove-hyper-link.mutation';
import { AddHyperLinkCommand } from '../commands/commands/add-hyper-link.command';
import { UpdateHyperLinkCommand } from '../commands/commands/update-hyper-link.command';
import { CancelHyperLinkCommand, RemoveHyperLinkCommand } from '../commands/commands/remove-hyper-link.command';

@OnLifecycle(LifecycleStages.Starting, SheetsHyperLinkController)
export class SheetsHyperLinkController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._registerCommands();
    }

    private _registerCommands() {
        [
            AddHyperLinkMutation,
            UpdateHyperLinkMutation,
            RemoveHyperLinkMutation,
            UpdateHyperLinkRefMutation,

            AddHyperLinkCommand,
            UpdateHyperLinkCommand,
            RemoveHyperLinkCommand,
            CancelHyperLinkCommand,
        ].forEach((command) => {
            this._commandService.registerCommand(command);
        });
    }
}
