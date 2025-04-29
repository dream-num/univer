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
import type { Observable } from 'rxjs';
import { Disposable, ObjectMatrix } from '@univerjs/core';
import { filter, Subject } from 'rxjs';

export interface ISheetNote {
    width: number;
    height: number;
    note: string;
}

export class SheetsNoteModel extends Disposable {
    private _noteMatrix = new Map<string, Map<string, ObjectMatrix<ISheetNote>>>();
    private readonly _change$ = new Subject<{ unitId: string; sheetId: string; row: number; col: number; note: Nullable<ISheetNote> }>();
    readonly change$ = this._change$.asObservable();

    private _ensureNoteMatrix(unitId: string, sheetId: string): ObjectMatrix<ISheetNote> {
        let unitMap = this._noteMatrix.get(unitId);
        if (!unitMap) {
            unitMap = new Map();
            this._noteMatrix.set(unitId, unitMap);
        }

        let matrix = unitMap.get(sheetId);
        if (!matrix) {
            matrix = new ObjectMatrix<ISheetNote>();
            unitMap.set(sheetId, matrix);
        }

        return matrix;
    }

    getCellNoteChange$(unitId: string, sheetId: string, row: number, col: number): Observable<{ note: Nullable<ISheetNote> }> {
        return this.change$.pipe(
            filter(({ unitId: u, sheetId: s, row: r, col: c }) => u === unitId && s === sheetId && r === row && c === col)
        );
    }

    updateNote(unitId: string, sheetId: string, row: number, col: number, note: ISheetNote): void {
        const matrix = this._ensureNoteMatrix(unitId, sheetId);
        matrix.setValue(row, col, note);
        this._change$.next({ unitId, sheetId, row, col, note });
    }

    removeNote(unitId: string, sheetId: string, row: number, col: number): void {
        const matrix = this._ensureNoteMatrix(unitId, sheetId);
        matrix.realDeleteValue(row, col);
        this._change$.next({ unitId, sheetId, row, col, note: null });
    }

    getNote(unitId: string, sheetId: string, row: number, col: number): Nullable<ISheetNote> {
        const matrix = this._ensureNoteMatrix(unitId, sheetId);
        return matrix.getValue(row, col);
    }

    getUnitNotes(unitId: string): Map<string, ObjectMatrix<ISheetNote>> | undefined {
        return this._noteMatrix.get(unitId);
    }

    deleteUnitNotes(unitId: string): void {
        this._noteMatrix.delete(unitId);
    }
}
