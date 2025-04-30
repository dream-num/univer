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

export interface ISheetNoteInfo extends ISheetNote {
    row: number;
    col: number;
}

export interface IFSheetsNoteWorksheet {
    /**
     * get the note of the primary cell
     */
    getNotes(): ISheetNoteInfo[];
}

export class FSheetsNoteWorksheet extends FWorksheet implements IFSheetsNoteWorksheet {
    getNotes(): ISheetNoteInfo[] {
        const model = this._injector.get(SheetsNoteModel);
        const notes = model.getSheetNotes(this.getWorkbook().getUnitId(), this.getSheetId());
        const arr: ISheetNoteInfo[] = [];

        notes?.forValue((row, col, note) => {
            arr.push({
                ...note,
                row,
                col,
            });
        });

        return arr;
    }
}

declare module '@univerjs/sheets/facade' {
    interface IWorksheet extends FSheetsNoteWorksheet { }
}

FWorksheet.extend(FSheetsNoteWorksheet);
