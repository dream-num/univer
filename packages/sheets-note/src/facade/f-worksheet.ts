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

import type { ISheetNote } from '@univerjs/sheets-note';
import { SheetsNoteModel } from '@univerjs/sheets-note';
import { FWorksheet } from '@univerjs/sheets/facade';

/**
 * @ignore
 */
export interface IFSheetsNoteWorksheet {
    /**
     * Get all annotations in the worksheet
     * @returns {ISheetNote[]} An array of all annotations in the worksheet
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const notes = fWorksheet.getNotes();
     * console.log(notes);
     *
     * notes.forEach((item) => {
     *   const { row, col, note } = item;
     *   console.log(`Cell ${fWorksheet.getRange(row, col).getA1Notation()} has a note: ${note}`);
     * });
     * ```
     */
    getNotes(): ISheetNote[];
}

export class FSheetsNoteWorksheet extends FWorksheet implements IFSheetsNoteWorksheet {
    override getNotes(): ISheetNote[] {
        const model = this._injector.get(SheetsNoteModel);
        const notes = model.getSheetNotes(this.getWorkbook().getUnitId(), this.getSheetId());
        if (!notes) {
            return [];
        }
        return Array.from(notes.values()).map((note) => ({ ...note }));
    }
}

FWorksheet.extend(FSheetsNoteWorksheet);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorksheet extends IFSheetsNoteWorksheet { }
}
