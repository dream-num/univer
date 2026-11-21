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

import { Disposable, ICommandService, Inject, RegionService } from '@univerjs/core';
import type { ICellValueCompareFn } from '../commands/commands/sheets-sort.command';
import type { TextComparer } from './utils';
import { SortRangeCommand } from '../commands/commands/sheets-sort.command';
import { SheetsSortService } from '../services/sheets-sort.service';
import { compareCells, createRegionTextComparer } from './utils';

export class SheetsSortController extends Disposable {
    private _compareText: TextComparer;

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetsSortService) private readonly _sortService: SheetsSortService,
        @Inject(RegionService) private readonly _regionService: RegionService
    ) {
        super();
        this._compareText = createRegionTextComparer(this._regionService.getCurrentRegion());
        this._initCommands();
        this._initTextComparer();
        this._registerCompareFns();
    }

    // Text is collated for Univer's configured region, not the host's default locale, so the
    // same data sorts the same way on every machine.
    private _initTextComparer(): void {
        this.disposeWithMe(this._regionService.currentRegion$.subscribe((region) => {
            this._compareText = createRegionTextComparer(region);
        }));
    }

    private _initCommands(): void {
        [
            SortRangeCommand,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    private _registerCompareFns(): void {
        const compareFn: ICellValueCompareFn = (type, a, b) => compareCells(type, a, b, this._compareText);
        this._sortService.registerCompareFn(compareFn);
    }
}
