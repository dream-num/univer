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
import { Inject } from '@wendellhu/redi';

import type { IMoveSelectionCommandParams } from '../../commands/commands/set-selection.command';
import { MoveSelectionCommand, MoveSelectionEnterAndTabCommand } from '../../commands/commands/set-selection.command';
import { ScrollController } from '../scroll.controller';

const SHEET_NAVIGATION_COMMANDS = [MoveSelectionCommand.id, MoveSelectionEnterAndTabCommand.id];

@OnLifecycle(LifecycleStages.Rendered, SheetNavigationController)
export class SheetNavigationController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(ScrollController) private readonly _scrollController: ScrollController
    ) {
        super();

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command) => {
                if (SHEET_NAVIGATION_COMMANDS.includes(command.id)) {
                    const params = command.params as IMoveSelectionCommandParams;

                    this._scrollController.scrollToVisible(params.direction);
                }
            })
        );
    }
}
