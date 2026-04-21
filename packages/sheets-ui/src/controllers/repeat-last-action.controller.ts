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

import { Disposable, ICommandService, Inject } from '@univerjs/core';
import { IRepeatLastActionService } from '../services/repeat-last-action.service';

export class RepeatLastActionController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(IRepeatLastActionService) private readonly _repeatLastActionService: IRepeatLastActionService
    ) {
        super();

        this._initCommandRecording();
    }

    private _initCommandRecording(): void {
        this.disposeWithMe(this._commandService.onCommandExecuted((commandInfo, options) => {
            if (options?.fromCollab || options?.fromChangeset) {
                return;
            }

            if (!this._repeatLastActionService.getRepeatableCommands().has(commandInfo.id)) {
                return;
            }

            this._repeatLastActionService.setAction(commandInfo);
        }));
    }
}
