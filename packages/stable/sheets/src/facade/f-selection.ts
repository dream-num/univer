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

import type { Direction, ISelectionCell, Nullable, Workbook, Worksheet } from '@univerjs/core';
import type { ISelectionWithStyle, ISetSelectionsOperationParams } from '@univerjs/sheets';
import { ICommandService, Inject, Injector, Rectangle } from '@univerjs/core';
import { getNextPrimaryCell, getPrimaryForRange, SetSelectionsOperation } from '@univerjs/sheets';

import { FRange } from './f-range';
import { FWorkbook } from './f-workbook';
import { FWorksheet } from './f-worksheet';

/**
 * Represents the active selection in the sheet.
 *
 * @example
 * ```ts
 * const fWorkbook = univerAPI.getActiveWorkbook()
 * const fWorksheet = fWorkbook.getActiveSheet()
 * const fSelection = fWorksheet.getSelection();
 * const activeRange = fSelection.getActiveRange();
 * console.log(activeRange);
 * ```
 * @hideconstructor
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
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A10:B11');
     * fRange.activate();
     * const fSelection = fWorksheet.getSelection();
     * console.log(fSelection.getActiveRange().getA1Notation()); // A10:B11
     * ```
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
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fSelection = fWorksheet.getSelection();
     * const activeRangeList = fSelection.getActiveRangeList();
     * activeRangeList.forEach((range) => {
     *   console.log(range.getA1Notation());
     * });
     * ```
     */
    getActiveRangeList(): FRange[] {
        return this._selections.map((selection) => {
            return this._injector.createInstance(FRange, this._workbook, this._worksheet, selection.range);
        });
    }

    /**
     * Represents the current select cell in the sheet.
     * @returns {ISelectionCell} The current select cell info.Pay attention to the type of the return value.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A10:B11');
     * fRange.activate();
     * const fSelection = fWorksheet.getSelection();
     * const currentCell = fSelection.getCurrentCell();
     * const { actualRow, actualColumn } = currentCell;
     * console.log(currentCell);
     * console.log(`actualRow: ${actualRow}, actualColumn: ${actualColumn}`); // actualRow: 9, actualColumn: 0
     * ```
     */
    getCurrentCell(): Nullable<ISelectionCell> {
        const current = this._selections.find((selection) => !!selection.primary);
        if (!current) {
            return null;
        }

        return current.primary;
    }

    /**
     * Returns the active sheet in the spreadsheet.
     * @returns {FWorksheet} The active sheet in the spreadsheet.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fSelection = fWorksheet.getSelection();
     * const activeSheet = fSelection.getActiveSheet();
     * console.log(activeSheet.equalTo(fWorksheet)); // true
     * ```
     */
    getActiveSheet(): FWorksheet {
        const fWorkbook = this._injector.createInstance(FWorkbook, this._workbook);
        return this._injector.createInstance(FWorksheet, fWorkbook, this._workbook, this._worksheet);
    }

    /**
     * Update the primary cell in the selection. if the primary cell not exists in selections, add it to the selections and clear the old selections.
     * @param {FRange} cell The new primary cell to update.
     * @returns {FSelection} The new selection after updating the primary cell.Because the selection is immutable, the return value is a new selection.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A10:B11');
     * fRange.activate();
     * const cell = fWorksheet.getRange('B11');
     *
     * let fSelection = fWorksheet.getSelection();
     * fSelection = fSelection.updatePrimaryCell(cell);
     *
     * const currentCell = fSelection.getCurrentCell();
     * const { actualRow, actualColumn } = currentCell;
     * console.log(currentCell);
     * console.log(`actualRow: ${actualRow}, actualColumn: ${actualColumn}`); // actualRow: 10, actualColumn: 1
     * ```
     */
    updatePrimaryCell(cell: FRange): FSelection {
        const commandService = this._injector.get(ICommandService);
        let newSelections = [];
        let hasSetPrimary = false;
        for (const { range, style } of this._selections) {
            if (Rectangle.contains(range, cell.getRange())) {
                newSelections.push({
                    range,
                    primary: getPrimaryForRange(cell.getRange(), this._worksheet),
                    style,
                });
                hasSetPrimary = true;
            } else {
                newSelections.push({
                    range,
                    primary: null,
                    style,
                });
            }
        }

        if (!hasSetPrimary) {
            newSelections = [
                {
                    range: cell.getRange(),
                    primary: getPrimaryForRange(cell.getRange(), this._worksheet),
                },
            ];
        }

        const setSelectionOperationParams: ISetSelectionsOperationParams = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            selections: newSelections,
        };

        commandService.syncExecuteCommand(SetSelectionsOperation.id, setSelectionOperationParams);
        return new FSelection(this._workbook, this._worksheet, newSelections, this._injector);
    }

    /**
     * Get the next primary cell in the specified direction. If the primary cell not exists in selections, return null.
     * The next primary cell in the specified direction is the next cell only within the current selection range.
     * For example, if the current selection is A1:B2, and the primary cell is B1, the next cell in the right direction is A2 instead of C1.
     * @param {Direction} direction The direction to move the primary cell.The enum value is maybe one of the following: UP(0),RIGHT(1), DOWN(2), LEFT(3).
     * @returns {FRange | null} The next primary cell in the specified direction.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * // make sure the active cell is A1 and selection is A1:B2
     * const fRange = fWorksheet.getRange('A1:B2');
     * fRange.activate();
     *
     * // get the next cell in the right direction, and update the primary cell to the next cell, now the active cell is B1
     * let fSelection = fWorksheet.getSelection();
     * const nextCell = fSelection.getNextDataRange(univerAPI.Enum.Direction.RIGHT);
     * console.log(nextCell?.getA1Notation()); // B1
     * fSelection = fSelection.updatePrimaryCell(nextCell);
     *
     * // get the next cell in the right direction, the next cell is A2
     * const nextCell2 = fSelection.getNextDataRange(univerAPI.Enum.Direction.RIGHT);
     * console.log(nextCell2?.getA1Notation()); // A2
     * ```
     */
    getNextDataRange(direction: Direction): FRange | null {
        const active = this._selections.find((selection) => !!selection.primary);
        if (!active) {
            return null;
        }

        const range = getNextPrimaryCell(this._selections.concat(), direction, this._worksheet);
        if (range) {
            return this._injector.createInstance(FRange, this._workbook, this._worksheet, range);
        }
        return null;
    }
}
