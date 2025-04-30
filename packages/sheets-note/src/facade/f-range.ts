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

export interface IFSheetsNoteRange {
    /**
     * get the note of the primary cell
     * @returns {Nullable<ISheetNote>} the note of the primary cell
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getWorkbook();
     * const fWorksheet = fWorkbook.getWorksheet();
     * const fRange = fWorksheet.getRange(0, 0, 1, 1);
     * const note = fRange.getNote();
     * ```
     */
    getNote(): Nullable<ISheetNote>;
    /**
     * create a new note and attach to the primary cell
     * @param {ISheetNote} note the note to create
     * @returns {FRange} the range
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getWorkbook();
     * const fWorksheet = fWorkbook.getWorksheet();
     * const fRange = fWorksheet.getRange(0, 0, 1, 1);
     * const note = fRange.createOrUpdateNote({});
     * ```
     */
    createOrUpdateNote(note: ISheetNote): FRange;
    /**
     * delete the note of the primary cell
     * @returns {FRange} the range
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getWorkbook();
     * const fWorksheet = fWorkbook.getWorksheet();
     * const fRange = fWorksheet.getRange(0, 0, 1, 1);
     * fRange.deleteNote();
     * ```
     */
    deleteNote(): FRange;
}

export class FSheetsNoteRange extends FRange implements IFSheetsNoteRange {
    createOrUpdateNote(note: ISheetNote): FRange {
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

    deleteNote(): FRange {
        const model = this._injector.get(SheetsNoteModel);
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

    getNote(): Nullable<ISheetNote> {
        const model = this._injector.get(SheetsNoteModel);
        return model.getNote(this.getUnitId(), this.getSheetId(), this.getRow(), this.getColumn());
    }
}

declare module '@univerjs/sheets/facade' {
    interface IRange extends FSheetsNoteRange { }
}

FRange.extend(FSheetsNoteRange);
