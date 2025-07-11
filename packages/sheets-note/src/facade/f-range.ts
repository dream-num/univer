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

import type { Nullable } from '@univerjs/core';
import type { ISheetNote } from '@univerjs/sheets-note';
import { RemoveNoteMutation, SheetsNoteModel, UpdateNoteMutation } from '@univerjs/sheets-note';
import { FRange } from '@univerjs/sheets/facade';

/**
 * @ignore
 */
export interface IFSheetsNoteRange {
    /**
     * Get the annotation of the top-left cell in the range
     * @returns {Nullable<ISheetNote>} The annotation of the top-left cell in the range
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:D10');
     * const note = fRange.getNote();
     * console.log(note);
     * ```
     */
    getNote(): Nullable<ISheetNote>;
    /**
     * Create or update the annotation of the top-left cell in the range
     * @param {ISheetNote} note The annotation to create or update
     * @returns {FRange} This range for method chaining
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1');
     * fRange.createOrUpdateNote({
     *   note: 'This is a note',
     *   width: 160,
     *   height: 100,
     *   show: true,
     * });
     * ```
     */
    createOrUpdateNote(note: ISheetNote): FRange;
    /**
     * Delete the annotation of the top-left cell in the range
     * @returns {FRange} This range for method chaining
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const notes = fWorksheet.getNotes();
     * console.log(notes);
     *
     * if (notes.length > 0) {
     *   // Delete the first note
     *   const { row, col } = notes[0];
     *   fWorksheet.getRange(row, col).deleteNote();
     * }
     * ```
     */
    deleteNote(): FRange;
}

export class FSheetsNoteRangeMixin extends FRange implements IFSheetsNoteRange {
    override createOrUpdateNote(note: ISheetNote): FRange {
        this._commandService.syncExecuteCommand(
            UpdateNoteMutation.id,
            {
                unitId: this.getUnitId(),
                sheetId: this.getSheetId(),
                row: this.getRow(),
                col: this.getColumn(),
                note,
            }
        );

        return this;
    }

    override deleteNote(): FRange {
        this._commandService.syncExecuteCommand(
            RemoveNoteMutation.id,
            {
                unitId: this.getUnitId(),
                sheetId: this.getSheetId(),
                row: this.getRow(),
                col: this.getColumn(),
            }
        );

        return this;
    }

    override getNote(): Nullable<ISheetNote> {
        const model = this._injector.get(SheetsNoteModel);
        return model.getNote(this.getUnitId(), this.getSheetId(), this.getRow(), this.getColumn());
    }
}

FRange.extend(FSheetsNoteRangeMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FRange extends IFSheetsNoteRange { }
}
