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

import type { ISelectionCell, Nullable, Workbook, Worksheet } from '@univerjs/core';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import { Inject, Injector } from '@univerjs/core';

import { FRange } from './f-range';

/**
 * @description Represents the active selection in the sheet.
 * @example
 * ```ts
 * const fWorkbook = univerAPI.getActiveWorkbook()
 * const fWorksheet = fWorkbook.getActiveSheet()
 * const fSelection = fWorksheet.getSelection();
 * const activeRange = fSelection.getActiveRange();
 * console.log(activeRange);
 * ```
 */
export class FSelection {
    constructor(
        private readonly _workbook: Workbook,
        private readonly _worksheet: Worksheet,
        private readonly _selections: Readonly<ISelectionWithStyle[]>,
        @Inject(Injector) private readonly _injector: Injector
    ) {
        // empty
    }

    /**
     * Represents the active selection in the sheet. Which means the selection contains the active cell.
     * @returns {FRange | null} The active selection.
     */
    getActiveRange(): FRange | null {
        const active = this._selections.find((selection) => !!selection.primary);
        if (!active) {
            return null;
        }

        return this._injector.createInstance(FRange, this._workbook, this._worksheet, active.range);
    }

    /**
     * Represents the active selection list in the sheet.
     * @returns {FRange[]} The active selection list.
     */
    getActiveRangeList(): FRange[] {
        return this._selections.map((selection) => {
            return this._injector.createInstance(FRange, this._workbook, this._worksheet, selection.range);
        });
    }

    /**
     * Represents the current select cell in the sheet.
     * @returns {ISelectionCell} The current select cell info.Pay attention to the type of the return value.
     */
    getCurrentCell(): Nullable<ISelectionCell> {
        const current = this._selections.find((selection) => !!selection.primary);
        if (!current) {
            return null;
        }

        return current.primary;
    }
}

