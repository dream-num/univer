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

import type { IRange, Workbook, Worksheet } from '@univerjs/core';
import { SelectionManagerService } from '@univerjs/sheets';
import { Inject, Injector } from '@wendellhu/redi';

import { FRange } from './f-range';
import { FSelection } from './f-selection';

export class FWorksheet {
    constructor(
        private readonly _workbook: Workbook,
        private readonly _worksheet: Worksheet,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService
    ) {}

    getSelection(): FSelection | null {
        const selections = this._selectionManagerService.getSelections();
        if (!selections) {
            return null;
        }

        return this._injector.createInstance(FSelection, this._workbook, this._worksheet, selections);
    }

    getRange(row: number, col: number): FRange | null {
        const range: IRange = {
            startRow: row,
            endRow: row,
            startColumn: col,
            endColumn: col,
        };

        return this._injector.createInstance(FRange, this._workbook, this._worksheet, range);
    }
}
