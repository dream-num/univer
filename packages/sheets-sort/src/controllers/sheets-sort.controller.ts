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
import { SortRangeCommand } from '../commands/commands/sheets-sort.command';
import { SheetsSortService } from '../services/sheets-sort.service';
import { compareCells } from './utils';

export class SheetsSortController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetsSortService) private readonly _sortService: SheetsSortService
    ) {
        super();
        this._initCommands();
        this._registerCompareFns();
    }

    private _initCommands(): void {
        [
            SortRangeCommand,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    private _registerCompareFns(): void {
        this._sortService.registerCompareFn(compareCells);
    }
}
